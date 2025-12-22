# Security Implementation TODO

This document outlines the security measures that need to be implemented for the CLUUB Frontend application.

## Current State (INSECURE - No Authentication)

```
❌ Anyone can call: /api/v1/members
❌ Anyone can call: /api/v1/timerecords
❌ Anyone can create/update/delete data
```

## Security Implementation Plan

### Phase 1: Backend Authentication (CRITICAL - Must be done first!)

#### 1. Authentication (Who are you?)

**Backend Implementation (FastAPI):**

```python
# Add to backend API
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from google.oauth2 import id_token
from google.auth.transport import requests

security = HTTPBearer()

def verify_google_token(credentials: HTTPBearer = Depends(security)):
    """Verify Google OAuth2 token on every request"""
    token = credentials.credentials
    try:
        # Verify token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Token is valid
        user_email = idinfo['email']
        return {'email': user_email, 'sub': idinfo['sub']}
    except ValueError:
        # Token is invalid
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# Protect all endpoints
@app.get("/api/v1/members")
async def list_members(user: dict = Depends(verify_google_token)):
    # If token is invalid/missing → 401 Unauthorized
    # If token is valid → proceed
    return get_members()

@app.post("/api/v1/timerecords")
async def create_timerecord(
    record: TimeRecordCreate,
    user: dict = Depends(verify_google_token)
):
    # Only authenticated users can create records
    return create_record(record)
```

**Frontend Implementation (Vue.js):**

```js
// Store auth token after login
localStorage.setItem('auth_token', token)

// Include token in every API request
const response = await fetch('/api/v1/members', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})

// Handle authentication errors
if (response.status === 401) {
  // Token expired or invalid - redirect to login
  localStorage.removeItem('auth_token')
  window.location.href = '/login'
}
```

#### 2. Authorization (What can you do?)

**Backend Implementation:**

```python
# Define user roles
from enum import Enum

class UserRole(Enum):
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

# Store user roles in database
# Check permissions before allowing actions

def require_admin(user: dict = Depends(verify_google_token)):
    """Only allow admins"""
    user_role = get_user_role(user['email'])
    if user_role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Protect sensitive endpoints
@app.post("/api/v1/members")
async def create_member(
    member: MemberCreate,
    user: dict = Depends(require_admin)
):
    # Only admins can create members
    return create_member(member)

@app.delete("/api/v1/members/{member_id}")
async def delete_member(
    member_id: int,
    user: dict = Depends(require_admin)
):
    # Only admins can delete members
    return delete_member(member_id)
```

#### 3. Input Validation (Already planned in AGENTS.md)

```python
# Validate all inputs with Pydantic
from pydantic import BaseModel, validator, Field

class TimeRecordCreate(BaseModel):
    member_id: int = Field(..., gt=0)
    worktime_from: datetime
    worktime_to: datetime
    operation: str = Field(None, max_length=140)
    
    @validator('worktime_to')
    def end_after_start(cls, v, values):
        if 'worktime_from' in values and v <= values['worktime_from']:
            raise ValueError('End time must be after start time')
        return v
```

### Phase 2: Frontend Authentication Flow

#### Components to Create:

1. **Login Page** (`src/views/Login.vue`)
   - Google Sign-In button
   - Handle OAuth2 callback
   - Store token in localStorage
   - Redirect to dashboard

2. **Authentication Service** (`src/services/auth.js`)
   ```js
   export const authService = {
     async login() {
       // Implement Google OAuth2 flow
     },
     
     logout() {
       localStorage.removeItem('auth_token')
       window.location.href = '/login'
     },
     
     isAuthenticated() {
       return !!localStorage.getItem('auth_token')
     },
     
     getAuthHeader() {
       const token = localStorage.getItem('auth_token')
       return token ? { 'Authorization': `Bearer ${token}` } : {}
     }
   }
   ```

3. **API Service** (`src/services/api.js`)
   ```js
   import { authService } from './auth'
   
   export async function apiRequest(url, options = {}) {
     const response = await fetch(url, {
       ...options,
       headers: {
         ...options.headers,
         ...authService.getAuthHeader()
       }
     })
     
     if (response.status === 401) {
       authService.logout()
       return
     }
     
     return response
   }
   ```

4. **Route Guards** (`src/router/index.js`)
   ```js
   router.beforeEach((to, from, next) => {
     if (to.meta.requiresAuth && !authService.isAuthenticated()) {
       next('/login')
     } else {
       next()
     }
   })
   ```

### Phase 3: Production Security

#### 1. HTTPS (Mandatory for production)

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy API requests to FastAPI backend
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve Vue.js frontend static files
    location / {
        root /var/www/cluub-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 2. Rate Limiting (Prevent abuse)

**Backend Implementation:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/v1/members")
@limiter.limit("100/minute")
async def list_members(request: Request, user: dict = Depends(verify_google_token)):
    return get_members()
```

#### 3. Security Headers

**Backend Implementation:**
```python
from fastapi.middleware.cors import CORSMiddleware

# Configure CORS properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Only your domain in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Add security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### Phase 4: OWASP ASVS Compliance

Implement specific requirements from [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/):

- **V2: Authentication** ✅ (Google OAuth2)
- **V3: Session Management** ✅ (JWT tokens)
- **V4: Access Control** ✅ (Role-based authorization)
- **V5: Input Validation** ✅ (Pydantic models)
- **V7: Error Handling** (Don't expose sensitive info in errors)
- **V8: Data Protection** (HTTPS, encrypted storage)
- **V9: Communications** (TLS 1.2+, secure headers)

## Implementation Priority

1. **HIGH PRIORITY** (Do first):
   - [ ] Backend: Implement Google OAuth2 authentication
   - [ ] Backend: Protect all API endpoints with token verification
   - [ ] Frontend: Create login page
   - [ ] Frontend: Add authentication service
   - [ ] Frontend: Update all API calls to include auth token

2. **MEDIUM PRIORITY** (Do next):
   - [ ] Backend: Implement role-based authorization
   - [ ] Backend: Add rate limiting
   - [ ] Frontend: Add route guards
   - [ ] Frontend: Handle 401/403 errors gracefully

3. **BEFORE PRODUCTION** (Must have):
   - [ ] Setup HTTPS with valid SSL certificate
   - [ ] Configure security headers
   - [ ] Restrict CORS to production domain only
   - [ ] Review and test all security measures
   - [ ] Perform security audit

## Important Notes

### What NOT to Do

❌ **Don't try to hide API endpoints** - it's impossible and unnecessary  
❌ **Don't rely on frontend security** - users can modify JavaScript  
❌ **Don't use "security through obscurity"**  
❌ **Don't hardcode API keys or secrets in frontend code**  

### What TO Do

✅ **Do implement authentication** (OAuth2)  
✅ **Do validate tokens on the backend**  
✅ **Do check user permissions**  
✅ **Do validate all inputs**  
✅ **Do use HTTPS in production**  
✅ **Do implement rate limiting**  
✅ **Do follow OWASP ASVS guidelines**  

## Real-World Examples

Every secure web application (GitHub, Gmail, Twitter, etc.) has:
- APIs visible in browser dev tools (F12 → Network tab)
- All requests can be inspected by users
- Security through authentication & authorization, NOT obscurity

The security comes from:
1. Valid authentication token required
2. Backend validates token on every request
3. Backend checks user permissions
4. HTTPS encrypts communication
5. Rate limiting prevents abuse

## Resources

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Status

- [ ] Authentication implemented
- [ ] Authorization implemented
- [ ] HTTPS configured
- [ ] Rate limiting enabled
- [ ] Security audit completed
- [ ] Ready for production

**Current Status:** ⚠️ NOT SECURE - No authentication implemented yet