# Complete Postman Testing Guide

## Prerequisites
1. Server running on `http://localhost:3000`
2. Database migrated and super admin created
3. Postman installed

## Base URL
```
http://localhost:3000
```

---

## 📋 **Phase 1: Company User APIs**

### 1. **Login as Company Super Admin**
**Endpoint:** `POST /api/company-users/login`

**Request Body:**
```json
{
  "email": "superadmin@company.com",
  "password": "SuperAdmin@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login Successful",
  "data": {
    "user": {
      "id": "8d827365-d03b-4bcd-934b-6235cbfbd3fc",
      "name": "Super Admin",
      "email": "superadmin@company.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Copy the `token` value and save it as `COMPANY_TOKEN` for subsequent requests.

---

### 2. **Get All Company Users**
**Endpoint:** `GET /api/company-users`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Company Users fetched successfully",
  "data": [
    {
      "id": "8d827365-d03b-4bcd-934b-6235cbfbd3fc",
      "name": "Super Admin",
      "email": "superadmin@company.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "createdAt": "2025-10-07T..."
    }
  ]
}
```

---

### 3. **Add Company Admin User**
**Endpoint:** `POST /api/company-users/add-user`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Request Body:**
```json
{
  "name": "John Admin",
  "email": "john.admin@company.com",
  "password": "Admin@123",
  "role": "ADMIN"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Company User Added Successfully",
  "data": {
    "id": "generated-uuid",
    "name": "John Admin",
    "email": "john.admin@company.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

---

### 4. **Update Company User**
**Endpoint:** `PUT /api/company-users/:userId`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/company-users/<userId>`

**Request Body:**
```json
{
  "name": "John Admin Updated",
  "role": "SUPER_ADMIN"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Company User Updated Successfully",
  "data": {
    "id": "userId",
    "name": "John Admin Updated",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE"
  }
}
```

---

### 5. **Change Company User Password**
**Endpoint:** `POST /api/company-users/change-password`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Request Body:**
```json
{
  "oldPassword": "SuperAdmin@123",
  "newPassword": "NewPassword@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password Changed Successfully"
}
```

**Note:** If testing this, remember to use new password for future logins!

---

### 6. **Delete Company User**
**Endpoint:** `DELETE /api/company-users/:userId`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/company-users/<userId>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Company User Deleted Successfully"
}
```

---

## 📋 **Phase 2: Client Company Onboarding APIs**

### 7. **Onboard Client Company**
**Endpoint:** `POST /api/onboard/client-company`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Request Body:**
```json
{
  "companyName": "Tech Solutions Ltd",
  "email": "contact@techsolutions.com",
  "phone": "+1234567890",
  "address": "123 Tech Street, Silicon Valley",
  "clientType": "PREMIUM",
  "validTill": "2026-12-31",
  "credits": 5000,
  "numProductsAssigned": 0,
  "superAdminName": "Alice Johnson",
  "superAdminEmail": "alice@techsolutions.com",
  "superAdminPassword": "Alice@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client Company onboarded successfully. Super Admin credentials sent via email.",
  "data": {
    "company": {
      "id": "client-company-uuid",
      "companyName": "Tech Solutions Ltd",
      "email": "contact@techsolutions.com",
      "clientType": "PREMIUM",
      "status": "ACTIVE",
      "validTill": "2026-12-31T...",
      "credits": 5000,
      "numProductsAssigned": 0
    },
    "superAdmin": {
      "id": "client-admin-uuid",
      "name": "Alice Johnson",
      "email": "alice@techsolutions.com",
      "role": "SUPER_ADMIN"
    }
  }
}
```

**Action:** Save the `company.id` as `CLIENT_COMPANY_ID` and note the super admin email for login.

---

### 8. **Get All Client Companies**
**Endpoint:** `GET /api/onboard/client-companies`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client Companies fetched successfully",
  "data": [
    {
      "id": "client-company-uuid",
      "companyName": "Tech Solutions Ltd",
      "email": "contact@techsolutions.com",
      "clientType": "PREMIUM",
      "status": "ACTIVE",
      "validTill": "2026-12-31T...",
      "credits": 5000,
      "numProductsAssigned": 0,
      "createdById": "8d827365-d03b-4bcd-934b-6235cbfbd3fc"
    }
  ]
}
```

---

### 9. **Get Single Client Company**
**Endpoint:** `GET /api/onboard/client-company/:companyId`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/onboard/client-company/<CLIENT_COMPANY_ID>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Client Company fetched successfully",
  "data": {
    "id": "client-company-uuid",
    "companyName": "Tech Solutions Ltd",
    "email": "contact@techsolutions.com",
    "clientType": "PREMIUM",
    "status": "ACTIVE",
    "validTill": "2026-12-31T...",
    "credits": 5000,
    "numProductsAssigned": 0,
    "users": [
      {
        "id": "client-admin-uuid",
        "name": "Alice Johnson",
        "email": "alice@techsolutions.com",
        "role": "SUPER_ADMIN"
      }
    ]
  }
}
```

---

### 10. **Edit Client Company**
**Endpoint:** `PUT /api/onboard/client-company/:companyId`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/onboard/client-company/<CLIENT_COMPANY_ID>`

**Request Body:**
```json
{
  "companyName": "Tech Solutions Limited",
  "phone": "+1234567899",
  "clientType": "ENTERPRISE",
  "credits": 10000,
  "validTill": "2027-12-31"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client Company updated successfully",
  "data": {
    "id": "client-company-uuid",
    "companyName": "Tech Solutions Limited",
    "clientType": "ENTERPRISE",
    "credits": 10000
  }
}
```

---

### 11. **Toggle Client Company Status**
**Endpoint:** `PATCH /api/onboard/client-company/:companyId/toggle-status`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/onboard/client-company/<CLIENT_COMPANY_ID>/toggle-status`

**Expected Response:**
```json
{
  "success": true,
  "message": "Client Company status updated to INACTIVE",
  "data": {
    "id": "client-company-uuid",
    "status": "INACTIVE"
  }
}
```

**Note:** Toggle again to make it ACTIVE before testing client user login.

---

### 12. **Delete Client Company**
**Endpoint:** `DELETE /api/onboard/client-company/:companyId`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/onboard/client-company/<CLIENT_COMPANY_ID>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Client Company and all associated users deleted successfully"
}
```

**⚠️ Warning:** Don't test this yet! Create it first, then test delete at the end.

---

## 📋 **Phase 3: Client User APIs**

### 13. **Login as Client Super Admin**
**Endpoint:** `POST /api/client-users/login`

**Request Body:**
```json
{
  "email": "alice@techsolutions.com",
  "password": "Alice@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login Successful",
  "data": {
    "user": {
      "id": "client-admin-uuid",
      "name": "Alice Johnson",
      "email": "alice@techsolutions.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "clientId": "client-company-uuid"
    },
    "company": {
      "id": "client-company-uuid",
      "companyName": "Tech Solutions Ltd",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Save the `token` as `CLIENT_TOKEN` for subsequent requests.

---

### 14. **Get All Client Users**
**Endpoint:** `GET /api/client-users`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client Users fetched successfully",
  "data": [
    {
      "id": "client-admin-uuid",
      "name": "Alice Johnson",
      "email": "alice@techsolutions.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "clientId": "client-company-uuid"
    }
  ]
}
```

---

### 15. **Add Client User**
**Endpoint:** `POST /api/client-users/add-user`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**Request Body:**
```json
{
  "name": "Bob Manager",
  "email": "bob@techsolutions.com",
  "password": "Bob@123",
  "role": "ADMIN"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client User Added Successfully",
  "data": {
    "id": "new-client-user-uuid",
    "name": "Bob Manager",
    "email": "bob@techsolutions.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "clientId": "client-company-uuid"
  }
}
```

---

### 16. **Update Client User**
**Endpoint:** `PUT /api/client-users/:userId`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**URL:** `http://localhost:3000/api/client-users/<new-client-user-uuid>`

**Request Body:**
```json
{
  "name": "Bob Senior Manager",
  "role": "SUPER_ADMIN"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client User Updated Successfully",
  "data": {
    "id": "new-client-user-uuid",
    "name": "Bob Senior Manager",
    "role": "SUPER_ADMIN"
  }
}
```

---

### 17. **Change Client User Password**
**Endpoint:** `POST /api/client-users/change-password`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**Request Body:**
```json
{
  "oldPassword": "Alice@123",
  "newPassword": "NewAlice@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password Changed Successfully"
}
```

---

### 18. **Delete Client User**
**Endpoint:** `DELETE /api/client-users/:userId`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**URL:** `http://localhost:3000/api/client-users/<new-client-user-uuid>`

**Expected Response:**
```json
{
  "success": true,
  "message": "Client User Deleted Successfully"
}
```

---

## 📋 **Phase 4: CameraTrap APIs**

### 19. **Add CameraTrap (Unassigned)**
**Endpoint:** `POST /api/camera-traps`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Request Body:**
```json
{
  "model": "CT-PRO-2024",
  "cameraId": "CAM-001",
  "trapName": "Forest Trap Alpha",
  "sensorType": "Motion",
  "specs": {
    "resolution": "4K",
    "nightVision": true,
    "batteryLife": "6 months"
  },
  "createdAt": "2025-10-07",
  "location": "Forest Reserve A, Section 3"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap added successfully",
  "data": {
    "id": "camera-trap-uuid-1",
    "model": "CT-PRO-2024",
    "cameraId": "CAM-001",
    "trapName": "Forest Trap Alpha",
    "sensorType": "Motion",
    "specs": {...},
    "location": "Forest Reserve A, Section 3",
    "assignedToId": null,
    "assignedAt": null,
    "assignedById": null
  }
}
```

**Action:** Save the `id` as `CAMERA_TRAP_ID_1`

---

### 20. **Add CameraTrap (Assigned)**
**Endpoint:** `POST /api/camera-traps`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Request Body:**
```json
{
  "model": "CT-STANDARD-2024",
  "cameraId": "CAM-002",
  "trapName": "Wildlife Trap Beta",
  "sensorType": "Heat",
  "specs": {
    "resolution": "1080p",
    "nightVision": true,
    "batteryLife": "3 months"
  },
  "createdAt": "2025-10-07",
  "location": "Wildlife Sanctuary B, Zone 1",
  "assignedToId": "<CLIENT_COMPANY_ID>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap added successfully",
  "data": {
    "id": "camera-trap-uuid-2",
    "model": "CT-STANDARD-2024",
    "cameraId": "CAM-002",
    "trapName": "Wildlife Trap Beta",
    "assignedToId": "client-company-uuid",
    "assignedAt": "2025-10-07T...",
    "assignedById": "8d827365-d03b-4bcd-934b-6235cbfbd3fc"
  }
}
```

**Action:** Save the `id` as `CAMERA_TRAP_ID_2`

**Note:** Check that ClientCompany `numProductsAssigned` increased to 1.

---

### 21. **Get All CameraTraps (Company User)**
**Endpoint:** `GET /api/camera-traps`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTraps fetched successfully",
  "data": [
    {
      "id": "camera-trap-uuid-1",
      "trapName": "Forest Trap Alpha",
      "assignedToId": null
    },
    {
      "id": "camera-trap-uuid-2",
      "trapName": "Wildlife Trap Beta",
      "assignedToId": "client-company-uuid",
      "assignedTo": {
        "companyName": "Tech Solutions Ltd"
      }
    }
  ]
}
```

**Note:** Company user sees ALL CameraTraps.

---

### 22. **Get All CameraTraps (Client User)**
**Endpoint:** `GET /api/camera-traps`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTraps fetched successfully",
  "data": [
    {
      "id": "camera-trap-uuid-2",
      "trapName": "Wildlife Trap Beta",
      "assignedToId": "client-company-uuid"
    }
  ]
}
```

**Note:** Client user sees ONLY assigned CameraTraps (CAM-002 only).

---

### 23. **Get Single CameraTrap**
**Endpoint:** `GET /api/camera-traps/:trapId`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_2>`

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap fetched successfully",
  "data": {
    "id": "camera-trap-uuid-2",
    "model": "CT-STANDARD-2024",
    "cameraId": "CAM-002",
    "trapName": "Wildlife Trap Beta",
    "sensorType": "Heat",
    "specs": {...},
    "location": "Wildlife Sanctuary B, Zone 1",
    "assignedToId": "client-company-uuid",
    "assignedAt": "2025-10-07T...",
    "assignedTo": {
      "companyName": "Tech Solutions Ltd"
    }
  }
}
```

---

### 24. **Edit CameraTrap (Company User)**
**Endpoint:** `PUT /api/camera-traps/:trapId`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_2>`

**Request Body:**
```json
{
  "trapName": "Wildlife Trap Beta Updated",
  "location": "Wildlife Sanctuary B, Zone 2",
  "sensorType": "Motion"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap updated successfully",
  "data": {
    "id": "camera-trap-uuid-2",
    "trapName": "Wildlife Trap Beta Updated",
    "location": "Wildlife Sanctuary B, Zone 2",
    "sensorType": "Motion"
  }
}
```

---

### 25. **Edit CameraTrap (Client User)**
**Endpoint:** `PUT /api/camera-traps/:trapId`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_2>`

**Request Body:**
```json
{
  "trapName": "Client Updated Trap Name",
  "location": "New Location by Client"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap updated successfully",
  "data": {
    "id": "camera-trap-uuid-2",
    "trapName": "Client Updated Trap Name",
    "location": "New Location by Client"
  }
}
```

---

### 26. **Client User Tries to Change Assignment (Should Fail)**
**Endpoint:** `PUT /api/camera-traps/:trapId`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_2>`

**Request Body:**
```json
{
  "assignedToId": null
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Client users are not allowed to change camera assignment"
}
```

**Status Code:** 403

---

### 27. **Assign CameraTrap to Company**
**Endpoint:** `POST /api/camera-traps/:trapId/assign`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_1>/assign`

**Request Body:**
```json
{
  "companyId": "<CLIENT_COMPANY_ID>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap assigned successfully",
  "data": {
    "id": "camera-trap-uuid-1",
    "trapName": "Forest Trap Alpha",
    "assignedToId": "client-company-uuid",
    "assignedAt": "2025-10-07T...",
    "assignedById": "8d827365-d03b-4bcd-934b-6235cbfbd3fc",
    "assignedTo": {
      "companyName": "Tech Solutions Ltd",
      "numProductsAssigned": 2
    }
  }
}
```

**Note:** Check that `numProductsAssigned` increased to 2.

---

### 28. **Reassign CameraTrap to Another Company**

**First, create another client company:**

**Endpoint:** `POST /api/onboard/client-company`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**Request Body:**
```json
{
  "companyName": "Wildlife Corp",
  "email": "contact@wildlifecorp.com",
  "phone": "+1987654321",
  "address": "456 Nature Ave",
  "clientType": "STANDARD",
  "validTill": "2026-12-31",
  "credits": 3000,
  "numProductsAssigned": 0,
  "superAdminName": "Charlie Boss",
  "superAdminEmail": "charlie@wildlifecorp.com",
  "superAdminPassword": "Charlie@123"
}
```

**Action:** Save the new company ID as `CLIENT_COMPANY_ID_2`

**Then reassign:**

**Endpoint:** `POST /api/camera-traps/:trapId/assign`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_1>/assign`

**Request Body:**
```json
{
  "companyId": "<CLIENT_COMPANY_ID_2>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap reassigned successfully",
  "data": {
    "id": "camera-trap-uuid-1",
    "assignedToId": "client-company-uuid-2",
    "previousCompany": {
      "id": "client-company-uuid",
      "numProductsAssigned": 1
    },
    "newCompany": {
      "id": "client-company-uuid-2",
      "numProductsAssigned": 1
    }
  }
}
```

**Note:** First company count decreased to 1, second company count increased to 1.

---

### 29. **Unassign CameraTrap**
**Endpoint:** `POST /api/camera-traps/:trapId/unassign`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_1>/unassign`

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap unassigned successfully",
  "data": {
    "id": "camera-trap-uuid-1",
    "assignedToId": null,
    "assignedAt": null,
    "assignedById": null,
    "previousCompany": {
      "id": "client-company-uuid-2",
      "numProductsAssigned": 0
    }
  }
}
```

**Note:** Company count decreased to 0.

---

### 30. **Client User Tries to Delete CameraTrap (Should Fail)**
**Endpoint:** `DELETE /api/camera-traps/:trapId`

**Headers:**
```
Authorization: Bearer <CLIENT_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_2>`

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied: Only COMPANY_USER can perform this action"
}
```

**Status Code:** 403

---

### 31. **Delete CameraTrap (Company User)**
**Endpoint:** `DELETE /api/camera-traps/:trapId`

**Headers:**
```
Authorization: Bearer <COMPANY_TOKEN>
```

**URL:** `http://localhost:3000/api/camera-traps/<CAMERA_TRAP_ID_2>`

**Expected Response:**
```json
{
  "success": true,
  "message": "CameraTrap deleted successfully",
  "data": {
    "previousCompany": {
      "id": "client-company-uuid",
      "numProductsAssigned": 0
    }
  }
}
```

**Note:** If it was assigned, company count decreased by 1.

---

## 🧪 **Testing Checklist**

### Company User APIs (6)
- [ ] Login
- [ ] Get All Company Users
- [ ] Add Company User
- [ ] Update Company User
- [ ] Change Password
- [ ] Delete Company User

### Client Company APIs (6)
- [ ] Onboard Client Company
- [ ] Get All Client Companies
- [ ] Get Single Client Company
- [ ] Edit Client Company
- [ ] Toggle Company Status
- [ ] Delete Client Company (test last)

### Client User APIs (6)
- [ ] Login as Client User
- [ ] Get All Client Users
- [ ] Add Client User
- [ ] Update Client User
- [ ] Change Password
- [ ] Delete Client User

### CameraTrap APIs (7)
- [ ] Add CameraTrap (unassigned)
- [ ] Add CameraTrap (assigned)
- [ ] Get All CameraTraps (Company view)
- [ ] Get All CameraTraps (Client view - filtered)
- [ ] Get Single CameraTrap
- [ ] Edit CameraTrap (Company user)
- [ ] Edit CameraTrap (Client user)
- [ ] Client tries to change assignment (should fail)
- [ ] Assign CameraTrap
- [ ] Reassign CameraTrap (check counts)
- [ ] Unassign CameraTrap
- [ ] Client tries to delete (should fail)
- [ ] Delete CameraTrap (Company user)

---

## 🔍 **Key Test Scenarios**

### Access Control Tests
1. ✅ Client user cannot add CameraTraps
2. ✅ Client user can only see assigned CameraTraps
3. ✅ Client user cannot delete CameraTraps
4. ✅ Client user cannot change assignment field
5. ✅ Only SUPER_ADMIN can delete company users
6. ✅ Inactive client company users cannot login

### Product Count Tests
1. ✅ Adding assigned CameraTrap increments count
2. ✅ Assigning unassigned CameraTrap increments count
3. ✅ Reassigning CameraTrap updates both companies
4. ✅ Unassigning CameraTrap decrements count
5. ✅ Deleting assigned CameraTrap decrements count

### Validation Tests
1. ✅ Cannot login with wrong password
2. ✅ Cannot add user with duplicate email
3. ✅ Cannot assign to non-existent company
4. ✅ Cannot access expired client company
5. ✅ Cannot add CameraTrap with duplicate cameraId

---

## 📊 **Expected Database State After All Tests**

**CompanyUser:**
- Super Admin (active)
- Possibly 1-2 additional users

**ClientCompany:**
- Tech Solutions Ltd (1-2 CameraTraps assigned)
- Wildlife Corp (0-1 CameraTraps assigned)

**ClientUser:**
- Alice Johnson (Tech Solutions super admin)
- Charlie Boss (Wildlife Corp super admin)
- Possibly other users

**CameraTrap:**
- Multiple traps in various assignment states

---

## 🚨 **Common Issues**

1. **401 Unauthorized:** Token expired or missing - re-login
2. **403 Forbidden:** Wrong user type or role - check access control
3. **404 Not Found:** Invalid UUID - check saved IDs
4. **500 Server Error:** Check server logs for details

---

## 📝 **Notes**

- All UUIDs are auto-generated by Prisma
- Tokens expire after configured time (check JWT_EXPIRY in .env)
- Email service sends actual emails (check spam folder)
- Product counts are automatically managed - verify after each assign/unassign/delete
- Client users cannot see unassigned CameraTraps
- Company users can perform all operations
