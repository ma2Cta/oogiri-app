const { Client } = require('pg');
require('dotenv/config');

async function resetDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'oogiri',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('データベースに接続しました');

    // 外部キー制約があるため、依存関係の逆順で削除
    const dropQueries = [
      'DROP TABLE IF EXISTS room_member CASCADE;',
      'DROP TABLE IF EXISTS player_session CASCADE;',
      'DROP TABLE IF EXISTS vote CASCADE;',
      'DROP TABLE IF EXISTS answer CASCADE;',
      'DROP TABLE IF EXISTS round CASCADE;',
      'DROP TABLE IF EXISTS question CASCADE;',
      'DROP TABLE IF EXISTS game_session CASCADE;',
      'DROP TABLE IF EXISTS room CASCADE;',
      'DROP TABLE IF EXISTS verificationToken CASCADE;',
      'DROP TABLE IF EXISTS session CASCADE;',
      'DROP TABLE IF EXISTS account CASCADE;',
      'DROP TABLE IF EXISTS user CASCADE;',
      // Enumタイプを削除
      'DROP TYPE IF EXISTS room_status CASCADE;',
      'DROP TYPE IF EXISTS session_status CASCADE;',
      'DROP TYPE IF EXISTS round_status CASCADE;',
      'DROP TYPE IF EXISTS player_status CASCADE;',
      'DROP TYPE IF EXISTS difficulty CASCADE;',
    ];

    for (const query of dropQueries) {
      try {
        await client.query(query);
        console.log(`実行完了: ${query}`);
      } catch (error) {
        console.log(`スキップ (既に存在しない): ${query}`);
      }
    }

    console.log('データベースのリセットが完了しました');
  } catch (error) {
    console.error('データベースリセット中にエラーが発生しました:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();