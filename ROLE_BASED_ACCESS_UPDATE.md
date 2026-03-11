# Role-Based Access Control Update

## Summary of Changes

This update adds role-based access control (RBAC) to the Student Pocket Money platform, enabling two distinct user types: **Students** and **Clients**.

---

## What Was Updated

### Backend Changes

#### 1. **New Middleware: Role Checking**
- **File**: `backend/middleware/roleMiddleware.js`
- Validates user role against required roles for specific endpoints
- Returns 403 Forbidden if user lacks permission

#### 2. **Updated Auth Controller**
- **File**: `backend/controllers/authController.js`
- `generateToken()` now includes role in JWT payload
- `registerUser()` accepts role parameter (student/client)
- Login returns role in response

#### 3. **Updated Auth Middleware**
- **File**: `backend/middleware/authMiddleware.js`
- Extracts and attaches role from JWT to request object

#### 4. **Protected Routes**
- **File**: `backend/routes/taskRoutes.js`
- `POST /api/tasks` → Only **clients** can create tasks
- `PUT /api/tasks/:id/accept` → Only **students** can accept tasks
- `PUT /api/tasks/:id/complete` → Only **clients** can mark complete

### Frontend Changes

#### 1. **Register Page**
- **File**: `frontend/src/pages/Register.jsx`
- Added role dropdown (Student/Client)
- Redirects to appropriate dashboard after registration

#### 2. **Login Page**
- **File**: `frontend/src/pages/Login.jsx`
- Redirects to `/client-dashboard` if role is "client"
- Redirects to `/dashboard` if role is "student"

#### 3. **New Client Dashboard**
- **File**: `frontend/src/pages/ClientDashboard.jsx`
- Shows tasks posted by the client
- "Create New Task" button
- Ability to mark tasks as completed
- Accessible only to clients

#### 4. **Updated Navigation Bar**
- **File**: `frontend/src/components/NavBar.jsx`
- Shows different navigation based on user role
- **Students** see: Tasks, Dashboard, Profile
- **Clients** see: My Tasks, Post Task, Profile

#### 5. **Updated App Routes**
- **File**: `frontend/src/App.jsx`
- Added `/client-dashboard` route
- Protected by ProtectedRoute component

#### 6. **Updated Task Feed (Student View)**
- **File**: `frontend/src/pages/TaskFeed.jsx`
- Shows only open tasks and student's accepted tasks
- "Accept Task" button only for open tasks
- "Mark Completed" button only for own accepted tasks

#### 7. **Updated Post Task Page**
- **File**: `frontend/src/pages/PostTask.jsx`
- Added role check before rendering form
- Displays error message if accessed by non-clients

---

## User Roles & Permissions

### 👨‍🎓 Student Role
| Feature | Allowed |
|---------|---------|
| View available tasks | ✅ |
| Accept tasks | ✅ |
| Complete own accepted tasks | ❌ (Client marks complete) |
| Create tasks | ❌ |
| Access `/tasks` | ✅ |
| Access `/dashboard` | ✅ |

### 💼 Client Role
| Feature | Allowed |
|---------|---------|
| View available tasks | ✅ |
| Create tasks | ✅ |
| Accept tasks / Apply to tasks | ❌ |
| Mark student tasks complete | ✅ |
| Access `/client-dashboard` | ✅ |
| Access `/post` | ✅ |

---

## API Endpoints & Role Requirements

```
POST   /api/auth/register    →  role: student|client (frontend choice)
POST   /api/auth/login       →  returns role in JWT
GET    /api/auth/me          →  authenticated users
PUT    /api/auth/me          →  authenticated users

POST   /api/tasks            →  ROLE: client only ✅
GET    /api/tasks            →  authenticated users
PUT    /api/tasks/:id/accept →  ROLE: student only ✅
PUT    /api/tasks/:id/complete → ROLE: client only ✅

POST   /api/ai/match         →  authenticated users
GET    /api/dashboard        →  authenticated users
```

---

## Login Workflow

### New User Registration
1. Choose role (Student or Client)
2. Fill in name, email, password
3. Backend stores role in database
4. JWT includes role claim
5. Frontend redirects based on role

### Returning User Login
1. Enter email & password
2. Backend validates credentials
3. Returns JWT with role
4. **If Client** → Redirected to `/client-dashboard`
5. **If Student** → Redirected to `/dashboard`

---

## Testing the Feature

### Register a Student
1. Go to `/register`
2. Select "Student" from dropdown
3. Fill in details
4. Should redirect to `/dashboard`
5. Should see "Tasks" and "Dashboard" in navbar

### Register a Client
1. Go to `/register`
2. Select "Client" from dropdown
3. Fill in details
4. Should redirect to `/client-dashboard`
5. Should see "My Tasks" and "Post Task" in navbar

### Try Unauthorized Actions
- **Student tries to POST task** → Returns 403 Forbidden
- **Client tries to PUT /accept** → Returns 403 Forbidden
- **Student accesses /post** → Redirected to /tasks

---

## Database Note

**Existing users** will have `role: "student"` by default. If you want to change existing users to clients:

```javascript
// Run in MongoDB or through a script
db.users.updateOne({ email: "client@example.com" }, { $set: { role: "client" } })
```

---

## No Changes Needed

✅ User Model - Already had role field (not changed)
✅ Task Model - No role-based changes needed
✅ Dashboard controller - Works for both roles
✅ AI match controller - Works for both roles
✅ Profile page - Works for both roles

---

## Summary

- ✅ Role field added to User model (already existed)
- ✅ Registration form now has role dropdown
- ✅ JWT includes role
- ✅ Role-based route protection (403 errors)
- ✅ Separate client/student dashboards
- ✅ Role-based UI rendering in navigation
- ✅ All existing functionality preserved
