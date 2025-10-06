# Quick Start Guide - CTSELF Client Company Onboarding

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL database running
- Postman (for testing)

### 1. Environment Setup

Ensure your `.env` file has:
```env
DATABASE_URL="postgresql://postgres:djakshat@localhost:5432/CTself?schema=public"
JWT_SECRET=CT
GMAIL_USER=noreplybnac@gmail.com
GMAIL_PASS=tlly zphv qpjo zjkt
PORT=3000
```

### 2. Database Setup

Run Prisma migrations:
```powershell
npx prisma generate
npx prisma migrate dev
```

### 3. Create a Super Admin (First Time Only)

If you haven't already, create a super admin user:
```powershell
node src/scripts/createSuperAdmin.js
```

Or manually insert into database:
```sql
INSERT INTO "CompanyUser" (name, username, email, password, role, "userType", status)
VALUES ('Super Admin', 'superadmin', 'admin@company.com', 'hashed_password', 'SUPER_ADMIN', 'COMPANY_USER', 'ACTIVE');
```

### 4. Start the Server

```powershell
node src/server.js
```

You should see:
```
Setting up Express server...
Mounting company user routes at /api/company-users
Mounting onboard routes at /api/onboard
Mounting client user routes at /api/client-users
Server running on port 3000
Test URL: http://localhost:3000/health
```

### 5. Test Health Endpoint

In Postman or browser:
```
GET http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 📝 Testing Workflow

### Step 1: Login as Company User

```http
POST http://localhost:3000/api/company-users/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "your_password"
}
```

**Save the token** from the response!

### Step 2: Onboard a Client Company

```http
POST http://localhost:3000/api/onboard/client-company
Authorization: Bearer YOUR_COMPANY_TOKEN
Content-Type: application/json

{
  "companyName": "Test Company Ltd",
  "companyEmail": "contact@testcompany.com",
  "companyMobile": "9876543210",
  "clientType": "PREMIUM",
  "validTill": "2025-12-31",
  "credits": 1000,
  "whatsappEnabled": true,
  "broadcastEnabled": true,
  "alarmEnabled": false,
  "adminName": "Jane Smith",
  "adminEmail": "jane@testcompany.com",
  "adminMobile": "9876543211"
}
```

**Check the console** - the temporary password will be logged (or check email if configured).

### Step 3: Login as Client User

```http
POST http://localhost:3000/api/client-users/login
Content-Type: application/json

{
  "email": "jane@testcompany.com",
  "password": "TEMP_PASSWORD_FROM_STEP_2"
}
```

**Save this token** - it's different from the company user token!

### Step 4: Add Another Client User

```http
POST http://localhost:3000/api/client-users
Authorization: Bearer YOUR_CLIENT_TOKEN
Content-Type: application/json

{
  "name": "Bob Johnson",
  "email": "bob@testcompany.com",
  "mobile": "9876543212",
  "role": "ADMIN"
}
```

The temporary password will be in the response.

---

## 🎯 Testing All Features

### Import Postman Collection
1. Open Postman
2. File → Import
3. Select `CTSELF_Postman_Collection.json`
4. Create an environment with variables:
   - `company_token`
   - `client_token`
   - `client_company_id`

### Run Tests in Order
1. ✅ Health Check
2. ✅ Company User Login (auto-saves token)
3. ✅ Onboard Client Company (auto-saves company ID)
4. ✅ Get All Client Companies
5. ✅ Get Single Client Company
6. ✅ Edit Client Company
7. ✅ Toggle Company Status
8. ✅ Client User Login (auto-saves token)
9. ✅ Add Client User
10. ✅ Get All Client Users
11. ✅ Update Client User
12. ✅ Change Password
13. ✅ Delete Client User
14. ✅ Delete Client Company

---

## 🔍 Common Issues & Solutions

### Issue: "User not found" on login
**Solution:** Create a company user first using `createSuperAdmin.js` script

### Issue: "Company is inactive" on client user login
**Solution:** Make sure company status is ACTIVE. Use toggle status API:
```http
PATCH /api/onboard/client-company/:id/status
{ "status": "ACTIVE" }
```

### Issue: Email not sending
**Solution:** 
- Check GMAIL_USER and GMAIL_PASS in .env
- Use Gmail App Password (not regular password)
- For testing, check console logs for temp passwords

### Issue: "Invalid token"
**Solution:** 
- Make sure you're using the correct token (company vs client)
- Token might be expired (2h for company, 8h for client)
- Re-login to get a fresh token

### Issue: Database connection error
**Solution:**
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env
- Run `npx prisma migrate dev`

---

## 📊 Database Schema Reference

### CompanyUser
- COMPANY_USER type
- Roles: SUPER_ADMIN, ADMIN, GENERAL
- Can onboard and manage client companies

### ClientCompany
- Created by CompanyUser
- Has status (ACTIVE/INACTIVE)
- Has subscription (validTill)
- Has credits and feature flags

### ClientUser
- CLIENT_USER type
- Belongs to one ClientCompany
- Roles: SUPER_ADMIN, ADMIN, GENERAL
- Can manage users in their company

---

## 🎨 Role Permissions Summary

### Company Users
- **SUPER_ADMIN**: All operations including delete companies
- **ADMIN**: Onboard, view, edit companies (cannot delete)
- **GENERAL**: View companies only

### Client Users
- **SUPER_ADMIN**: All operations on users, edit company info
- **ADMIN**: Add/update users, edit company info
- **GENERAL**: View users and company info only

---

## 📧 Email Configuration (Optional)

For production email functionality:

1. Create Gmail App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   
2. Update .env:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASS=your_16_char_app_password
   ```

3. Test by onboarding a company - admin should receive email

---

## 🛠️ Development Tips

### View all routes:
The server logs all mounted routes on startup.

### Debug middleware:
Check console logs - all requests are logged with timestamp.

### Test authorization:
Try accessing endpoints with wrong user type or role to test protection.

### Database inspection:
```powershell
npx prisma studio
```
Opens GUI to view/edit database records.

---

## 📚 Next Steps

1. ✅ Test all endpoints in Postman
2. ✅ Verify email delivery
3. ✅ Test role-based access control
4. ✅ Test company status validation
5. ✅ Test subscription expiry
6. 🔜 Add frontend application
7. 🔜 Add more features (products, reports, etc.)

---

## 🆘 Need Help?

Check these files:
- `API_DOCUMENTATION.md` - Complete API reference
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- Console logs - All requests/errors are logged
- Prisma Studio - Visual database inspection

---

## ✅ Checklist Before Production

- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment-specific DATABASE_URL
- [ ] Configure proper email service (SendGrid, AWS SES)
- [ ] Add rate limiting
- [ ] Add request validation library (Joi, Zod)
- [ ] Set up error logging (Winston, Sentry)
- [ ] Add API documentation (Swagger)
- [ ] Implement refresh tokens
- [ ] Add audit logs
- [ ] Set up monitoring (PM2, New Relic)

---

**You're all set! 🎉** Start testing in Postman and let me know if you encounter any issues.
