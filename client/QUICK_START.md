# CTSELF Client Dashboard - Quick Start Guide

## 🎯 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd client
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to: **http://localhost:3001**

### Step 4: Login
Use your client user credentials:
```
Email: (provided by company admin)
Password: (provided by company admin)
```

---

## 🔑 First Time Login

If you're logging in for the first time with a temporary password:

1. Login with temporary credentials
2. Go to **Profile** page
3. Click **"Change Password"**
4. Enter temporary password and new password
5. Save and login again with new password

---

## 📚 Quick Navigation

After login, you'll see:

### 🏠 Dashboard
- Overview of your camera traps
- Company information
- Subscription status
- Quick stats

### 📷 Camera Traps
- View all assigned camera traps
- Search and filter devices
- Click on any trap to view/edit details

### 👥 Users (Admin Only)
- Manage company users
- Add new users
- Edit roles and permissions

### 🏢 Company Info (Admin Only)
- View company details
- Edit contact information
- Monitor subscription

### 👤 Profile
- View your information
- Change password
- Security settings

---

## ✨ Key Features

### What You CAN Do:
- ✅ View assigned camera traps
- ✅ Edit trap details (location, GPS, IMEI, etc.)
- ✅ Search and filter devices
- ✅ View device status
- ✅ Change your password
- ✅ Manage users (if admin)
- ✅ Edit company info (if admin)

### What You CANNOT Do:
- ❌ Add new camera traps (company admin only)
- ❌ Delete camera traps (company admin only)
- ❌ Change trap assignments (company admin only)
- ❌ View traps not assigned to your company

---

## 🎨 User Interface

### Color Coding
- **Green**: Active/Success
- **Red**: Inactive/Error
- **Blue**: Information
- **Yellow**: Warning
- **Purple**: Super Admin role

### Status Badges
- **Active**: Device is operational
- **Inactive**: Device expired or inactive
- **Company Status**: Your company account status

---

## 🔐 Roles & Permissions

### SUPER_ADMIN
- Full access to all features
- Can manage users
- Can edit company information

### ADMIN
- Same as SUPER_ADMIN
- Can manage users
- Can edit company information

### GENERAL
- View camera traps
- Edit camera trap details
- Cannot manage users or company info

---

## 📞 Need Help?

### Common Questions

**Q: I forgot my password**
A: Contact your company administrator to reset it

**Q: I can't see a camera trap**
A: It may not be assigned to your company. Contact company admin.

**Q: I can't add a new camera trap**
A: Only company administrators can add devices

**Q: My company status shows INACTIVE**
A: Contact your company administrator or support

**Q: Subscription is expiring soon**
A: Contact your company administrator to renew

---

## 🛠️ Technical Support

- **Backend Issues**: Check if server is running on port 3000
- **Login Issues**: Verify credentials with admin
- **Permission Errors**: Verify your role assignment
- **API Errors**: Check browser console (F12)

---

## 📱 Mobile Support

The dashboard is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones

---

## 🚀 Next Steps

1. **Explore Dashboard**: Get familiar with the interface
2. **View Camera Traps**: Check your assigned devices
3. **Update Details**: Edit device information as needed
4. **Change Password**: Set a secure password
5. **Manage Users**: (If admin) Add team members

---

## 📖 Full Documentation

For complete documentation, see:
- `README.md` - Full project documentation
- `../CAMERATRAP_API_DOCUMENTATION.md` - API reference
- `../POSTMAN_TESTING_GUIDE.md` - API testing guide

---

**Happy monitoring! 📷**
