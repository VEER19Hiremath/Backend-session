import {
  createTask,
  deleteTask,
  findTaskById,
  getTasksByUserId,
  updateTaskTitle,
} from '../models/taskModel.js'

// Return only the current user's tasks. `req.user` is attached by the
// `requireAuth` middleware and contains the user loaded from the token.
export async function listTasks(req, res) {
  const tasks = await getTasksByUserId(req.user.id)
  return res.json({ success: true, tasks })
}

// Create a new task for the logged-in user.
// Validates the presence of a title and associates the new task with the
// authenticated user's id.
export async function addTask(req, res) {
  const { title } = req.body || {}

  if (!title || String(title).trim() === '') {
    return res.status(400).json({ success: false, message: 'Task title is required' })
  }

  const task = await createTask(req.user.id, title)
  return res.status(201).json({ success: true, task })
}

// Update a task only if it belongs to the current user.
// The model functions require both the task id and the user id to guarantee
// ownership checks at the DB level.
export async function editTask(req, res) {
  const { id } = req.params
  const { title } = req.body || {}

  if (!title || String(title).trim() === '') {
    return res.status(400).json({ success: false, message: 'Task title is required' })
  }

  const task = await findTaskById(id, req.user.id)

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' })
  }

  const updatedTask = await updateTaskTitle(id, req.user.id, title)
  return res.json({ success: true, task: updatedTask })
}

// Delete a task only if it belongs to the current user.
export async function removeTask(req, res) {
  const { id } = req.params
  const task = await findTaskById(id, req.user.id)

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' })
  }

  await deleteTask(id, req.user.id)
  return res.json({ success: true, message: 'Task deleted' })
}
