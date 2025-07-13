import { NextResponse } from 'next/server';
import { seedQuestions, seedExtraQuestions } from '@/lib/seed-questions';

export async function POST() {
  // 開発環境でのみ許可
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Seeding only allowed in development' }, { status: 403 });
  }

  try {
    const basicQuestions = await seedQuestions();
    const extraQuestions = await seedExtraQuestions();
    
    return NextResponse.json({ 
      success: true,
      seeded: {
        basicQuestions: basicQuestions.length,
        extraQuestions: extraQuestions.length,
        total: basicQuestions.length + extraQuestions.length
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}