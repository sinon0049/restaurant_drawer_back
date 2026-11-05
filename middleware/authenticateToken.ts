import passport from "passport";

const authenticateToken = passport.authenticate('token', { session: false })

export default authenticateToken