import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { questions } from './schema';
import { productionQuestions } from '../production-questions';
import {
  getQuestionCount,
  checkDuplicateQuestions,
  validateQuestionData,
  log,
  showProgress
} from './seed-utils';

// 環境変数をロード
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedProduction() {
  try {
    log('🌱 本番環境用データベースシード処理を開始します...');
    
    // 環境チェック
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL が設定されていません');
    }
    
    // 現在の質問数を確認
    const currentCount = await getQuestionCount();
    log(`現在の質問数: ${currentCount}件`);
    
    if (currentCount > 0) {
      log('既に質問データが存在します。追加の質問のみを挿入します。', 'warn');
    }
    
    // 質問データのバリデーション
    log('質問データを検証中...');
    const validation = validateQuestionData(productionQuestions);
    
    if (!validation.valid) {
      log('質問データにエラーがあります:', 'error');
      validation.errors.forEach(error => log(error, 'error'));
      throw new Error('質問データの検証に失敗しました');
    }
    
    // 重複チェック
    log('重複する質問をチェック中...');
    const contents = productionQuestions.map(q => q.content);
    const duplicates = await checkDuplicateQuestions(contents);
    
    if (duplicates.length > 0) {
      log(`${duplicates.length}件の重複する質問が見つかりました`, 'warn');
      duplicates.forEach(content => log(`  - ${content}`, 'warn'));
    }
    
    // 重複を除外した質問データを準備
    const uniqueQuestions = productionQuestions.filter(
      q => !duplicates.includes(q.content)
    );
    
    if (uniqueQuestions.length === 0) {
      log('挿入する新しい質問がありません', 'warn');
      return;
    }
    
    log(`${uniqueQuestions.length}件の新しい質問を挿入します...`);
    
    // バッチ処理で質問を挿入
    const batchSize = 10;
    const batches = Math.ceil(uniqueQuestions.length / batchSize);
    let insertedCount = 0;
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min((i + 1) * batchSize, uniqueQuestions.length);
      const batch = uniqueQuestions.slice(start, end);
      
      const insertData = batch.map(q => ({
        content: q.content,
        category: q.category,
        difficulty: q.difficulty
      }));
      
      try {
        await db.insert(questions).values(insertData);
        insertedCount += batch.length;
        showProgress(insertedCount, uniqueQuestions.length, '挿入進捗');
      } catch (error) {
        log(`バッチ ${i + 1} の挿入中にエラーが発生しました`, 'error');
        throw error;
      }
    }
    
    // 最終的な質問数を確認
    const finalCount = await getQuestionCount();
    log(`✅ シード処理が完了しました！`);
    log(`  挿入された質問数: ${insertedCount}件`);
    log(`  総質問数: ${finalCount}件`);
    
    // カテゴリー別の統計を表示
    log('\n📊 カテゴリー別統計:');
    const categoryStats = uniqueQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categoryStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        log(`  ${category}: ${count}件`);
      });
    
    // 難易度別の統計を表示
    log('\n📊 難易度別統計:');
    const difficultyStats = uniqueQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    ['easy', 'medium', 'hard'].forEach(difficulty => {
      const count = difficultyStats[difficulty] || 0;
      log(`  ${difficulty}: ${count}件`);
    });
    
    log('\n🎉 本番環境用データベースシードが正常に完了しました！');
    
  } catch (error) {
    log('本番環境用シード処理中にエラーが発生しました:', 'error');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// スクリプトとして実行された場合のみシード実行
if (process.argv[1] === __filename) {
  console.log('🌱 本番環境用シードスクリプトを開始します...');
  console.log('このスクリプトは既存のデータを削除せず、新しい質問のみを追加します。');
  seedProduction();
}

export { seedProduction };