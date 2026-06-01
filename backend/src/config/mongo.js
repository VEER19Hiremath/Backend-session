import { MongoClient } from 'mongodb'

// Use `MONGODB_URI` if provided, otherwise fall back to a local DB.
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/startupflow'
const client = new MongoClient(mongoUri)

// We lazily initialize the DB connection and indexes and then reuse them.
// This avoids reconnecting on every request and ensures indexes are created
// exactly once on startup.
let dbPromise
let indexesPromise

// Open one MongoDB connection and reuse it for every request.
async function getDb() {
  if (!dbPromise) {
    // Save the promise so concurrent calls wait for the same connection attempt
    dbPromise = client.connect().then(() => client.db())
  }

  return dbPromise
}

// Return the two collections used by this app and make the common indexes once.
export async function getCollections() {
  const db = await getDb()
  const users = db.collection('users')
  const tasks = db.collection('tasks')

  if (!indexesPromise) {
    // Create a unique index on email and a compound index for tasks. Running
    // these as a Promise.all lets us wait for both indexes to be ready.
    indexesPromise = Promise.all([
      users.createIndex({ email: 1 }, { unique: true }),
      tasks.createIndex({ userId: 1, createdAt: -1 }),
    ])
  }

  await indexesPromise

  return { users, tasks }
}

// Lightweight ID generator for records in this demo app. The prefix helps
// with debugging (e.g. `user_...` vs `task_`). Not meant to be cryptographically
// strong — just unique enough for local development.
export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}