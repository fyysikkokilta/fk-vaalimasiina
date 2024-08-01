import React from 'react'
import { Vote } from './vote/Vote'
import { Login } from './login/Login'
import { useCookies } from 'react-cookie'

export const Voter = () => {
  const [cookies] = useCookies(['token'])

  if (cookies.token) {
    return <Vote />
  } else {
    return <Login />
  }
}
