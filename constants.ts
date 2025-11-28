

// Configuration for the API connection
export const API_BASE_URL = 'https://api.rotaportasdeaco.com:3060'; 
export const API_ENDPOINT = '/gravacoes-todas';
export const API_MALLING_ENDPOINT = '/subir-malling';
export const API_MAILING_STATS_ENDPOINT = '/estatisticas-mailings';
export const API_MAILINGS_LIST_ENDPOINT = '/mailings';
export const API_COMPATIBLE_CEPS_ENDPOINT = '/mailings-ceps-compativel';
export const API_LISTS_ENDPOINT = '/listas';

// Toggle this to false to use your real local backend. 
// Set to true to see the UI with generated mock data immediately.
export const USE_MOCK_DATA = false; 

export const DEFAULT_PAGE_SIZE = 15;
export const UPLOAD_BATCH_SIZE = 500; // Enviar 500 linhas por vez para não travar o servidor

export const CHART_COLORS = [
  '#0ea5e9', // Sky 500
  '#22c55e', // Green 500
  '#eab308', // Yellow 500
  '#ef4444', // Red 500
  '#8b5cf6', // Violet 500
  '#f97316', // Orange 500
];