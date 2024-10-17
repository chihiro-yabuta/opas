import { Agent } from 'https';
import { SSL_OP_LEGACY_SERVER_CONNECT } from 'constants';

export const base = 'https://reserve.opas.jp/';
export const genreSlct = 'portal/menu/GenreSelect.cgi';
export const login = 'menu/Login.cgi';

export const agent = new Agent({
  secureOptions: SSL_OP_LEGACY_SERVER_CONNECT
});

export interface Org {
  [region: string]: {
    [org: string]: {
      id: string;
      subGenres: {
        id: string;
        name: string;
      }[];
    };
  };
}

export interface Response {
  [region: string]: {
    [subGenre: string]: {
      [org: string]: {
        [subOrg: string]: string[];
      };
    };
  };
}

export const regions = {
  '270008': 'osakafu',
  '272035': 'toyonaka',
  '272116': 'ibaraki',
  '271403': 'sakai',
  '272256': 'takaishi',
  '272311': 'osakasayama',
  '273619': 'kumatori',
  '272043': 'ikeda',
  '272272': 'higashiosaka',
  '272051': 'suita',
  '272191': 'izumi',
  '272078': 'takatsuki',
  '272167': 'kawachinagano',
  '271004': 'osakashi',
  '272141': 'tondabayashi',
  '273821': 'kanan',
  '273813': 'taishi',
  '273830': 'chihayaakasaka',
}

export const genres = {
  'バレーボール': 'A00',
  'バスケットボール': 'B00',
  'バドミントン': 'C00',
  '卓球': 'D00',
  'テニス': 'E00',
  '体操': 'F00',
  'ダンス・エクササイズ': 'G00',
  '武道': 'H00',
  '野球・ソフトボール': 'I00',
  'サッカー': 'J00',
  'ニュースポーツ': 'K00',
  '陸上・跳躍・投擲': 'L00',
  '競技会・運動会': 'M00',
  '文化利用・会議（スポーツ）': 'N00',
  'レクリエーション': 'O00',
  'その他球技': 'P00',
  'その他スポーツ': 'Q00',
  'その他': 'R00',
}