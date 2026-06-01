// Entry point for the StartupFlow backend.
// Responsibilities:
// - Ensure MongoDB is reachable and indexes exist before starting the HTTP server
// - Start the Express app and log the listening URL
import app from './app.js'
import { getCollections } from './config/mongo.js'

const port = process.env.PORT || 5000

// Connect to MongoDB and then start the Express server. If the DB connection
// fails we exit with a non-zero code so containers or scripts can notice.
async function startServer() {
  try {
    // Ensures collections and indexes are created before accepting requests
    await getCollections()

    app.listen(port, () => {
      console.log(`MongoDB connected. StartupFlow API running on http://localhost:${port}`)
    })
  } catch (error) {
    // Keep the error visible and stop the process; starting without DB is unsafe.
    console.error('MongoDB connection failed.')
    console.error(error)
    process.exit(1)
  }
}

startServer()
