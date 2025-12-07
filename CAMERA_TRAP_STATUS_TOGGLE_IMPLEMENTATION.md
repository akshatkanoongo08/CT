# Camera Trap Active/Inactive Toggle Feature - Implementation Summary

## ✅ Feature Implemented

Added the ability for **CLIENT_USER** (ADMIN/SUPER_ADMIN roles) to mark assigned camera traps as **ACTIVE** or **INACTIVE** from both the list view and detail page.

---

## 🎯 What Was Done

### 1. **Database Schema Update**
**File:** `prisma/schema.prisma`

- ✅ Added `status` field to `CameraTrap` model
- ✅ Type: `UserStatus` enum (ACTIVE/INACTIVE)
- ✅ Default: `ACTIVE`
- ✅ Migration created: `20251121105237_add_camera_trap_status`

**Schema Change:**
```prisma
model CameraTrap {
  id           String         @id @default(uuid())
  batchId      String?
  productId    String?
  assignedToId String?
  assignedAt   DateTime?
  assignedById String?
  productType  String?
  validTill    DateTime?
  gps          String?
  imei         String?
  sim          String?
  simNumber    String?
  location     String?
  status       UserStatus     @default(ACTIVE)  // ← NEW FIELD
  assignedBy   CompanyUser?   @relation(fields: [assignedById], references: [id])
  assignedTo   ClientCompany? @relation(fields: [assignedToId], references: [id])
}
```

---

### 2. **Backend Controller**
**File:** `src/controllers/ct.controller.js`

- ✅ Added `toggleCameraTrapStatus` function
- ✅ Toggles between ACTIVE ↔ INACTIVE
- ✅ Access control: CLIENT_USER can only toggle their company's cameras
- ✅ Access control: COMPANY_USER can toggle any camera
- ✅ Returns updated camera trap with new status

**Key Features:**
- Validates camera trap exists
- Checks user permissions
- Toggles status atomically
- Returns success message with updated data

---

### 3. **Backend Route**
**File:** `src/routes/ct.routes.js`

- ✅ Added route: `PATCH /api/camera-traps/:id/toggle`
- ✅ Uses `unifiedAuthMiddleware` (works for both COMPANY_USER and CLIENT_USER)
- ✅ Imported `toggleCameraTrapStatus` controller

**Route Definition:**
```javascript
router.patch(
  '/:id/toggle',
  unifiedAuthMiddleware,
  toggleCameraTrapStatus
);
```

---

### 4. **Frontend API Service**
**File:** `client/src/services/api.js`

- ✅ Added `toggleCameraTrapStatus(trapId)` method
- ✅ Makes PATCH request to `/camera-traps/:trapId/toggle`

**Method:**
```javascript
async toggleCameraTrapStatus(trapId) {
  return this.api.patch(`/camera-traps/${trapId}/toggle`);
}
```

---

### 5. **Camera Traps List Page**
**File:** `client/src/pages/CameraTraps.jsx`

**Changes:**
- ✅ Imported `Power` and `PowerOff` icons from lucide-react
- ✅ Imported `useAuth` to access user role
- ✅ Added `togglingId` state to track which camera is being toggled
- ✅ Added `handleToggleStatus` function with:
  - Prevents navigation when clicking toggle button
  - Prevents multiple simultaneous toggles
  - Updates local state optimistically
  - Shows success/error alerts
- ✅ Updated status badge to use `trap.status` from database
- ✅ Added toggle button in card footer
- ✅ **Role-based access:** Button only shown to ADMIN/SUPER_ADMIN

**UI Features:**
- 🟢 **Active camera:** Shows "Mark as Inactive" button (red theme)
- 🔴 **Inactive camera:** Shows "Mark as Active" button (green theme)
- ⏳ Loading spinner during toggle
- 🚫 Disabled state during toggle
- ✅ Success message after toggle
- ❌ Error message on failure

**Toggle Button:**
```jsx
{(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
  <button
    onClick={(e) => handleToggleStatus(e, trap.id)}
    disabled={togglingId === trap.id}
    className={/* conditional styling based on status */}
  >
    {/* Icon + Text based on current status */}
  </button>
)}
```

---

### 6. **Camera Trap Detail Page**
**File:** `client/src/pages/CameraTrapDetail.jsx`

**Changes:**
- ✅ Imported `Power` and `PowerOff` icons
- ✅ Added `toggling` state
- ✅ Added `handleToggleStatus` function with:
  - Updates camera trap state
  - Shows success message for 3 seconds
  - Shows error message on failure
- ✅ Updated status card to use `cameraTrap.status` from database
- ✅ Added prominent toggle button below status card
- ✅ **Role-based access:** Button only shown to ADMIN/SUPER_ADMIN

**UI Features:**
- 📊 Large status badge showing current state
- 🎨 Color-coded button (green for activate, red for deactivate)
- 🔄 Full-width button with icon and clear text
- ⏳ Loading state with spinner
- 🚫 Disabled during toggle
- ✅ Success message display
- ❌ Error message display

---

## 🎨 UI/UX Design

### List View (CameraTraps.jsx)
```
┌─────────────────────────────────────┐
│  🎥 Camera Name                 📶  │
│  Location                           │
│  IMEI: 123456789                    │
│  Valid Till: Dec 31, 2025          │
├─────────────────────────────────────┤
│  ✅ Active          👁️ View Details │
│  ┌───────────────────────────────┐  │
│  │  🔴 Mark as Inactive          │  │ ← Only for ADMIN/SUPER_ADMIN
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Detail View (CameraTrapDetail.jsx)
```
┌──────────────────────────────────────┐
│  🎥  Camera Trap CT001               │
│      Camera Trap Type    ✅ Active   │
│  ┌────────────────────────────────┐  │
│  │  🔴 Mark Camera Trap as        │  │ ← Only for ADMIN/SUPER_ADMIN
│  │     Inactive                   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 🔐 Access Control

| User Role | List View | Detail View | Notes |
|-----------|-----------|-------------|-------|
| **CLIENT_USER - GENERAL** | ❌ No toggle button | ❌ No toggle button | View-only access |
| **CLIENT_USER - ADMIN** | ✅ Toggle button shown | ✅ Toggle button shown | Can toggle status |
| **CLIENT_USER - SUPER_ADMIN** | ✅ Toggle button shown | ✅ Toggle button shown | Can toggle status |
| **COMPANY_USER** | ✅ Can toggle any camera | ✅ Can toggle any camera | Full access |

**Security:**
- Backend validates user has permission to toggle specific camera
- CLIENT_USER can only toggle cameras assigned to their company
- COMPANY_USER can toggle any camera
- Frontend hides button for GENERAL role

---

## 📊 Status vs Valid Till

**Important Distinction:**

| Field | Purpose | Controlled By | Displayed As |
|-------|---------|--------------|--------------|
| `status` | Manual active/inactive toggle | Client Admin | Active/Inactive badge |
| `validTill` | Subscription expiry date | Company Admin | Valid Till date |

**Use Cases:**
- **Status INACTIVE:** Camera temporarily disabled by client (maintenance, testing, etc.)
- **Status ACTIVE:** Camera is operational and can be used
- **validTill expired:** Subscription expired, needs renewal
- **validTill future:** Subscription is valid

Both fields affect camera availability, but serve different purposes.

---

## 🧪 Testing Steps

### **Test 1: List View Toggle (ADMIN User)**
1. Login as CLIENT_USER with ADMIN role
2. Navigate to Camera Traps page
3. Find an ACTIVE camera trap
4. Click "Mark as Inactive" button
5. ✅ Button shows loading spinner
6. ✅ Success message appears
7. ✅ Badge changes to "Inactive"
8. ✅ Button changes to "Mark as Active" (green)

### **Test 2: Detail View Toggle (ADMIN User)**
1. Click on a camera trap card
2. Navigate to detail page
3. See large status badge showing current status
4. Click the toggle button
5. ✅ Button shows loading state
6. ✅ Success message appears for 3 seconds
7. ✅ Status badge updates
8. ✅ Button text and color change

### **Test 3: GENERAL User Access**
1. Login as CLIENT_USER with GENERAL role
2. Navigate to Camera Traps page
3. ✅ No toggle button visible on cards
4. Click to view detail page
5. ✅ No toggle button visible on detail page
6. ✅ Can only view camera trap information

### **Test 4: Permission Validation**
1. Login as CLIENT_USER from Company A
2. Try to toggle camera assigned to Company B (via API)
3. ✅ Backend returns 403 Forbidden error
4. ✅ Error message shown to user

### **Test 5: Status Persistence**
1. Toggle camera to INACTIVE
2. Refresh page
3. ✅ Status remains INACTIVE
4. Navigate away and come back
5. ✅ Status still INACTIVE
6. Toggle back to ACTIVE
7. ✅ Status updates and persists

---

## 🔄 API Endpoint Details

### **Endpoint:** `PATCH /api/camera-traps/:id/toggle`

**Authentication:** Required (JWT token)

**Authorization:**
- CLIENT_USER: Can toggle cameras assigned to their company (ADMIN/SUPER_ADMIN only)
- COMPANY_USER: Can toggle any camera

**Request:**
```http
PATCH /api/camera-traps/abc-123-uuid/toggle
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "message": "Camera trap marked as inactive successfully",
  "cameraTrap": {
    "id": "abc-123-uuid",
    "productId": "CT001",
    "status": "INACTIVE",
    "assignedToId": "company-uuid",
    "assignedTo": {
      "id": "company-uuid",
      "companyName": "Test Company",
      "email": "test@company.com"
    },
    ...
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "message": "Camera trap not found"
}
```

**403 Forbidden:**
```json
{
  "message": "You can only toggle status for camera traps assigned to your company"
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized: invalid or expired token"
}
```

---

## 📁 Files Modified/Created

### **Modified Files:**

1. ✅ `prisma/schema.prisma`
   - Added `status` field to CameraTrap model

2. ✅ `prisma/migrations/20251121105237_add_camera_trap_status/migration.sql`
   - Database migration to add status column

3. ✅ `src/controllers/ct.controller.js`
   - Added `toggleCameraTrapStatus` function

4. ✅ `src/routes/ct.routes.js`
   - Added PATCH route for toggle endpoint
   - Imported toggleCameraTrapStatus

5. ✅ `client/src/services/api.js`
   - Added `toggleCameraTrapStatus` method

6. ✅ `client/src/pages/CameraTraps.jsx`
   - Imported Power/PowerOff icons and useAuth
   - Added togglingId state
   - Added handleToggleStatus function
   - Updated status badge to use database status
   - Added toggle button with role-based access

7. ✅ `client/src/pages/CameraTrapDetail.jsx`
   - Imported Power/PowerOff icons
   - Added toggling state
   - Added handleToggleStatus function
   - Updated status card to use database status
   - Added prominent toggle button with role-based access

### **New Files:**
None (all changes were modifications to existing files)

---

## 🚀 Feature Benefits

### **For Client Admins:**
- ✅ Quick enable/disable of camera traps
- ✅ Temporary deactivation without losing data
- ✅ Visual feedback with color-coded buttons
- ✅ Clear status indication

### **For Operations:**
- ✅ Maintenance mode support
- ✅ Testing/troubleshooting capability
- ✅ No need to unassign/reassign cameras
- ✅ Audit trail through status changes

### **For System:**
- ✅ Separate status from subscription (validTill)
- ✅ Granular control over camera availability
- ✅ Better data integrity
- ✅ Role-based access control

---

## 💡 Usage Scenarios

### **Scenario 1: Temporary Maintenance**
- Camera needs repair
- Admin marks as INACTIVE
- Camera removed from active monitoring
- After repair, admin marks as ACTIVE
- Camera resumes normal operation

### **Scenario 2: Testing**
- New camera assigned
- Admin marks as INACTIVE during testing
- Run tests without affecting production
- Mark as ACTIVE when ready

### **Scenario 3: Seasonal Use**
- Cameras only needed certain months
- Mark INACTIVE during off-season
- Saves monitoring resources
- Reactivate when needed

### **Scenario 4: Issue Resolution**
- Camera reports errors
- Admin marks INACTIVE to investigate
- Fix issues
- Mark ACTIVE when resolved

---

## 🎉 Implementation Complete!

All tasks completed successfully:
- ✅ Database schema updated with migration
- ✅ Backend controller and route implemented
- ✅ Frontend API service method added
- ✅ List view updated with toggle button
- ✅ Detail view updated with toggle button
- ✅ Role-based access control implemented
- ✅ Error handling and user feedback
- ✅ Loading states and disabled states
- ✅ Success/error messages

**Ready for Testing!** 🚀

---

**Last Updated:** November 21, 2025  
**Feature Version:** 1.0  
**Status:** ✅ Complete
