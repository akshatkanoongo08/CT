# CameraTrap Management API Documentation

## Overview
Complete API documentation for managing Camera Traps (Products/Devices) with role-based access control.

---

## Access Control Summary

| Action | Company SUPER_ADMIN | Company ADMIN | Client SUPER_ADMIN | Client ADMIN | Client GENERAL |
|--------|---------------------|---------------|-------------------|--------------|----------------|
| Add CameraTrap | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All CameraTraps | ✅ (all) | ✅ (all) | ✅ (assigned only) | ✅ (assigned only) | ✅ (assigned only) |
| View Single CameraTrap | ✅ | ✅ | ✅ (if assigned) | ✅ (if assigned) | ✅ (if assigned) |
| Edit CameraTrap | ✅ (all fields) | ✅ (all fields) | ✅ (not assignment) | ✅ (not assignment) | ❌ |
| Delete CameraTrap | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign CameraTrap | ✅ | ✅ | ❌ | ❌ | ❌ |
| Unassign CameraTrap | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Endpoints

### 1. Add CameraTrap
**Accessible by:** Company ADMIN and SUPER_ADMIN only

```http
POST /api/camera-traps
Authorization: Bearer <company_user_token>
Content-Type: application/json

{
  "productId": "CT-12345",
  "batchId": "BATCH-001",
  "productType": "Trail Camera",
  "assignedToId": "client-company-uuid",
  "validTill": "2026-12-31",
  "gps": "12.9716° N, 77.5946° E",
  "imei": "123456789012345",
  "sim": "SIM-12345",
  "simNumber": "9876543210",
  "location": "Forest Area A"
}
```

**Required Fields:**
- `productId` (String) - Unique product identifier

**Optional Fields:**
- `batchId` - Batch identifier
- `productType` - Type of camera trap
- `assignedToId` - ClientCompany UUID (if assigning immediately)
- `validTill` - Product validity date
- `gps` - GPS coordinates
- `imei` - Device IMEI number
- `sim` - SIM card info
- `simNumber` - SIM phone number
- `location` - Location description

**Response:**
```json
{
  "message": "CameraTrap added successfully",
  "cameraTrap": {
    "id": "trap-uuid",
    "productId": "CT-12345",
    "batchId": "BATCH-001",
    "productType": "Trail Camera",
    "assignedToId": "client-company-uuid",
    "assignedAt": "2025-10-07T10:00:00Z",
    "assignedById": "company-user-uuid",
    "validTill": "2026-12-31T00:00:00Z",
    "gps": "12.9716° N, 77.5946° E",
    "imei": "123456789012345",
    "sim": "SIM-12345",
    "simNumber": "9876543210",
    "location": "Forest Area A",
    "assignedTo": {
      "id": "client-company-uuid",
      "companyName": "ABC Tech",
      "email": "info@abctech.com"
    },
    "assignedBy": {
      "id": "company-user-uuid",
      "name": "Super Admin",
      "email": "admin@company.com"
    }
  }
}
```

**Notes:**
- If `assignedToId` is provided:
  - ClientCompany's `numProductsAssigned` is automatically incremented
  - `assignedAt` and `assignedById` are automatically set
- ClientCompany must be ACTIVE to assign

---

### 2. Get All CameraTraps

**Company Users:** See all CameraTraps  
**Client Users:** See only CameraTraps assigned to their company

```http
GET /api/camera-traps
Authorization: Bearer <token>
```

**Response (Company User):**
```json
{
  "message": "CameraTraps retrieved successfully",
  "count": 25,
  "cameraTraps": [
    {
      "id": "trap-uuid",
      "productId": "CT-12345",
      "batchId": "BATCH-001",
      "productType": "Trail Camera",
      "assignedToId": "company-uuid",
      "assignedAt": "2025-10-07T10:00:00Z",
      "assignedById": "user-uuid",
      "validTill": "2026-12-31T00:00:00Z",
      "gps": "12.9716° N, 77.5946° E",
      "imei": "123456789012345",
      "location": "Forest Area A",
      "assignedTo": {
        "id": "company-uuid",
        "companyName": "ABC Tech",
        "email": "info@abctech.com",
        "status": "ACTIVE"
      },
      "assignedBy": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@company.com"
      }
    }
  ]
}
```

**Response (Client User):**
```json
{
  "message": "CameraTraps retrieved successfully",
  "count": 5,
  "cameraTraps": [
    // Only CameraTraps assigned to this client's company
  ]
}
```

---

### 3. Get Single CameraTrap

**Company Users:** Can view any CameraTrap  
**Client Users:** Can only view if assigned to their company

```http
GET /api/camera-traps/:trapId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "CameraTrap retrieved successfully",
  "cameraTrap": {
    "id": "trap-uuid",
    "productId": "CT-12345",
    "batchId": "BATCH-001",
    "productType": "Trail Camera",
    "assignedToId": "company-uuid",
    "assignedAt": "2025-10-07T10:00:00Z",
    "assignedById": "user-uuid",
    "validTill": "2026-12-31T00:00:00Z",
    "gps": "12.9716° N, 77.5946° E",
    "imei": "123456789012345",
    "sim": "SIM-12345",
    "simNumber": "9876543210",
    "location": "Forest Area A",
    "assignedTo": {
      "id": "company-uuid",
      "companyName": "ABC Tech",
      "email": "info@abctech.com",
      "mobile": "9876543210",
      "status": "ACTIVE",
      "clientType": "PREMIUM"
    },
    "assignedBy": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "SUPER_ADMIN"
    }
  }
}
```

**Error (Client User accessing unassigned CameraTrap):**
```json
{
  "message": "Access denied: CameraTrap not assigned to your company"
}
```

---

### 4. Edit CameraTrap

**Company Users:** Can edit all fields including assignment  
**Client Users:** Can edit details but NOT assignment

```http
PUT /api/camera-traps/:trapId
Authorization: Bearer <token>
Content-Type: application/json

{
  "productType": "Night Vision Camera",
  "gps": "13.0827° N, 80.2707° E",
  "location": "Forest Area B",
  "validTill": "2027-12-31"
}
```

**Company User - Change Assignment:**
```json
{
  "assignedToId": "new-company-uuid",
  "location": "Transferred to New Location"
}
```

**Response:**
```json
{
  "message": "CameraTrap updated successfully",
  "cameraTrap": {
    "id": "trap-uuid",
    "productId": "CT-12345",
    "productType": "Night Vision Camera",
    "gps": "13.0827° N, 80.2707° E",
    "location": "Forest Area B",
    "validTill": "2027-12-31T00:00:00Z",
    // ... other fields
  }
}
```

**Client User Error (trying to change assignment):**
```json
{
  "message": "Access denied: Client users cannot change assignment"
}
```

**Client User Error (accessing unassigned CameraTrap):**
```json
{
  "message": "Access denied: CameraTrap not assigned to your company"
}
```

**Notes:**
- When changing assignment (Company users only):
  - Old company's `numProductsAssigned` decrements
  - New company's `numProductsAssigned` increments
  - `assignedAt` and `assignedById` are updated

---

### 5. Delete CameraTrap

**Accessible by:** Company ADMIN and SUPER_ADMIN only

```http
DELETE /api/camera-traps/:trapId
Authorization: Bearer <company_user_token>
```

**Response:**
```json
{
  "message": "CameraTrap deleted successfully",
  "deletedTrap": {
    "id": "trap-uuid",
    "productId": "CT-12345",
    "assignedTo": "company-uuid"
  }
}
```

**Client User Error:**
```json
{
  "message": "Access denied: Only company users can delete CameraTraps"
}
```

**Notes:**
- If CameraTrap was assigned, the ClientCompany's `numProductsAssigned` is automatically decremented

---

### 6. Assign CameraTrap to Company

**Accessible by:** Company ADMIN and SUPER_ADMIN only

```http
POST /api/camera-traps/:trapId/assign
Authorization: Bearer <company_user_token>
Content-Type: application/json

{
  "assignedToId": "client-company-uuid"
}
```

**Response:**
```json
{
  "message": "CameraTrap assigned successfully",
  "cameraTrap": {
    "id": "trap-uuid",
    "productId": "CT-12345",
    "assignedToId": "client-company-uuid",
    "assignedAt": "2025-10-07T10:00:00Z",
    "assignedById": "company-user-uuid",
    "assignedTo": {
      "id": "client-company-uuid",
      "companyName": "ABC Tech",
      "email": "info@abctech.com"
    },
    "assignedBy": {
      "id": "company-user-uuid",
      "name": "Super Admin",
      "email": "admin@company.com"
    }
  }
}
```

**Notes:**
- If reassigning (already assigned to another company):
  - Old company's count decrements
  - New company's count increments
- Cannot assign to INACTIVE company

---

### 7. Unassign CameraTrap from Company

**Accessible by:** Company ADMIN and SUPER_ADMIN only

```http
POST /api/camera-traps/:trapId/unassign
Authorization: Bearer <company_user_token>
```

**Response:**
```json
{
  "message": "CameraTrap unassigned successfully",
  "cameraTrap": {
    "id": "trap-uuid",
    "productId": "CT-12345",
    "assignedToId": null,
    "assignedAt": null,
    "assignedById": null
  }
}
```

**Error (if not assigned):**
```json
{
  "message": "CameraTrap is not assigned to any company"
}
```

**Notes:**
- Company's `numProductsAssigned` is automatically decremented

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Product ID is required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied: Only company users can delete CameraTraps"
}
```

### 404 Not Found
```json
{
  "message": "CameraTrap not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message details"
}
```

---

## Testing Workflow

### Step 1: Login as Company User
```
POST http://localhost:3000/api/company-users/login
Body: { "email": "admin@company.com", "password": "password" }
```

### Step 2: Add CameraTrap (Unassigned)
```
POST http://localhost:3000/api/camera-traps
Authorization: Bearer <company_token>
Body: {
  "productId": "CT-001",
  "productType": "Trail Camera",
  "gps": "12.9716° N, 77.5946° E"
}
```

### Step 3: Onboard Client Company
```
POST http://localhost:3000/api/onboard/client-company
Authorization: Bearer <company_token>
Body: { ... company details ... }
```

### Step 4: Assign CameraTrap
```
POST http://localhost:3000/api/camera-traps/<trapId>/assign
Authorization: Bearer <company_token>
Body: { "assignedToId": "<company_uuid>" }
```

### Step 5: Login as Client User
```
POST http://localhost:3000/api/client-users/login
Body: { "email": "client@company.com", "password": "password" }
```

### Step 6: View Assigned CameraTraps
```
GET http://localhost:3000/api/camera-traps
Authorization: Bearer <client_token>
```

### Step 7: Edit CameraTrap (as Client)
```
PUT http://localhost:3000/api/camera-traps/<trapId>
Authorization: Bearer <client_token>
Body: { "location": "New Location", "gps": "new coordinates" }
```

### Step 8: Try to Delete (Should Fail)
```
DELETE http://localhost:3000/api/camera-traps/<trapId>
Authorization: Bearer <client_token>
// Expected: 403 Forbidden
```

---

## Business Logic

### Product Count Management
- **On Add with Assignment:** `numProductsAssigned++`
- **On Assign:** `numProductsAssigned++` (new company)
- **On Reassign:** Old company `--`, New company `++`
- **On Unassign:** `numProductsAssigned--`
- **On Delete:** `numProductsAssigned--` (if was assigned)

### Access Rules
1. **Company Users (ADMIN/SUPER_ADMIN):**
   - Full CRUD access
   - Can manage all CameraTraps
   - Can assign/unassign to any company

2. **Client Users (SUPER_ADMIN/ADMIN):**
   - Read: Only assigned CameraTraps
   - Edit: Only assigned CameraTraps (not assignment field)
   - No delete access

3. **Client Users (GENERAL):**
   - Read-only access to assigned CameraTraps

---

## Key Features

✅ Role-based access control  
✅ Automatic product count tracking  
✅ Assignment audit trail (who assigned, when)  
✅ Company status validation (cannot assign to inactive)  
✅ Client user restrictions (cannot change assignment)  
✅ Filtered views (clients see only their CameraTraps)  
✅ Complete CRUD operations  
✅ Reassignment support with count management  

---

**All endpoints are ready to test!** 🎉
