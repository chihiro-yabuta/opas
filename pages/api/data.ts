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
  '270008': ['osakafu', '大阪府'],
  '272035': ['toyonaka', '豊中市'],
  '272116': ['ibaraki', '茨木市'],
  '271403': ['sakai', '堺市'],
  '272256': ['takaishi', '高石市'],
  '272311': ['osakasayama', '大阪狭山市'],
  '273619': ['kumatori', '熊取町'],
  '272043': ['ikeda', '池田市'],
  '272272': ['higashiosaka', '東大阪市'],
  '272051': ['suita', '吹田市'],
  '272191': ['izumi', '和泉市'],
  '272078': ['takatsuki', '高槻市'],
  '272167': ['kawachinagano', '河内長野市'],
  '271004': ['osakashi', '大阪市'],
  '272141': ['tondabayashi', '富田林市'],
  '273821': ['kanan', '河南町'],
  '273813': ['taishi', '太子町'],
  '273830': ['chihayaakasaka', '千早赤阪村'],
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