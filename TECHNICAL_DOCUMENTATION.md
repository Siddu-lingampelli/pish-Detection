# PhishGuard: Technical Architecture & Implementation Methodology

## Technologies Used

### 1. Frontend Technologies

#### **Core Framework & Build Tools**
- **React 18.2.0** - Component-based UI library with concurrent features
- **Vite 5.4.21** - Next-generation frontend build tool with HMR (Hot Module Replacement)
- **React Router v6** - Client-side routing and navigation

#### **Styling & UI**
- **TailwindCSS 3.4** - Utility-first CSS framework for rapid UI development
- **Framer Motion** - Animation library for smooth transitions and interactions
- **CSS Grid & Flexbox** - Modern layout systems

#### **State Management & Data Fetching**
- **React Hooks** (useState, useEffect, useRef, useCallback)
- **Axios** - Promise-based HTTP client for API communication
- **LocalStorage API** - Client-side data persistence for authentication

#### **UI Components & Icons**
- **React Icons** - Icon library (Feather Icons, Bootstrap Icons)
- **Custom Components** - Reusable component architecture

#### **Media Handling**
- **jsQR** - QR code decoding library
- **HTML5 Canvas API** - Image manipulation and processing
- **File API** - File upload and handling

### 2. Backend Technologies

#### **Runtime & Framework**
- **Node.js 18+** - JavaScript runtime environment
- **Express.js 4.18** - Minimal and flexible web application framework
- **ES6 Modules** - Modern JavaScript module system

#### **Database**
- **MongoDB 6+** - NoSQL document database
- **Mongoose 7.5** - MongoDB object modeling (ODM)
- **Database Design**: User collections, scan history, analytics

#### **Authentication & Security**
- **jsonwebtoken (JWT)** - Token-based authentication
- **bcryptjs** - Password hashing (10 salt rounds)
- **CORS** - Cross-Origin Resource Sharing middleware
- **express-rate-limit** - API rate limiting (planned)

#### **File Processing**
- **Multer** - Multipart/form-data handling for file uploads
- **Sharp** - High-performance image processing (resize, format conversion)
- **Jimp** - JavaScript image manipulation (color analysis, pixel operations)
- **Tesseract.js** - OCR engine for text extraction (fallback)

#### **External API Integration**
- **Axios** - HTTP client for external API calls
- **async/await** - Asynchronous operation handling
- **Promise.all** - Parallel API execution

### 3. Artificial Intelligence Services

#### **OpenRouter GPT-4o (Vision + Language)**
- **Model**: gpt-4o (OpenAI's multimodal model)
- **Capabilities**: 
  - Image analysis and understanding
  - Text extraction from screenshots
  - Visual pattern recognition
  - Natural language threat assessment
- **Use Cases**: Screenshot analysis, email content analysis
- **API Endpoint**: https://openrouter.ai/api/v1/chat/completions

#### **Mistral AI**
- **Model**: mistral-small-latest
- **Capabilities**:
  - Conversational AI
  - Context-aware responses
  - Security knowledge base
  - Multi-turn dialogue
- **Use Cases**: AI Security Assistant chatbot
- **API Endpoint**: https://api.mistral.ai/v1/chat/completions

### 4. Security APIs & Threat Intelligence

#### **Google Safe Browsing API v4**
- **Purpose**: Real-time threat detection
- **Coverage**: Malware, phishing, unwanted software, social engineering
- **Integration**: Lookup API for URL verification
- **Database Size**: Billions of unsafe URLs

#### **VirusTotal API v3**
- **Purpose**: Multi-engine malware scanning
- **Coverage**: 90+ antivirus engines
- **Features**: URL scanning, file scanning, domain reports
- **Data**: Historical threat intelligence

#### **URLScan.io API**
- **Purpose**: Website analysis and sandbox
- **Features**: 
  - Visual rendering
  - Network traffic analysis
  - JavaScript execution
  - Redirect chain tracking
- **Output**: Screenshots, DOM analysis, HTTP transactions

### 5. Browser Extension Technologies

#### **Chrome Extension (Manifest V3)**
- **manifest.json** - Extension configuration
- **popup.html/js** - User interface
- **background.js** - Service worker for background tasks
- **content.js** - Injected scripts for page interaction
- **Chrome APIs**: tabs, storage, notifications

### 6. Development Tools & Infrastructure

#### **Version Control**
- **Git** - Version control system
- **GitHub** - Code repository hosting
- **Branch Strategy**: main, development, feature branches

#### **Package Management**
- **npm (Node Package Manager)** - Dependency management
- **package.json** - Project configuration and scripts

#### **Development Environment**
- **VS Code** - Primary IDE
- **Nodemon** - Auto-restart development server
- **ESLint** - Code linting (planned)
- **Prettier** - Code formatting (planned)

#### **Environment Configuration**
- **dotenv** - Environment variable management
- **.env files** - Secure API key storage
- **Environment separation**: Development, Production

### 7. Deployment Technologies (Planned)

#### **Frontend Hosting**
- **Vercel** or **Netlify** - Static site hosting with CDN
- **CI/CD**: Automatic deployment on git push

#### **Backend Hosting**
- **AWS EC2** or **DigitalOcean** - Virtual private servers
- **PM2** - Node.js process manager
- **Nginx** - Reverse proxy and load balancer

#### **Database Hosting**
- **MongoDB Atlas** - Cloud-hosted MongoDB
- **Automatic backups** - Data persistence and recovery

#### **Domain & SSL**
- **Custom domain** - Professional branding
- **Let's Encrypt** - Free SSL certificates
- **HTTPS** - Encrypted communication

---

## Implementation Methodology

### Development Approach: Agile + Feature-Driven Development

#### **Phase 1: Foundation (Completed)**
✅ Project setup and architecture design
✅ Core URL scanning with multi-API integration
✅ Basic UI/UX with professional design system
✅ QR code scanning implementation
✅ Database schema and connection

#### **Phase 2: AI Integration (Completed)**
✅ GPT-4o Vision API for screenshot analysis
✅ Mistral AI chatbot assistant
✅ Email phishing scanner with GPT-4o
✅ Advanced risk scoring algorithms
✅ Typosquatting detection

#### **Phase 3: Authentication (Completed)**
✅ User registration and login system
✅ JWT token-based authentication
✅ Password hashing with bcrypt
✅ Protected routes (frontend + backend)
✅ Freemium access control

#### **Phase 4: Enhancement (Current)**
🔄 User dashboard and profile
🔄 Scan history and analytics
🔄 Batch URL scanning
🔄 Email file upload (.eml)
🔄 Browser extension refinement

#### **Phase 5: Optimization (Planned)**
📋 Performance optimization
📋 API rate limiting
📋 Caching strategies
📋 Error handling improvements
📋 Unit and integration testing

#### **Phase 6: Deployment (Planned)**
📋 Production environment setup
📋 CI/CD pipeline configuration
📋 Monitoring and logging
📋 Documentation finalization
📋 Launch and marketing

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Web Browser  │  │    Mobile    │  │  Chrome Extension    │  │
│  │  (React UI)  │  │  (Planned)   │  │   (Manifest V3)      │  │
│  └──────┬───────┘  └──────────────┘  └──────────┬───────────┘  │
│         │                                        │               │
│         └────────────────────┬───────────────────┘               │
└──────────────────────────────┼─────────────────────────────────┘
                               │ HTTPS/REST API
┌──────────────────────────────┼─────────────────────────────────┐
│                         API GATEWAY                              │
│                    ┌─────────┴─────────┐                        │
│                    │  Express.js Server │                        │
│                    │   (Node.js 18+)    │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐ │
│  │            AUTHENTICATION MIDDLEWARE                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │  JWT Verify  │  │   bcrypt     │  │  Rate Limit  │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬─────────────────────────────────┘
                               │
┌──────────────────────────────┼─────────────────────────────────┐
│                      SERVICE LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  URL Analysis    │  │  Screenshot      │  │  QR Scanner  │ │
│  │  Service         │  │  Analysis        │  │  Service     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Email Analysis  │  │  AI Assistant    │  │  Auth        │ │
│  │  Service         │  │  Service         │  │  Service     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└──────────────────────────────┬─────────────────────────────────┘
                               │
┌──────────────────────────────┼─────────────────────────────────┐
│                     EXTERNAL APIs LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   Google   │  │ VirusTotal │  │ URLScan.io │  │ OpenRouter│ │
│  │    Safe    │  │    API     │  │    API     │  │ GPT-4o   │ │
│  │  Browsing  │  │            │  │            │  │  Vision  │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│  ┌────────────┐                                                │
│  │ Mistral AI │                                                │
│  │    API     │                                                │
│  └────────────┘                                                │
└──────────────────────────────┬─────────────────────────────────┘
                               │
┌──────────────────────────────┼─────────────────────────────────┐
│                       DATA LAYER                                │
│                    ┌─────────┴─────────┐                       │
│                    │     MongoDB        │                       │
│                    │  (Mongoose ODM)    │                       │
│                    └───────────────────┘                        │
│  Collections:                                                   │
│  • users (authentication data)                                 │
│  • scans (scan history)                                        │
│  • analytics (usage statistics)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Process Flowcharts

### 1. URL Scanning Process Flow

```
START
  ↓
[User enters URL]
  ↓
┌─────────────────────────────┐
│ Client-side Validation      │
│ • Check URL format          │
│ • Remove whitespace         │
│ • Normalize URL             │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Send to Backend API         │
│ POST /api/scan              │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 1: URL Pattern Analysis               │
│ • Parse URL components (protocol, domain, path)     │
│ • Check for suspicious TLDs (.tk, .ml, .ga)        │
│ • Detect IP-based URLs (http://192.168.x.x)        │
│ • Identify suspicious subdomains                    │
│ Risk Score: +0-15                                   │
└─────────────┬───────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 2: Keyword Intelligence               │
│ • Scan for phishing keywords (urgent, verify)      │
│ • Check for financial terms (bank, payment)        │
│ • Detect regional keywords (PhonePe, Paytm)        │
│ • Brand impersonation check                         │
│ Risk Score: +0-15                                   │
└─────────────┬───────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 3: SSL/TLS Validation                 │
│ • Check HTTPS protocol                              │
│ • Validate SSL certificate                          │
│ • Verify certificate authority                      │
│ • Check expiration date                             │
│ Risk Score: +0-10                                   │
└─────────────┬───────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────────────────┐
│      PARALLEL API CALLS (Promise.all)                  │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ LAYER 4:         │  │ LAYER 5:         │           │
│  │ Google Safe      │  │ VirusTotal       │           │
│  │ Browsing         │  │ Multi-Engine     │           │
│  │                  │  │                  │           │
│  │ Check against    │  │ Scan with 90+    │           │
│  │ threat database  │  │ AV engines       │           │
│  │                  │  │                  │           │
│  │ Risk: +0-20      │  │ Risk: +0-20      │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
│  ┌──────────────────┐                                  │
│  │ LAYER 6:         │                                  │
│  │ URLScan.io       │                                  │
│  │                  │                                  │
│  │ Deep analysis    │                                  │
│  │ Screenshot       │                                  │
│  │ Network traffic  │                                  │
│  │                  │                                  │
│  │ Risk: +0-20      │                                  │
│  └──────────────────┘                                  │
└────────────┬───────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 7: AI Assessment                      │
│ • Send results to Mistral AI (if configured)       │
│ • Generate natural language explanation            │
│ • Provide security recommendations                  │
│ • Contextual threat analysis                        │
└─────────────┬───────────────────────────────────────┘
              ↓
┌─────────────────────────────┐
│ Aggregate Risk Score        │
│ Total: 0-100                │
│ • 0-30: Safe (Green)        │
│ • 31-60: Suspicious (Yellow)│
│ • 61-100: Dangerous (Red)   │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Store Result in Database    │
│ (if user authenticated)     │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Return JSON Response        │
│ • risk_score                │
│ • status (safe/suspicious)  │
│ • details (layer results)   │
│ • ai_explanation            │
│ • recommendations           │
└─────────────┬───────────────┘
              ↓
[Display Results to User]
  ↓
END
```

---

### 2. Screenshot Analysis Process Flow

```
START
  ↓
[User uploads screenshot image]
  ↓
┌─────────────────────────────┐
│ Client-side Validation      │
│ • Check file type (jpg/png) │
│ • Verify file size (<10MB)  │
│ • Preview image             │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Upload to Backend           │
│ POST /api/screenshot/analyze│
│ (multipart/form-data)       │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Multer: Handle File Upload  │
│ • Save to temp directory    │
│ • Generate unique filename  │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Image Preprocessing (Sharp)                     │
│ • Resize to max 2000px width                    │
│ • Compress (80% quality)                        │
│ • Convert to JPEG if needed                     │
│ • Optimize for API transmission                 │
└─────────────┬───────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Visual Analysis (Jimp)                          │
│ • Color histogram analysis                      │
│ • Detect dominant colors                        │
│ • Identify visual patterns                      │
│ • Form field detection (heuristic)              │
└─────────────┬───────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ GPT-4o Vision API (Primary)                     │
│ • Convert image to base64                       │
│ • Send to OpenRouter API                        │
│ • Model: gpt-4o                                 │
│                                                  │
│ Analysis Tasks:                                 │
│ 1. Extract visible text (OCR)                   │
│ 2. Identify brands/logos                        │
│ 3. Detect input fields (password, credit card)  │
│ 4. Spot suspicious elements                     │
│ 5. Assess overall risk (0-100)                  │
│ 6. Provide detailed reasoning                   │
└─────────────┬───────────────────────────────────┘
              ↓
         [Success?]
          /     \
        YES      NO
         ↓       ↓
         │   ┌─────────────────────────────────┐
         │   │ Fallback: Tesseract.js OCR      │
         │   │ • Basic text extraction         │
         │   │ • Limited accuracy              │
         │   └─────────────┬───────────────────┘
         │                 ↓
         └─────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Enhanced Risk Scoring                           │
│                                                  │
│ Factors:                                        │
│ • Detected brands (PayPal, Bank logos) +20      │
│ • Suspicious input fields (many fields) +15     │
│ • Urgency keywords in text +10                  │
│ • Missing HTTPS indicators +15                  │
│ • Poor design quality +10                       │
│ • Visual inconsistencies +10                    │
│ • AI confidence score (0-100)                   │
│                                                  │
│ Final Score: 0-100                              │
└─────────────┬───────────────────────────────────┘
              ↓
┌─────────────────────────────┐
│ Clean Up Temp Files         │
│ • Delete uploaded image     │
│ • Free memory               │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Store Result (if logged in) │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Return JSON Response        │
│ • extractedText             │
│ • riskScore (0-100)         │
│ • detectedBrands            │
│ • inputFields               │
│ • suspiciousElements        │
│ • reasoning (AI explanation)│
└─────────────┬───────────────┘
              ↓
[Display Results to User]
  ↓
END
```

---

### 3. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

START
  ↓
[User clicks "Sign Up"]
  ↓
┌─────────────────────────────┐
│ Registration Form           │
│ • Name                      │
│ • Email                     │
│ • Password                  │
│ • Confirm Password          │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Client-side Validation      │
│ • All fields filled         │
│ • Valid email format        │
│ • Password >= 6 chars       │
│ • Passwords match           │
└─────────────┬───────────────┘
              ↓
          [Valid?]
          /      \
        NO       YES
         ↓        ↓
    [Show Error]  │
         ↓        │
    [Retry] ──────┘
              ↓
┌─────────────────────────────┐
│ POST /api/auth/register     │
│ Send: {name, email, pass}   │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Backend: Check Email Uniqueness         │
│ • Query MongoDB for existing email      │
└─────────────┬───────────────────────────┘
              ↓
          [Exists?]
          /      \
        YES       NO
         ↓        ↓
    [Return 400]  │
    "Already      │
    registered"   │
         ↓        │
         └────────┘
              ↓
┌─────────────────────────────┐
│ Hash Password (bcrypt)      │
│ • Salt rounds: 10           │
│ • Generate secure hash      │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Create User in MongoDB      │
│ • Save name, email, hash    │
│ • Set createdAt timestamp   │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Generate JWT Token          │
│ • Payload: {userId, email}  │
│ • Secret: JWT_SECRET        │
│ • Expiration: 7 days        │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Return Response             │
│ • token (JWT)               │
│ • user {id, name, email}    │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Client: Store in LocalStorage│
│ • localStorage.setItem      │
│   ('token', token)          │
│ • localStorage.setItem      │
│   ('user', JSON.stringify)  │
└─────────────┬───────────────┘
              ↓
[Redirect to /scanner]
  ↓
END


┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

START
  ↓
[User clicks "Login"]
  ↓
┌─────────────────────────────┐
│ Login Form                  │
│ • Email                     │
│ • Password                  │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Client-side Validation      │
│ • Both fields filled        │
│ • Valid email format        │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ POST /api/auth/login        │
│ Send: {email, password}     │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Backend: Find User by Email │
│ • Query MongoDB             │
└─────────────┬───────────────┘
              ↓
          [Found?]
          /      \
        NO        YES
         ↓         ↓
    [Return 401]   │
    "Invalid       │
    credentials"   │
         ↓         │
         └─────────┘
              ↓
┌─────────────────────────────┐
│ Compare Password            │
│ • bcrypt.compare(input,     │
│   hashedPassword)           │
└─────────────┬───────────────┘
              ↓
          [Match?]
          /      \
        NO       YES
         ↓        ↓
    [Return 401]  │
    "Invalid      │
    credentials"  │
         ↓        │
         └────────┘
              ↓
┌─────────────────────────────┐
│ Generate JWT Token          │
│ • Same as registration      │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Return Response             │
│ • token                     │
│ • user                      │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Client: Store in LocalStorage│
└─────────────┬───────────────┘
              ↓
[Redirect to /scanner]
  ↓
END


┌─────────────────────────────────────────────────────────────┐
│                 PROTECTED ROUTE ACCESS                       │
└─────────────────────────────────────────────────────────────┘

START
  ↓
[User navigates to protected route]
  ↓
┌─────────────────────────────┐
│ ProtectedRoute Component    │
│ • Check localStorage        │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ Token exists?               │
│ localStorage.getItem('token')│
└─────────────┬───────────────┘
              ↓
          [Exists?]
          /      \
        NO       YES
         ↓        ↓
    [Navigate to  │
     /login]      │
         ↓        │
       END        │
              ↓
┌─────────────────────────────┐
│ Render Protected Component  │
│ • Screenshot Analyzer       │
│ • Email Scanner             │
│ • QR Scanner                │
│ • History                   │
│ • Analytics                 │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────────────┐
│ Make API Request with Token         │
│ • Include token in Authorization    │
│   header: "Bearer <token>"          │
└─────────────┬───────────────────────┘
              ↓
          [Valid?]
          /      \
        NO       YES
         ↓        ↓
    [401 Error]   │
    Clear storage │
    Redirect /login│
         ↓        │
       END        │
              ↓
[Process Request]
  ↓
END
```

---

### 4. AI Chatbot Interaction Flow

```
START
  ↓
[User clicks AI Assistant button]
  ↓
┌─────────────────────────────┐
│ Open Chat Window            │
│ • Display welcome message   │
│ • Show suggested questions  │
└─────────────┬───────────────┘
              ↓
[User types question]
  ↓
┌─────────────────────────────┐
│ User Message Added          │
│ • Append to messages array  │
│ • Display in chat UI        │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│ POST /api/ai-assistant/chat │
│ Body:                       │
│ • message: user question    │
│ • conversationHistory (last │
│   6 messages for context)   │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Backend: AI Assistant Service           │
│                                         │
│ Check API Key:                          │
│ • MISTRAL_API_KEY exists?               │
└─────────────┬───────────────────────────┘
              ↓
          [Exists?]
          /      \
        NO       YES
         ↓        ↓
    ┌───────────────────────┐
    │ Fallback Response     │
    │ • Pattern matching    │
    │ • Keyword detection   │
    │ • Static responses    │
    └─────────┬─────────────┘
              │
              └──────────────┐
                            ↓
              ┌──────────────────────────────┐
              │ Mistral AI API Call          │
              │ • Model: mistral-small-latest│
              │ • System prompt (security)   │
              │ • Conversation history       │
              │ • User message               │
              │ • max_tokens: 500            │
              │ • temperature: 0.7           │
              └──────────┬───────────────────┘
                        ↓
              ┌──────────────────────────────┐
              │ Mistral Generates Response   │
              │ • Context-aware              │
              │ • Security-focused           │
              │ • Conversational tone        │
              └──────────┬───────────────────┘
                        ↓
┌─────────────────────────────────────────┐
│ Return AI Response                      │
│ • reply (text)                          │
│ • timestamp                             │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────┐
│ Client: Display Response    │
│ • Add to messages array     │
│ • Render in chat UI         │
│ • Scroll to bottom          │
└─────────────┬───────────────┘
              ↓
[User can ask follow-up questions]
  ↓
[Loop back to "User types question"]
  or
[Close chat]
  ↓
END
```

---

## Database Schema Design

### User Collection

```javascript
{
  _id: ObjectId("..."),
  name: String,              // "John Doe"
  email: String,             // "john@example.com" (unique, lowercase)
  password: String,          // bcrypt hash
  createdAt: Date,           // Auto-generated timestamp
  role: String,              // "user" | "admin" (future)
  subscription: {            // Future: premium features
    plan: String,            // "free" | "premium" | "enterprise"
    expiresAt: Date
  },
  settings: {
    notifications: Boolean,
    theme: String
  }
}
```

### Scan History Collection (Planned)

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId,          // Reference to User
  scanType: String,          // "url" | "qr" | "screenshot" | "email"
  input: String,             // URL or description
  result: {
    riskScore: Number,       // 0-100
    status: String,          // "safe" | "suspicious" | "dangerous"
    details: Object,         // Full scan results
    aiExplanation: String
  },
  timestamp: Date,           // When scan was performed
  ipAddress: String,         // User IP (privacy considerations)
  userAgent: String          // Browser/device info
}
```

### Analytics Collection (Planned)

```javascript
{
  _id: ObjectId("..."),
  date: Date,                // Aggregated by day
  totalScans: Number,
  scansByType: {
    url: Number,
    qr: Number,
    screenshot: Number,
    email: Number
  },
  threatDetected: Number,
  safeSites: Number,
  suspiciousSites: Number,
  topPhishingDomains: [String],
  averageRiskScore: Number
}
```

---

## API Endpoint Documentation

### Authentication Endpoints

```
POST /api/auth/register
Description: Register new user
Body: { name, email, password }
Response: { success, token, user: {id, name, email} }
Status: 201 Created | 400 Bad Request | 500 Error

POST /api/auth/login
Description: Login user
Body: { email, password }
Response: { success, token, user: {id, name, email} }
Status: 200 OK | 401 Unauthorized | 500 Error

GET /api/auth/me
Description: Get current user info
Headers: Authorization: Bearer <token>
Response: { success, user: {id, name, email} }
Status: 200 OK | 401 Unauthorized
```

### Scanning Endpoints

```
POST /api/scan
Description: Scan URL with 7-layer analysis
Body: { url }
Response: { 
  success, 
  risk_score, 
  status,
  details: {
    url_analysis,
    keyword_check,
    ssl_check,
    google_safe_browsing,
    virustotal,
    urlscan,
    ai_assessment
  },
  recommendations
}
Status: 200 OK | 400 Bad Request | 500 Error

POST /api/qr/scan
Description: Decode QR code and analyze URL
Body: FormData with 'image' field
Response: { success, decodedUrl, scanResults }
Status: 200 OK | 400 Bad Request | 500 Error

POST /api/screenshot/analyze
Description: AI-powered screenshot analysis
Body: FormData with 'screenshot' field (max 10MB)
Response: {
  success,
  extractedText,
  riskScore,
  detectedBrands,
  inputFields,
  suspiciousElements,
  reasoning
}
Status: 200 OK | 400 Bad Request | 500 Error

POST /api/email/analyze
Description: Analyze email for phishing
Body: { 
  subject, 
  sender, 
  body, 
  headers (optional) 
}
Response: {
  success,
  riskScore,
  extractedLinks,
  suspiciousKeywords,
  senderAnalysis,
  aiAnalysis,
  recommendations
}
Status: 200 OK | 400 Bad Request | 500 Error
```

### AI Assistant Endpoints

```
POST /api/ai-assistant/chat
Description: Chat with AI security assistant
Body: { 
  message, 
  conversationHistory: [{role, content}] 
}
Response: { 
  success, 
  reply, 
  timestamp 
}
Status: 200 OK | 400 Bad Request | 500 Error

GET /api/ai-assistant/test
Description: Health check
Response: { status, powered_by }
Status: 200 OK
```

---

## Security Considerations

### 1. Authentication Security
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Secure token storage (localStorage)
- 🔄 TODO: Refresh token mechanism
- 🔄 TODO: Password strength requirements
- 🔄 TODO: Account lockout after failed attempts

### 2. API Security
- ✅ CORS configuration (whitelist origins)
- ✅ Environment variable protection (.env)
- ✅ Input validation
- 🔄 TODO: Rate limiting (express-rate-limit)
- 🔄 TODO: API key rotation
- 🔄 TODO: Request size limits

### 3. Data Security
- ✅ MongoDB connection string in .env
- ✅ No sensitive data in responses
- ✅ Temporary file cleanup (screenshots)
- 🔄 TODO: Database encryption at rest
- 🔄 TODO: Audit logging
- 🔄 TODO: GDPR compliance features

### 4. Client-Side Security
- ✅ XSS protection (React escaping)
- ✅ HTTPS enforcement (production)
- ✅ Secure headers
- 🔄 TODO: Content Security Policy
- 🔄 TODO: Subresource Integrity

---

## Performance Optimization

### Current Optimizations
- ✅ Parallel API calls (Promise.all)
- ✅ Image compression before upload
- ✅ Lazy loading components
- ✅ Debounced input handlers

### Planned Optimizations
- 🔄 Redis caching for repeated URL scans
- 🔄 CDN for static assets
- 🔄 Database indexing (email, userId)
- 🔄 API response compression (gzip)
- 🔄 Code splitting (React.lazy)
- 🔄 Service worker for offline support

---

## Testing Strategy (Planned)

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, services, utilities
- **Target**: 80% code coverage

### Integration Testing
- **Framework**: Supertest (API testing)
- **Coverage**: API endpoints, database operations
- **Target**: All critical paths

### End-to-End Testing
- **Framework**: Cypress or Playwright
- **Coverage**: User flows, authentication, scanning
- **Target**: Main user journeys

### Security Testing
- **Tools**: OWASP ZAP, npm audit
- **Coverage**: Vulnerability scanning, dependency checks
- **Frequency**: Every release

---

## Deployment Pipeline (Planned)

```
┌─────────────────────────────────────────────────────────┐
│                   CI/CD PIPELINE                         │
└─────────────────────────────────────────────────────────┘

Developer Commits Code
        ↓
┌───────────────────────┐
│ GitHub Repository     │
│ (main branch)         │
└───────────┬───────────┘
            ↓
┌───────────────────────────────────────┐
│ GitHub Actions / CI Trigger           │
│ • Checkout code                       │
│ • Install dependencies (npm ci)       │
│ • Run linter (ESLint)                 │
│ • Run tests (Jest)                    │
│ • Build production (npm run build)    │
└───────────┬───────────────────────────┘
            ↓
        [Tests Pass?]
        /          \
      NO            YES
       ↓             ↓
  [Notify Team]      │
  [Stop Pipeline]    │
       ↓             │
     END             │
                    ↓
┌────────────────────────────────────┐
│ Build Docker Images (Optional)     │
│ • Frontend container               │
│ • Backend container                │
└───────────┬────────────────────────┘
            ↓
┌────────────────────────────────────┐
│ Deploy to Staging                  │
│ • Frontend → Vercel/Netlify        │
│ • Backend → AWS EC2/DigitalOcean   │
│ • Database → MongoDB Atlas         │
└───────────┬────────────────────────┘
            ↓
┌────────────────────────────────────┐
│ Run Smoke Tests                    │
│ • Health check endpoints           │
│ • Critical user flows              │
└───────────┬────────────────────────┘
            ↓
        [Success?]
        /          \
      NO            YES
       ↓             ↓
  [Rollback]         │
  [Alert Team]       │
       ↓             │
     END             │
                    ↓
┌────────────────────────────────────┐
│ Manual QA (Staging)                │
│ • Test all features                │
│ • Security checks                  │
└───────────┬────────────────────────┘
            ↓
        [Approved?]
        /          \
      NO            YES
       ↓             ↓
  [Fix Issues]       │
  [Redeploy]         │
       ↓             │
       └─────────────┘
                    ↓
┌────────────────────────────────────┐
│ Deploy to Production               │
│ • Blue-Green deployment            │
│ • Zero-downtime strategy           │
└───────────┬────────────────────────┘
            ↓
┌────────────────────────────────────┐
│ Post-Deployment                    │
│ • Monitor logs (CloudWatch)        │
│ • Track errors (Sentry)            │
│ • Performance metrics (New Relic)  │
└───────────┬────────────────────────┘
            ↓
          END
```

---

## Monitoring & Logging (Planned)

### Application Monitoring
- **Tool**: New Relic / DataDog
- **Metrics**: Response time, throughput, error rate
- **Alerts**: Slack/Email notifications

### Error Tracking
- **Tool**: Sentry
- **Coverage**: Frontend + Backend errors
- **Features**: Stack traces, user context, breadcrumbs

### Log Aggregation
- **Tool**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Logs**: API requests, authentication, scan results
- **Retention**: 30 days

### Uptime Monitoring
- **Tool**: UptimeRobot / Pingdom
- **Checks**: Every 5 minutes
- **Alerts**: Email/SMS on downtime

---

## Development Timeline

### Completed (Weeks 1-4)
✅ Project setup and architecture
✅ Core URL scanning (7 layers)
✅ QR code scanning
✅ Screenshot analysis with AI
✅ Email phishing scanner
✅ AI chatbot assistant
✅ Authentication system
✅ Professional UI/UX design

### In Progress (Weeks 5-6)
🔄 User dashboard
🔄 Scan history
🔄 Batch URL scanning
🔄 Email file upload

### Upcoming (Weeks 7-8)
📋 API rate limiting
📋 Performance optimization
📋 Unit testing
📋 Documentation completion

### Future (Weeks 9+)
📋 Production deployment
📋 Browser extension enhancement
📋 Mobile app (React Native)
📋 Team features
📋 API marketplace

---

## Conclusion

PhishGuard is built with modern, enterprise-grade technologies following industry best practices. The modular architecture allows for easy scaling and maintenance, while the comprehensive security layers ensure maximum protection against evolving cyber threats.

**Key Technical Achievements:**
- ✅ Multi-layered detection (7 independent systems)
- ✅ AI integration (GPT-4o Vision + Mistral AI)
- ✅ Real-time threat intelligence (3 major APIs)
- ✅ Scalable architecture (MERN stack)
- ✅ Secure authentication (JWT + bcrypt)
- ✅ Professional UI/UX (React + TailwindCSS)

This technical foundation positions PhishGuard as a cutting-edge cybersecurity platform ready for enterprise deployment and future enhancements.

---

*Technical Documentation v1.0 - Last Updated: November 1, 2025*
