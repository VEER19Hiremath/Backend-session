import jwt from 'jsonwebtoken'
import { findUserById } from '../models/userModel.js'

// Keep the JWT secret in one place. In production this must be a secure secret.
const jwtSecret = process.env.JWT_SECRET || 'startupflow-dev-secret'

function readToken(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

// Protect task routes so only logged-in users can access them.
// Steps:
// 1. Read the `Authorization: Bearer <token>` header
// 2. Verify the JWT and extract the `sub` (user id)
// 3. Load the user from the DB and attach it to `req.user`
// 4. Call `next()` if successful, otherwise return 401
export async function requireAuth(req, res, next) {
  const token = readToken(req)

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing token' })
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    const user = await findUserById(payload.sub)

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    // Attach the full user object to the request for handlers to use.
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}
