import { db } from '../db';
import { questions } from './schema';
import { eq } from 'drizzle-orm';

/**
 * 現在の質問数を取得
 */
export async function getQuestionCount(): Promise<number> {
  const result = await db.select({ count: questions.id }).from(questions);
  return result.length;
}

/**
 * 質問内容の重複をチェック
 */
export async function checkDuplicateQuestions(contents: string[]): Promise<string[]> {
  const duplicates: string[] = [];
  
  for (const content of contents) {
    const existing = await db
      .select()
      .from(questions)
      .where(eq(questions.content, content))
      .limit(1);
    
    if (existing.length > 0) {
      duplicates.push(content);
    }
  }
  
  return duplicates;
}

/**
 * 質問データのバリデーション
 */
export function validateQuestionData(data: Array<{
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  data.forEach((item, index) => {
    if (!item.content || item.content.trim().length === 0) {
      errors.push(`質問 ${index + 1}: 内容が空です`);
    }
    
    if (!item.category || item.category.trim().length === 0) {
      errors.push(`質問 ${index + 1}: カテゴリーが空です`);
    }
    
    if (!['easy', 'medium', 'hard'].includes(item.difficulty)) {
      errors.push(`質問 ${index + 1}: 難易度が不正です（${item.difficulty}）`);
    }
    
    if (item.content && item.content.length > 200) {
      errors.push(`質問 ${index + 1}: 内容が長すぎます（200文字以内）`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 環境に応じたログ出力
 */
export function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [SEED]`;
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ❌`, message);
      break;
    case 'warn':
      console.warn(`${prefix} ⚠️`, message);
      break;
    case 'info':
    default:
      console.log(`${prefix} ℹ️`, message);
      break;
  }
}

/**
 * プログレスバー表示用のヘルパー
 */
export function showProgress(current: number, total: number, label: string = '') {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  process.stdout.write(`\r${label} ${bar} ${percentage}% (${current}/${total})`);
  
  if (current === total) {
    process.stdout.write('\n');
  }
}