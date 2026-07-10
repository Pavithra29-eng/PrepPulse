const { Router } = require('express');
const passport = require('passport'); // Added passport requirement
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

// Existing Routes
authRouter.post("/register", authController.registerUserController);
authRouter.post("/login", authController.loginUserController);
authRouter.get("/logout", authController.logoutUserController);
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);

// Google OAuth Routes
authRouter.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

authRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // Redirects back to your live production frontend dashboard
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(frontendUrl);
    }
);

module.exports = authRouter;