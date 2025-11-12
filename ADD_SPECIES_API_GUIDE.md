# Add Species to Master List - API Guide

This guide explains how to add new species to the master supported species list using the API endpoint (Method 2).

## Endpoint Details

**URL:** `POST http://localhost:5000/api/species-of-interest/supported`

**Authentication:** Required - COMPANY_USER JWT token

**Authorization:** Any COMPANY_USER role can add species (SUPER_ADMIN, ADMIN, GENERAL)

## Request Format

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "specieId": "tiger",
  "specieName": "Tiger"
}
```

### Field Descriptions
- `specieId` (required): Unique identifier for the species (lowercase, no spaces)
- `specieName` (required): Display name for the species (proper case)

## Example Requests

### 1. Add Tiger
```json
POST http://localhost:5000/api/species-of-interest/supported
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body:
{
  "specieId": "tiger",
  "specieName": "Tiger"
}
```

### 2. Add Elephant
```json
{
  "specieId": "elephant",
  "specieName": "Elephant"
}
```

### 3. Add Leopard
```json
{
  "specieId": "leopard",
  "specieName": "Leopard"
}
```

### 4. Add Wild Boar
```json
{
  "specieId": "wild_boar",
  "specieName": "Wild Boar"
}
```

## Success Response

**Status Code:** `201 Created`

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

## Error Responses

### 1. Missing Required Fields
**Status Code:** `400 Bad Request`
```json
{
  "message": "specieId and specieName are required"
}
```

### 2. Duplicate Species
**Status Code:** `400 Bad Request`
```json
{
  "message": "Species with specieId 'tiger' already exists in the master list"
}
```

### 3. Unauthorized (No Token)
**Status Code:** `403 Forbidden`
```json
{
  "message": "No token provided"
}
```

### 4. Invalid Token
**Status Code:** `401 Unauthorized`
```json
{
  "message": "Unauthorized: invalid or expired token"
}
```

### 5. Not a Company User
**Status Code:** `403 Forbidden`
```json
{
  "message": "Access denied: user must be a COMPANY_USER"
}
```

## How to Get JWT Token

### Step 1: Login as Company User
```
POST http://localhost:5000/api/auth/company/login
Content-Type: application/json

Body:
{
  "email": "your_company_email@example.com",
  "password": "your_password"
}
```

### Step 2: Copy the Token
From the response, copy the `token` value:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Step 3: Use Token in Request
Add the token to the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing in Postman

### Setup
1. Create a new POST request
2. URL: `http://localhost:5000/api/species-of-interest/supported`
3. Go to **Headers** tab:
   - Add `Authorization` header with value `Bearer <your_token>`
   - Add `Content-Type` header with value `application/json`
4. Go to **Body** tab:
   - Select **raw**
   - Select **JSON** from dropdown
   - Paste your JSON body

### Example Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Add Species to Master List",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login (Get Token)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"your_password\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/company/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "company", "login"]
        }
      }
    },
    {
      "name": "Add Tiger",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"specieId\": \"tiger\",\n  \"specieName\": \"Tiger\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/species-of-interest/supported",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "species-of-interest", "supported"]
        }
      }
    },
    {
      "name": "Add Elephant",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"specieId\": \"elephant\",\n  \"specieName\": \"Elephant\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/species-of-interest/supported",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "species-of-interest", "supported"]
        }
      }
    }
  ]
}
```

## Verification

After adding a species, verify it's available for clients:

### Check Master Species List
```
GET http://localhost:5000/api/species-of-interest/supported
Authorization: Bearer <client_user_token>
```

The newly added species should appear in the response.

## Notes

1. **Unique specieId**: Each species must have a unique `specieId`. The system will reject duplicates.

2. **Naming Convention**: 
   - `specieId`: lowercase, use underscores for spaces (e.g., "wild_boar")
   - `specieName`: proper case with spaces (e.g., "Wild Boar")

3. **Active by Default**: All new species are created with `active: true`

4. **Company Users Only**: This endpoint is exclusively for COMPANY_USER authentication. CLIENT_USER tokens will be rejected.

5. **Immediate Availability**: Once added, the species immediately becomes available for clients to select in their Species of Interest list.

## Common Use Cases

1. **Adding Wildlife Species**: Tiger, Leopard, Elephant, Bear, etc.
2. **Adding Domestic Animals**: Horse, Sheep, Goat, Buffalo, etc.
3. **Adding Birds**: Eagle, Peacock, Vulture, Crow, etc.
4. **Adding Reptiles**: Snake, Lizard, Crocodile, etc.

## Integration with Existing Workflow

Once a species is added via this API:

1. ✅ It appears in the master list (`GET /api/species-of-interest/supported`)
2. ✅ Client users can select it when adding Species of Interest
3. ✅ It's available in the searchable dropdown in the frontend
4. ✅ Clients can assign severity levels (LOW, MEDIUM, HIGH) to it
5. ✅ It persists across server restarts (stored in database)

---

**Last Updated:** November 12, 2025  
**API Version:** 1.0  
**Backend Port:** 5000
