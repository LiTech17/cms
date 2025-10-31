// /app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getProfileData, comparePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    const profile = await getProfileData();

    if (!profile || !profile.setupComplete) {
      return NextResponse.json(
        { message: 'Profile not found or not set up. Please complete initial setup.' },
        { status: 404 }
      );
    }

    // Verify password
    if (!comparePassword(password, profile.admin.hashedPassword)) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to login' },
      { status: 500 }
    );
  }
}

