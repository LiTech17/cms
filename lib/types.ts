// /lib/types.ts

// --- Generic Types ---
export interface NavItem {
  label: string;
  href: string;
}

// --- HOME.JSON Types ---
export interface HomeData {
  header: {
    logo: string;
    navigation: NavItem[];
  };
  hero: {
    image: string;
    heading: string;
    text: string;
    gallery: string[];
  };
  gridSections: Array<{
    id: string;
    title: string;
    vision?: string;
    mission?: string;
    text?: string;
    items?: string[];
  }>;
  posts: Array<{
    id: string;
    title: string;
    image: string;
    text?: string;
    objectives?: string[];
  }>;
  footer: {
    column1: {
      logo: string;
      title: string;
      text: string;
    };
    column2: {
      address: string;
      contactForm: boolean;
      phone: string;
      email: string;
    };
    column3: {
      socials: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
      };
      copyright: string;
    };
  };
}

// --- PROFILE.JSON Type (from /lib/auth.ts) ---
export interface ProfileData {
  setupComplete: boolean;
  admin: {
    fullName: string;
    username: string;
    email: string;
    hashedPassword: string; // bcrypt hash
  };
}

// --- MEDIA.JSON Type ---
export interface MediaItem {
  filename: string;
  alt: string;
  uploadedAt: string;
}

export interface MediaData {
  uploads: MediaItem[];
}