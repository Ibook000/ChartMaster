export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ChartData {
  code: string;
  explanation: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  isCode?: boolean;
}