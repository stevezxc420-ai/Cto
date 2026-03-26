# Authentication Testing Guide

## Quick Start Testing

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Create a test account:**
   - Navigate to `http://localhost:3000/signup`
   - Fill in the form:
     - Name: Test User
     - Email: test@example.com
     - Password: Test1234
     - Confirm Password: Test1234
   - Check "I agree to the Terms of Service and Privacy Policy"
   - Click "Create account"
   - You should be redirected to `/dashboard`

3. **Test logout:**
   - Click on your avatar (top right)
   - Click "Sign out"
   - You should be redirected to `/login`

4. **Test login:**
   - On the login page, enter:
     - Email: test@example.com
     - Password: Test1234
   - Optionally check "Remember me for 7 days"
   - Click "Sign in"
   - You should be redirected to `/dashboard`

5. **Test protected routes:**
   - While logged out, try to access `/dashboard`
   - You should be redirected to `/login`

## Features to Test

### Login Page (`/login`)
- [x] Email validation (valid format required)
- [x] Password validation (minimum 6 characters)
- [x] "Remember me" checkbox
- [x] Show/hide password toggle
- [x] Error messages for invalid credentials
- [x] Loading state during submission
- [x] "Forgot password?" link
- [x] "Sign up now" link
- [x] Redirect to dashboard on success
- [x] Auto-redirect if already logged in

### Signup Page (`/signup`)
- [x] Name validation (minimum 2 characters)
- [x] Email validation (valid format)
- [x] Password strength validation (8+ chars, uppercase, lowercase, number)
- [x] Password confirmation matching
- [x] Show/hide password toggles
- [x] Terms of service checkbox (required)
- [x] Error messages for validation failures
- [x] Loading state during submission
- [x] "Sign in" link
- [x] Redirect to dashboard on success
- [x] Duplicate email detection

### Forgot Password Page (`/forgot-password`)
- [x] Email input with validation
- [x] Success message after submission
- [x] "Back to sign in" link

### Header Component
- [x] Shows "Sign in" and "Sign up" buttons when logged out
- [x] Shows user avatar when logged in
- [x] User menu dropdown with name and email
- [x] "Sign out" button in dropdown
- [x] Dashboard and Settings links only visible when authenticated

### Token Management
- [x] JWT token stored in localStorage
- [x] User data stored in localStorage
- [x] Token expiration handling
- [x] Remember me extends expiration to 7 days
- [x] Regular login expires in 1 day
- [x] Automatic cleanup on logout

### Protected Routes
- [x] `/dashboard` requires authentication
- [x] `/users` requires authentication
- [x] `/settings` requires authentication
- [x] Redirect to `/login` when accessing protected routes without auth
- [x] Redirect to `/dashboard` after successful login

## Testing Scenarios

### Scenario 1: New User Registration
1. Go to `/signup`
2. Try submitting with empty fields → See validation errors
3. Enter weak password → See password strength error
4. Enter non-matching passwords → See mismatch error
5. Fill form correctly → Redirected to dashboard
6. Check localStorage for token and user data

### Scenario 2: Returning User Login
1. Logout if logged in
2. Go to `/login`
3. Try submitting with wrong email → See error message
4. Enter correct credentials
5. Toggle "Remember me"
6. Submit → Redirected to dashboard
7. Check localStorage token expiration

### Scenario 3: Session Persistence
1. Login with "Remember me" checked
2. Close and reopen browser
3. Navigate to `/dashboard`
4. Should stay logged in

### Scenario 4: Token Expiration
1. Login without "Remember me"
2. Manually modify localStorage token expiration to past date
3. Refresh page or navigate to protected route
4. Should be logged out and redirected to login

### Scenario 5: Protected Route Access
1. Logout
2. Try to access `/dashboard` directly
3. Should redirect to `/login`
4. Login
5. Should redirect back to `/dashboard`

## Mock API Behavior

The mock API:
- Stores user data in localStorage under `mock_users` key
- Generates random tokens for authentication
- Simulates 800ms delay for realistic API behavior
- Validates credentials on login
- Checks for duplicate emails on signup
- Persists across page refreshes

## Browser Testing

Recommended browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Test responsive design:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

## Console Checks

Check browser console for:
- No JavaScript errors
- Proper token storage logs
- API call simulations
- Navigation events
