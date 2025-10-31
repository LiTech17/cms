// /app/api/auth/setup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { setupAdminProfile } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, username, email, password } = body;

    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const profile = await setupAdminProfile({
      fullName,
      username,
      email,
      password,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to setup profile' },
      { status: 500 }
    );
  }
}

