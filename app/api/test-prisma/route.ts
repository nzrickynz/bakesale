import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'alice@prisma.io',
        },
      },
      cacheStrategy: {
        ttl: 60, // seconds
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error('Prisma test error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
