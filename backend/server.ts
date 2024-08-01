import express from 'express'
import cors from 'cors'
import adminElectionsRouter from './handlers/admin/elections'
import adminLoginRouter from './handlers/admin/login'
import adminStatusRouter from './handlers/admin/status'
import adminVoterRouter from './handlers/admin/voters'
import adminVotesRouter from './handlers/admin/votes'

import electionsRouter from './handlers/elections'
import loginRouter from './handlers/login'
import voteRouter from './handlers/vote'
import voterRouter from './handlers/voter'

import 'dotenv/config'
import { initDatabase } from './models'
import jsonwebtoken from 'jsonwebtoken'

if (
  !process.env.PORT ||
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_USERNAME ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME ||
  !process.env.ADMIN_USERNAME ||
  !process.env.ADMIN_PASSWORD ||
  !process.env.SECRET_KEY ||
  !process.env.JWT_SECRET
) {
  throw new Error('Environment variables not set')
}

await initDatabase()

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/admin/login', adminLoginRouter)

app.use('/admin', (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const jwt = authHeader.split(' ')[1]

  try {
    jsonwebtoken.verify(jwt, process.env.JWT_SECRET!)
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  next()
})

app.use('/admin/elections', adminElectionsRouter)
app.use('/admin/status', adminStatusRouter)
app.use('/admin/voters', adminVoterRouter)
app.use('/admin/votes', adminVotesRouter)

app.use('/elections', electionsRouter)
app.use('/login', loginRouter)
app.use('/vote', voteRouter)
app.use('/voter', voterRouter)

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})
