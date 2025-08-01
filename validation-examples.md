# API Validation Error Response Examples

This document shows the standardized JSON format for validation errors in the Digital Wallet API.

## 1. Registration Validation Errors

### Missing Required Fields
**Request:**
```json
POST /api/v1/auth/register
{
  "name": "",
  "email": "invalid-email"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error: name is required, email must be a valid email address, password is required, phone is required, role is required"
}
```

### Invalid Email Format
**Request:**
```json
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "invalid-email",
  "password": "123456",
  "phone": "1234567890",
  "role": "user"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error: email must be a valid email address"
}
```

### Invalid Role
**Request:**
```json
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "phone": "1234567890",
  "role": "invalid_role"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error: role must be one of: user, agent, admin"
}
```

### Password Too Short
**Request:**
```json
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123",
  "phone": "1234567890",
  "role": "user"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error: password must be at least 6 characters long"
}
```

### Duplicate Email
**Request:**
```json
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "existing@example.com",
  "password": "123456",
  "phone": "1234567890",
  "role": "user"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Duplicate key error: email already exists."
}
```

## 2. Login Validation Errors

### Missing Credentials
**Request:**
```json
POST /api/v1/auth/login
{
  "email": ""
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error: email is required, password is required"
}
```

### Invalid Email Format
**Request:**
```json
POST /api/v1/auth/login
{
  "email": "invalid-email",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error: email must be a valid email address"
}
```

### Invalid Credentials
**Request:**
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Agent Not Approved
**Request:**
```json
POST /api/v1/auth/login
{
  "email": "agent@example.com",
  "password": "correctpassword"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Agent not yet approved by admin."
}
```

## 3. Authentication/Authorization Errors

### Missing Token
**Request:**
```json
GET /api/v1/wallets/my-wallet
// No Authorization header
```

**Response:**
```json
{
  "success": false,
  "message": "You are not authorized! (Token missing)"
}
```

### Invalid Token
**Request:**
```json
GET /api/v1/wallets/my-wallet
Authorization: invalid_token
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid token or token expired!"
}
```

### Insufficient Permissions
**Request:**
```json
GET /api/v1/users/
Authorization: user_token_without_admin_role
```

**Response:**
```json
{
  "success": false,
  "message": "You are forbidden to access this resource!"
}
```

## 4. Success Response Format (for comparison)

### Successful Registration
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully!",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "isApproved": true,
    "_id": "64a1b2c3d4e5f6789012345",
    "wallet": "64a1b2c3d4e5f6789012346",
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  }
}
```

## HTTP Status Codes Used

- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Authentication required, invalid/expired token
- **403 Forbidden**: Insufficient permissions, agent not approved
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate data (email, phone already exists)
- **500 Internal Server Error**: Unexpected server errors

## Response Structure

All error responses follow this consistent structure:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

All success responses follow this structure:
```json
{
  "success": true,
  "message": "Success description",
  "data": { /* response data */ }
}
```
