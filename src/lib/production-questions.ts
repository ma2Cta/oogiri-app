export const productionQuestions = [
  // === 既存の質問（30問） ===
  // テクノロジー
  {
    content: "このアプリの新機能を考えてください",
    category: "テクノロジー",
    difficulty: "medium" as const
  },
  {
    content: "もしもスマートフォンが意思を持ったら人間に要求しそうなこと",
    category: "テクノロジー",
    difficulty: "hard" as const
  },
  {
    content: "もしもAIが感情を持ったら最初に言いそうなこと",
    category: "AI・テクノロジー",
    difficulty: "medium" as const
  },
  {
    content: "ロボットが人間らしさを学ぶために最初に挑戦しそうなこと",
    category: "ロボット・AI",
    difficulty: "medium" as const
  },

  // SF・ファンタジー
  {
    content: "もしも地球が正方形だったら起こりそうなこと",
    category: "SF・ファンタジー",
    difficulty: "easy" as const
  },
  {
    content: "宇宙人が地球に来て最初に驚きそうなこと",
    category: "宇宙",
    difficulty: "easy" as const
  },
  {
    content: "宇宙人が地球のコンビニで一番驚きそうな商品",
    category: "宇宙・SF",
    difficulty: "easy" as const
  },
  {
    content: "宇宙で開催されるオリンピックにありそうな新競技",
    category: "宇宙・スポーツ",
    difficulty: "easy" as const
  },
  {
    content: "魔法使いが現代社会で就職面接を受けたときの自己PR",
    category: "ファンタジー",
    difficulty: "medium" as const
  },

  // 動物
  {
    content: "猫が人間の言葉を話せるようになったら最初に言いそうなこと",
    category: "動物",
    difficulty: "easy" as const
  },
  {
    content: "犬と猫が合体したペットの困った特徴",
    category: "動物",
    difficulty: "easy" as const
  },
  {
    content: "もしも動物が人間の言葉を理解していたら密かに思っていそうなこと",
    category: "動物",
    difficulty: "easy" as const
  },

  // 超能力
  {
    content: "時間を止められる能力を手に入れた中学生がやりそうなこと",
    category: "超能力",
    difficulty: "medium" as const
  },
  {
    content: "時間を巻き戻せる能力の意外なデメリット",
    category: "超能力",
    difficulty: "hard" as const
  },
  {
    content: "透明人間になった人が最初にやってしまいそうな失敗",
    category: "超能力",
    difficulty: "medium" as const
  },

  // 未来・時間
  {
    content: "未来の履歴書にありそうな項目",
    category: "未来",
    difficulty: "medium" as const
  },
  {
    content: "タイムトラベラーが現代に来て最も困惑しそうなもの",
    category: "タイムトラベル",
    difficulty: "medium" as const
  },
  {
    content: "タイムマシンの取扱説明書に書いてありそうな注意事項",
    category: "タイムトラベル",
    difficulty: "medium" as const
  },
  {
    content: "もしも一日が30時間になったら増えそうな時間の使い道",
    category: "時間・生活",
    difficulty: "medium" as const
  },

  // 物理・科学
  {
    content: "もしも重力が半分になったら日常生活で困ること",
    category: "物理",
    difficulty: "hard" as const
  },
  {
    content: "もしも重力の向きを自由に変えられたら起こりそうな事故",
    category: "物理・科学",
    difficulty: "hard" as const
  },
  {
    content: "地球が立方体だったら変わりそうな天気予報",
    category: "地理・気象",
    difficulty: "hard" as const
  },

  // その他
  {
    content: "ドラえもんの道具で一番いらないもの",
    category: "アニメ・漫画",
    difficulty: "easy" as const
  },
  {
    content: "ドラえもんが故障したときにありそうな症状",
    category: "アニメ・漫画",
    difficulty: "easy" as const
  },
  {
    content: "もしも日本が常夏の国だったら変わりそうな文化",
    category: "文化・社会",
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
    content: "もしも言葉が目に見えたら困りそうなシチュエーション",
    category: "言語・コミュニケーション",
    difficulty: "hard" as const
  },
  {
    content: "もしも睡眠が不要になったら新しく生まれそうな職業",
    category: "仕事・職業",
    difficulty: "medium" as const
  },
  {
    content: "もしも記憶を物理的に取り出せたら起こりそうなトラブル",
    category: "記憶・脳科学",
    difficulty: "hard" as const
  },

  // === 新規追加分（70問） ===
  
  // 日常生活・社会（15問）
  {
    content: "もしも電車が常に満員だったら生まれそうな新サービス",
    category: "日常生活",
    difficulty: "medium" as const
  },
  {
    content: "コンビニ店員がお客様に本音を言える日があったら聞こえてきそうな言葉",
    category: "日常生活",
    difficulty: "easy" as const
  },
  {
    content: "もしも家電製品同士が会話できたら話し合いそうなこと",
    category: "日常生活",
    difficulty: "medium" as const
  },
  {
    content: "エレベーターで知らない人と二人きりになったときの気まずさを解消する方法",
    category: "日常生活",
    difficulty: "easy" as const
  },
  {
    content: "もしも信号機に感情があったら赤信号が長い理由",
    category: "日常生活",
    difficulty: "easy" as const
  },
  {
    content: "満員電車で絶対に座れる特殊能力",
    category: "日常生活",
    difficulty: "medium" as const
  },
  {
    content: "もしも鏡が正直すぎたら言われそうなこと",
    category: "日常生活",
    difficulty: "easy" as const
  },
  {
    content: "24時間営業じゃないコンビニの新しい名前",
    category: "日常生活",
    difficulty: "easy" as const
  },
  {
    content: "もしも自動ドアが選り好みしたら入れない人の特徴",
    category: "日常生活",
    difficulty: "medium" as const
  },
  {
    content: "雨の日だけ使える超能力",
    category: "日常生活",
    difficulty: "medium" as const
  },
  {
    content: "もしも財布が話せたら持ち主に言いたいこと",
    category: "日常生活",
    difficulty: "easy" as const
  },
  {
    content: "電子マネーが現金に勝てない唯一のシチュエーション",
    category: "日常生活",
    difficulty: "medium" as const
  },
  {
    content: "もしも傘に人格があったら梅雨の時期に思うこと",
    category: "日常生活",
    difficulty: "easy" as const
  },
  {
    content: "歩きスマホをやめさせる画期的なアイデア",
    category: "日常生活",
    difficulty: "medium" as const
  },
  {
    content: "もしも時計が逆回りしたら起こる面白い現象",
    category: "日常生活",
    difficulty: "hard" as const
  },

  // 学校・教育（10問）
  {
    content: "宿題を忘れた時の斬新な言い訳",
    category: "学校・教育",
    difficulty: "easy" as const
  },
  {
    content: "もしも通知表が正直すぎたら書かれそうなコメント",
    category: "学校・教育",
    difficulty: "medium" as const
  },
  {
    content: "体育の授業で新しく採用されそうな競技",
    category: "学校・教育",
    difficulty: "easy" as const
  },
  {
    content: "もしも黒板が生徒の本音を映し出したら見えそうな文字",
    category: "学校・教育",
    difficulty: "medium" as const
  },
  {
    content: "給食で絶対に出てこないメニューとその理由",
    category: "学校・教育",
    difficulty: "easy" as const
  },
  {
    content: "もしも教科書にSNS機能があったら起こりそうなこと",
    category: "学校・教育",
    difficulty: "medium" as const
  },
  {
    content: "テスト中にだけ使える微妙な超能力",
    category: "学校・教育",
    difficulty: "medium" as const
  },
  {
    content: "もしも学校の机が記憶を持っていたら知っている秘密",
    category: "学校・教育",
    difficulty: "hard" as const
  },
  {
    content: "卒業式で絶対に言わない方がいい一言",
    category: "学校・教育",
    difficulty: "easy" as const
  },
  {
    content: "もしも成績表がゲームのステータス画面だったら表示される項目",
    category: "学校・教育",
    difficulty: "medium" as const
  },

  // 仕事・ビジネス（10問）
  {
    content: "リモートワーク中に起こりがちなハプニング",
    category: "仕事・ビジネス",
    difficulty: "easy" as const
  },
  {
    content: "もしも会議室に本音センサーがあったら鳴りっぱなしになる瞬間",
    category: "仕事・ビジネス",
    difficulty: "medium" as const
  },
  {
    content: "履歴書に書いてはいけない特技",
    category: "仕事・ビジネス",
    difficulty: "easy" as const
  },
  {
    content: "もしもパソコンが残業を拒否したら表示されるエラーメッセージ",
    category: "仕事・ビジネス",
    difficulty: "medium" as const
  },
  {
    content: "社長の椅子に座ったら自動的に身につく能力",
    category: "仕事・ビジネス",
    difficulty: "medium" as const
  },
  {
    content: "もしも名刺交換がバトルだったら起こりそうなこと",
    category: "仕事・ビジネス",
    difficulty: "hard" as const
  },
  {
    content: "会社のエレベーターで上司と二人きりになった時の必殺技",
    category: "仕事・ビジネス",
    difficulty: "medium" as const
  },
  {
    content: "もしも給料日が毎日だったら起こりそうな社会問題",
    category: "仕事・ビジネス",
    difficulty: "hard" as const
  },
  {
    content: "在宅ワーク専用の新しい服装",
    category: "仕事・ビジネス",
    difficulty: "easy" as const
  },
  {
    content: "もしも会社のプリンターに感情があったら月曜日の朝に思うこと",
    category: "仕事・ビジネス",
    difficulty: "easy" as const
  },

  // 恋愛・人間関係（10問）
  {
    content: "初デートで絶対に行ってはいけない場所",
    category: "恋愛・人間関係",
    difficulty: "easy" as const
  },
  {
    content: "もしも好きな人の心の声が聞こえたら幻滅しそうな瞬間",
    category: "恋愛・人間関係",
    difficulty: "medium" as const
  },
  {
    content: "LINEの既読スルーに対する面白い対抗策",
    category: "恋愛・人間関係",
    difficulty: "easy" as const
  },
  {
    content: "もしも恋愛にレベルがあったら初心者が覚える最初のスキル",
    category: "恋愛・人間関係",
    difficulty: "medium" as const
  },
  {
    content: "友達の恋人を初めて見た時に絶対言ってはいけない一言",
    category: "恋愛・人間関係",
    difficulty: "easy" as const
  },
  {
    content: "もしも別れ話がゲームのイベントだったら選択肢に出てきそうな項目",
    category: "恋愛・人間関係",
    difficulty: "hard" as const
  },
  {
    content: "合コンで使える一発芸（ただし全員ドン引き）",
    category: "恋愛・人間関係",
    difficulty: "medium" as const
  },
  {
    content: "もしも恋のキューピッドが現代にいたらやりそうな仕事",
    category: "恋愛・人間関係",
    difficulty: "medium" as const
  },
  {
    content: "友情と恋愛の境界線を科学的に説明すると",
    category: "恋愛・人間関係",
    difficulty: "hard" as const
  },
  {
    content: "もしもフラれた回数でポイントが貯まったら交換できそうな商品",
    category: "恋愛・人間関係",
    difficulty: "medium" as const
  },

  // 食べ物・料理（10問）
  {
    content: "もしも野菜が肉の味だったら起こりそうな社会現象",
    category: "食べ物・料理",
    difficulty: "medium" as const
  },
  {
    content: "ラーメンの新しいトッピング（ただし邪道）",
    category: "食べ物・料理",
    difficulty: "easy" as const
  },
  {
    content: "もしも料理が作った人の性格を反映したら起こりそうなこと",
    category: "食べ物・料理",
    difficulty: "medium" as const
  },
  {
    content: "冷蔵庫の奥から出てきた謎の物体の正体",
    category: "食べ物・料理",
    difficulty: "easy" as const
  },
  {
    content: "もしもお箸がしゃべったら食事中に言いそうなこと",
    category: "食べ物・料理",
    difficulty: "easy" as const
  },
  {
    content: "カップラーメンを5分待てない人のための新商品",
    category: "食べ物・料理",
    difficulty: "medium" as const
  },
  {
    content: "もしも食べ物に賞味期限ではなくレベルが表示されたら",
    category: "食べ物・料理",
    difficulty: "hard" as const
  },
  {
    content: "お弁当に入っていたら確実にテンションが下がるもの",
    category: "食べ物・料理",
    difficulty: "easy" as const
  },
  {
    content: "もしも寿司ネタが職業を持っていたらマグロの仕事",
    category: "食べ物・料理",
    difficulty: "medium" as const
  },
  {
    content: "深夜に食べる罪悪感を数値化したら一番高い食べ物",
    category: "食べ物・料理",
    difficulty: "medium" as const
  },

  // ゲーム・エンタメ（10問）
  {
    content: "ゲームのラスボスが主人公に言いたい本音",
    category: "ゲーム・エンタメ",
    difficulty: "medium" as const
  },
  {
    content: "もしもゲームのセーブデータに税金がかかったら",
    category: "ゲーム・エンタメ",
    difficulty: "hard" as const
  },
  {
    content: "RPGの村人が冒険者に対して思っている不満",
    category: "ゲーム・エンタメ",
    difficulty: "easy" as const
  },
  {
    content: "もしもゲームのBGMが状況に合わなかったら起こりそうなこと",
    category: "ゲーム・エンタメ",
    difficulty: "medium" as const
  },
  {
    content: "映画館で絶対にやってはいけない新しいマナー違反",
    category: "ゲーム・エンタメ",
    difficulty: "easy" as const
  },
  {
    content: "もしもアニメキャラが現実世界で就活したら苦労しそうなこと",
    category: "ゲーム・エンタメ",
    difficulty: "medium" as const
  },
  {
    content: "ゲーム実況者が絶対に言わない方がいいセリフ",
    category: "ゲーム・エンタメ",
    difficulty: "easy" as const
  },
  {
    content: "もしもポケモンが労働基準法を知ったら起こりそうなこと",
    category: "ゲーム・エンタメ",
    difficulty: "hard" as const
  },
  {
    content: "格闘ゲームのキャラが必殺技を出す前に考えていること",
    category: "ゲーム・エンタメ",
    difficulty: "medium" as const
  },
  {
    content: "もしもゲームの世界にSNSがあったら炎上しそうな投稿",
    category: "ゲーム・エンタメ",
    difficulty: "medium" as const
  },

  // スポーツ・健康（5問）
  {
    content: "もしもマラソンがRPGだったらありそうなイベント",
    category: "スポーツ・健康",
    difficulty: "medium" as const
  },
  {
    content: "筋トレを続けられない人のための画期的な方法",
    category: "スポーツ・健康",
    difficulty: "easy" as const
  },
  {
    content: "もしも体重計が励ましてくれたら言いそうなセリフ",
    category: "スポーツ・健康",
    difficulty: "easy" as const
  },
  {
    content: "オリンピックに採用されそうで採用されない競技",
    category: "スポーツ・健康",
    difficulty: "medium" as const
  },
  {
    content: "もしも病院の待合室に娯楽施設があったら置かれそうなもの",
    category: "スポーツ・健康",
    difficulty: "easy" as const
  }
];