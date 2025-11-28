import { ApiResponse, FilterState, MailingItem, MailingResponse, MailingStatsResponse, MailingListResponse, CompatibleCepsResponse, ListStatsResponse } from '../types';
import { API_BASE_URL, API_ENDPOINT, API_MALLING_ENDPOINT, API_MAILING_STATS_ENDPOINT, API_MAILINGS_LIST_ENDPOINT, API_COMPATIBLE_CEPS_ENDPOINT, API_LISTS_ENDPOINT, USE_MOCK_DATA } from '../constants';
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

  console.log(`📡 Chamando API Gravações: ${url}`); 

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

export const fetchMailingStats = async (filters: FilterState): Promise<MailingStatsResponse> => {
    if (USE_MOCK_DATA) {
        // Retornar mock simples se necessário
        return {
            totalMailings: 0,
            totalPages: 0,
            paginaAtual: 1,
            porPagina: 50,
            temProximaPagina: false,
            temPaginaAnterior: false,
            totaisGerais: { total_registros: 0, total_telefones_unicos: 0, total_duplicados: 0, total_geral: 0, taxa_duplicacao_geral: 0 },
            estatisticas: []
        };
    }

    const queryParams = new URLSearchParams();
    
    // Mapear filtros do dashboard para filtros da rota de estatísticas
    if (filters.start_date) queryParams.append('data_inicio', filters.start_date);
    if (filters.end_date) queryParams.append('data_fim', filters.end_date);
    if (filters.lista_nome) queryParams.append('nome_malling', filters.lista_nome);
    
    // Padrões
    queryParams.append('page', '1');
    queryParams.append('limit', '100'); // Pegar top 100 mailings
    queryParams.append('order_by', 'data_ultima_insercao');
    queryParams.append('order_dir', 'DESC');

    const url = `${API_BASE_URL}${API_MAILING_STATS_ENDPOINT}?${queryParams.toString()}`;
    
    console.log(`📡 Chamando API Estatísticas: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Falha ao buscar estatísticas de mailing:', error);
        throw error;
    }
};

export const fetchMailingsList = async (nome?: string, data?: string): Promise<MailingListResponse> => {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => setTimeout(() => resolve({
            success: true,
            mailings: ['Mailing_SP_2023', 'Base_RJ_Vendas', 'Lista_Fria_Nov', 'Campanha_Natal'],
            total: 4
        }), 500));
    }

    const queryParams = new URLSearchParams();
    if (nome) queryParams.append('nome', nome);
    if (data) queryParams.append('data', data);

    const url = `${API_BASE_URL}${API_MAILINGS_LIST_ENDPOINT}?${queryParams.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Falha ao buscar lista de mailings:', error);
        throw error;
    }
};

export const uploadMailingBatch = async (data: MailingItem[]): Promise<MailingResponse> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    message: "Mock upload success",
                    totalItens: data.length,
                    totalTelefonesProcessados: data.length * 1.5,
                    totalNovosMalling: Math.floor(data.length * 0.8),
                    totalDuplicadosLogs: Math.floor(data.length * 0.2)
                });
            }, 1000);
        });
    }

    const url = `${API_BASE_URL}${API_MALLING_ENDPOINT}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro API (${response.status}): ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Falha ao enviar lote de mailing:', error);
        throw error;
    }
};

export const fetchCompatibleData = async (mailings: string[], page: number = 1, limit: number = 5000): Promise<CompatibleCepsResponse> => {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => setTimeout(() => resolve({
            totalRegistros: 100,
            paginaAtual: page,
            porPagina: limit,
            totalPages: 1,
            dados: Array(10).fill(null).map((_, i) => ({
                id: i, nome: `Teste ${i}`, cpf: '123', telefone1: '1199999999', 
                telefone2: '', telefone3: '', telefone4: '', uf: 'SP', 
                bairro: 'Centro', cidade: 'SP', endereco: 'Rua A', cep: '01000-000', 
                numero: '10', nome_malling: mailings[0], data_insercao: new Date().toISOString()
            }))
        }), 500));
    }

    const url = `${API_BASE_URL}${API_COMPATIBLE_CEPS_ENDPOINT}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mailings,
                page,
                limit
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Falha ao buscar dados compatíveis:', error);
        throw error;
    }
};

export const fetchListsStats = async (filters: FilterState): Promise<ListStatsResponse> => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: [],
            pagination: {},
            filters: {}
        };
    }

    const queryParams = new URLSearchParams();
    
    // Envia datas com horário específico para garantir filtro correto de dia inteiro
    if (filters.start_date) {
        queryParams.append('start_date', `${filters.start_date} 00:00:01`);
        queryParams.append('data_inicio', `${filters.start_date} 00:00:01`);
    }
    if (filters.end_date) {
        queryParams.append('end_date', `${filters.end_date} 23:59:59`);
        queryParams.append('data_fim', `${filters.end_date} 23:59:59`);
    }
    
    if (filters.lista_nome) queryParams.append('lista_nome', filters.lista_nome);
    queryParams.append('limit', '50'); // Pegar top 50 listas para o gráfico

    const url = `${API_BASE_URL}${API_LISTS_ENDPOINT}?${queryParams.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Falha ao buscar estatísticas de listas:', error);
        throw error;
    }
};