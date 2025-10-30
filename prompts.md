Create a Next.js 15 project named `capdimw-cms` configured with:
- TypeScript
- Tailwind CSS
- shadcn/ui components
- lucide-react icons
- Embla Carousel with Autoplay plugin
- A `/data` directory for all site content (home.json, about.json, etc.)
- A `/lib` directory for helper utilities
- Pages:
  - `/` (Home)
  - `/about`
  - `/programs`
  - `/posts`
  - `/donate`
- App Router with shared layout including `<PublicHeader/>` and `<PublicFooter/>`
- Environment-ready configuration for GitHub JSON persistence
- Include placeholder JSON files for each page in `/data`
Output the full project structure and configuration files (package.json, tailwind.config.ts, etc.)





Create a global layout (`app/layout.tsx`) that includes:
- `<PublicHeader />` and `<PublicFooter />`
- Responsive navigation menu with routes:
  Home, About, Programs, Posts, Donate
- When `isAuth = true`, show extra items:
  Account Settings, Site Analytics
- Add a light/dark theme toggle using next-themes
- Style with Tailwind + shadcn/ui
- Footer with 3 columns:
  1️⃣ Logo, CAPDIMW.org tagline
  2️⃣ Address, contact info, contact form
  3️⃣ Social links (Facebook, Twitter, LinkedIn)
Ensure all components follow the design rules from GEMINI.md



Create `app/page.tsx` that dynamically loads data from `/data/home.json`.  
Sections should include:

1. **Hero Section**
   - Hero image with overlay heading and text
   - Heading: “Welcome to CAPDIMW.org”
   - Text: “Creating a free socially excluded living environment to advance sustainable citizen rights.”
   - Background image sourced from JSON

2. **Gallery Carousel**
   - Carousel of images from JSON gallery array
   - Use Embla Carousel with autoplay plugin

3. **Grid Card Section**
   - Organizational Goals, Vision, Mission, Geographical Location, Economic Empowerment
   - Use responsive 2-column grid layout with shadcn/ui Cards

4. **Posts Section**
   - Two side-by-side content blocks:
     - Economic Empowerment Programme Description
     - Key Objectives
   - Each with image + text from JSON

5. **Footer**
   - Reuse global footer component

Ensure all text, headings, and image references are fetched from `/data/home.json`.
Use skeleton loaders for suspense boundaries.



Implement an Edit Mode system for authenticated users.

- When `isAuth = true`, all text and image sections become editable.
- Add small floating “Edit” buttons beside editable fields.
- Use `contenteditable` for text editing and a simple modal for images.
- Add a Save/Cancel bar at the top of the screen.
- On save, use `/lib/github.ts` with:
  - `getJSON(path: string)`
  - `updateJSON(path: string, data: any, commitMessage: string)`
  - Use GitHub REST API v3 with a personal access token stored in env.
- Commit updated JSON files directly to GitHub.
- Show a toast or banner confirming save success.


Implement a simple JSON-based authentication system:

- First-time access:
  - No password required → grant admin mode.
  - Prompt user to create password.
  - Hash password with bcrypt and save to `/data/profile.json`.
- Subsequent access:
  - Require password entry.
  - Verify bcrypt hash from profile.json.
- On successful login:
  - Store `isAuth = true` in localStorage.
  - Show edit controls, analytics, and account settings.
- Add `/account-settings/page.tsx` for updating password and viewing profile.



Create an image manager system integrated with Edit Mode:

- Images are stored under `/public/uploads`
- Metadata is stored in `/data/media.json`
- When an admin replaces an image:
  - Convert to Base64
  - Push to GitHub via API
  - Update `media.json` with new file name and alt text
- Include a gallery modal to choose existing media
- Validate file type and size before upload



Create `/analytics/page.tsx` that displays simple site analytics:
- Read data from `/data/analytics.json`
- Track total page visits (incremented on page load)
- Show:
  - Total visits
  - Top 3 visited pages
  - Basic line chart using Recharts
- Only accessible when `isAuth = true`
- Add a “Reset Data” button (commits cleared analytics.json)


Prepare the environment and deployment configuration:

- Add `.env.local.example` with:
  ```
  NEXT_PUBLIC_GITHUB_TOKEN=
  NEXT_PUBLIC_GITHUB_REPO=
  NEXT_PUBLIC_GITHUB_OWNER=
  ```
- Add a build script for 20i Node environment.
- Ensure environment variables are loaded securely.
- Include a GitHub Actions workflow that deploys to 20i or Vercel when `main` branch is updated.
- Test all pages in production build.



- Ensure mobile responsiveness throughout.
- Add subtle Framer Motion transitions for hero and gallery.
- Apply consistent typography and spacing.
- Use meaningful meta tags and Open Graph data from JSON.
- Finalize color palette for both light and dark themes.
- Add a favicon and metadata via Next.js metadata API.


