import { Status, Response } from './data';

export const mockError: Status = {
  status: 'error',
  genre: 'バレーボール',
  msg: 'test'
};

export const mockInProgress: Status = {
  status: 'in-progress',
  genre: 'バレーボール',
  msg: 'test'
};

export const mockData: Response = {
  '大阪府': {},
  '豊中市': {},
  '茨木市': {},
  '堺市': {},
  '高石市': {
    'バレーボール': {
      '高石市立総合体育館': {
        'アリーナ１／２面': [
          '2024年10月9日 | 09:00 ～ 12:00(午前)',
          '2024年10月11日 | 09:00 ～ 12:00(午前)',
          '2024年10月9日 | 12:00 ～ 15:00(午後Ａ)',
        ],
        'アリーナ全面': [
          '2024年10月14日 | 12:00 ～ 15:00(午後Ａ)',
          '2024年10月16日 | 12:00 ～ 15:00(午後Ａ)',
          '2024年10月28日 | 09:00 ～ 12:00(午前)',
        ]
      }
    },
    'ソフトバレーボール': {
      '高石市立総合体育館': {
        'アリーナ１／２面': [
          '2024年10月21日 | 09:00 ～ 12:00(午前)',
          '2024年10月23日 | 09:00 ～ 12:00(午前)',
          '2024年10月24日 | 09:00 ～ 12:00(午前)',
        ],
        'アリーナ全面': [
          '2024年10月28日 | 09:00 ～ 12:00(午前)',
          '2024年10月30日 | 12:00 ～ 15:00(午後Ａ)',
          '2024年11月2日 | 21:00 ～ 22:30(夜間Ｂ)',
        ]
      }
    }
  },
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
  '千早赤阪村':{},
};