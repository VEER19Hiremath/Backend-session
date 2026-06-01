// Simple health-check endpoint used by monitoring or quick local checks.
export function healthCheck(req, res) {
  res.json({ success: true, message: 'StartupFlow API is running' })
}
