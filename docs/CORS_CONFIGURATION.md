# CORS Configuration Guide

Your CORS is now configured to accept an array of URLs. Here's how to use it:

## Environment Variables

Add this to your `.env` file to configure allowed origins:

```env
# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3001,http://localhost:3000,https://yourdomain.com,https://staging.yourdomain.com

# Your main frontend URL
FRONTEND_URL=https://yourdomain.com
```

## Default Configuration

If no `CORS_ORIGINS` is set, it defaults to:
- `http://localhost:3001` (React dev server)
- `http://localhost:3000` (Alternative React port)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8080` (Vue dev server)

## How It Works

1. **Environment Variable**: Set `CORS_ORIGINS` as a comma-separated string
2. **Config Processing**: The config splits the string into an array
3. **CORS Middleware**: Uses a function to check if the origin is allowed
4. **Logging**: Blocked origins are logged to console for debugging

## Example Usage

### Development
```env
CORS_ORIGINS=http://localhost:3001,http://localhost:3000,http://localhost:5173
```

### Production
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://staging.yourdomain.com
```

### Multiple Environments
```env
CORS_ORIGINS=http://localhost:3001,https://staging.yourdomain.com,https://yourdomain.com
```

## Features

✅ **Array Support**: Accepts multiple URLs
✅ **Environment Config**: Configure via `.env` file
✅ **Development Defaults**: Works out of the box for local development
✅ **Production Ready**: Easy to configure for production
✅ **Logging**: Shows blocked origins for debugging
✅ **Flexible**: Supports any number of origins

## Security Notes

- Only add trusted domains to `CORS_ORIGINS`
- Use HTTPS in production
- Remove localhost URLs in production
- Monitor logs for blocked origins

## Testing

To test if CORS is working:

```bash
# Test from allowed origin
curl -H "Origin: http://localhost:3001" http://localhost:3000/health

# Test from blocked origin (should fail)
curl -H "Origin: http://malicious-site.com" http://localhost:3000/health
```

The server will log blocked origins to help with debugging.
