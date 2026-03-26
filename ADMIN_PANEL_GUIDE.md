# PlanEats Admin Panel Documentation

## Overview
The PlanEats Admin Panel provides administrators with powerful tools to manage users, moderate recipes, and monitor platform analytics.

## Features

### 1. Dashboard (`/admin/dashboard`)
- **Platform Statistics**: Real-time overview of users, recipes, and meal plans
- **User Growth Tracking**: New user signups (7-day and 30-day periods)
- **Recipe Moderation Queue**: Count of pending recipe reviews
- **Quick Actions**: Direct links to user management and recipe moderation

### 2. User Management (`/admin/users`)
- **View All Users**: Paginated list with search and filters
- **Search Options**: Filter by username, email, or name
- **Role Management**: 
  - Assign/remove admin privileges
  - Change user roles (user, admin, super-admin)
- **Status Control**: Activate or deactivate user accounts
- **User Deletion**: Remove users and their associated content
- **Pagination**: 10, 25, or 50 users per page

### 3. Recipe Moderation (`/admin/recipes`)
- **Review Queue**: View all user-submitted recipes pending verification
- **Recipe Preview**: Full recipe details before approval
- **Verification Actions**:
  - Approve recipes (makes them visible to all users)
  - Reject with reason (provides feedback to authors)
- **Filtering**: Browse by cuisine, difficulty, status
- **Pagination**: Navigate through large queues

## Access Control

### Who Can Access?
The admin panel is accessible only to users with:
- `role` field set to `'admin'` or `'super-admin'`, OR
- `isAdmin` field set to `true`, OR
- Email matching `ADMIN_EMAIL` environment variable

### Security Features
- **Protected Routes**: All admin routes require authentication
- **Admin Middleware**: Server-side verification of admin privileges
- **Frontend Protection**: React Router guards prevent unauthorized access
- **Automatic Redirect**: Non-admin users are redirected to dashboard

## Getting Started

### 1. Create an Admin User

**Option A: Using the Script (Recommended)**
```bash
cd backend
node scripts/make-admin.js <email>
# Example: node scripts/make-admin.js admin@example.com
```

**Option B: Manual MongoDB Update**
```javascript
// In MongoDB Compass or shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true, role: 'admin' } }
)
```

**Option C: Environment Variable**
Set your email in `.env`:
```bash
ADMIN_EMAIL=your-email@example.com
```

### 2. Access the Admin Panel

1. **Login** with your admin account at `http://localhost:5173/login`
2. **Look for the Admin Link** in the navigation bar (shield icon)
3. **Navigate** to admin sections:
   - Dashboard: `/admin/dashboard`
   - Users: `/admin/users`
   - Recipes: `/admin/recipes`

## API Endpoints

### Dashboard & Analytics
```
GET    /api/admin/stats       - Platform statistics
GET    /api/admin/analytics   - Detailed analytics with filters
```

### User Management
```
GET    /api/admin/users              - List all users (paginated)
GET    /api/admin/users/:id          - Get single user
PUT    /api/admin/users/:id          - Update user (role, status)
DELETE /api/admin/users/:id          - Delete user
```

### Recipe Moderation
```
GET    /api/admin/recipes/pending         - Get pending recipes
PUT    /api/admin/recipes/:id/verify      - Verify/reject recipe
```

## Technical Implementation

### Backend Files Created
- `backend/routes/admin.js` - Admin route definitions
- `backend/controllers/adminController.js` - Business logic
- `backend/scripts/make-admin.js` - Admin user creation script

### Frontend Files Created
- `frontend/src/services/admin.js` - API service layer
- `frontend/src/components/AdminRoute.jsx` - Route protection
- `frontend/src/components/admin/AdminLayout.jsx` - Layout component
- `frontend/src/pages/admin/AdminDashboard.jsx` - Dashboard page
- `frontend/src/pages/admin/UserManagement.jsx` - User management page
- `frontend/src/pages/admin/RecipeModeration.jsx` - Recipe moderation page

### Files Modified
- `backend/models/User.js` - Added `isAdmin` and `role` fields
- `backend/middleware/auth.js` - Enhanced admin authentication
- `backend/server.js` - Registered admin routes
- `frontend/src/stores/authStore.js` - Added admin state management
- `frontend/src/components/Navigation.jsx` - Added admin link
- `frontend/src/App.jsx` - Added admin routes

## Usage Examples

### Making a User an Admin
```bash
# From backend directory
node scripts/make-admin.js testuser@example.com
```

### Verifying a Recipe via API
```bash
curl -X PUT http://localhost:5001/api/admin/recipes/RECIPE_ID/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"isVerified": true}'
```

### Getting User Statistics
```bash
curl http://localhost:5001/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Best Practices

1. **Regular Moderation**: Review pending recipes daily
2. **User Communication**: Provide clear rejection reasons
3. **Backup Admins**: Maintain multiple admin accounts
4. **Monitor Growth**: Check analytics weekly
5. **Security**: Never share admin credentials

## Troubleshooting

### "Admin privileges required" Error
- Verify your user has `isAdmin: true` or `role: 'admin'`
- Check if you're logged in with the correct account
- Ensure the token hasn't expired

### Admin Link Not Showing in Navigation
- Confirm `isAdmin()` returns true in browser console
- Try logging out and back in
- Clear browser cache

### Cannot Access Admin Routes
- Check that you're using HTTPS on Netlify
- Verify CORS allows your production URL
- Ensure backend is running and accessible

## Future Enhancements

Potential features to add:
- [ ] Advanced analytics charts
- [ ] Bulk user actions
- [ ] Recipe version history
- [ ] Email notifications for rejections
- [ ] Content flagging system
- [ ] Admin activity logs
- [ ] Export data to CSV
- [ ] Real-time notifications

## Support

For issues or questions about the admin panel, check:
- Backend logs for API errors
- Browser console for frontend errors
- MongoDB for data verification

---

**Version**: 1.0.0  
**Last Updated**: March 26, 2026
