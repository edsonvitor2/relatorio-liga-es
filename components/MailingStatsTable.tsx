
import React from 'react';
import { MailingStat } from '../types';
import { Database, Calendar, Users, Copy } from 'lucide-react';

interface MailingStatsTableProps {
  data: MailingStat[];
}

const MailingStatsTable: React.FC<MailingStatsTableProps> = ({ data }) => {
  if (data.length === 0) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
             <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Database className="h-6 w-6 text-slate-400" />
             </div>
             <p className="text-slate-500">Nenhum dado de importação encontrado para o período.</p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome da Base / Mailing</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data Importação</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Inserido</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contatos Únicos</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duplicados</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Taxa Duplicação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{row.nome_malling}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    {new Date(row.data_primeira_insercao).toLocaleDateString()}
                    <span className="text-xs ml-1 opacity-70">
                         {new Date(row.data_primeira_insercao).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-medium text-slate-900">{row.total_geral.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center text-sm text-green-700 font-medium">
                      <Users className="w-4 h-4 mr-1.5" />
                      {row.total_telefones_unicos.toLocaleString()}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center text-sm text-orange-600">
                      <Copy className="w-4 h-4 mr-1.5" />
                      {row.total_duplicados.toLocaleString()}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.taxa_duplicacao > 20 ? 'bg-red-100 text-red-800' : 
                      row.taxa_duplicacao > 10 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                  }`}>
                    {row.taxa_duplicacao}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MailingStatsTable;
