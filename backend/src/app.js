import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

const app = express()

// app.js stays intentionally small: its job is to configure middleware,
// mount route handlers, and provide a single fallback for unknown routes.
app.use(cors())
app.use(express.json())

// Mount route groups under clear prefixes. Route handlers live in `src/routes`.
app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

// Catch-all 404 for any path not handled above. Responses are JSON-shaped
// for consistency with the API clients used in the project.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

export default app