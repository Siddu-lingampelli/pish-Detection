# Development Notes & Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend (Port 3000)                          │  │
│  │  - URL Scanner Component                             │  │
│  │  - Results Display                                   │  │
│  │  - History & Analytics                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ (Axios)
┌─────────────────▼───────────────────────────────────────────┐
│                      API LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Server (Port 5000)                       │  │
│  │  - Route Handlers                                    │  │
│  │  - Request Validation                                │  │
│  │  - Response Formatting                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   BUSINESS LOGIC                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Phishing Detection Service                          │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  1. URL Structure Analysis                     │  │  │
│  │  │     - IP detection                             │  │  │
│  │  │     - TLD analysis                             │  │  │
│  │  │     - Pattern matching                         │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  2. Keyword Detection                          │  │  │
│  │  │     - Phishing keywords                        │  │  │
│  │  │     - Context analysis                         │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  3. SSL/HTTPS Verification                     │  │  │
│  │  │     - Protocol check                           │  │  │
│  │  │     - Certificate validation                   │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  4. External API Integration (Optional)        │  │  │
│  │  │     - Google Safe Browsing                     │  │  │
│  │  │     - Threat Intelligence                      │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB Database (Port 27017)                       │  │
│  │  - URLScan Collection                                │  │
│  │  - Indexed Queries                                   │  │
│  │  - Aggregation Pipeline                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Scan Request Flow
```
1. User enters URL in React form
   ↓
2. Form validation (client-side)
   ↓
3. POST request to /api/scan
   ↓
4. Server-side validation
   ↓
5. PhishingDetectionService.detectPhishing()
   ├─→ URL Structure Analysis
   ├─→ Keyword Detection
   ├─→ SSL Verification
   └─→ Google Safe Browsing (if enabled)
   ↓
6. Combine detection results
   ↓
7. Calculate confidence score
   ↓
8. Save to MongoDB
   ↓
9. Return response to client
   ↓
10. Display results with visualization
```

---

## 🧮 Detection Algorithm

### Scoring System
```javascript
// Initialize base score
let totalScore = 0;

// URL Structure Analysis (0-0.5)
totalScore += urlAnalysis.riskScore;

// Keyword Analysis (0-0.5)
totalScore += keywordAnalysis.keywordScore;

// Safe Browsing API (0-1.0)
if (safeBrowsingResult.isThreat) {
    totalScore = 1.0; // Override
}

// Final Determination
if (totalScore >= 0.7) → Phishing
else if (totalScore >= 0.3) → Suspicious
else → Legit
```

### Risk Factor Weights
| Factor | Weight | Description |
|--------|--------|-------------|
| IP Address | 0.30 | Uses IP instead of domain |
| Suspicious TLD | 0.20 | .tk, .ml, .ga, etc. |
| @ Symbol | 0.30 | URL obfuscation |
| No HTTPS | 0.15 | No SSL encryption |
| Excessive Subdomains | 0.15 | 3+ subdomains |
| Suspicious Characters | 0.10 | Multiple hyphens |
| Long Domain | 0.10 | Over 50 characters |
| Homograph Attack | 0.40 | Look-alike characters |
| Phishing Keyword | 0.05 | Per keyword found |
| Multiple Keywords | 0.20 | 3+ keywords |

---

## 📊 Database Schema

### URLScan Collection
```javascript
{
  _id: ObjectId,
  url: String (required, indexed),
  result: String (enum: ['Legit', 'Suspicious', 'Phishing']),
  confidence_score: Number (0-1),
  meta_data: {
    domain_age: String,
    has_ssl: Boolean,
    keywords: [String],
    threat_types: [String],
    risk_factors: [String],
    ip_address: String,
    domain_length: Number,
    has_suspicious_chars: Boolean
  },
  scan_duration: Number (milliseconds),
  created_at: Date (indexed),
  updated_at: Date
}
```

### Indexes
```javascript
// Compound index for filtering
{ url: 1, created_at: -1 }

// Result filter
{ result: 1 }

// Timestamp sorting
{ created_at: -1 }
```

---

## 🎨 Frontend Components

### Component Hierarchy
```
App.jsx
├── Navbar.jsx
└── Routes
    ├── Home.jsx
    │   ├── URLScanner.jsx
    │   └── ScanResult.jsx
    ├── History.jsx
    └── Analytics.jsx
```

### State Management
```javascript
// Home Component
- loading: boolean
- scanResult: object | null
- error: string | null

// History Component
- scans: array
- loading: boolean
- filter: string
- pagination: object

// Analytics Component
- stats: object | null
- loading: boolean
```

---

## 🔐 Security Considerations

### Input Validation
1. **Client-side**:
   - URL format validation
   - Required field checks
   - Protocol verification (http/https)

2. **Server-side**:
   - URL sanitization
   - Length limits
   - MongoDB injection prevention
   - XSS prevention

### API Security
- CORS configuration
- Rate limiting (future)
- Input sanitization
- Error message sanitization
- MongoDB query parameterization

---

## ⚡ Performance Optimizations

### Database
- Indexed queries for fast lookups
- Compound indexes for filtering
- Aggregation pipeline for statistics
- Limited result sets with pagination

### Frontend
- Vite for fast builds
- Code splitting
- Lazy loading components (future)
- Optimized bundle size
- TailwindCSS purging

### Backend
- Async/await for non-blocking operations
- Connection pooling (MongoDB)
- Request timeout handling
- Efficient data structures

---

## 🧪 Testing Strategy

### Unit Tests (Future Implementation)
```javascript
// Backend
- URL validation tests
- Detection algorithm tests
- Risk scoring tests
- API endpoint tests

// Frontend
- Component rendering tests
- Form validation tests
- API call mocking tests
```

### Integration Tests
```javascript
- End-to-end scan flow
- Database operations
- API response validation
- Error handling
```

### Manual Testing Checklist
- [ ] Legitimate URLs (Google, GitHub)
- [ ] Suspicious URLs (test TLDs)
- [ ] IP-based URLs
- [ ] URLs with special characters
- [ ] Very long URLs
- [ ] Invalid URLs
- [ ] Empty input
- [ ] History filtering
- [ ] Analytics calculations
- [ ] Delete operations

---

## 📦 Deployment Strategy

### Development
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

### Production Build
```bash
# Frontend build
cd client
npm run build
# Creates: client/dist

# Serve with backend
cd server
# Serve static files from client/dist
npm start
```

### Deployment Options
1. **Heroku** - Easy deployment
2. **Vercel** - Frontend (Vite/React)
3. **Railway** - Full-stack
4. **DigitalOcean** - VPS
5. **AWS** - Scalable infrastructure
6. **Docker** - Containerization (future)

---

## 🔄 CI/CD Pipeline (Future)

```yaml
# .github/workflows/deploy.yml
1. Install dependencies
2. Run linting
3. Run tests
4. Build frontend
5. Deploy to production
6. Health check
```

---

## 📈 Monitoring & Analytics

### Metrics to Track
- Total scans performed
- Detection accuracy
- False positive rate
- Average scan duration
- API response times
- Database query performance
- Error rates

### Logging
```javascript
// Backend logs
- Scan requests
- Detection results
- API errors
- Database connections
- External API calls

// Frontend logs
- Component errors
- API failures
- User actions (optional)
```

---

## 🚀 Scalability Considerations

### Horizontal Scaling
- Load balancer for multiple backend instances
- MongoDB replica sets
- Redis for caching (future)
- Message queue for async processing (future)

### Vertical Scaling
- Increase server resources
- Database optimization
- Query caching
- Connection pooling

---

## 🛠️ Development Tools

### Backend
- **nodemon** - Auto-restart on changes
- **eslint** - Code linting (future)
- **prettier** - Code formatting (future)
- **jest** - Testing framework (future)

### Frontend
- **Vite** - Fast development server
- **React DevTools** - Component inspection
- **TailwindCSS** - Utility-first styling
- **PostCSS** - CSS processing

---

## 📚 API Rate Limiting (Future)

```javascript
// Example implementation
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

---

## 🔒 Environment Variables

### Server (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phishingDetection
CLIENT_URL=http://localhost:3000
GOOGLE_SAFE_BROWSING_API_KEY=optional
VIRUSTOTAL_API_KEY=optional
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 Code Style Guide

### JavaScript/React
- Use ES6+ syntax
- Async/await over promises
- Functional components with hooks
- Destructuring where possible
- Meaningful variable names
- Comments for complex logic

### CSS/TailwindCSS
- Utility-first approach
- Component classes for reusable styles
- Responsive design mobile-first
- Consistent spacing scale

---

## 🎯 Best Practices Followed

1. **Separation of Concerns**
   - Routes, services, models separated
   - Component-based UI architecture

2. **Error Handling**
   - Try-catch blocks
   - Proper error messages
   - Error boundaries (React)

3. **Validation**
   - Client and server-side
   - Data sanitization
   - Type checking

4. **Documentation**
   - Inline comments
   - README files
   - API documentation
   - Code examples

5. **Security**
   - Input validation
   - CORS configuration
   - Environment variables
   - No sensitive data exposure

---

**Last Updated**: October 31, 2025
**Version**: 1.0.0
**Author**: Lingampelli Siddhartha
