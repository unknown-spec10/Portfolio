export interface ProjectInfo {
  name: string;
  description: string;
  narrative: string;
  tags: string[];
  role: string;
}

export interface Project extends ProjectInfo {
  id: string;
  userId: string;
  username: string;
  url: string;
  status: "draft" | "public";
  isAiLoading?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  authProvider?: "google" | "github";
  photoURL?: string;
  tagline?: string;
  philosophy?: string;
  githubUrl?: string;
  githubUsername?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeStoragePath?: string;
  resumeUploadedAt?: any;
  skills: string[];
  socials: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string;
}
