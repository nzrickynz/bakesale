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
        ttl: 60,
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Prisma test error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
