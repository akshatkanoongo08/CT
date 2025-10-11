# CTSELF Client Dashboard

A comprehensive React-based client dashboard for managing camera traps, users, and company information.

## 🚀 Features

### Authentication & Authorization
- **Secure Login**: JWT-based authentication for client users
- **Role-Based Access Control**: 
  - `SUPER_ADMIN`: Full access to all features
  - `ADMIN`: User management and company info editing
  - `GENERAL`: View camera traps and edit permitted fields

### Dashboard
- Real-time KPIs (total traps, active/inactive devices, credits)
- Company status and subscription alerts
- Quick access to recent camera traps
- Subscription expiry warnings

### Camera Traps Management
- **View**: List all assigned camera traps with filters
- **Search**: By Product ID, IMEI, or Location
- **Filter**: By status (active/inactive)
- **Detail View**: Complete device information
- **Edit**: Update location, GPS, IMEI, SIM details
- **Restrictions**: Cannot add, delete, or change assignments (Company admin only)

### User Management (Admin Only)
- Add new client users with role assignment
- Edit existing users
- Delete users (except yourself)
- View user status and roles

### Company Information (Admin Only)
- View company details
- Edit contact information
- View subscription status
- Monitor credits and product assignments

### Profile & Settings
- View personal information
- Change password securely
- Security tips and best practices

## 📦 Tech Stack

- **React 18**: Modern UI library
- **React Router 6**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **Lucide React**: Beautiful icon library
- **date-fns**: Date formatting utilities
- **React Leaflet**: Interactive maps (for future enhancements)

## 🛠️ Installation

### Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:3000`

### Steps

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file** (optional):
   Create `.env` in the client folder:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to `http://localhost:3001`

## 📁 Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Topbar.jsx       # Top navigation bar
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── context/         # React Context
│   │   └── AuthContext.jsx  # Authentication state
│   ├── pages/           # Page components
│   │   ├── Login.jsx        # Login page
│   │   ├── Dashboard.jsx    # Dashboard overview
│   │   ├── CameraTraps.jsx  # Camera traps list
│   │   ├── CameraTrapDetail.jsx  # Single trap detail
│   │   ├── Users.jsx        # User management
│   │   ├── CompanyInfo.jsx  # Company information
│   │   └── Profile.jsx      # User profile
│   ├── services/        # API services
│   │   └── api.js          # Axios instance & API calls
│   ├── App.jsx          # Root component with routes
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

## 🔐 Authentication Flow

1. **Login**: User enters email and password
2. **API Call**: POST `/api/client-users/login`
3. **Token Storage**: JWT token stored in localStorage
4. **Auto-attach**: Axios interceptor adds token to all requests
5. **Auto-logout**: 401 responses trigger logout and redirect

## 📱 Pages & Features

### 1. Login Page (`/login`)
- Email/password authentication
- Error handling
- Auto-redirect if already logged in

### 2. Dashboard (`/dashboard`)
- **KPI Cards**:
  - Total camera traps
  - Active devices
  - Inactive devices
  - Credits remaining
- **Company Info Widget**
- **Recent Activity**
- **Alerts**: Subscription expiry, inactive company

### 3. Camera Traps (`/camera-traps`)
- **Grid View**: Card-based display
- **Search**: Real-time filtering
- **Status Filter**: All/Active/Inactive
- **Click to Detail**: Navigate to single trap view

### 4. Camera Trap Detail (`/camera-traps/:trapId`)
- **View Mode**: Display all trap information
- **Edit Mode**: 
  - ✅ Can edit: Location, GPS, IMEI, SIM, Valid Till, Product Type
  - ❌ Cannot edit: Product ID, Assignment
- **Assignment Info**: Read-only display
- **Validation**: Form validation before save

### 5. Users (`/users`) - Admin Only
- **Table View**: All company users
- **Add User**: Modal form with role selection
- **Edit User**: Update name, mobile, role
- **Delete User**: Remove users (except yourself)
- **Temp Password**: Generated on user creation

### 6. Company Info (`/company`) - Admin Only
- **Editable Fields**: Name, Email, Phone, Address
- **Read-only**: Subscription details, credits, status
- **Validation**: Required fields enforced

### 7. Profile (`/profile`)
- **Personal Info**: View-only display
- **Change Password**: 
  - Current password verification
  - New password confirmation
  - Minimum 6 characters
- **Security Tips**: Best practices

## 🎨 UI Components

### Reusable Classes (in `index.css`)

```css
.btn              /* Base button */
.btn-primary      /* Primary action button */
.btn-secondary    /* Secondary button */
.btn-danger       /* Destructive action */
.input            /* Form input */
.card             /* Container card */
.badge            /* Status badge */
.badge-success    /* Green badge */
.badge-warning    /* Yellow badge */
.badge-danger     /* Red badge */
.badge-info       /* Blue badge */
```

## 🔗 API Integration

### API Service (`src/services/api.js`)

**Interceptors**:
- **Request**: Auto-attach Authorization header
- **Response**: Handle 401 (logout), return data directly

**Methods**:
```javascript
// Auth
api.login(email, password)
api.changePassword(oldPassword, newPassword)

// Camera Traps
api.getCameraTraps()
api.getCameraTrap(trapId)
api.updateCameraTrap(trapId, data)

// Users
api.getClientUsers()
api.addClientUser(data)
api.updateClientUser(userId, data)
api.deleteClientUser(userId)

// Company
api.getCompanyInfo(companyId)
api.updateCompanyInfo(companyId, data)
```

## 🛡️ Access Control

### Role Permissions

| Feature | SUPER_ADMIN | ADMIN | GENERAL |
|---------|-------------|-------|---------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Camera Traps | ✅ | ✅ | ✅ |
| Edit Camera Traps | ✅ | ✅ | ✅ |
| Add/Delete Traps | ❌ (Company only) | ❌ | ❌ |
| Change Assignment | ❌ (Company only) | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ |
| Edit Company Info | ✅ | ✅ | ❌ |

### Route Protection

```javascript
// All routes protected by default
<ProtectedRoute>
  <Layout />
</ProtectedRoute>

// Admin-only pages
useAuth().isAdmin() // true for SUPER_ADMIN & ADMIN
```

## 🧪 Testing Workflow

1. **Start Backend**: Ensure Express server running on port 3000
2. **Start Frontend**: `npm run dev` (port 3001)
3. **Login**: Use client credentials from backend

### Test Credentials
```
Email: alice@techsolutions.com
Password: Alice@123
```

### Test Flow:
1. ✅ Login with client credentials
2. ✅ View dashboard with company stats
3. ✅ Navigate to Camera Traps
4. ✅ Click on a trap to view details
5. ✅ Edit trap location/GPS
6. ✅ Try to change assignment (should show alert)
7. ✅ Navigate to Users (if admin)
8. ✅ Add a new user
9. ✅ Edit company info (if admin)
10. ✅ Change password in Profile

## 🐛 Troubleshooting

### Issue: API calls failing
**Solution**: 
- Ensure backend is running on port 3000
- Check Vite proxy configuration in `vite.config.js`
- Verify token in localStorage

### Issue: Token expired
**Solution**: 
- Login again
- Check JWT_SECRET matches backend
- Verify token expiry time

### Issue: Cannot access admin pages
**Solution**:
- Verify user role is ADMIN or SUPER_ADMIN
- Check `useAuth().isAdmin()` returns true
- Ensure user status is ACTIVE

### Issue: Camera trap assignment not editable
**Solution**:
- This is intentional - only company admins can change assignments
- Client users can only edit other fields

## 📝 Environment Variables

Create `.env` file in client folder (optional):

```env
# API Base URL (defaults to /api with Vite proxy)
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

Output: `dist/` folder ready to deploy

## 📄 License

This project is part of the CTSELF system.

## 👥 Support

For issues or questions:
- Check backend API documentation
- Review Postman testing guide
- Contact system administrator

---

Built with ❤️ using React + Vite + Tailwind CSS
