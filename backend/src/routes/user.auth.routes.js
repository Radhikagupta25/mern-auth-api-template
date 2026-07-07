import { Router } from "express";
import { changeUserPassword, deleteAccount, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatarImage, updateUserDetails, verifyEmail, googleLogin, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account using email and password.
 *
 *       ### What happens during registration?
 *
 *       - Validates all required fields.
 *       - Ensures the username and email are unique.
 *       - Uploads the avatar image to Cloudinary (if provided).
 *       - Hashes the password using bcrypt.
 *       - Creates the user in MongoDB.
 *       - Generates an email verification token.
 *       - Sends a verification email via Nodemailer.
 *
 *       **Note:** Newly registered users must verify their email before logging in.
 *
 *     operationId: registerUser
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - username
 *               - email
 *               - password
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Full name of the user.
 *                 example: Radhika Gupta
 *
 *               username:
 *                 type: string
 *                 description: Unique username.
 *                 example: radhika25
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address.
 *                 example: radhika@gmail.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Account password.
 *                 example: Password@123
 *
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile image.
 *
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 201
 *               success: true
 *               message: User registered Successfully
 *               data:
 *                 _id: 686b4fc94d6f9a1c3d12ab45
 *                 fullname: Radhika Gupta
 *                 username: radhika25
 *                 email: radhika@gmail.com
 *                 avatar: https://res.cloudinary.com/demo/avatar.png
 *                 isEmailVerified: false
 *                 provider: local
 *                 createdAt: "2026-07-07T12:45:10.321Z"
 *                 updatedAt: "2026-07-07T12:45:10.321Z"
 *
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: All fields are required
 *
 *       409:
 *         description: Email or username already exists.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 409
 *               success: false
 *               message: User with email or username already exists
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login a user
 *     description: |
 *       Authenticates a registered user using either **email** or **username**
 *       along with their password.
 *
 *       ### What happens during login?
 *
 *       - Validates the provided credentials.
 *       - Checks whether the user exists.
 *       - Verifies the password using bcrypt.
 *       - Ensures the email has been verified.
 *       - Generates a new Access Token and Refresh Token.
 *       - Stores the Refresh Token in the database.
 *       - Sets secure HTTP-only cookies.
 *       - Returns the authenticated user's information.
 *
 *       **Note:** Either **email** or **username** must be provided.
 *
 *     operationId: loginUser
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address.
 *                 example: radhika@gmail.com
 *
 *               username:
 *                 type: string
 *                 description: Username (can be used instead of email).
 *                 example: radhika25
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password.
 *                 example: Password@123
 *
 *     responses:
 *       200:
 *         description: Login successful.
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Sets secure HTTP-only cookies containing
 *               the Access Token and Refresh Token.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: User logged in successfully
 *               data:
 *                 user:
 *                   _id: 686b4fc94d6f9a1c3d12ab45
 *                   fullname: Radhika Gupta
 *                   username: radhika25
 *                   email: radhika@gmail.com
 *                   avatar: https://res.cloudinary.com/demo/avatar.png
 *                   isEmailVerified: true
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       400:
 *         description: Username or email is required.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: username or email is required
 *
 *       401:
 *         description: Invalid credentials or email not verified.
 *         content:
 *           application/json:
 *             examples:
 *               InvalidPassword:
 *                 value:
 *                   statusCode: 401
 *                   success: false
 *                   message: Password is incorrect
 *
 *               EmailNotVerified:
 *                 value:
 *                   statusCode: 401
 *                   success: false
 *                   message: Please verify your email first.
 *
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 404
 *               success: false
 *               message: User not found
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/login").post(
    loginUser
)

/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout the current user
 *     description: |
 *       Logs out the currently authenticated user.
 *
 *       ### What happens during logout?
 *
 *       - Requires a valid JWT access token.
 *       - Removes the stored refresh token from the database.
 *       - Clears the **accessToken** and **refreshToken**
 *         HTTP-only cookies.
 *       - Invalidates the current user session.
 *
 *       **Authentication Required**
 *
 *     operationId: logoutUser
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *         headers:
 *           Set-Cookie:
 *             description: Clears the authentication cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: User logged out successfully
 *               data: {}
 *
 *       401:
 *         description: Unauthorized. Invalid or missing access token.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Unauthorized request
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/logout").post(
    verifyJWT,
    logoutUser
)

/**
 * @swagger
 * /refreshToken:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: |
 *       Generates a new Access Token and Refresh Token using a valid Refresh Token.
 *
 *       ### What happens during token refresh?
 *
 *       - Reads the refresh token from an HTTP-only cookie.
 *       - If the cookie is unavailable, checks the request body.
 *       - Verifies the JWT refresh token.
 *       - Ensures the token matches the one stored in the database.
 *       - Generates a new Access Token.
 *       - Rotates the Refresh Token.
 *       - Updates secure HTTP-only cookies.
 *
 *       **Recommended:** Send the Refresh Token using HTTP-only cookies.
 *
 *     operationId: refreshAccessToken
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (optional if sent via HTTP-only cookie).
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Sets new secure HTTP-only accessToken and refreshToken cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Access token refreshed successfully
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       401:
 *         description: Invalid, expired, or missing refresh token.
 *         content:
 *           application/json:
 *             examples:
 *               MissingToken:
 *                 value:
 *                   statusCode: 401
 *                   success: false
 *                   message: unauthorized request
 *
 *               InvalidToken:
 *                 value:
 *                   statusCode: 401
 *                   success: false
 *                   message: Invalid refresh token
 *
 *               ExpiredToken:
 *                 value:
 *                   statusCode: 401
 *                   success: false
 *                   message: Refresh token is expired or used
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/refreshToken").post(
    refreshAccessToken
)

/**
 * @swagger
 * /changePassword:
 *   patch:
 *     tags:
 *       - User
 *     summary: Change account password
 *     description: |
 *       Changes the password of the currently authenticated user.
 *
 *       ### What happens?
 *
 *       - Requires a valid JWT access token.
 *       - Verifies the current password.
 *       - Ensures the new password and confirmation password match.
 *       - Hashes the new password using bcrypt.
 *       - Saves the updated password securely.
 *
 *       **Authentication Required**
 *
 *     operationId: changeUserPassword
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current account password.
 *                 example: OldPassword@123
 *
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password.
 *                 example: NewPassword@123
 *
 *               confNewPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirm new password.
 *                 example: NewPassword@123
 *
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Password changed succesfully
 *               data: {}
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             examples:
 *               PasswordMismatch:
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: New passwords doesn't match
 *
 *               InvalidOldPassword:
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: Invalid old password
 *
 *       401:
 *         description: Unauthorized. Missing or invalid access token.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Unauthorized request
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/changePassword").patch(
    verifyJWT,
    changeUserPassword
)

/**
 * @swagger
 * /userDetails:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user profile
 *     description: |
 *       Retrieves the profile of the currently authenticated user.
 *
 *       ### What does this endpoint return?
 *
 *       - User profile information.
 *       - Avatar URL.
 *       - Email verification status.
 *       - Authentication provider.
 *       - Account creation and update timestamps.
 *
 *       Sensitive information such as the password and refresh token
 *       is never returned.
 *
 *       **Authentication Required**
 *
 *     operationId: getCurrentUser
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: User details fetched successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Current user fetched successfully
 *               data:
 *                 _id: "686b4fc94d6f9a1c3d12ab45"
 *                 fullname: "Radhika Gupta"
 *                 username: "radhika25"
 *                 email: "radhika@gmail.com"
 *                 avatar: "https://res.cloudinary.com/demo/avatar.png"
 *                 isEmailVerified: true
 *                 provider: "local"
 *                 createdAt: "2026-07-07T12:45:10.321Z"
 *                 updatedAt: "2026-07-07T13:15:48.912Z"
 *
 *       401:
 *         description: Unauthorized. Missing or invalid access token.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Unauthorized request
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/userDetails").get(
    verifyJWT,
    getCurrentUser
)

/**
 * @swagger
 * /updateUserDetails:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update user profile
 *     description: |
 *       Updates the profile information of the currently authenticated user.
 *
 *       ### What can be updated?
 *
 *       - Full Name
 *       - Username
 *       - Email Address
 *
 *       You may update **one or multiple fields** in a single request.
 *
 *       **Authentication Required**
 *
 *     operationId: updateUserDetails
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - fullname
 *                 properties:
 *                   fullname:
 *                     type: string
 *                     example: Radhika Gupta
 *
 *               - type: object
 *                 required:
 *                   - username
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: radhika2509
 *
 *               - type: object
 *                 required:
 *                   - email
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: radhika@gmail.com
 *
 *               - type: object
 *                 required:
 *                   - fullname
 *                   - username
 *                 properties:
 *                   fullname:
 *                     type: string
 *                     example: Radhika Gupta
 *                   username:
 *                     type: string
 *                     example: radhika2509
 *
 *               - type: object
 *                 required:
 *                   - fullname
 *                   - email
 *                 properties:
 *                   fullname:
 *                     type: string
 *                     example: Radhika Gupta
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: radhika@gmail.com
 *
 *               - type: object
 *                 required:
 *                   - username
 *                   - email
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: radhika2509
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: radhika@gmail.com
 *
 *               - type: object
 *                 required:
 *                   - fullname
 *                   - username
 *                   - email
 *                 properties:
 *                   fullname:
 *                     type: string
 *                     example: Radhika Gupta
 *                   username:
 *                     type: string
 *                     example: radhika2509
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: radhika@gmail.com
 *
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: User details updated successfully
 *               data:
 *                 _id: "686b4fc94d6f9a1c3d12ab45"
 *                 fullname: "Radhika Gupta"
 *                 username: "radhika2509"
 *                 email: "radhika@gmail.com"
 *                 avatar: "https://res.cloudinary.com/demo/avatar.png"
 *                 isEmailVerified: true
 *                 provider: "local"
 *                 createdAt: "2026-07-07T12:45:10.321Z"
 *                 updatedAt: "2026-07-07T14:22:15.143Z"
 *
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: At least one field must be provided
 *
 *       401:
 *         description: Unauthorized. Missing or invalid access token.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Unauthorized request
 *
 *       409:
 *         description: Username or email already exists.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 409
 *               success: false
 *               message: User with email or username already exists
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/updateUserDetails").patch(
    verifyJWT,
    updateUserDetails
)

/**
 * @swagger
 * /updateImageFiles:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update user avatar
 *     description: |
 *       Updates the avatar image of the currently authenticated user.
 *
 *       ### What happens?
 *
 *       - Requires a valid JWT access token.
 *       - Accepts an image file using multipart/form-data.
 *       - Uploads the image to Cloudinary.
 *       - Updates the user's avatar URL in MongoDB.
 *       - Returns the updated user profile.
 *
 *       **Authentication Required**
 *
 *     operationId: updateUserAvatarImage
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: New profile image.
 *
 *     responses:
 *       200:
 *         description: Avatar updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Avatar updated successfully
 *               data:
 *                 _id: "686b4fc94d6f9a1c3d12ab45"
 *                 fullname: "Radhika Gupta"
 *                 username: "radhika25"
 *                 email: "radhika@gmail.com"
 *                 avatar: "https://res.cloudinary.com/demo/new-avatar.png"
 *                 isEmailVerified: true
 *                 provider: "local"
 *                 createdAt: "2026-07-07T12:45:10.321Z"
 *                 updatedAt: "2026-07-07T15:04:37.128Z"
 *
 *       400:
 *         description: Avatar image not provided.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: Avatar file is required
 *
 *       401:
 *         description: Unauthorized. Missing or invalid access token.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Unauthorized request
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/updateImageFiles").patch(
    verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    updateUserAvatarImage
)

/**
 * @swagger
 * /verify-email/{token}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify email address
 *     description: |
 *       Verifies a user's email address using the verification token sent via email.
 *
 *       ### What happens?
 *
 *       - Reads the verification token from the URL.
 *       - Validates the token.
 *       - Checks whether the token has expired.
 *       - Marks the user's email as verified.
 *       - Removes the verification token from the database.
 *
 *       This endpoint is typically accessed through the verification email sent during registration.
 *
 *     operationId: verifyEmail
 *
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Email verification token.
 *         schema:
 *           type: string
 *         example: 6b7f0d35eaf81d4a7d8b96f6d15b1f5fd5c57f72b9f5...
 *
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Email verified successfully
 *               data: {}
 *
 *       400:
 *         description: Invalid or expired verification token.
 *         content:
 *           application/json:
 *             examples:
 *               InvalidToken:
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: Invalid verification token
 *
 *               ExpiredToken:
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: Verification token has expired
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/verify-email/:token").get(
    verifyEmail
)

/**
 * @swagger
 * /deleteAccount:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete user account
 *     description: |
 *       Permanently deletes the currently authenticated user's account.
 *
 *       ### What happens?
 *
 *       - Requires a valid JWT access token.
 *       - Deletes the user's account from the database.
 *       - Removes the stored refresh token.
 *       - Clears authentication cookies.
 *
 *       ⚠️ **Warning:** This action is irreversible.
 *
 *       **Authentication Required**
 *
 *     operationId: deleteAccount
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *         headers:
 *           Set-Cookie:
 *             description: Clears the accessToken and refreshToken cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Account deleted successfully
 *               data: {}
 *
 *       401:
 *         description: Unauthorized. Missing or invalid access token.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Unauthorized request
 *
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 404
 *               success: false
 *               message: User not found
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/deleteAccount").delete(
    verifyJWT,
    deleteAccount
)

/**
 * @swagger
 * /google-login:
 *   post:
 *     tags:
 *       - OAuth
 *     summary: Authenticate with Google
 *     description: |
 *       Authenticates a user using a Google ID Token.
 *
 *       ### What happens?
 *
 *       - Verifies the Google ID Token.
 *       - Retrieves the user's Google profile.
 *       - Creates a new account if one does not already exist.
 *       - Links the account with Google as the authentication provider.
 *       - Generates Access and Refresh Tokens.
 *       - Stores the Refresh Token in the database.
 *       - Sets secure HTTP-only authentication cookies.
 *       - Returns the authenticated user's profile.
 *
 *       **Note:** The frontend should first authenticate the user with Google
 *       and send the resulting **ID Token** to this endpoint.
 *
 *     operationId: googleLogin
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID Token obtained after successful Google authentication.
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ3ZT...
 *
 *     responses:
 *       200:
 *         description: Google login successful.
 *         headers:
 *           Set-Cookie:
 *             description: Sets secure HTTP-only accessToken and refreshToken cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Google login successful
 *               data:
 *                 user:
 *                   _id: "686b4fc94d6f9a1c3d12ab45"
 *                   fullname: "Radhika Gupta"
 *                   username: "radhika25"
 *                   email: "radhika@gmail.com"
 *                   avatar: "https://lh3.googleusercontent.com/..."
 *                   provider: "google"
 *                   isEmailVerified: true
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: Google ID Token is required
 *
 *       401:
 *         description: Invalid Google token.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Invalid Google ID Token
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/google-login").post(
    googleLogin
);

/**
 * @swagger
 * /forgotPassword:
 *   post:
 *     tags:
 *       - Password Recovery
 *     summary: Request a password reset
 *     description: |
 *       Generates a secure password reset token and sends it to the user's
 *       registered email address.
 *
 *       ### What happens?
 *
 *       - Validates the provided email address.
 *       - Checks whether the user exists.
 *       - Generates a secure password reset token.
 *       - Stores the hashed token with an expiration time.
 *       - Sends a password reset email using Nodemailer.
 *
 *       **Note:** During development, the reset token is included in the
 *       email for testing purposes. In production, users should use the
 *       password reset link sent via email.
 *
 *     operationId: forgotPassword
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registered email address.
 *                 example: radhika@gmail.com
 *
 *     responses:
 *       200:
 *         description: Password reset email sent successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Password reset email sent successfully
 *               data: {}
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: Email is required
 *
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 404
 *               success: false
 *               message: User not found
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/forgotPassword").post(
    forgotPassword
);

/**
 * @swagger
 * /resetPassword/{token}:
 *   post:
 *     tags:
 *       - Password Recovery
 *     summary: Reset account password
 *     description: |
 *       Resets the user's password using a valid password reset token.
 *
 *       ### What happens?
 *
 *       - Reads the reset token from the URL.
 *       - Validates the reset token.
 *       - Checks whether the token has expired.
 *       - Ensures the new password and confirmation password match.
 *       - Hashes the new password using bcrypt.
 *       - Updates the user's password.
 *       - Removes the password reset token from the database.
 *
 *       **Note:** A password reset token can only be used once.
 *
 *     operationId: resetPassword
 *
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Password reset token.
 *         schema:
 *           type: string
 *         example: 6b7f0d35eaf81d4a7d8b96f6d15b1f5fd5c57f72b9f5...
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New account password.
 *                 example: NewPassword@123
 *
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirm the new password.
 *                 example: NewPassword@123
 *
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Password reset successfully
 *               data: {}
 *
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             examples:
 *               PasswordMismatch:
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: Password and confirm password do not match
 *
 *               InvalidToken:
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: Invalid password reset token
 *
 *               ExpiredToken:
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: Password reset token has expired
 *
 *       500:
 *         description: Internal server error.
 */
router.route("/resetPassword/:token").post(
    resetPassword
);
export default router