import jsonwebtoken from 'jsonwebtoken'

import { router } from '../../init'
import { testProcedure } from '../../procedures/testProcedure'

export const testLoginRouter = router({
  authenticate: testProcedure.mutation(() => {
    const username = process.env.ADMIN_USERNAME!

    if (process.env.NODE_ENV === 'development') {
      return jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
        expiresIn: '10h'
      })
    }
  })
})
