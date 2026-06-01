import { createId, getCollections } from '../config/mongo.js'

// Query tasks for a given user and return newest-first.
export async function getTasksByUserId(userId) {
  const { tasks } = await getCollections()
  return tasks.find({ userId }).sort({ createdAt: -1 }).toArray()
}

// Find a task by id while also checking ownership (userId). This ensures
// controllers don't accidentally access another user's data.
export async function findTaskById(taskId, userId) {
  const { tasks } = await getCollections()
  return tasks.findOne({ id: taskId, userId })
}

// Create a task record belonging to `userId`. The title is trimmed to avoid
// accidental leading/trailing whitespace.
export async function createTask(userId, title) {
  const { tasks } = await getCollections()
  const task = {
    id: createId('task'),
    userId,
    title: String(title).trim(),
    createdAt: new Date().toISOString(),
  }

  await tasks.insertOne(task)
  return task
}

// Update the title for a task only if the provided `userId` owns it. Returns
// `null` when no document matched the filter (ownership or id mismatch).
export async function updateTaskTitle(taskId, userId, title) {
  const { tasks } = await getCollections()
  const result = await tasks.updateOne(
    { id: taskId, userId },
    {
      $set: {
        title: String(title).trim(),
        updatedAt: new Date().toISOString(),
      },
    },
  )

  if (result.matchedCount === 0) {
    return null
  }

  return tasks.findOne({ id: taskId, userId })
}

// Delete a task only when the user owns it. Returns true when deletion
// succeeded, false otherwise.
export async function deleteTask(taskId, userId) {
  const { tasks } = await getCollections()
  const result = await tasks.deleteOne({ id: taskId, userId })
  return result.deletedCount > 0
}
