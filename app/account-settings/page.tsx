// /app/account-settings/page.tsx

import { getProfileData } from '@/lib/auth';
import AccountSettingsClient from '@/components/account-settings-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings - CAPDIMW.org',
  description: 'Manage your admin account settings and password.',
};

export default async function AccountSettingsPage() {
  const profile = await getProfileData();

  return <AccountSettingsClient initialProfile={profile} />;
}

