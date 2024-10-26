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
  regions: string[];
  genre: string;
  status: 'in-progress' | 'error';
  msg: string;
}

export interface Range {
  [date: string]: number[][];
}

export interface Header {
  title: string;
  colSpan: number;
}