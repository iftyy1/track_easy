import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/server/db/schema/auth-users';
import { randomBytes, scryptSync } from 'crypto';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name as string | undefined;
    const email = body.email as string | undefined;
    const password = body.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // check existing user
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    const stored = `${salt}$${derived}`;

    const [newUser] = await db.insert(users).values({ name: name || null, email, password: stored }).returning();

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
