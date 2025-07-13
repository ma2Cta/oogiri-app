import { db } from './db';
import { questions } from './db/schema';
import { sampleQuestions } from './sample-questions';

export async function seedQuestions() {
  try {
    console.log('Seeding questions...');
    
    // 既存のお題をクリア（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      await db.delete(questions);
    }

    // サンプルお題を挿入
    const insertData = sampleQuestions.map(q => ({
      content: q.content,
      category: q.category,
      difficulty: q.difficulty
    }));

    const result = await db.insert(questions).values(insertData).returning();
    
    console.log(`Successfully seeded ${result.length} questions`);
    return result;
    
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
}

// 追加のお題データ
export const extraQuestions = [
  {
    content: "もしもAIが感情を持ったら最初に言いそうなこと",
    category: "AI・テクノロジー",
    difficulty: "medium" as const
  },
  {
    content: "宇宙人が地球のコンビニで一番驚きそうな商品",
    category: "宇宙・SF",
    difficulty: "easy" as const
  },
  {
    content: "もしも日本が常夏の国だったら変わりそうな文化",
    category: "文化・社会",
    difficulty: "medium" as const
  },
  {
    content: "犬と猫が合体したペットの困った特徴",
    category: "動物",
    difficulty: "easy" as const
  },
  {
    content: "時間を巻き戻せる能力の意外なデメリット",
    category: "超能力",
    difficulty: "hard" as const
  },
  {
    content: "もしも重力の向きを自由に変えられたら起こりそうな事故",
    category: "物理・科学",
    difficulty: "hard" as const
  },
  {
    content: "透明人間になった人が最初にやってしまいそうな失敗",
    category: "超能力",
    difficulty: "medium" as const
  },
  {
    content: "もしも食べ物に感情があったら怒りそうな料理",
    category: "食べ物",
    difficulty: "easy" as const
  },
  {
    content: "未来の学校にありそうな授業科目",
    category: "教育・未来",
    difficulty: "medium" as const
  },
  {
    content: "ロボットが人間らしさを学ぶために最初に挑戦しそうなこと",
    category: "ロボット・AI",
    difficulty: "medium" as const
  },
  {
    content: "もしも言葉が目に見えたら困りそうなシチュエーション",
    category: "言語・コミュニケーション",
    difficulty: "hard" as const
  },
  {
    content: "魔法使いが現代社会で就職面接を受けたときの自己PR",
    category: "ファンタジー",
    difficulty: "medium" as const
  },
  {
    content: "地球が立方体だったら変わりそうな天気予報",
    category: "地理・気象",
    difficulty: "hard" as const
  },
  {
    content: "もしも動物が人間の言葉を理解していたら密かに思っていそうなこと",
    category: "動物",
    difficulty: "easy" as const
  },
  {
    content: "タイムマシンの取扱説明書に書いてありそうな注意事項",
    category: "タイムトラベル",
    difficulty: "medium" as const
  },
  {
    content: "もしも睡眠が不要になったら新しく生まれそうな職業",
    category: "仕事・職業",
    difficulty: "medium" as const
  },
  {
    content: "宇宙で開催されるオリンピックにありそうな新競技",
    category: "宇宙・スポーツ",
    difficulty: "easy" as const
  },
  {
    content: "もしも記憶を物理的に取り出せたら起こりそうなトラブル",
    category: "記憶・脳科学",
    difficulty: "hard" as const
  },
  {
    content: "ドラえもんが故障したときにありそうな症状",
    category: "アニメ・漫画",
    difficulty: "easy" as const
  },
  {
    content: "もしも一日が30時間になったら増えそうな時間の使い道",
    category: "時間・生活",
    difficulty: "medium" as const
  }
];

export async function seedExtraQuestions() {
  try {
    console.log('Seeding extra questions...');
    
    const insertData = extraQuestions.map(q => ({
      content: q.content,
      category: q.category,
      difficulty: q.difficulty
    }));

    const result = await db.insert(questions).values(insertData).returning();
    
    console.log(`Successfully seeded ${result.length} extra questions`);
    return result;
    
  } catch (error) {
    console.error('Error seeding extra questions:', error);
    throw error;
  }
}