import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, findUserByEmail, toSafeUser } from '../models/userModel.js'

// Secret for signing tokens. In production this should come from a secure
// environment variable and be rotated appropriately.
const jwtSecret = process.env.JWT_SECRET || 'startupflow-dev-secret'

// Create a JWT containing the user's id and email. The `sub` claim holds
// the subject (user id) which is later used to load the user for protected
// routes. Tokens expire after 7 days in this demo.
function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' })
}

// Register a new user and save only the hashed password.
// - Validates that all fields are present
// - Normalizes the email in the model layer
// - Returns a safe user representation (without password hash)
export async function register(req, res) {
  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill all fields' })
  }

  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered' })
  }

  const user = await createUser({
    name,
    email,
    // bcrypt with 10 rounds for demo purposes; in high-security apps consider a higher cost
    passwordHash: await bcrypt.hash(String(password), 10),
  })

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: toSafeUser(user),
  })
}

// Login checks the password and returns a JWT token.
// Steps:
// 1. Validate input
// 2. Lookup user by normalized email
// 3. Verify password using bcrypt
// 4. Sign and return a JWT along with a safe user object
export async function login(req, res) {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter email and password' })
  }

  const user = await findUserByEmail(email)

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const passwordMatches = await bcrypt.compare(String(password), user.passwordHash)

  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const token = signToken(user)

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: toSafeUser(user),
  })
}
