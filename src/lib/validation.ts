/**
 * 入力値検証とサニタイゼーション
 */

import { GAME_CONSTANTS } from './config';

// UUID検証
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
}

// ルームコード検証
export function isValidRoomCode(code: string): boolean {
  const pattern = new RegExp(`^[A-Z0-9]{${GAME_CONSTANTS.ROOM_CODE_LENGTH}}$`);
  return typeof code === 'string' && pattern.test(code);
}

// テキスト入力のサニタイゼーション
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // 基本的なHTMLエスケープ
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 回答内容の検証とサニタイゼーション
export function validateAndSanitizeAnswer(content: string): string {
  if (!content || typeof content !== 'string') {
    throw new Error('Answer content is required');
  }
  
  const sanitized = sanitizeText(content);
  
  if (sanitized.length === 0) {
    throw new Error('Answer cannot be empty after sanitization');
  }
  
  if (sanitized.length > GAME_CONSTANTS.ANSWER_MAX_LENGTH) {
    throw new Error(`Answer is too long (max ${GAME_CONSTANTS.ANSWER_MAX_LENGTH} characters)`);
  }
  
  // 不適切な文字列パターンをチェック
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /vbscript:/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      throw new Error('Invalid characters detected in answer');
    }
  }
  
  return sanitized;
}

// ルーム名の検証とサニタイゼーション
export function validateAndSanitizeRoomName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Room name is required');
  }
  
  const sanitized = sanitizeText(name);
  
  if (sanitized.length === 0) {
    throw new Error('Room name cannot be empty');
  }
  
  if (sanitized.length > GAME_CONSTANTS.ROOM_NAME_MAX_LENGTH) {
    throw new Error(`Room name is too long (max ${GAME_CONSTANTS.ROOM_NAME_MAX_LENGTH} characters)`);
  }
  
  return sanitized;
}

// 数値の検証
export function validatePositiveInteger(value: unknown, fieldName: string): number {
  const num = Number(value);
  
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  
  return num;
}

// レート制限用のキー生成
export function generateRateLimitKey(identifier: string, action: string): string {
  return `rate_limit:${action}:${identifier}`;
}