# API Documentation - Client Company Onboarding System

## Overview
This system allows Company Users (SUPER_ADMIN/ADMIN) to onboard Client Companies and manage them. Client Companies can then manage their own users.

---

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## User Types & Roles

### UserType
- `COMPANY_USER` - Internal company employees
- `CLIENT_USER` - Employees of client companies

### Roles (for both user types)
- `SUPER_ADMIN` - Full access
- `ADMIN` - Administrative access
- `GENERAL` - Limited access

---

## API Endpoints

### 1. Company User Authentication

#### Login Company User
```http
POST /api/company-users/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "admin@company.com",
    "role": "SUPER_ADMIN",
    "userType": "COMPANY_USER"
  }
}
```

---

### 2. Client Company Onboarding

#### Onboard New Client Company
**Accessible by:** Company SUPER_ADMIN or ADMIN

```http
POST /api/onboard/client-company
Authorization: Bearer <company_user_token>
Content-Type: application/json

{
  // Required ClientCompany details
  "companyName": "Acme Corporation",
  "companyEmail": "contact@acme.com",
  "companyMobile": "9876543210",
  
  // Optional ClientCompany details
  "clientType": "PREMIUM",
  "validTill": "2025-12-31",
  "credits": 1000,
  "whatsappEnabled": true,
  "broadcastEnabled": true,
  "alarmEnabled": false,
  
  // Required Client Super Admin details
  "adminName": "Jane Smith",
  "adminEmail": "jane@acme.com",
  "adminMobile": "9876543211"
}
```

**Response:**
```json
{
  "message": "Client company onboarded successfully. Setup email sent to admin.",
  "company": {
    "id": 1,
    "companyName": "Acme Corporation",
    "email": "contact@acme.com",
    "mobile": "9876543210",
    "clientType": "PREMIUM",
    "status": "ACTIVE"
  },
  "admin": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@acme.com",
    "role": "SUPER_ADMIN"
  }
}
```

**Note:** A setup email with temporary password is sent to the admin email.

---

#### Get All Client Companies
**Accessible by:** Company users (all roles)

```http
GET /api/onboard/client-companies
Authorization: Bearer <company_user_token>
```

**Response:**
```json
{
  "message": "Client companies retrieved successfully",
  "count": 2,
  "companies": [
    {
      "id": 1,
      "companyName": "Acme Corporation",
      "email": "contact@acme.com",
      "mobile": "9876543210",
      "status": "ACTIVE",
      "clientType": "PREMIUM",
      "createdAt": "2025-10-06T10:00:00Z",
      "createdBy": {
        "id": 1,
        "name": "John Doe",
        "email": "admin@company.com"
      },
      "_count": {
        "clientUsers": 5,
        "products": 10
      }
    }
  ]
}
```

---

#### Get Single Client Company
**Accessible by:** Company users and Client users

```http
GET /api/onboard/client-company/:companyId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Company details retrieved successfully",
  "company": {
    "id": 1,
    "companyName": "Acme Corporation",
    "email": "contact@acme.com",
    "mobile": "9876543210",
    "status": "ACTIVE",
    "clientType": "PREMIUM",
    "validTill": "2025-12-31T00:00:00Z",
    "credits": 1000,
    "whatsappEnabled": true,
    "broadcastEnabled": true,
    "alarmEnabled": false,
    "numProductsAssigned": 10,
    "numProductsInUse": 8,
    "createdBy": { "id": 1, "name": "John Doe", "email": "admin@company.com" },
    "clientUsers": [
      {
        "id": 1,
        "name": "Jane Smith",
        "email": "jane@acme.com",
        "role": "SUPER_ADMIN",
        "status": "ACTIVE"
      }
    ],
    "products": []
  }
}
```

---

#### Edit Client Company
**Accessible by:** Company ADMIN/SUPER_ADMIN and Client SUPER_ADMIN/ADMIN

```http
PUT /api/onboard/client-company/:companyId
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Acme Corp Updated",
  "email": "newemail@acme.com",
  "mobile": "9876543999",
  "clientType": "ENTERPRISE",
  "credits": 2000,
  "whatsappEnabled": false
}
```

**Response:**
```json
{
  "message": "Company updated successfully",
  "company": {
    "id": 1,
    "companyName": "Acme Corp Updated",
    "email": "newemail@acme.com",
    "mobile": "9876543999",
    "clientType": "ENTERPRISE",
    "status": "ACTIVE"
  }
}
```

---

#### Toggle Company Status
**Accessible by:** Company ADMIN/SUPER_ADMIN and Client SUPER_ADMIN/ADMIN

```http
PATCH /api/onboard/client-company/:companyId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "INACTIVE"
}
```

**Response:**
```json
{
  "message": "Company status updated to INACTIVE",
  "company": {
    "id": 1,
    "companyName": "Acme Corporation",
    "status": "INACTIVE"
  }
}
```

---

#### Delete Client Company
**Accessible by:** Company SUPER_ADMIN ONLY

```http
DELETE /api/onboard/client-company/:companyId
Authorization: Bearer <company_super_admin_token>
```

**Response:**
```json
{
  "message": "Company deleted successfully",
  "deletedCompany": {
    "id": 1,
    "companyName": "Acme Corporation",
    "deletedUsers": 5,
    "unassignedProducts": 10
  }
}
```

**Note:** This will delete all client users and unassign all products.

---

### 3. Client User Management

#### Login Client User
```http
POST /api/client-users/login
Content-Type: application/json

{
  "email": "jane@acme.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@acme.com",
    "mobile": "9876543211",
    "role": "SUPER_ADMIN",
    "userType": "CLIENT_USER"
  },
  "company": {
    "id": 1,
    "companyName": "Acme Corporation",
    "email": "contact@acme.com",
    "clientType": "PREMIUM",
    "credits": 1000
  }
}
```

---

#### Add Client User
**Accessible by:** Client SUPER_ADMIN or ADMIN

```http
POST /api/client-users
Authorization: Bearer <client_user_token>
Content-Type: application/json

{
  "name": "Bob Johnson",
  "email": "bob@acme.com",
  "mobile": "9876543212",
  "role": "GENERAL"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "name": "Bob Johnson",
    "email": "bob@acme.com",
    "mobile": "9876543212",
    "role": "GENERAL"
  },
  "tempPassword": "xyz123abc"
}
```

---

#### Get All Client Users
**Accessible by:** All authenticated client users

```http
GET /api/client-users
Authorization: Bearer <client_user_token>
```

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "count": 2,
  "users": [
    {
      "id": 1,
      "name": "Jane Smith",
      "email": "jane@acme.com",
      "mobile": "9876543211",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "createdAt": "2025-10-06T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Bob Johnson",
      "email": "bob@acme.com",
      "mobile": "9876543212",
      "role": "GENERAL",
      "status": "ACTIVE",
      "createdAt": "2025-10-06T11:00:00Z"
    }
  ]
}
```

---

#### Update Client User
**Accessible by:** Client SUPER_ADMIN or ADMIN

```http
PUT /api/client-users/:userId
Authorization: Bearer <client_user_token>
Content-Type: application/json

{
  "name": "Bob Johnson Updated",
  "mobile": "9876543999",
  "role": "ADMIN",
  "status": "INACTIVE"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 2,
    "name": "Bob Johnson Updated",
    "email": "bob@acme.com",
    "mobile": "9876543999",
    "role": "ADMIN",
    "status": "INACTIVE"
  }
}
```

---

#### Delete Client User
**Accessible by:** Client SUPER_ADMIN ONLY

```http
DELETE /api/client-users/:userId
Authorization: Bearer <client_super_admin_token>
```

**Response:**
```json
{
  "message": "User deleted successfully",
  "deletedUser": {
    "id": 2,
    "name": "Bob Johnson",
    "email": "bob@acme.com"
  }
}
```

---

#### Change Password
**Accessible by:** Any authenticated client user

```http
POST /api/client-users/change-password
Authorization: Bearer <client_user_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

## Middleware Features

### validateClientCompany Middleware
Automatically applied to all client user endpoints. It:
- Validates JWT token
- Checks if user is CLIENT_USER
- Verifies user account is ACTIVE
- Checks if ClientCompany exists and is ACTIVE
- Verifies company subscription hasn't expired
- Stores company details in `req.company`
- Stores user details in `req.clientUser`

### authMiddleware
Applied to company user endpoints. It:
- Validates JWT token
- Checks if user is COMPANY_USER
- Verifies user account is ACTIVE
- Enforces role-based access control

### unifiedAuthMiddleware
Supports both COMPANY_USER and CLIENT_USER. Used in endpoints accessible by both user types.

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized: Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied: Your company is currently inactive"
}
```

### 404 Not Found
```json
{
  "message": "Company not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message details"
}
```

---

## Testing the APIs

### Step 1: Login as Company User
```bash
POST http://localhost:3000/api/company-users/login
{
  "email": "your_company_user_email",
  "password": "your_password"
}
```
Save the token.

### Step 2: Onboard a Client Company
```bash
POST http://localhost:3000/api/onboard/client-company
Authorization: Bearer <company_user_token>
{
  "companyName": "Test Company",
  "companyEmail": "test@company.com",
  "companyMobile": "9999999999",
  "adminName": "Admin User",
  "adminEmail": "admin@testcompany.com",
  "adminMobile": "9999999998"
}
```

### Step 3: Check Email
The client super admin will receive an email with login credentials.

### Step 4: Login as Client User
```bash
POST http://localhost:3000/api/client-users/login
{
  "email": "admin@testcompany.com",
  "password": "temp_password_from_email"
}
```

### Step 5: Add More Users
```bash
POST http://localhost:3000/api/client-users
Authorization: Bearer <client_user_token>
{
  "name": "New User",
  "email": "newuser@testcompany.com",
  "mobile": "9999999997",
  "role": "GENERAL"
}
```

---

## 7. Species of Interest Management

### 7.1 Add Species to Master List (Company Admin Only)

**Endpoint:** `POST /api/species-of-interest/supported`

**Authentication:** COMPANY_USER JWT token required

**Description:** Allows company administrators to add new species to the master supported species list. Once added, these species become available for all client companies to select.

**Request:**
```http
POST /api/species-of-interest/supported
Authorization: Bearer <company_user_token>
Content-Type: application/json

{
  "specieId": "tiger",
  "specieName": "Tiger"
}
```

**Response (201 Created):**
```json
{
  "message": "Species added to master list successfully",
  "species": {
    "id": 5,
    "specieId": "tiger",
    "specieName": "Tiger",
    "active": true,
    "createdAt": "2025-11-12T10:30:00.000Z"
  }
}
```

**Error Responses:**

*Missing Required Fields (400):*
```json
{
  "message": "specieId and specieName are required"
}
```

*Duplicate Species (400):*
```json
{
  "message": "Species with specieId 'tiger' already exists in the master list"
}
```

*Unauthorized - Not a Company User (403):*
```json
{
  "message": "Access denied: user must be a COMPANY_USER"
}
```

**Field Requirements:**
- `specieId` (required): Unique identifier, lowercase, no spaces (e.g., "wild_boar")
- `specieName` (required): Display name, proper case (e.g., "Wild Boar")

**Access Control:**
- ✅ COMPANY_USER (all roles)
- ❌ CLIENT_USER (all roles)

### 7.2 Get Master Species List

**Endpoint:** `GET /api/species-of-interest/supported`

**Authentication:** CLIENT_USER or COMPANY_USER JWT token required

**Description:** Retrieves all active species from the master list.

**Request:**
```http
GET /api/species-of-interest/supported
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Supported species retrieved successfully",
  "species": [
    {
      "id": 1,
      "specieId": "cow",
      "specieName": "Cow",
      "active": true,
      "createdAt": "2025-11-12T09:00:00.000Z"
    },
    {
      "id": 2,
      "specieId": "dog",
      "specieName": "Dog",
      "active": true,
      "createdAt": "2025-11-12T09:00:00.000Z"
    }
  ]
}
```

### 7.3 Add Species of Interest (Client Admin Only)

**Endpoint:** `POST /api/species-of-interest`

**Authentication:** CLIENT_USER JWT token (ADMIN or SUPER_ADMIN role)

**Description:** Allows client admins to select a species from the master list and add it to their company's Species of Interest with a severity level.

**Request:**
```http
POST /api/species-of-interest
Authorization: Bearer <client_user_token>
Content-Type: application/json

{
  "specieId": 1,
  "severityLevel": "HIGH"
}
```

**Severity Levels:**
- `LOW` - Minimal threat, monitoring recommended
- `MEDIUM` - Moderate concern, requires attention
- `HIGH` - Significant threat, immediate action needed

**Response (201 Created):**
```json
{
  "message": "Species of interest added successfully",
  "speciesOfInterest": {
    "id": 1,
    "clientId": "abc-123",
    "specieId": 1,
    "specieName": "Tiger",
    "severityLevel": "HIGH",
    "active": true,
    "createdAt": "2025-11-12T11:00:00.000Z"
  }
}
```

### 7.4 Get Client's Species of Interest

**Endpoint:** `GET /api/species-of-interest`

**Authentication:** CLIENT_USER JWT token required

**Description:** Retrieves all species of interest for the authenticated client user's company.

**Request:**
```http
GET /api/species-of-interest
Authorization: Bearer <client_user_token>
```

**Response (200 OK):**
```json
{
  "message": "Species of interest retrieved successfully",
  "speciesOfInterest": [
    {
      "id": 1,
      "clientId": "abc-123",
      "specieId": 1,
      "specieName": "Tiger",
      "severityLevel": "HIGH",
      "active": true,
      "createdAt": "2025-11-12T11:00:00.000Z",
      "supportedSpecies": {
        "specieId": "tiger",
        "specieName": "Tiger"
      }
    }
  ]
}
```

### 7.5 Update Species Severity Level

**Endpoint:** `PUT /api/species-of-interest/:id`

**Authentication:** CLIENT_USER JWT token (ADMIN or SUPER_ADMIN role)

**Request:**
```http
PUT /api/species-of-interest/1
Authorization: Bearer <client_user_token>
Content-Type: application/json

{
  "severityLevel": "MEDIUM"
}
```

**Response (200 OK):**
```json
{
  "message": "Species of interest updated successfully",
  "speciesOfInterest": {
    "id": 1,
    "severityLevel": "MEDIUM",
    ...
  }
}
```

### 7.6 Delete Species of Interest

**Endpoint:** `DELETE /api/species-of-interest/:id`

**Authentication:** CLIENT_USER JWT token (ADMIN or SUPER_ADMIN role)

**Description:** Soft deletes a species of interest (sets active=false).

**Request:**
```http
DELETE /api/species-of-interest/1
Authorization: Bearer <client_user_token>
```

**Response (200 OK):**
```json
{
  "message": "Species of interest deleted successfully"
}
```

### 7.7 Toggle Species Active Status

**Endpoint:** `PATCH /api/species-of-interest/:id/toggle`

**Authentication:** CLIENT_USER JWT token (ADMIN or SUPER_ADMIN role)

**Description:** Toggles the active status of a species of interest.

**Request:**
```http
PATCH /api/species-of-interest/1/toggle
Authorization: Bearer <client_user_token>
```

**Response (200 OK):**
```json
{
  "message": "Species of interest activated successfully",
  "speciesOfInterest": {
    "id": 1,
    "active": true,
    ...
  }
}
```

---

## Notes

1. **Email Configuration**: Ensure `GMAIL_USER` and `GMAIL_PASS` are set in `.env` for email functionality
2. **JWT Secret**: Set strong `JWT_SECRET` in `.env`
3. **Database**: Run `npx prisma migrate dev` before testing
4. **Client Type**: Options are `STANDARD`, `PREMIUM`, `ENTERPRISE`
5. **Status**: Options are `ACTIVE`, `INACTIVE`
6. **Subscription**: If `validTill` is set and expired, client users cannot login
7. **Species Management**: 
   - Company users manage the master species list
   - Client users select from the master list for their company
   - Severity levels help prioritize species monitoring
   - See `ADD_SPECIES_API_GUIDE.md` for detailed species management guide
