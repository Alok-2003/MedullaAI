# Medulla AI Authentication API

A secure authentication server providing email/password registration with OTP email verification.

## Features

- User registration with password hashing
- Email verification using OTP (One-Time Password)
- JWT-based authentication
- Email-based OTP verification flow
- Protected routes for authenticated users
- Input validation for all endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Email account for sending verification emails (Gmail recommended)

## Installation

1. Clone the repository or navigate to the project folder
2. Install dependencies:

```bash
cd backend
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` (or use the existing `.env` file)
   - Update the values in `.env` with your own credentials:
     - `PORT`: Server port (default: 5000)
     - `MONGODB_URI`: MongoDB connection string
     - `JWT_SECRET`: Secret key for JWT token generation
     - `EMAIL_USER`: Email address for sending OTPs
     - `EMAIL_PASS`: Email app password (for Gmail, generate an app password)
     - `OTP_EXPIRY`: OTP expiry time in minutes (default: 10)

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication Routes

| Method | Endpoint           | Description                  | Request Body                                  | Authentication Required |
|--------|-------------------|------------------------------|----------------------------------------------|------------------------|
| POST   | /api/auth/register | Register a new user         | `{ name, email, password }`                  | No                     |
| POST   | /api/auth/verify-email | Verify email with OTP   | `{ email, otp }`                            | No                     |
| POST   | /api/auth/login    | Login with email/password   | `{ email, password }`                       | No                     |
| POST   | /api/auth/resend-otp | Resend verification OTP   | `{ email }`                                 | No                     |
| GET    | /api/auth/me       | Get current user profile    | -                                            | Yes                    |

## Authentication Flow

1. **Registration**:
   - User registers with name, email, and password
   - System generates an OTP and sends it to the user's email
   - Response includes user details without the password

2. **Email Verification**:
   - User submits the OTP received via email
   - System verifies the OTP and marks the user as verified
   - On successful verification, a JWT token is issued

3. **Login**:
   - User logs in with email and password
   - If the user is verified, a JWT token is issued
   - If the user is not verified, a new OTP is generated and sent

4. **Protected Routes**:
   - Include the JWT token in the Authorization header
   - Format: `Bearer <token>`

## Error Handling

The API provides clear error messages for:
- Invalid input data
- Authentication failures
- Server errors

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- OTP expiration
- Input validation for all endpoints
- Protected routes middleware

## Development Notes

To modify the OTP email template, edit the `sendVerificationEmail` function in `utils/emailService.js`.
