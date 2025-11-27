
import { ApiResponse, FilterState } from '../types';
import { API_BASE_URL, API_ENDPOINT, USE_MOCK_DATA } from '../constants';
import { generateMockData } from './mockService';

export const fetchRecordings = async (filters: FilterState): Promise<ApiResponse> => {
  if (USE_MOCK_DATA) {
    console.log('⚠️ Using Mock Data. Change USE_MOCK_DATA in constants.ts to use real API.');
    return generateMockData(filters);
  }

  const queryParams = new URLSearchParams();

  if (filters.start_date) queryParams.append('start_date', filters.start_date);
  if (filters.end_date) queryParams.append('end_date', filters.end_date);
  if (filters.lista_nome) queryParams.append('lista_nome', filters.lista_nome);
  if (filters.disposition) queryParams.append('disposition', filters.disposition);
  queryParams.append('sem_lista', String(filters.sem_lista));
  queryParams.append('page', String(filters.page));
  queryParams.append('limit', String(filters.limit));

  const url = `${API_BASE_URL}${API_ENDPOINT}?${queryParams.toString()}`;

  console.log(`📡 Chamando API: ${url}`); // Log para debug

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Falha ao buscar gravações:', error);
    throw error;
  }
};
