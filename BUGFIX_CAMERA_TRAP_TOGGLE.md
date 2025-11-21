# Bug Fix: Camera Trap Status Toggle - "Failed to update camera trap status"

## 🐛 Issue
When clicking the toggle button to change camera trap status, the error message **"Failed to update camera trap status"** was displayed.

## 🔍 Root Cause
The controller was trying to access `req.user.clientId` which doesn't exist in the request object. 

**Problem in `src/controllers/ct.controller.js`:**
```javascript
// ❌ INCORRECT - req.user.clientId doesn't exist
if (req.user.userType === 'CLIENT_USER') {
  if (!cameraTrap.assignedToId || cameraTrap.assignedToId !== req.user.clientId) {
    return res.status(403).json({ 
      message: 'You can only toggle status for camera traps assigned to your company' 
    });
  }
}
```

### Why This Happened
The `unifiedAuthMiddleware` (used by the toggle route) sets up the request object like this:
- `req.user` - Contains: `id`, `email`, `userType`, `role` (from JWT)
- `req.company` - Contains full company details (for CLIENT_USER)
- `req.clientUser` - Contains full client user details (for CLIENT_USER)

The `req.user` object does **NOT** contain `clientId`. The company ID is in `req.company.id`.

## ✅ Solution
Updated the controller to use `req.company.id` instead of `req.user.clientId`.

**Fixed Code:**
```javascript
// ✅ CORRECT - req.company.id is set by unifiedAuthMiddleware
if (req.user.userType === 'CLIENT_USER') {
  if (!req.company || !cameraTrap.assignedToId || cameraTrap.assignedToId !== req.company.id) {
    return res.status(403).json({ 
      message: 'You can only toggle status for camera traps assigned to your company' 
    });
  }
}
```

## 📁 File Changed
- ✅ `src/controllers/ct.controller.js` - Line 606 (toggleCameraTrapStatus function)

## 🧪 Testing
After this fix, the toggle functionality should work correctly:

1. **Login as CLIENT_USER (ADMIN role)**
2. **Navigate to Camera Traps page**
3. **Click "Mark as Inactive" button on any camera**
4. ✅ Status should change successfully
5. ✅ Success message should appear
6. ✅ Button should change to "Mark as Active"

## 📊 Request Object Structure

For reference, here's what's available in the request object for CLIENT_USER:

```javascript
req.user = {
  id: "user-uuid",
  email: "user@example.com",
  userType: "CLIENT_USER",
  role: "ADMIN"
}

req.company = {
  id: "company-uuid",              // ← Use this for clientId!
  companyName: "Company Name",
  email: "company@example.com",
  mobile: "1234567890",
  status: "ACTIVE",
  clientType: "STANDARD",
  validTill: "2025-12-31",
  credits: 100,
  whatsappEnabled: true,
  broadcastEnabled: false,
  alarmEnabled: true,
  numProductsAssigned: 5,
  numProductsInUse: 3
}

req.clientUser = {
  id: "user-uuid",
  name: "User Name",
  email: "user@example.com",
  mobile: "9876543210",
  role: "ADMIN",
  userType: "CLIENT_USER",
  clientId: "company-uuid",        // ← Also available here
  client: { ...company details... }
}
```

## 💡 Key Takeaway
When using `unifiedAuthMiddleware`:
- For CLIENT_USER company ID: Use `req.company.id` or `req.clientUser.clientId`
- For COMPANY_USER: Use `req.companyUser` for user details
- For user ID (both types): Use `req.user.id`

## ✅ Status
**FIXED** - Server automatically restarted with nodemon. Feature should now work correctly!

---

**Date:** November 21, 2025  
**Bug Severity:** High (Feature blocker)  
**Resolution Time:** Immediate
