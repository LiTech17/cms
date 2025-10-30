# 🚀 GEMINI.md - Project Specification

## 💡 Project Title & Overview

**CAPDIMW.org - Headless JSON CMS Website for NGOs**

This is a **Next.js 15 (App Router)** application serving as a **headless Content Management System (CMS)** for NGOs. All content is stored exclusively in **JSON files** within the `/data` directory. Content persistence is achieved by committing and syncing these JSON files directly to a **GitHub repository** using the GitHub REST API. **No traditional backend server or database is to be used.**



## 🛠️ Technology Stack & Dependencies

| Category | Technology | Purpose | Note |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js 15** | Primary application foundation. | Must use the **App Router**. |
| **Language** | **TypeScript** | Strict typing and code quality. | All new files must be `.tsx` or `.ts`. |
| **Styling** | **Tailwind CSS** | Utility-first CSS for rapid development. | |
| **UI Components** | **shadcn/ui** | Accessible, custom-styled components. | |
| **Icons** | **lucide-react** | Vector icon library. | |
| **Data/State** | **GitHub REST API v3** | Content persistence (JSON commits/pushes). | **Mandatory** for all write operations. |
| **Hashing** | **bcrypt** | Secure local password hashing. | |
| **UI Extras** | **Embla Carousel** | Modern, accessible image/content carousel. | Include **Autoplay plugin**. |
| **Analytics** | **Recharts** | Interactive data visualization. |



## 🎨 Design System & Rules

  * **Aesthetics:** Use a **modern, minimal UI** with accessible color contrast.
  * **Responsiveness:** All components must be **mobile-first** and fully responsive.
  * **Containers:** Use **`rounded-2xl` corners** and subtle **soft shadows** (e.g., `shadow-lg`) on cards and images.
  * **Spacing:** A minimum of `p-4` padding/margin must separate major sections.
  * **Typography:** Font sizes must **scale appropriately** based on breakpoints.
  * **Section Backgrounds:** Alternate section colors using `bg-muted/40` or `bg-background`.
  * **Layouts:** Prefer **`flex`**, **`grid`**, and **`aspect-video`** for content structuring.



## 🧠 Core Behavior Rules (Gemini Agent Constraints)

1.  **Code Format:** Always generate **TypeScript + JSX** (`.tsx`) files.
2.  **Architecture:** **NEVER introduce a backend, API, or database.** Content must only be managed via GitHub JSON commits.
3.  **Authentication Control:** Respect the user's authentication state (`isAuth`):
      * `isAuth = true`: Show **admin controls** (Edit buttons, Analytics, Account Settings links).
      * `isAuth = false`: Show **public view only**.
4.  **Content Management:**
      * **Read:** Read content from `/data/*.json`.
      * **Write/Save:** Any content edit must trigger an update to the relevant JSON file and **commit/push the change to GitHub** using `/lib/github.ts`.
5.  **Media Storage:** Images/media must be stored under `/public/uploads` and tracked in the `/data/media.json` file.



## 📂 Required Folder Structure

```
/app
  /page.tsx (Home Page)
  /about/page.tsx
  /programs/page.tsx
  /posts/page.tsx
  /donate/page.tsx
  /analytics/page.tsx
  /account-settings/page.tsx
/components
  public-header.tsx
  public-footer.tsx
  editor-controls.tsx
  carousel.tsx
/lib
  github.ts (Handles REST API for JSON commits)
  auth.ts (Handles bcrypt hashing and authentication logic)
  json.ts (Utility for reading/parsing local JSON data)
/data
  home.json
  about.json
  programs.json
  posts.json
  donate.json
  profile.json (Stores hashed password)
  media.json (Tracks /public/uploads file list)
/public
  /uploads (Location for committed media files)
```



## 🔐 Authentication & Security

  * **First Run:** Allow **open authorization** when `profile.json` is empty to grant initial admin access.
  * **Password Setup:** Password set in `Account Settings` must be **hashed with bcrypt** and stored in `/data/profile.json`.
  * **Login Validation:** Future logins must **validate the password against the bcrypt hash** before enabling edit mode.
  * **State Management:** The `isAuth` state (boolean) must be saved in **`localStorage`** to persist the admin session.



## 🧰 Edit Mode Guidelines

When `isAuth` is `true`, every editable content section must allow inline modification:

  * **Text/Copy:** Use **inline text fields** or `contenteditable`.
  * **Controls:** Display clearly visible **“Save Changes”** and **“Cancel”** buttons.
  * **Media:** Provide an **Image Picker** interface for media replacement.
  * **Commit Action:** On “Save Changes,” commit the JSON diff to GitHub via `/lib/github.ts`.

