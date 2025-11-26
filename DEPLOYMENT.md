# FinTrack Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure these environment variables are set on your production server:

```bash
# Required
DATABASE_URL="postgresql://username:password@host:5432/fintrack?schema=public"
JWT_SECRET="<strong-random-string>"  # Generate with: openssl rand -base64 32
NODE_ENV="production"

# Optional (if behind proxy/load balancer)
TRUST_PROXY="true"
```

⚠️ **CRITICAL**: Never use the default `JWT_SECRET` in production!

### 2. Database Setup
```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Build Application
```bash
npm install
npm run build
```

## Common Deployment Issues & Fixes

### Issue: Login successful but not redirecting to homepage

**Causes:**
1. **Cookie not being set** - Check browser DevTools → Application → Cookies
2. **HTTPS misconfiguration** - Secure cookies require HTTPS in production
3. **Proxy/Load Balancer issues** - Headers not being forwarded correctly
4. **SameSite cookie policy** - Fixed by using `sameSite: 'lax'` instead of `strict`

**Solutions Applied:**
- ✅ Changed `sameSite` from `strict` to `lax` for better cross-origin compatibility
- ✅ Standardized JWT library to `jose` across all files
- ✅ Added environment variable validation
- ✅ Added standalone output for deployment

### Issue: JWT verification fails

**Cause:** Using different JWT libraries (`jsonwebtoken` vs `jose`) with different encoding

**Solution:** All JWT operations now use `jose` library consistently

### Issue: Cookies not working behind proxy

**Solution:**
1. Set `TRUST_PROXY=true` in environment variables
2. Ensure your proxy/load balancer forwards these headers:
   - `X-Forwarded-Proto`
   - `X-Forwarded-Host`
   - `X-Forwarded-For`

## Platform-Specific Deployment

### Vercel
```bash
# Set environment variables in Vercel dashboard
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Deploy
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### DigitalOcean / AWS / Generic VPS
```bash
# 1. Install ALL dependencies (including devDependencies for build)
npm install

# 2. Setup database
npx prisma migrate deploy
npx prisma generate

# 3. Build the application
npm run build

# 4. Start with PM2 (recommended)
pm2 stop fintrack || true
pm2 delete fintrack || true
pm2 start npm --name "fintrack" -- start
pm2 save
pm2 startup

# OR start without PM2
# npm start
```

**IMPORTANT After Code Changes:**
```bash
# Pull latest code
git pull

# Reinstall dependencies if package.json changed
npm install

# Regenerate Prisma client if schema changed
npx prisma generate

# Rebuild Next.js
npm run build

# Restart the server
pm2 restart fintrack
# OR if not using PM2, kill and restart
```

## Verifying Deployment

### 1. Check Environment Variables
```bash
# On your server
printenv | grep -E 'DATABASE_URL|JWT_SECRET|NODE_ENV'
```

### 2. Test Login Flow
1. Open browser DevTools (F12)
2. Go to Network tab
3. Attempt login
4. Check `/api/auth/login` response:
   - Should return 200 OK
   - Should have `Set-Cookie` header
5. Check Application → Cookies tab:
   - Should see `token` cookie
   - Check `Secure`, `HttpOnly`, `SameSite` flags

### 3. Check Server Logs
```bash
# Look for these validation messages
# ✅ All environment variables present
# ⚠️  Warnings about default secrets or missing proxy settings
```

## Security Checklist

- [ ] Strong JWT_SECRET (not default value)
- [ ] DATABASE_URL uses strong password
- [ ] HTTPS enabled (for secure cookies)
- [ ] Environment variables not committed to git
- [ ] Database migrations run successfully
- [ ] Cookie settings appropriate for your domain

## Troubleshooting

### Check cookie in browser
```javascript
// Run in browser console
document.cookie
```

### Test API directly
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}' \
  -v
```

Look for `Set-Cookie` in response headers.

### Common errors

**"Missing required environment variables"**
- Ensure all variables from `.env.example` are set on server

**"Invalid token"**
- Check JWT_SECRET is identical between login and middleware
- Verify no extra spaces or quotes in environment variable

**"Unauthorized" after login**
- Check cookie is being set (browser DevTools)
- Verify cookie domain matches your deployment domain
- Check HTTPS is properly configured

## Support

If issues persist:
1. Check browser console for errors
2. Check server logs for JWT or database errors
3. Verify all environment variables are correctly set
4. Test locally with `NODE_ENV=production` to reproduce

