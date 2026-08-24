// This file is used to let typescript recognize req.user as AuthUser

import type { AuthUser } from "./user"
import "passport"

declare global {
    namespace Express {
        interface User extends AuthUser {}
    }
}

export {}