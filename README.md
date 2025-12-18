# React App with Authentication

This project is a modern React application with a complete authentication system, built with TypeScript and Tailwind CSS.

## Features

- ✅ **Login & Signup** - Beautiful authentication pages with form validation
- ✅ **JWT Token Management** - Secure token storage in localStorage with expiration
- ✅ **Remember Me** - Extended session duration (7 days vs 1 day)
- ✅ **Protected Routes** - Automatic redirect to login for unauthenticated users
- ✅ **Logout Functionality** - Clean session termination
- ✅ **Forgot Password UI** - Password recovery interface (UI only)
- ✅ **Responsive Design** - Mobile-friendly forms and layouts
- ✅ **Dark Mode** - Full dark mode support with theme persistence
- ✅ **Form Validation** - Real-time client-side validation with error messages
- ✅ **Mock API** - Built-in mock authentication for development/testing

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Authentication System

### Pages

- **`/login`** - User login with email/password and "remember me" option
- **`/signup`** - New user registration with validation
- **`/forgot-password`** - Password reset interface (UI only)

### Protected Routes

The following routes require authentication:
- `/dashboard` - User dashboard
- `/users` - User management
- `/settings` - Application settings

Unauthenticated users are automatically redirected to `/login`.

### Mock API

The app includes a built-in mock authentication API for development and testing. It stores user data in localStorage and simulates API delays.

To create a test account:
1. Navigate to `/signup`
2. Fill in the registration form
3. The account will be stored in localStorage
4. Use the same email to log in

### Form Validation

- **Login**: Email format, password minimum length
- **Signup**: Name (2+ chars), valid email, strong password (8+ chars with uppercase, lowercase, and number), password confirmation

### Token Management

- JWT tokens stored in localStorage with expiration timestamps
- Remember me: 7 days expiration
- Regular login: 1 day expiration
- Automatic token validation and cleanup on expiration
- 401 responses trigger automatic logout and redirect

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
