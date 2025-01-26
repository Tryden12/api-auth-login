import { getSecret } from './ssm.mjs';
import pkg from 'jsonwebtoken';

const { sign, verify } = pkg;


export async function generateToken(userInfo) {
    const secret = await getSecret()

  if (!userInfo) { return null; }

  return sign(userInfo, secret, {
    expiresIn: '1h'
  })
}

export async function verifyToken(username, token) {
    const secret = await getSecret()

    return verify(token, secret, (error, response) => {
        if (error) {
            return {
              verified: false,
              message: 'invalid token'
            }
          }
      
          if (response.username !== username) {
            return {
              verified: false,
              message: 'invalid user'
            }
          }
      
          return {
            verified: true,
            message: 'verifed'
          }
    })
}