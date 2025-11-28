import React, { useState, useEffect, useCallback } from 'react';
import { ApiResponse, FilterState, Recording, PaginationMeta, MailingGeneralStats, MailingStat, ListStatData } from './types';
import { fetchRecordings, fetchMailingStats, fetchListsStats } from './services/api';
import Filters from './components/Filters';
import RecordingsTable from './components/RecordingsTable';
import MailingStatsTable from './components/MailingStatsTable';
import StatsCard from './components/StatsCard';
import Charts from './components/Charts';
import MailingUpload from './components/MailingUpload';
import MailingComparison from './components/MailingComparison';
import { Phone, Clock, Percent, Activity, BarChart3, LayoutDashboard, Database, Users, Copy, FileText, PieChart as PieChartIcon, Upload, GitCompare, PhoneOutgoing } from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from './constants';

// Helper para converter "HH:MM:SS" em segundos totais
const timeStringToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  // Formato HH:MM:SS
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  // Fallback formato MM:SS
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

// Helper para formatar segundos de volta para texto (para exibir médias)
const secondsToTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

// DEFINIÇÃO DAS 4 VISÕES PRINCIPAIS
type ViewState = 'calls' | 'mailing' | 'upload' | 'comparison';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('calls');
  
  // -- ESTADOS DE GRAVAÇÕES (CALLS) --
  const [allData, setAllData] = useState<Recording[]>([]);
  const [tableData, setTableData] = useState<Recording[]>([]);
  const [callStats, setCallStats] = useState({ total: 0, avgDuration: '0s', successRate: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [listsData, setListsData] = useState<ListStatData[]>([]);
  
  // -- ESTADOS DE MAILING --
  const [mailingGeneralStats, setMailingGeneralStats] = useState<MailingGeneralStats | null>(null);
  const [mailingList, setMailingList] = useState<MailingStat[]>([]);

  // -- ESTADOS COMPARTILHADOS --
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<FilterState>({
    start_date: '',
    end_date: '',
    lista_nome: '',
    disposition: '',
    sem_lista: false,
    page: 1, 
    limit: pageSize
  });

  // --- FUNÇÃO PARA CARREGAR DADOS DE LIGAÇÕES ---
  const loadCallData = useCallback(async () => {
    setLoading(true);
    try {
        // Busca até 5000 registros para ter gráficos completos
        const apiFiltersCalls = { ...filters, page: 1, limit: 5000 };
        
        // Executa requests em paralelo (Gravações + Estatísticas de Listas)
        const [recordingsResponse, listsResponse] = await Promise.all([
            fetchRecordings(apiFiltersCalls),
            fetchListsStats(apiFiltersCalls)
        ]);
        
        // Processar Gravações
        const fetchedRecordings = recordingsResponse.dados || [];
        setAllData(fetchedRecordings);
        setCurrentPage(1);

        // Processar Listas
        if (listsResponse.success && Array.isArray(listsResponse.data)) {
            setListsData(listsResponse.data);
        } else {
            setListsData([]);
        }

        // Cálculos de Estatísticas no Frontend
        const total = recordingsResponse.totalRegistros || fetchedRecordings.length;
        const validCalls = fetchedRecordings.filter(d => d.disposition === 'ANSWERED').length;
        const totalDurationSeconds = fetchedRecordings.reduce((acc, curr) => acc + timeStringToSeconds(curr.duration), 0);
        const avgDurSeconds = fetchedRecordings.length > 0 ? Math.floor(totalDurationSeconds / fetchedRecordings.length) : 0;
        const rate = fetchedRecordings.length > 0 ? Math.floor((validCalls / fetchedRecordings.length) * 100) : 0;

        setCallStats({
            total: total,
            avgDuration: secondsToTime(avgDurSeconds),
            successRate: rate
        });

    } catch (error) {
        console.error("Erro ao carregar ligações:", error);
        setAllData([]);
        setListsData([]);
        setCallStats({ total: 0, avgDuration: '0s', successRate: 0 });
    } finally {
        setLoading(false);
    }
  }, [filters]);

  // --- FUNÇÃO PARA CARREGAR DADOS DE MAILING ---
  const loadMailingData = useCallback(async () => {
    setLoading(true);
    try {
        const response = await fetchMailingStats(filters);
        setMailingGeneralStats(response.totaisGerais);
        setMailingList(response.estatisticas);
    } catch (error) {
        console.error("Erro ao carregar estatísticas de mailing:", error);
        setMailingGeneralStats(null);
        setMailingList([]);
    } finally {
        setLoading(false);
    }
  }, [filters]);

  // --- EFEITO PRINCIPAL DE CARREGAMENTO ---
  useEffect(() => {
    if (currentView === 'calls') {
        loadCallData();
    } else if (currentView === 'mailing') {
        loadMailingData();
    }
    // 'upload' e 'comparison' não carregam dados globais neste hook
  }, [currentView, loadCallData, loadMailingData]); 

  // --- PAGINAÇÃO CLIENT-SIDE PARA TABELA DE LIGAÇÕES ---
  useEffect(() => {
    if (currentView === 'calls') {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setTableData(allData.slice(startIndex, endIndex));
    }
  }, [currentPage, allData, pageSize, currentView]);


  const handleApplyFilters = () => {
    if (currentView === 'calls') loadCallData();
    if (currentView === 'mailing') loadMailingData();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    document.getElementById('recordings-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Meta dados para paginação
  const totalPages = Math.ceil(allData.length / pageSize);
  const paginationMeta: PaginationMeta = {
      paginaAtual: currentPage,
      porPagina: pageSize,
      totalPages: totalPages,
      temProximaPagina: currentPage < totalPages,
      temPaginaAnterior: currentPage > 1
  };

  // Calculate Aggregates for Lists
  const totalListasQty = listsData.reduce((acc, item) => acc + item.lista_quantidade, 0);
  const totalDiscadoQty = listsData.reduce((acc, item) => acc + item.total_discado, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar - Visível apenas nos Dashboards */}
      {(currentView === 'calls' || currentView === 'mailing') && (
        <aside className="w-80 p-4 fixed h-screen overflow-hidden hidden lg:block z-10 border-r border-slate-200 bg-white">
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
                pageSize={pageSize}
                setPageSize={setPageSize}
                currentView={currentView}
            />
            </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${(currentView === 'calls' || currentView === 'mailing') ? 'lg:ml-80' : 'mx-auto container'}`}>
        
        {/* HEADER DE NAVEGAÇÃO */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-20">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
                {currentView === 'calls' && 'Dashboard de Ligações'}
                {currentView === 'mailing' && 'Relatório de Importação'}
                {currentView === 'upload' && 'Upload de Bases'}
                {currentView === 'comparison' && 'Seleção de Bases'}
            </h2>
            <p className="text-slate-500 text-sm">
                {currentView === 'calls' && 'Analise gravações, tempo falado e status das chamadas.'}
                {currentView === 'mailing' && 'Verifique duplicidades e novos contatos inseridos.'}
                {currentView === 'upload' && 'Importe novas planilhas para o sistema.'}
                {currentView === 'comparison' && 'Selecione e compare bases de mailing.'}
            </p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
              <button 
                onClick={() => setCurrentView('calls')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    currentView === 'calls' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                  <Phone size={18} />
                  Ligações
              </button>
              <button 
                onClick={() => setCurrentView('mailing')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    currentView === 'mailing' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                  <PieChartIcon size={18} />
                  Mailing Stats
              </button>
              <button 
                onClick={() => setCurrentView('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    currentView === 'upload' 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                  <Upload size={18} />
                  Upload
              </button>
              <button 
                onClick={() => setCurrentView('comparison')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    currentView === 'comparison' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                  <GitCompare size={18} />
                  Comparar Bases
              </button>
          </div>
        </header>

        {/* --- VISÃO 1: DASHBOARD DE LIGAÇÕES --- */}
        {currentView === 'calls' && (
            <div className="animate-in fade-in duration-500 pb-20">
                
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-600" /> KPIs de Atendimento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <StatsCard 
                        title="Total Filtrado" 
                        value={callStats.total.toLocaleString()} 
                        icon={Activity} 
                        color="blue" 
                    />
                    <StatsCard 
                        title="Taxa de Atendimento" 
                        value={`${callStats.successRate}%`} 
                        icon={Percent} 
                        color="green" 
                        trend={callStats.successRate > 50 ? "Performance Positiva" : "Atenção Necessária"}
                    />
                    <StatsCard 
                        title="Duração Média" 
                        value={callStats.avgDuration} 
                        icon={Clock} 
                        color="orange" 
                    />
                    <StatsCard 
                        title="Total em Listas" 
                        value={totalListasQty.toLocaleString()} 
                        icon={Database} 
                        color="blue" 
                    />
                    <StatsCard 
                        title="Total Discado" 
                        value={totalDiscadoQty.toLocaleString()} 
                        icon={PhoneOutgoing} 
                        color="green" 
                    />
                    <StatsCard 
                        title="Total na Tela" 
                        value={tableData.length} 
                        icon={Phone} 
                        color="red" 
                    />
                </div>

                {/* Gráficos Exclusivos de Ligações */}
                {!loading && (
                    <Charts data={allData} listsData={listsData} />
                )}

                {/* Tabela de Gravações */}
                <div id="recordings-table" className="flex items-center gap-2 mb-4 text-slate-800 pt-4 border-t border-slate-200">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-lg">Registros Detalhados</h3>
                </div>
                
                <div className="min-h-[500px]">
                    <RecordingsTable 
                        data={tableData} 
                        pagination={paginationMeta} 
                        onPageChange={handlePageChange} 
                        isLoading={loading}
                    />
                </div>
            </div>
        )}

        {/* --- VISÃO 2: RELATÓRIO DE MAILING --- */}
        {currentView === 'mailing' && (
            <div className="animate-in fade-in duration-500 pb-20">
                
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" /> Performance de Importação
                </h3>

                {mailingGeneralStats ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatsCard 
                                title="Total Inserido" 
                                value={mailingGeneralStats.total_geral.toLocaleString()} 
                                icon={FileText} 
                                color="blue" 
                            />
                            <StatsCard 
                                title="Contatos Únicos" 
                                value={mailingGeneralStats.total_telefones_unicos.toLocaleString()} 
                                icon={Users} 
                                color="green" 
                            />
                            <StatsCard 
                                title="Duplicados" 
                                value={mailingGeneralStats.total_duplicados.toLocaleString()} 
                                icon={Copy} 
                                color="orange" 
                            />
                             <StatsCard 
                                title="Taxa Duplicidade Global" 
                                value={`${mailingGeneralStats.taxa_duplicacao_geral}%`} 
                                icon={Percent} 
                                color="red" 
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-slate-800 pt-4">
                            <Database className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-lg">Histórico de Bases Importadas</h3>
                        </div>
                        <div className="mb-8 min-h-[500px]">
                            <MailingStatsTable data={mailingList} />
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                        {loading ? <p>Carregando estatísticas...</p> : <p className="text-slate-500">Nenhum dado encontrado para os filtros selecionados.</p>}
                    </div>
                )}
            </div>
        )}

        {/* --- VISÃO 3: UPLOAD --- */}
        {currentView === 'upload' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MailingUpload />
            </div>
        )}

        {/* --- VISÃO 4: COMPARAÇÃO (NOVO) --- */}
        {currentView === 'comparison' && (
            <MailingComparison />
        )}

      </main>
    </div>
  );
}

export default App;