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


// --- Programs Page Data ---
export interface Program {
  id: string;
  title: string;
  shortDescription: string;
  image: string;
  details: {
    heading: string;
    text: string;
    objectives: Array<string>;
    focusAreas: Array<string>;
  };
}

export interface ProgramData {
  hero: {
    heading: string;
    text: string;
  };
  programs: Array<Program>;
}


// --- ABOUT.JSON Types (New) ---

/** Defines the structure for a single member of the Leadership Team. */
export interface TeamMember {
  name: string;
  role: string;
  photo: string; // Path to the image file
}

/** Defines the structure for a single Project/Impact highlight. */
export interface ProjectHighlight {
  name: string;
  impact: string; // Description of the project's impact
}

/** Defines the structure for the Program Highlights section. */
export interface ProgramHighlights {
  title: string;
  description: string;
  areas: string[]; // List of focus areas/programmatic areas
  projects: ProjectHighlight[];
}

/** Defines the structure for the Team section. */
export interface TeamSection {
  title: string;
  members: TeamMember[];
}

/** Defines the structure for the History section. */
export interface HistorySection {
  title: string;
  text: string;
  location: string;
}

/** Defines the structure for the Vision and Mission section. */
export interface VisionAndMission {
  vision: string;
  mission: string;
}

/** Defines the overall structure of the /data/about.json file. */
export interface AboutData {
  hero: {
    image: string;
    heading: string;
    text: string;
  };
  history: HistorySection;
  visionAndMission: VisionAndMission;
  programHighlights: ProgramHighlights;
  team: TeamSection;
}

// --- DONATE.JSON Types ---
export interface DonationOption {
  amount: number;
  description: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface DonateData {
  title: string;
  mainText: string;
  donationOptions: DonationOption[];
  bankDetails: BankDetails;
}

// --- POSTS.JSON Types ---
export interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  contentPath: string;
  content?: string; // Full content (if stored directly in JSON instead of markdown)
}

export interface PostsData {
  title: string;
  posts: Post[];
}