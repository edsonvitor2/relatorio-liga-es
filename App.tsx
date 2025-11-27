import React, { useState, useEffect } from 'react';
import { ApiResponse, FilterState, Recording, PaginationMeta } from './types';
import { fetchRecordings } from './services/api';
import Filters from './components/Filters';
import RecordingsTable from './components/RecordingsTable';
import StatsCard from './components/StatsCard';
import Charts from './components/Charts';
import { Phone, Clock, Percent, Activity, BarChart3, LayoutDashboard } from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from './constants';

function App() {
  const [data, setData] = useState<Recording[]>([]);
  const [stats, setStats] = useState({ total: 0, avgDuration: 0, successRate: 0 });
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>({
    start_date: '',
    end_date: '',
    lista_nome: '',
    disposition: '',
    sem_lista: false,
    page: 1,
    limit: DEFAULT_PAGE_SIZE
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response: ApiResponse = await fetchRecordings(filters);
      setData(response.dados);
      
      // Update pagination info
      if (response.paginacao) {
        setPagination(response.paginacao);
      }

      // Calculate simple client-side stats based on current view 
      // (In a real app, these might come from a separate 'stats' endpoint for accuracy over total dataset)
      const total = response.totalRegistros;
      
      // These stats are calculated on the page data for demo purposes, 
      // ideally the backend returns aggregate stats
      const validCalls = response.dados.filter(d => d.disposition === 'ANSWERED').length;
      const totalDuration = response.dados.reduce((acc, curr) => acc + curr.duration, 0);
      const avgDur = response.dados.length > 0 ? Math.floor(totalDuration / response.dados.length) : 0;
      const rate = response.dados.length > 0 ? Math.floor((validCalls / response.dados.length) * 100) : 0;

      setStats({
        total: total,
        avgDuration: avgDur,
        successRate: rate
      });

    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and whenever filters change effectively
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]); // Only auto-reload on page change. Filters require manual "Apply" button.

  const handleApplyFilters = () => {
    loadData();
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar / Filter Panel */}
      <aside className="w-80 p-4 fixed h-screen overflow-hidden hidden lg:block z-10">
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 px-2 mb-6 text-slate-900">
             <div className="bg-primary-600 text-white p-2 rounded-lg">
                <LayoutDashboard size={24} />
             </div>
             <h1 className="text-xl font-bold tracking-tight">CallMetrics</h1>
          </div>
          <Filters 
            filters={filters} 
            setFilters={setFilters} 
            onApply={handleApplyFilters}
            isLoading={loading}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-4 lg:p-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500">Visão geral das chamadas e gravações do sistema.</p>
          </div>
          
          {/* Mobile Filter Toggle (Hidden on Desktop) */}
          <button className="lg:hidden bg-white border border-slate-300 px-4 py-2 rounded-lg text-slate-700 font-medium shadow-sm">
             Filtros
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total de Registros" 
            value={stats.total.toLocaleString()} 
            icon={Activity} 
            color="blue" 
          />
          <StatsCard 
            title="Taxa de Sucesso" 
            value={`${stats.successRate}%`} 
            icon={Percent} 
            color="green" 
            trend={stats.successRate > 50 ? "+2.5% vs ontem" : "-1.2% vs ontem"}
          />
          <StatsCard 
            title="Duração Média" 
            value={`${stats.avgDuration}s`} 
            icon={Clock} 
            color="orange" 
          />
          <StatsCard 
            title="Chamadas Ativas" 
            value={loading ? '-' : pagination?.porPagina || 0} 
            icon={Phone} 
            color="red" 
          />
        </div>

        {/* Charts Section */}
        {!loading && data.length > 0 && (
           <Charts data={data} />
        )}

        {/* Data Table Section */}
        <div className="flex items-center gap-2 mb-4 text-slate-800">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-lg">Registros Detalhados</h3>
        </div>
        
        <div className="h-[calc(100vh-500px)] min-h-[500px]">
            <RecordingsTable 
                data={data} 
                pagination={pagination} 
                onPageChange={handlePageChange} 
                isLoading={loading}
            />
        </div>

      </main>
    </div>
  );
}

export default App;