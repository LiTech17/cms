// /app/api/auth/change-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getProfileData, comparePassword, hashPassword } from '@/lib/auth';
import { updateJSON } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Both current and new passwords are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const profile = await getProfileData();

    if (!profile || !profile.setupComplete) {
      return NextResponse.json(
        { message: 'Profile not found or not set up' },
        { status: 404 }
      );
    }

    // Verify current password
    if (!comparePassword(currentPassword, profile.admin.hashedPassword)) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    const hashedPassword = hashPassword(newPassword);
    const updatedProfile = {
      ...profile,
      admin: {
        ...profile.admin,
        hashedPassword,
      },
    };

    await updateJSON('data/profile.json', updatedProfile, 'Changed admin password.');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to change password' },
      { status: 500 }
    );
  }
}

