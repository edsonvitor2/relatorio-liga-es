import { Recording, ApiResponse, FilterState } from '../types';

// Helper to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Mock Data Generator
export const generateMockData = (filters: FilterState): Promise<ApiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const count = 200; // Simulate a database of 200 items
      const dispositions = ['ANSWERED', 'NO ANSWER', 'BUSY', 'FAILED'];
      const lists = ['Mailing_SP_High', 'Mailing_RJ_Leads', 'Retorno_Vendas', '', null];
      
      let allData: Recording[] = Array.from({ length: count }).map((_, i) => {
        const date = randomDate(new Date(2023, 0, 1), new Date());
        const duration = Math.floor(Math.random() * 300);
        return {
          id: i + 1,
          calldate: date.toISOString(),
          src: `100${Math.floor(Math.random() * 10)}`,
          dst: `119${Math.floor(Math.random() * 90000000 + 10000000)}`,
          duration: duration,
          billsec: Math.max(0, duration - 10),
          disposition: dispositions[Math.floor(Math.random() * dispositions.length)],
          gravacao: Math.random() > 0.5 ? 'path/to/file.wav' : null,
          destino: 'SIP/Trunk',
          cml_nome: 'Campaign A',
          lista_nome: lists[Math.floor(Math.random() * lists.length)],
          cml_id: 101,
          tipomailing: 'active',
          usr_nome: `Agent_${Math.floor(Math.random() * 5)}`,
          data_insercao: date.toISOString(),
        };
      });

      // Apply Filters (Simulating Backend Logic)
      if (filters.sem_lista) {
        allData = allData.filter(item => !item.lista_nome);
      } else {
        allData = allData.filter(item => !!item.lista_nome);
        
        if (filters.lista_nome) {
          allData = allData.filter(item => 
            item.lista_nome?.toLowerCase().includes(filters.lista_nome.toLowerCase())
          );
        }
      }

      if (filters.disposition) {
        allData = allData.filter(item => item.disposition === filters.disposition);
      }

      if (filters.start_date) {
        allData = allData.filter(item => item.calldate >= filters.start_date);
      }
      
      if (filters.end_date) {
        allData = allData.filter(item => item.calldate <= filters.end_date);
      }

      // Sorting
      allData.sort((a, b) => new Date(b.calldate).getTime() - new Date(a.calldate).getTime());

      // Pagination
      const total = allData.length;
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      const paginatedData = allData.slice(startIndex, endIndex);

      const totalPages = Math.ceil(total / filters.limit);

      resolve({
        totalRegistros: total,
        filtro_sem_lista: filters.sem_lista,
        dados: paginatedData,
        paginacao: {
          paginaAtual: filters.page,
          porPagina: filters.limit,
          totalPages: totalPages,
          temProximaPagina: filters.page < totalPages,
          temPaginaAnterior: filters.page > 1
        }
      });
    }, 800); // Simulate network latency
  });
};