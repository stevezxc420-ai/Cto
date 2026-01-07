# API Analytics Platform MVP

A complete, production-ready API Analytics Platform deployed on Vercel + Supabase + Railway with zero ongoing costs.

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API (Railway)**: [https://your-app.railway.app](https://your-app.railway.app)
- **Database (Supabase)**: PostgreSQL with real-time features

## 📊 Features

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + JWT Authentication
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel (Frontend) + Railway (Backend) + Supabase (Database)
- **Authentication**: Secure JWT-based auth system
- **Analytics**: Dashboard with usage metrics and cost tracking
- **Responsive Design**: Dark/light mode, mobile-friendly
- **API Management**: Store and manage API credentials securely

## 💰 Cost Breakdown (100% FREE)

| Service | Free Tier | Usage |
|---------|-----------|-------|
| **Vercel** | Unlimited personal projects | Frontend hosting |
| **Railway** | $5 free credits/month | Backend API server |
| **Supabase** | 50,000 monthly active users | PostgreSQL database |
| **GitHub** | Unlimited public repos | Code hosting |

**Total Cost**: $0/month for MVP

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │    Railway      │    │    Supabase     │
│   (Frontend)     │◄──►│    (Backend)    │◄──►│   (Database)    │
│   React 19      │    │   Node.js API   │    │  PostgreSQL     │
│   TypeScript    │    │   JWT Auth      │    │     + RLS       │
│   Tailwind CSS  │    │   Rate Limiting │    │   Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start (5 minutes)

### 1. Setup Supabase Database (FREE)

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Click "New Project" → "api-analytics"
4. Choose region closest to you
5. Wait 2-3 minutes for setup
6. Go to **Settings** → **Database** → **Connection pooling**
7. Copy **Connection String (Pooler)** → Save as `SUPABASE_URL`
8. Copy **Connection String (Direct)** → Save as `DATABASE_URL`

### 2. Deploy Backend to Railway ($5 free credits)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select this repository
5. Add environment variables:
   ```
   NODE_ENV=production
   SUPABASE_URL=your_supabase_pooler_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_super_secure_random_secret
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
6. Deploy (5-10 minutes)
7. Copy Railway domain → Save as `RAILWAY_URL`

### 3. Deploy Frontend to Vercel (FREE)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New"** → **"Project"**
4. Select this repository
5. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-railway-app.railway.app/api
   REACT_APP_TOKEN_KEY=auth_token
   ```
6. Deploy (3-5 minutes)
7. Copy Vercel URL → Save as `VERCEL_URL`

### 4. Update CORS & Test

1. Go back to Railway dashboard
2. Update `CORS_ORIGIN` to your Vercel URL
3. Railway auto-redeploys (1-2 minutes)

### 5. Run Database Migrations

1. Go to Supabase dashboard
2. Click **SQL Editor**
3. Copy content from `server/migrations/001_initial_schema.sql`
4. Run SQL to create tables and default admin user

### 6. Test Deployment

1. Open your Vercel URL
2. Login with: `admin@api-analytics.com` / `admin123`
3. Test dashboard and all features

## 📁 Project Structure

```
api-analytics-platform/
├── src/                          # Frontend React app
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Page components
│   ├── lib/                     # Utilities and API client
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # TypeScript type definitions
├── server/                      # Backend Node.js API
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Authentication & validation
│   │   ├── config/           # Database configuration
│   │   └── migrations/       # Database migrations
│   └── package.json
├── railway.json                # Railway deployment config
├── vercel.json                 # Vercel deployment config
└── README.md
```

## 🔧 Local Development

### Frontend (React)
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Backend (Node.js/Express)
```bash
cd server

# Install dependencies
npm install

# Start development server
npm run dev

# Run database migrations
npm run migrate
```

## 📊 Database Schema

### Tables Created:
- **users** - User accounts and authentication
- **api_credentials** - Stored API keys and secrets
- **cost_data** - API usage costs and billing
- **usage_data** - API usage statistics and metrics
- **user_settings** - User preferences and configurations

### Security Features:
- **Row Level Security (RLS)** - Users only access their own data
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Secure cross-origin requests

## 🔑 Default Admin Account

- **Email**: admin@api-analytics.com
- **Password**: admin123

**⚠️ Change this password immediately after first login!**

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activities` - Recent activities
- `GET /api/dashboard/charts/data` - Chart data

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `PUT /api/settings/password` - Change password
- `GET /api/settings/profile` - Get profile
- `PUT /api/settings/profile` - Update profile

## 🔒 Security Considerations

1. **Environment Variables**: Never commit real secrets to git
2. **JWT Secret**: Use a strong, random secret key
3. **Database Credentials**: Use Supabase service role key for migrations
4. **CORS**: Configure proper origins for production
5. **Rate Limiting**: Built-in protection against abuse
6. **Input Validation**: All inputs validated server-side
7. **SQL Injection**: Protected through parameterized queries

## 📈 Scaling Beyond Free Tier

When your app grows beyond free tiers:

### Vercel
- **Pro Plan**: $20/month for commercial use
- **Team Plan**: $100/month for teams

### Railway
- **Pro Plan**: $20/month for increased limits
- **Team Plan**: $100/month for teams

### Supabase
- **Pro Plan**: $25/month for 50k+ users
- **Team Plan**: $599/month for teams

## 🛠️ Technologies Used

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Vercel** - Serverless deployment

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Supabase** - PostgreSQL with real-time features
- **Railway** - Container deployment platform

### Database
- **PostgreSQL** - Relational database
- **Row Level Security** - Database-level access control
- **Real-time** - Live data updates

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you have any questions or need help with deployment:

1. Check the [troubleshooting section](#troubleshooting)
2. Open an issue on GitHub
3. Contact support

## 🐛 Troubleshooting

### Frontend not loading
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Ensure `REACT_APP_API_URL` points to Railway backend

### Backend API errors
- Check Railway deployment logs
- Verify Supabase connection strings
- Ensure all environment variables are set

### Database connection issues
- Check Supabase dashboard for connection status
- Verify database URL format
- Ensure RLS policies are correctly applied

### CORS errors
- Update `CORS_ORIGIN` in Railway to match Vercel URL
- Wait for Railway to auto-redeploy
- Check browser console for specific errors

---

**Made with ❤️ using React + Node.js + PostgreSQL**