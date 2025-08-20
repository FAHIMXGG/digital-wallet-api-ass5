# Authentication Features Testing Guide

This document provides a comprehensive guide to test the new authentication features added to the Digital Wallet API.

## New Features Added

1. **Email Verification with OTP** - Users must verify their email before they can log in
2. **Forgot Password with OTP** - Users can reset their password using OTP sent to email
3. **Change Password** - Authenticated users can change their password

## Prerequisites

1. Make sure you have configured email settings in your `.env` file:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Digital Wallet <your-email@gmail.com>
OTP_EXPIRES_IN=300
```

2. Start the server:
```bash
npm run dev
```

## Testing Scenarios

### 1. User Registration with Email Verification

**Step 1: Register a new user**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "user"
}
```

**Expected Response:**
- Status: 201
- User created successfully
- Email verification OTP sent to the provided email

**Step 2: Try to login before verification (should fail)**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
- Status: 403
- Error: "Please verify your email before logging in."

**Step 3: Verify email with OTP**
```bash
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Expected Response:**
- Status: 200
- Email verified successfully
- Welcome email sent

**Step 4: Login after verification (should succeed)**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
- Status: 200
- Login successful with JWT token

### 2. Resend Verification Email

```bash
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 3. Forgot Password Flow

**Step 1: Request password reset**
```bash
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Expected Response:**
- Status: 200
- Password reset OTP sent to email

**Step 2: Reset password with OTP**
```bash
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "654321",
  "newPassword": "newpassword123"
}
```

**Expected Response:**
- Status: 200
- Password reset successfully

**Step 3: Login with new password**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "newpassword123"
}
```

### 4. Change Password (Authenticated)

**Step 1: Login to get JWT token**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "newpassword123"
}
```

**Step 2: Change password**
```bash
POST /api/v1/auth/change-password
Content-Type: application/json
Authorization: <your-jwt-token>

{
  "currentPassword": "newpassword123",
  "newPassword": "anothernewpassword123"
}
```

**Expected Response:**
- Status: 200
- Password changed successfully

## Error Cases to Test

1. **Invalid OTP**: Use wrong OTP code
2. **Expired OTP**: Wait for OTP to expire (5 minutes by default)
3. **Already verified email**: Try to verify already verified email
4. **Non-existent user**: Use email that doesn't exist
5. **Wrong current password**: Use incorrect current password in change password
6. **Weak password**: Use password less than 6 characters

## Email Templates

The system sends three types of emails:

1. **Email Verification**: Contains 6-digit OTP for email verification
2. **Password Reset**: Contains 6-digit OTP for password reset
3. **Welcome Email**: Sent after successful email verification

## Database Changes

New fields added to User model:
- `isEmailVerified`: Boolean field to track email verification status

New OTP model created:
- Stores OTPs with expiration and usage tracking
- Automatically cleans up expired OTPs using MongoDB TTL index

## Security Features

1. **OTP Expiration**: OTPs expire after 5 minutes (configurable)
2. **One-time Use**: OTPs can only be used once
3. **Email Verification Required**: Users cannot login without email verification
4. **Password Strength**: Minimum 6 characters required
5. **Current Password Validation**: Required for password changes
