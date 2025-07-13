export const sampleQuestions = [
  {
    content: "このアプリの新機能を考えてください",
    category: "テクノロジー",
    difficulty: "medium" as const
  },
  {
    content: "もしも地球が正方形だったら起こりそうなこと",
    category: "SF・ファンタジー",
    difficulty: "easy" as const
  },
  {
    content: "猫が人間の言葉を話せるようになったら最初に言いそうなこと",
    category: "動物",
    difficulty: "easy" as const
  },
  {
    content: "時間を止められる能力を手に入れた中学生がやりそうなこと",
    category: "超能力",
    difficulty: "medium" as const
  },
  {
    content: "未来の履歴書にありそうな項目",
    category: "未来",
    difficulty: "medium" as const
  },
  {
    content: "宇宙人が地球に来て最初に驚きそうなこと",
    category: "宇宙",
    difficulty: "easy" as const
  },
  {
    content: "もしもスマートフォンが意思を持ったら人間に要求しそうなこと",
    category: "テクノロジー",
    difficulty: "hard" as const
  },
  {
    content: "ドラえもんの道具で一番いらないもの",
    category: "アニメ・漫画",
    difficulty: "easy" as const
  },
  {
    content: "タイムトラベラーが現代に来て最も困惑しそうなもの",
    category: "タイムトラベル",
    difficulty: "medium" as const
  },
  {
    content: "もしも重力が半分になったら日常生活で困ること",
    category: "物理",
    difficulty: "hard" as const
  }
];

export function getRandomQuestion() {
  return sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
}

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
  return sampleQuestions.filter(q => q.difficulty === difficulty);
}