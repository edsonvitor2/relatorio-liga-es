export interface Recording {
  id: number;
  calldate: string;
  src: string;
  dst: string;
  duration: number;
  billsec: number;
  disposition: string; // 'ANSWERED', 'NO ANSWER', 'BUSY', 'FAILED'
  gravacao: string | null;
  destino: string;
  cml_nome: string;
  lista_nome: string | null;
  cml_id: number;
  tipomailing: string;
  usr_nome: string;
  data_insercao: string;
}

export interface PaginationMeta {
  paginaAtual: number;
  porPagina: number;
  totalPages: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

export interface ApiResponse {
  totalRegistros: number;
  filtro_sem_lista: boolean;
  dados: Recording[];
  paginacao?: PaginationMeta;
}

export interface FilterState {
  start_date: string;
  end_date: string;
  lista_nome: string;
  disposition: string;
  sem_lista: boolean;
  page: number;
  limit: number;
}

export enum DispositionType {
  ALL = '',
  ANSWERED = 'ANSWERED',
  NO_ANSWER = 'NO ANSWER',
  BUSY = 'BUSY',
  FAILED = 'FAILED'
}