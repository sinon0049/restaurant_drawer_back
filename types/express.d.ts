import { User } from './user';
import type AuthUser = require('./user');

declare namespace Express {
  interface Request {
    user: AuthUser;
  }
}