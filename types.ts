

export interface Recording {
  id: number;
  calldate: string;
  src: string;
  dst: string;
  duration: string; // "00:01:08"
  billsec: string;  
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

// Novos tipos para o Upload de Mailing
export interface MailingItem {
    nome?: string;
    cpf?: string;
    telefone1?: string;
    telefone2?: string;
    telefone3?: string;
    telefone4?: string;
    uf?: string;
    bairro?: string;
    cidade?: string;
    endereco?: string;
    cep?: string;
    numero?: string;
    malling_name?: string; // Usado para enviar o nome escolhido no input
    [key: string]: any; // Permite outras colunas do Excel
}

export interface MailingResponse {
    message: string;
    totalItens: number;
    totalTelefonesProcessados: number;
    totalNovosMalling: number;
    totalDuplicadosLogs: number;
    error?: string;
}

// Tipos para Estatísticas de Mailing
export interface MailingStat {
    nome_malling: string;
    total_registros: number;
    total_telefones_unicos: number;
    total_duplicados: number;
    total_geral: number;
    taxa_duplicacao: number;
    data_primeira_insercao: string;
    data_ultima_insercao: string;
}

export interface MailingGeneralStats {
    total_registros: number;
    total_telefones_unicos: number;
    total_duplicados: number;
    total_geral: number;
    taxa_duplicacao_geral: number;
}

export interface MailingStatsResponse {
    totalMailings: number;
    totalPages: number;
    paginaAtual: number;
    porPagina: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
    totaisGerais: MailingGeneralStats;
    estatisticas: MailingStat[];
}

export interface MailingListResponse {
    success: boolean;
    mailings: string[];
    total: number;
    error?: string;
}

// Tipos para Comparação e Exportação
export interface CompatibleData {
    id: number;
    nome: string;
    cpf: string;
    telefone1: string;
    telefone2: string;
    telefone3: string;
    telefone4: string;
    uf: string;
    bairro: string;
    cidade: string;
    endereco: string;
    cep: string;
    numero: string;
    nome_malling: string;
    data_insercao: string;
}

export interface CompatibleCepsResponse {
    totalRegistros: number;
    paginaAtual: number;
    porPagina: number;
    totalPages: number;
    dados: CompatibleData[];
    error?: string;
}