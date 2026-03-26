# PlanEats Admin Credentials & Quick Start

## 🔐 Admin Login Credentials

### Primary Admin Account
```
Email: test2@example.com
Password: password123
Username: testuser2
Role: admin
```

### Alternative: Use Your Email
To make YOUR email an admin, run:
```bash
cd backend
node scripts/make-admin.js your-email@example.com
```

---

## 🚀 Quick Start Guide

### 1. Access the Admin Panel

**Step 1:** Go to the application
- Local: http://localhost:5173
- Production: https://planeatss.netlify.app

**Step 2:** Login with admin credentials above

**Step 3:** Look for the **Admin** link in navigation (shield icon 🛡️)

**Step 4:** Navigate to admin sections:
- Dashboard: http://localhost:5173/admin/dashboard
- Users: http://localhost:5173/admin/users
- Recipes: http://localhost:5173/admin/recipes

---

## 📊 What You Can Do as Admin

### Dashboard Features
✅ View total users (currently 4 users)
✅ See active/inactive users
✅ Track new signups (7-day & 30-day)
✅ Monitor recipe count (11 recipes, 4 pending)
✅ Check meal plan statistics

### User Management
✅ Search users by username/email/name
✅ Filter by role (user/admin/super-admin)
✅ Filter by status (active/inactive)
✅ Make users admins or remove admin privileges
✅ Activate/deactivate accounts
✅ Delete users and their content

### Recipe Moderation
✅ Review pending recipes (4 currently waiting)
✅ Preview full recipe details
✅ Approve recipes (makes them public)
✅ Reject with reason (provides feedback)
✅ Browse by cuisine and difficulty

---

## 🔧 Admin Script Usage

### Make a user admin:
```bash
cd backend
node scripts/make-admin.js user@example.com
```

### Example:
```bash
node scripts/make-admin.js fibaaminnu@gmail.com
```

---

## 🌐 Deployment Info

### Backend Server
- Running on port: **5001**
- Status: ✅ Active
- MongoDB: ✅ Connected

### Frontend (Development)
- Running on port: **5173**
- URL: http://localhost:5173
- Status: ✅ Active

### Frontend (Production)
- Platform: Netlify
- URL: https://planeatss.netlify.app
- CORS: ✅ Configured for production

---

## 📱 API Endpoints

### Get Dashboard Stats
```bash
curl http://localhost:5001/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Users
```bash
curl http://localhost:5001/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify a Recipe
```bash
curl -X PUT http://localhost:5001/api/admin/recipes/RECIPE_ID/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"isVerified": true}'
```

---

## 🎯 Current Platform Stats

- **Total Users**: 4
- **Active Users**: 4
- **New Users (7 days)**: 1
- **New Users (30 days)**: 1
- **Total Recipes**: 11
- **Pending Review**: 4
- **Meal Plans**: 3

---

## 📚 Documentation

Full admin panel guide: `ADMIN_PANEL_GUIDE.md`

---

## ⚠️ Security Notes

- Never share admin credentials publicly
- Use strong passwords in production
- Regularly review admin access
- Monitor admin activity logs
- Keep ADMIN_EMAIL environment variable updated

---

## 🆘 Troubleshooting

**Can't see Admin link?**
- Make sure you're logged in as admin
- Check browser console for errors
- Try logging out and back in

**Getting "Admin privileges required"?**
- Verify your user has `isAdmin: true` and `role: 'admin'`
- Run the make-admin script again
- Clear browser cache

**Need help?**
- Check `ADMIN_PANEL_GUIDE.md` for detailed documentation
- Review backend logs for API errors
- Check MongoDB data if needed

---

**Last Updated**: March 26, 2026  
**Version**: 1.0.0
