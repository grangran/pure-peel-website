# Website Security Guide for Pure Peel Co.

## Current Security Status

### ✅ Already Secure:
- HTTPS enabled (Vercel automatically provides SSL)
- Environment variables for secrets (not in code)
- Stripe handles payment security
- No sensitive data stored in frontend

### ⚠️ Areas to Improve:
- Add security headers
- Add rate limiting
- Add input validation
- Regular dependency updates
- CORS configuration

---

## Essential Security Measures

### 1. Security Headers ⭐⭐⭐⭐⭐

**Add security headers to protect against common attacks:**

#### For Vercel (Frontend):
Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

#### For Render (Backend):
Add to `server.js`:

```javascript
// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})
```

**Protects against:**
- XSS attacks
- Clickjacking
- MIME type sniffing
- Information leakage

---

### 2. Rate Limiting ⭐⭐⭐⭐⭐

**Prevent abuse and DDoS attacks:**

Install `express-rate-limit`:

```bash
npm install express-rate-limit
```

Add to `server.js`:

```javascript
import rateLimit from 'express-rate-limit'

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Stricter limit for checkout
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 checkout attempts per 15 minutes
  message: 'Too many checkout attempts, please try again later.'
})

// Apply to routes
app.use('/api/', apiLimiter)
app.use('/api/create-checkout-session', checkoutLimiter)
```

**Protects against:**
- DDoS attacks
- Brute force attacks
- API abuse

---

### 3. Input Validation ⭐⭐⭐⭐⭐

**Validate and sanitize all user input:**

Install `express-validator`:

```bash
npm install express-validator
```

Add validation to checkout endpoint:

```javascript
import { body, validationResult } from 'express-validator'

// Validation rules
const validateCheckout = [
  body('shippingInfo.email').isEmail().normalizeEmail(),
  body('shippingInfo.firstName').trim().isLength({ min: 1, max: 50 }),
  body('shippingInfo.lastName').trim().isLength({ min: 1, max: 50 }),
  body('shippingInfo.postalCode').matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/),
  body('items').isArray().notEmpty(),
]

app.post('/api/create-checkout-session', validateCheckout, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  // ... rest of code
})
```

**Protects against:**
- SQL injection
- XSS attacks
- Invalid data
- Buffer overflow

---

### 4. CORS Configuration ⭐⭐⭐⭐

**Restrict which domains can access your API:**

Update CORS in `server.js`:

```javascript
import cors from 'cors'

const corsOptions = {
  origin: [
    'https://purepeelco.com',
    'https://www.purepeelco.com',
    'http://localhost:5173', // Development only
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
```

**Protects against:**
- Unauthorized API access
- CSRF attacks
- Data theft

---

### 5. Environment Variables Security ⭐⭐⭐⭐⭐

**Already doing this, but verify:**

✅ **Good:**
- Secrets in environment variables (Render/Vercel)
- Not committed to git
- `.env` in `.gitignore`

❌ **Never do:**
- Commit secrets to git
- Hardcode API keys
- Share secrets in screenshots/logs

**Checklist:**
- [ ] All API keys in environment variables
- [ ] `.env` in `.gitignore`
- [ ] No secrets in code
- [ ] Different keys for dev/prod

---

### 6. Dependency Security ⭐⭐⭐⭐

**Keep dependencies updated:**

Check for vulnerabilities:

```bash
npm audit
```

Fix vulnerabilities:

```bash
npm audit fix
```

Update regularly:

```bash
npm update
```

**Automate:**
- Use Dependabot (GitHub) to auto-update dependencies
- Review security advisories

---

### 7. HTTPS/SSL ⭐⭐⭐⭐⭐

**Already secure (Vercel provides SSL automatically):**

✅ **Verified:**
- Site uses HTTPS
- SSL certificate valid
- HTTP redirects to HTTPS

**Check:**
- Visit: `https://purepeelco.com`
- Browser should show padlock icon
- No "Not Secure" warnings

---

### 8. Content Security Policy (CSP) ⭐⭐⭐

**Prevent XSS attacks:**

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://pure-peel-website.onrender.com; frame-src https://js.stripe.com;"
        }
      ]
    }
  ]
}
```

**Protects against:**
- XSS attacks
- Data injection
- Unauthorized scripts

---

### 9. API Key Rotation ⭐⭐⭐

**Regularly rotate API keys:**

**Stripe:**
- Rotate keys every 90 days
- Use different keys for dev/prod
- Revoke old keys after rotation

**Resend:**
- Rotate API keys periodically
- Use different keys for dev/prod

**Canada Post:**
- Rotate credentials if compromised
- Use different credentials for dev/prod

---

### 10. Error Handling ⭐⭐⭐

**Don't expose sensitive info in errors:**

**Bad:**
```javascript
catch (error) {
  res.status(500).json({ error: error.message }) // Exposes internal details
}
```

**Good:**
```javascript
catch (error) {
  console.error('Internal error:', error) // Log for debugging
  res.status(500).json({ error: 'An error occurred. Please try again.' }) // Generic message
}
```

---

### 11. Data Protection ⭐⭐⭐⭐

**Protect customer data:**

✅ **Already doing:**
- Stripe handles payment data (PCI compliant)
- No credit card data stored
- Customer emails encrypted in transit

**Additional measures:**
- Encrypt sensitive data at rest
- Regular backups
- GDPR compliance (if serving EU customers)

---

### 12. Monitoring & Logging ⭐⭐⭐

**Monitor for security issues:**

**Set up:**
- Error tracking (Sentry, LogRocket)
- Security monitoring
- Unusual activity alerts

**Monitor:**
- Failed login attempts
- Unusual API usage
- Error rates
- Response times

---

## Quick Security Checklist

### Immediate Actions (High Priority):
- [ ] Add security headers (Vercel + Render)
- [ ] Add rate limiting to API
- [ ] Add input validation
- [ ] Configure CORS properly
- [ ] Run `npm audit` and fix vulnerabilities

### Short-term (Medium Priority):
- [ ] Add Content Security Policy
- [ ] Improve error handling
- [ ] Set up monitoring
- [ ] Document security procedures

### Long-term (Ongoing):
- [ ] Regular dependency updates
- [ ] API key rotation
- [ ] Security audits
- [ ] Penetration testing

---

## Security Testing

### Test Your Security:

1. **HTTPS Check:**
   - Visit: https://www.ssllabs.com/ssltest/
   - Enter: `purepeelco.com`
   - Check rating (should be A or A+)

2. **Security Headers:**
   - Visit: https://securityheaders.com
   - Enter: `purepeelco.com`
   - Check rating

3. **Vulnerability Scan:**
   - Run: `npm audit`
   - Fix any high/critical vulnerabilities

4. **CORS Test:**
   - Try accessing API from unauthorized domain
   - Should be blocked

---

## Summary

**Your website is already fairly secure, but you can improve it by:**

1. ✅ **Add security headers** (prevents XSS, clickjacking)
2. ✅ **Add rate limiting** (prevents abuse)
3. ✅ **Add input validation** (prevents injection attacks)
4. ✅ **Configure CORS** (restricts API access)
5. ✅ **Keep dependencies updated** (fixes vulnerabilities)

**Most important:** Security headers and rate limiting - these provide the biggest security improvements with minimal effort.

I can help implement any of these security measures. Which ones would you like to start with?

