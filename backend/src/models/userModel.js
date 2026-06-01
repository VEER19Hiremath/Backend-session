import { createId, getCollections } from '../config/mongo.js'

// Hide the password hash before sending user data back.
export function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
}

// Find a user by normalized email. Normalization (trim + toLowerCase)
// helps avoid duplicates like `A@x.com` vs ` a@x.com `.
export async function findUserByEmail(email) {
  const { users } = await getCollections()
  const normalizedEmail = String(email).trim().toLowerCase()
  return users.findOne({ email: normalizedEmail })
}

export async function findUserById(id) {
  const { users } = await getCollections()
  return users.findOne({ id })
}

// Create a new user record. The password must be hashed by the caller
// (see `authController.register`) before calling this function.
export async function createUser({ name, email, passwordHash }) {
  const { users } = await getCollections()
  const user = {
    id: createId('user'),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  await users.insertOne(user)
  return user
}
