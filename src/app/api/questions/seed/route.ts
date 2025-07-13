import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';

const sampleQuestions = [
  {
    content: '宇宙で開催されるオリンピックにありそうな新競技',
    category: '宇宙・スポーツ',
    difficulty: 'easy' as const
  },
  {
    content: '100年後のコンビニで売っていそうな商品',
    category: '未来・日常',
    difficulty: 'medium' as const
  },
  {
    content: 'もしも動物が人間の仕事をしたら、一番向いている組み合わせ',
    category: '動物・職業',
    difficulty: 'easy' as const
  },
  {
    content: '超能力者が困りそうな日常の悩み',
    category: '超能力・日常',
    difficulty: 'medium' as const
  },
  {
    content: 'ロボットが人間に質問されて困ること',
    category: 'ロボット・AI',
    difficulty: 'hard' as const
  },
  {
    content: '時間を止められる能力を悪用する方法',
    category: '超能力・悪用',
    difficulty: 'hard' as const
  },
  {
    content: '犬の散歩中に犬が考えていそうなこと',
    category: '動物・日常',
    difficulty: 'easy' as const
  },
  {
    content: '魔法学校の授業でありそうな困った出来事',
    category: '魔法・学校',
    difficulty: 'medium' as const
  },
  {
    content: '宇宙人が地球を観光する際のガイドブックに書かれていそうな注意事項',
    category: '宇宙人・観光',
    difficulty: 'hard' as const
  },
  {
    content: 'もしも雲に乗れたら、やってみたいこと',
    category: '空・冒険',
    difficulty: 'easy' as const
  }
];

export async function POST() {
  try {
    // 既存の質問数をチェック
    const existingQuestions = await db.select().from(questions);
    
    if (existingQuestions.length > 0) {
      return NextResponse.json({ 
        message: 'Questions already exist', 
        count: existingQuestions.length 
      });
    }

    // サンプル質問を挿入
    const insertedQuestions = await db.insert(questions)
      .values(sampleQuestions.map(q => ({
        ...q,
        createdAt: new Date()
      })))
      .returning();

    return NextResponse.json({ 
      message: 'Sample questions created successfully',
      count: insertedQuestions.length,
      questions: insertedQuestions
    });

  } catch (error) {
    console.error('Question seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}