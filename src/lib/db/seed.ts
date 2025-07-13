import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { questions } from './schema';
import { sampleQuestions } from '../sample-questions';
import { extraQuestions } from '../seed-questions';

// 環境変数をロード
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // 既存のお題をクリア（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('Clearing existing questions...');
      await db.delete(questions);
    }

    // サンプルお題を挿入
    console.log('Inserting sample questions...');
    const sampleData = sampleQuestions.map(q => ({
      content: q.content,
      category: q.category,
      difficulty: q.difficulty
    }));

    const extraData = extraQuestions.map(q => ({
      content: q.content,
      category: q.category,
      difficulty: q.difficulty
    }));

    const allData = [...sampleData, ...extraData];
    const result = await db.insert(questions).values(allData).returning();

    console.log(`✅ Successfully seeded ${result.length} questions`);
    console.log('🎉 Database seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// スクリプトとして実行された場合のみシード実行
if (require.main === module) {
  seed();
}

export { seed };