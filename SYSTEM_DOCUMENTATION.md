# 📚 System Documentation
**CAPDIMW.org - Headless JSON CMS**

## Technical Architecture & Implementation Guide

---

## 🏗️ System Architecture

### **High-Level Overview**

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 App                        │
│                  (App Router + SSR)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   Browser    │───▶│  Middleware  │───▶│  Routes   │ │
│  │  (Client)    │    │  (Tracking)  │    │  (Pages)  │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                    │                  │       │
│         │                    │                  ▼       │
│         │                    │         ┌──────────────┐ │
│         │                    │         │ API Routes   │ │
│         │                    │         │ /api/*       │ │
│         │                    │         └──────────────┘ │
│         │                    │                  │       │
│         │                    └───────────────────┼───────┤
│         │                                        │       │
│         ▼                                        ▼       │
│  ┌──────────────┐                        ┌──────────────┐│
│  │  Components  │                        │    lib/      ││
│  │  (React)     │                        │  - github.ts ││
│  │              │                        │  - auth.ts   ││
│  └──────────────┘                        │  - types.ts   ││
│         │                                └──────────────┘│
│         │                                        │       │
│         └────────────────────────────────────────┼───────┤
│                                                  ▼       │
│                                          ┌──────────────┐│
│                                          │ GitHub REST  ││
│                                          │     API      ││
│                                          └──────────────┘│
│                                                  │       │
│                                                  ▼       │
│                                          ┌──────────────┐│
│                                          │ GitHub Repo  ││
│                                          │  (JSON Data) ││
│                                          └──────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
AI-APPS/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (header, footer, providers)
│   ├── page.tsx                  # Home page (Server Component)
│   ├── about/
│   │   └── page.tsx             # About page
│   ├── programs/
│   │   ├── page.tsx             # Programs listing
│   │   └── [programId]/
│   │       └── page.tsx         # Program detail (dynamic)
│   ├── posts/
│   │   ├── page.tsx             # Posts listing
│   │   └── [slug]/
│   │       └── page.tsx         # Post detail (dynamic)
│   ├── donate/
│   │   └── page.tsx             # Donation page
│   ├── analytics/
│   │   └── page.tsx             # Analytics dashboard
│   ├── account-settings/
│   │   └── page.tsx             # Admin settings
│   └── api/                      # API Routes (Server Actions)
│       ├── auth/
│       │   ├── setup/           # Initial admin setup
│       │   ├── login/           # Login endpoint
│       │   └── change-password/ # Password change
│       ├── json/[filename]/      # JSON file retrieval
│       ├── upload-image/         # Image upload handler
│       └── analytics/track/      # Visit tracking
│
├── components/                    # React Components
│   ├── auth-provider.tsx         # Auth context provider
│   ├── editor-controls.tsx       # Edit mode wrapper
│   ├── image-picker-modal.tsx    # Image selection UI
│   ├── editable-carousel.tsx     # Editable image gallery
│   ├── editable-image.tsx        # Editable image component
│   ├── carousel.tsx              # Image carousel (Embla)
│   ├── toaster.tsx               # Toast notifications
│   ├── public-header.tsx         # Site header
│   ├── public-footer.tsx         # Site footer
│   └── *-page-client.tsx         # Page client components
│
├── lib/                          # Core Utilities
│   ├── github.ts                 # GitHub API integration
│   ├── auth.ts                   # Authentication logic
│   ├── types.ts                  # TypeScript definitions
│   ├── json-server.ts            # Server-side JSON reading
│   └── json-client.ts            # Client-side JSON fetching
│
├── data/                         # Content Storage (JSON)
│   ├── home.json                 # Home page content
│   ├── about.json                # About page content
│   ├── programs.json             # Programs data
│   ├── posts.json                # Posts listing
│   ├── donate.json               # Donation page content
│   ├── profile.json              # Admin profile (hashed password)
│   ├── media.json                # Image metadata
│   └── analytics.json            # Analytics data
│
├── public/                       # Static Assets
│   └── uploads/                  # User-uploaded images
│
├── middleware.ts                 # Request interceptor (analytics)
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS config
└── package.json                  # Dependencies
```

---

## 🔄 Data Flow Architecture

### **1. Content Reading Flow**

```
User Request
    │
    ▼
Server Component (page.tsx)
    │
    ▼
fetchJsonServer() / getJSON()
    │
    ├─▶ Local File System (development)
    │       └─▶ /data/*.json
    │
    └─▶ GitHub API (production/preview)
            └─▶ GET /repos/{owner}/{repo}/contents/data/*.json
                    └─▶ Parse JSON
                            └─▶ Pass to Client Component
                                    └─▶ Render UI
```

### **2. Content Writing Flow**

```
User Action (Edit Content)
    │
    ▼
Client Component State Update
    │
    ▼
User Clicks "Save"
    │
    ▼
commitJsonChange() / updateJSON()
    │
    ▼
GitHub API
    │
    ├─▶ GET file (to obtain SHA)
    │
    ├─▶ Base64 encode new content
    │
    └─▶ PUT /repos/{owner}/{repo}/contents/{path}
            └─▶ Commit created
                    └─▶ Toast notification
                            └─▶ UI updates
```

### **3. Authentication Flow**

```
User Access
    │
    ▼
AuthProvider (checks localStorage)
    │
    ├─▶ isAuth = false
    │       └─▶ Public view only
    │
    └─▶ isAuth = true
            └─▶ Show edit controls
                    │
                    ▼
            User edits content
                    │
                    ▼
            Server Action / API Route
                    │
                    ├─▶ Verify password (if needed)
                    │
                    └─▶ Update GitHub
```

### **4. Image Upload Flow**

```
User Selects Image
    │
    ▼
Image Picker Modal
    │
    ├─▶ Gallery Tab: Browse existing
    │
    └─▶ Upload Tab: Select new file
            │
            ▼
        Validate (type, size)
            │
            ▼
        Convert to Base64
            │
            ▼
        POST /api/upload-image
            │
            ├─▶ uploadBinaryFile() → GitHub
            │
            └─▶ updateJSON(media.json) → GitHub
                    │
                    └─▶ Return public path
                            │
                            └─▶ Update component state
```

### **5. Analytics Tracking Flow**

```
Page Visit
    │
    ▼
Middleware (middleware.ts)
    │
    ├─▶ Skip: API, static files, uploads
    │
    └─▶ Track: Page routes
            │
            ▼
        Async fetch('/api/analytics/track')
            │
            ▼
        Update analytics.json
            │
            ├─▶ Increment totalVisits
            │
            ├─▶ Update pageVisits[pathname]
            │
            ├─▶ Add to visitsByDate
            │
            └─▶ Recalculate topPages
                    │
                    └─▶ Commit to GitHub
```

---

## 🧩 Core Components Deep Dive

### **1. EditorControls Component**

**Purpose:** Wraps content sections to enable inline editing

**Location:** `components/editor-controls.tsx`

**Props:**
```typescript
interface EditorControlsProps {
  sectionId: string;           // Unique identifier for section
  children: ReactNode;          // Content to wrap
  isEditing: boolean;         // Current edit state
  onStartEdit: () => void;     // Start editing callback
  onSave: () => Promise<void>; // Save callback
  onCancel: () => void;        // Cancel callback
}
```

**Behavior:**
- Only visible when `isAuth === true`
- Shows "Edit" button when not editing
- Shows "Save" and "Cancel" buttons when editing
- Handles loading states during save
- Shows toast notifications for success/error

**Usage Pattern:**
```tsx
<EditorControls
  sectionId="hero"
  isEditing={isEditing.hero}
  onStartEdit={() => startEdit('hero')}
  onCancel={() => cancelEdit('hero')}
  onSave={() => saveContent('hero')}
>
  {/* Editable content */}
</EditorControls>
```

---

### **2. AuthProvider Component**

**Purpose:** Global authentication state management

**Location:** `components/auth-provider.tsx`

**State:**
- `isAuth`: Boolean indicating if user is authenticated
- `isLoading`: Boolean for initial load state
- `login()`: Function to set authenticated state
- `logout()`: Function to clear authenticated state

**Storage:** `localStorage` with key `capdimw_admin_auth`

**Flow:**
1. Component mounts
2. Reads from localStorage
3. Sets `isAuth` state
4. Provides context to children
5. Children use `useAuth()` hook to access state

**Security Note:** This is client-side only. Server-side routes should verify authentication separately.

---

### **3. GitHub Integration Library**

**Purpose:** Interface with GitHub REST API for content persistence

**Location:** `lib/github.ts`

**Key Functions:**

#### `getJSON(path: string)`
- Fetches JSON file from GitHub
- Returns `{ content: any, sha?: string } | null`
- Uses `cache: 'no-store'` for fresh data
- Handles 404 (returns null) and errors gracefully

#### `updateJSON(path, data, commitMessage)`
- Gets current file SHA
- Converts data to Base64
- Commits to GitHub using PUT request
- Updates or creates file based on SHA presence

#### `uploadBinaryFile(filePath, base64Content, commitMessage)`
- Similar to `updateJSON` but for binary files
- Used for image uploads
- Validates SHA before upload

**Error Handling:**
- Graceful fallbacks when GitHub not configured
- Detailed error messages
- Logging for debugging

---

### **4. Authentication Library**

**Purpose:** Password management and profile handling

**Location:** `lib/auth.ts`

**Key Functions:**

#### `hashPassword(password: string)`
- Uses bcrypt with 10 salt rounds
- Synchronous hashing
- Returns hashed string

#### `comparePassword(password, hash)`
- Verifies password against hash
- Uses bcrypt comparison
- Returns boolean

#### `getProfileData()`
- Fetches profile from GitHub
- Returns default structure if missing
- Handles first-run scenario

#### `setupAdminProfile(newAdminData)`
- Hashes password
- Creates profile structure
- Commits to GitHub

**Security:**
- Passwords never stored in plaintext
- Only hashes stored in GitHub
- Server-side only operations

---

## 🔌 API Routes

### **1. `/api/auth/setup`**

**Method:** POST  
**Purpose:** Initial admin account setup

**Request Body:**
```json
{
  "fullName": "string",
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "profile": ProfileData
}
```

**Validation:**
- All fields required
- Password minimum 6 characters
- Email format validation

---

### **2. `/api/auth/change-password`**

**Method:** POST  
**Purpose:** Change admin password

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

**Security:**
- Verifies current password
- Hashes new password
- Updates profile in GitHub

---

### **3. `/api/auth/login`**

**Method:** POST  
**Purpose:** Authenticate admin user

**Request Body:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

**Flow:**
1. Fetch profile from GitHub
2. Compare password with hash
3. Return success/failure
4. Client sets localStorage on success

---

### **4. `/api/upload-image`**

**Method:** POST  
**Purpose:** Upload image to GitHub

**Request:** FormData
- `file`: File object
- `altText`: string (optional)

**Response:**
```json
{
  "success": true,
  "filename": "/uploads/image.jpg",
  "mediaItem": MediaItem
}
```

**Validation:**
- File type: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Validates MIME type

**Process:**
1. Validate file
2. Convert to Base64
3. Upload to GitHub (`public/uploads/`)
4. Update `media.json`
5. Return public path

---

### **5. `/api/analytics/track`**

**Method:** POST  
**Purpose:** Record page visit

**Request Body:**
```json
{
  "pathname": "/about"
}
```

**Response:**
```json
{
  "success": true
}
```

**Updates:**
- `totalVisits++`
- `pageVisits[pathname]++`
- Adds to `visitsByDate`
- Recalculates `topPages`

**Called By:** Middleware on every page visit

---

### **6. `/api/json/[filename]`**

**Method:** GET  
**Purpose:** Fetch JSON file from local filesystem

**Response:** JSON content of file

**Use Case:** Client-side JSON fetching when GitHub unavailable

---

## 🎨 Component Architecture Patterns

### **Server Component Pattern**

```typescript
// app/page.tsx
export default async function HomePage() {
  const data = await fetchJsonServer<HomeData>('home.json');
  return <HomePageClient initialData={data} />;
}
```

**Benefits:**
- Data fetching on server
- SEO-friendly
- No client-side data fetching delay

---

### **Client Component Pattern**

```typescript
// components/home-page-client.tsx
'use client';

const HomePageClient = ({ initialData }) => {
  const [content, setContent] = useState(initialData);
  // ... editing logic
  return <div>{/* UI */}</div>;
};
```

**Responsibilities:**
- Interactivity
- State management
- User interactions
- API calls for updates

---

### **Edit Mode Pattern**

```typescript
// Pattern used across all pages
const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

const startEdit = (sectionId: string) => {
  setOriginalContent(content);
  setIsEditing(prev => ({ ...prev, [sectionId]: true }));
};

const cancelEdit = (sectionId: string) => {
  setContent(originalContent);
  setIsEditing(prev => ({ ...prev, [sectionId]: false }));
};

const saveContent = async (sectionId: string) => {
  await commitJsonChange('file.json', content, `Update ${sectionId}`);
  setIsEditing(prev => ({ ...prev, [sectionId]: false }));
};
```

**Features:**
- Section-level editing
- Cancel restores original
- Save commits to GitHub
- Toast notifications

---

## 🔐 Security Implementation

### **Authentication Security**

1. **Password Hashing**
   - Algorithm: bcrypt
   - Salt rounds: 10
   - Never stored in plaintext

2. **Token Management**
   - GitHub tokens server-side only
   - Never exposed to client
   - Environment variables

3. **Session Management**
   - localStorage for client state
   - No sensitive data in storage
   - Server validates on critical operations

### **Input Validation**

1. **File Uploads**
   - MIME type checking
   - File size limits
   - Extension validation

2. **Form Inputs**
   - Required field validation
   - Type checking
   - Length constraints

3. **API Routes**
   - Request validation
   - Error sanitization
   - Rate limiting (recommended)

---

## 📊 Data Models

### **HomeData**
```typescript
{
  header: { logo, navigation },
  hero: { image, heading, text, gallery },
  gridSections: Array<{ id, title, text, ... }>,
  posts: Array<{ id, title, image, text }>,
  footer: { column1, column2, column3 }
}
```

### **ProfileData**
```typescript
{
  setupComplete: boolean,
  admin: {
    fullName: string,
    username: string,
    email: string,
    hashedPassword: string
  }
}
```

### **MediaData**
```typescript
{
  uploads: Array<{
    filename: string,
    alt: string,
    uploadedAt: string
  }>
}
```

### **AnalyticsData**
```typescript
{
  totalVisits: number,
  pageVisits: Record<string, number>,
  visitsByDate: Array<{ date: string, visits: number }>,
  topPages: Array<{ path: string, visits: number }>
}
```

---

## 🚀 Deployment Considerations

### **Environment Variables**

Required:
```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_REPO=username/repo-name
GITHUB_BRANCH=main
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### **Build Process**

```bash
npm run build    # Creates optimized production build
npm start        # Runs production server
```

### **Static Generation**

- Program detail pages: Pre-rendered via `generateStaticParams`
- Post detail pages: Pre-rendered via `generateStaticParams`
- Home/About/Donate: Server-rendered with fresh data

### **GitHub Repository Setup**

1. Create repository
2. Initialize with JSON files in `/data`
3. Set up GitHub Personal Access Token
4. Grant `repo` scope
5. Configure environment variables

---

## 🔧 Development Workflow

### **Local Development**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000
```

### **Content Editing**

1. Log in via `/account-settings`
2. Navigate to any page
3. Click "Edit" on sections
4. Modify content
5. Click "Save Changes"
6. Changes commit to GitHub

### **Testing GitHub Integration**

```bash
# Test GitHub API (if script exists)
npm run test-github
```

---

## 🐛 Troubleshooting

### **Common Issues**

1. **"GitHub commits disabled"**
   - Check environment variables
   - Verify GITHUB_TOKEN and GITHUB_REPO

2. **"Failed to load data"**
   - Check JSON file exists in `/data`
   - Verify JSON syntax
   - Check GitHub repository access

3. **"Image upload fails"**
   - Check file size (< 5MB)
   - Verify file type (JPEG, PNG, GIF, WebP)
   - Check GitHub token permissions

4. **"Authentication not working"**
   - Clear localStorage
   - Verify profile.json exists
   - Check password hash format

---

## 📈 Performance Optimizations

1. **Image Optimization**
   - Next.js Image component
   - Automatic lazy loading
   - Responsive images

2. **Code Splitting**
   - Automatic with App Router
   - Route-based splitting
   - Component-level splitting

3. **Caching**
   - Static generation where possible
   - GitHub API caching strategies
   - Browser caching headers

4. **Bundle Size**
   - Tree shaking enabled
   - Minimal dependencies
   - Optimized imports

---

## 🔮 Future Enhancements

### **Recommended Additions**

1. **Testing Suite**
   - Unit tests (Jest/Vitest)
   - Integration tests
   - E2E tests (Playwright)

2. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics dashboards

3. **Features**
   - Draft/publish workflow
   - Content versioning
   - Multi-user support
   - Content scheduling

4. **Infrastructure**
   - CI/CD pipeline
   - Automated backups
   - Staging environment

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Maintained By:** Development Team

