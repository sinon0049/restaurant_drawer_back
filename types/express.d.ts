import type { AuthUser } from './user'

// let ts recognize req.user as AuthUser
declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export {}