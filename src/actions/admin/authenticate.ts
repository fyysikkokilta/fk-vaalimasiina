'use server'

import jsonwebtoken from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { z } from 'zod'

const authenticateSchema = z.object({
  username: z.string(),
  password: z.string()
})

export default async function authenticate(
  _prevState: unknown,
  formData: FormData
) {
  const authenticateData = Object.fromEntries(formData)
  const validatedAuthenticateData =
    authenticateSchema.safeParse(authenticateData)

  if (!validatedAuthenticateData.success) {
    return {
      success: false,
      message: 'wrong_username_or_password'
    }
  }

  const { username, password } = validatedAuthenticateData.data
  const cookieStore = await cookies()

  if (process.env.NODE_ENV === 'development') {
    if (username === 'admin' && password === 'password') {
      const jwt = jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
        expiresIn: '10h'
      })
      cookieStore.set('admin-token', jwt)

      return {
        success: true,
        message: 'login_successful'
      }
    }
  }

  const adminUsername = process.env.ADMIN_USERNAME!
  const adminPassword = process.env.ADMIN_PASSWORD!

  if (adminUsername !== username || adminPassword !== password) {
    return {
      success: false,
      message: 'wrong_username_or_password'
    }
  }

  const jwt = jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
    expiresIn: '10h'
  })

  cookieStore.set('admin-token', jwt, {
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8
  })

  return {
    success: true,
    message: 'login_successful'
  }
}
