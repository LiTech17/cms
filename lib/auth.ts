// /lib/auth.ts

import * as bcrypt from 'bcryptjs';
import { getJSON, updateJSON } from './github';

// --- CONFIGURATION ---
const PROFILE_FILE = 'data/profile.json';
const SALT_ROUNDS = 10;
// ---------------------

/**
 * Defines the structure for the profile.json file.
 */
export interface ProfileData {
  setupComplete: boolean;
  admin: {
    fullName: string;
    username: string;
    email: string;
    hashedPassword: string; // bcrypt hash
  };
}

/**
 * Reads the current profile data (hashed password, setup status) from GitHub.
 */
export async function getProfileData(): Promise<ProfileData | null> {
  const result = await getJSON(PROFILE_FILE);
  if (!result || typeof result.content !== 'object') {
    // Return a default structure if the file is missing or invalid (First Run)
    return {
      setupComplete: false,
      admin: { fullName: '', username: '', email: '', hashedPassword: '' },
    };
  }
  return result.content as ProfileData;
}

/**
 * Hashes a plaintext password using bcrypt.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Handles the initial setup (First Run) or updating the admin profile.
 * Saves the new profile data (with hashed password) to GitHub.
 * @param newAdminData The new data for the admin profile.
 * @returns The updated profile data.
 */
export async function setupAdminProfile(newAdminData: Omit<ProfileData['admin'], 'hashedPassword'> & { password: string }): Promise<ProfileData> {
  const hashedPassword = hashPassword(newAdminData.password);

  const updatedProfile: ProfileData = {
    setupComplete: true,
    admin: {
      fullName: newAdminData.fullName,
      username: newAdminData.username,
      email: newAdminData.email,
      hashedPassword: hashedPassword,
    },
  };

  await updateJSON(PROFILE_FILE, updatedProfile, 'Setup admin profile and password.');
  return updatedProfile;
}