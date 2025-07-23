/**
 * ⚠️ 警告: このスクリプトは開発環境専用です！
 * 
 * このスクリプトは既存の質問データを全て削除してから新しいデータを挿入します。
 * 本番環境では絶対に使用しないでください。
 * 
 * 本番環境では `npm run db:seed:production` を使用してください。
 */

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
    console.log('🌱 Seeding database (DEVELOPMENT MODE)...');
    
    // 環境確認
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ エラー: 本番環境でこのスクリプトを実行することはできません！');
      console.error('本番環境では npm run db:seed:production を使用してください。');
      process.exit(1);
    }

    // 既存のお題をクリア（開発環境のみ）
    console.log('⚠️  警告: 既存の質問データを全て削除します...');
    await db.delete(questions);

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
if (process.argv[1] === __filename) {
  seed();
}

export { seed };