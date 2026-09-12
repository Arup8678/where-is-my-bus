import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const item = await prisma.feedback.create({
      data: {
        name: name || null,
        email: email || null,
        phone: phone || null,
        message: message.trim()
      }
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Feedback API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: feedback });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
