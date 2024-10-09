export const re = (e: string) => e.match(/(\d+)年(\d+)月(\d+)日/).slice(1, 4).join('/');

export interface Response {
  [region: string]: {
    [subGenre: string]: {
      [org: string]: {
        [subOrg: string]: string[];
      }
    }
  }
}

export interface Status {
  [key: string]: {
    key: string;
    status: 'in-progress' | 'skip' | 'error';
    msg: string;
  }
}

export const initData: Response = {
  '大阪府': {},
  '豊中市': {},
  '茨木市': {},
  '堺市': {},
  '高石市': {},
  '大阪狭山市': {},
  '熊取町': {},
  '池田市': {},
  '東大阪市': {},
  '吹田市': {},
  '和泉市': {},
  '高槻市': {},
  '河内長野市': {},
  '大阪市': {},
  '富田林市': {},
  '河南町': {},
  '太子町': {},
  '千早赤阪村': {},
};

export const genres = [
  [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
  ],
  [
    '卓球',
    'テニス',
    '体操',
  ],
  [
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
  ],
  [
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
  ],
  [
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
  ],
  [
    'その他球技',
    'その他スポーツ',
    'その他',
  ],
];

export const regions = {
  '大阪府': [
    'テニス',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
    '競技会・運動会',
    'その他球技',
  ],
  '豊中市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
  ],
  '茨木市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
  ],
  '堺市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
    '文化利用・会議（スポーツ）',
    'その他球技',
    'その他スポーツ',
    'その他',
  ],
  '高石市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'その他球技',
    'その他',
  ],
  '大阪狭山市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
  ],
  '熊取町': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    'サッカー',
    'ニュースポーツ',
    '文化利用・会議（スポーツ）',
    'その他球技',
  ],
  '池田市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
    'その他',
  ],
  '東大阪市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '文化利用・会議（スポーツ）',
    'その他球技',
    'その他スポーツ',
    'その他',
  ],
  '吹田市': [
    'その他球技',
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他スポーツ',
    'その他',
  ],
  '和泉市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '文化利用・会議（スポーツ）',
    'その他',
  ],
  '高槻市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
    'その他スポーツ',
  ],
  '河内長野市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
  ],
  '大阪市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'その他球技',
    'その他',
  ],
  '富田林市': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
    'その他スポーツ',
    'その他',
  ],
  '河南町': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '陸上・跳躍・投擲',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
    'その他',
  ],
  '太子町': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '文化利用・会議（スポーツ）',
    'その他球技',
  ],
  '千早赤阪村': [
    'バレーボール',
    'バスケットボール',
    'バドミントン',
    '卓球',
    'テニス',
    '体操',
    'ダンス・エクササイズ',
    '武道',
    '野球・ソフトボール',
    'サッカー',
    'ニュースポーツ',
    '競技会・運動会',
    '文化利用・会議（スポーツ）',
    'レクリエーション',
    'その他球技',
  ],
};

export const color = [
  '#FF0000',
  '#0000FF',
  '#CCCC00',
  '#008000',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A',
  '#808080',
  '#ADD8E6',
  '#00FF00',
  '#40E0D0',
  '#FF00FF',
  '#C5C5AC',
  '#C0C0C0',
  '#FFD700',
  '#000080',
  '#DC143C',
];