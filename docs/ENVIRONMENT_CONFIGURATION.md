# Environment Configuration Guide

Your backend now automatically detects development vs production environment and uses the appropriate frontend URLs.

## 🚀 How It Works

The system automatically detects your environment based on `NODE_ENV`:

- **Development**: `NODE_ENV !== 'production'` → Uses `http://localhost:5173`
- **Production**: `NODE_ENV === 'production'` → Uses `https://www.ark-id.xyz`

## 📝 Environment Variables

### Development (.env)
```env
# Development environment
NODE_ENV=development
# or just don't set NODE_ENV (defaults to development)

# Optional: Override default dev URL
FRONTEND_URL_DEV=http://localhost:5173

# Optional: Override default prod URL  
FRONTEND_URL_PROD=https://www.ark-id.xyz
```

### Production (.env)
```env
# Production environment
NODE_ENV=production

# Optional: Override default URLs
FRONTEND_URL_DEV=http://localhost:5173
FRONTEND_URL_PROD=https://www.ark-id.xyz
```

## 🔧 Configuration Options

### Option 1: Automatic (Recommended)
Just set `NODE_ENV` and let the system handle the rest:

```env
# Development
NODE_ENV=development
# → Uses http://localhost:5173

# Production  
NODE_ENV=production
# → Uses https://www.ark-id.xyz
```

### Option 2: Manual Override
Override the automatic URLs if needed:

```env
# Force a specific frontend URL regardless of environment
FRONTEND_URL=https://staging.ark-id.xyz
```

### Option 3: Environment-Specific URLs
Set different URLs for dev and prod:

```env
NODE_ENV=production
FRONTEND_URL_DEV=http://localhost:5173
FRONTEND_URL_PROD=https://www.ark-id.xyz
```

## 🎯 What Gets Redirected Where

### Development Mode
- **Success**: `http://localhost:5173/payment/success?reference=...&order=...`
- **Failed**: `http://localhost:5173/payment/failed?reference=...`
- **Error**: `http://localhost:5173/payment/error?message=...`

### Production Mode
- **Success**: `https://www.ark-id.xyz/payment/success?reference=...&order=...`
- **Failed**: `https://www.ark-id.xyz/payment/failed?reference=...`
- **Error**: `https://www.ark-id.xyz/payment/error?message=...`

## 🛠️ Testing Your Configuration

### Check Current Environment
```bash
# Check what environment is detected
node -e "console.log('NODE_ENV:', process.env.NODE_ENV || 'development')"
```

### Test Development
```bash
# Start in development mode
NODE_ENV=development npm start
# or just
npm start
```

### Test Production
```bash
# Start in production mode
NODE_ENV=production npm start
```

## 🔍 Debugging

The system logs which environment it's running in. Check your console output:

```
🚀 Server running on port 3000
Environment: development
Frontend URL: http://localhost:5173
```

## 📋 Quick Reference

| Environment | NODE_ENV | Frontend URL | CORS Origins |
|-------------|----------|--------------|---------------|
| Development | `development` or unset | `http://localhost:5173` | `localhost:*` |
| Production | `production` | `https://www.ark-id.xyz` | `ark-id.xyz` |

## ⚠️ Important Notes

1. **Set NODE_ENV=production** when deploying to production
2. **Don't commit production .env files** to version control
3. **Test both environments** before deploying
4. **Check CORS origins** match your frontend domains

## 🚀 Deployment

### Development
```bash
# .env
NODE_ENV=development
# Frontend will redirect to http://localhost:5173
```

### Production
```bash
# .env
NODE_ENV=production
# Frontend will redirect to https://www.ark-id.xyz
```

Your payment callbacks will now automatically use the correct frontend URL based on your environment! 🎉
