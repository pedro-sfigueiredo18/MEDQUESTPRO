'use client';

import { useState } from 'react';
import { Questao } from '@/types/questao';
import { 
  exportToExcel, 
  exportToSocrative, 
  exportToPDF, 
  exportToWord, 
  downloadFile,
  ExportOptions as ExportOptionsType
} from '@/lib/exportUtils';

interface ExportOptionsProps {
  questao?: Questao;
  questoes?: Questao[];
  onClose?: () => void;
  isAdminReport?: boolean;
}

export default function ExportOptions({ questao, questoes, onClose, isAdminReport = false }: ExportOptionsProps) {
  const [options, setOptions] = useState<ExportOptionsType>({
    includeHeader: true,
    includeFooter: true,
    includeWatermark: true
  });

  const itemsToExport = questao ? [questao] : questoes || [];

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };

  const handleExportExcel = () => {
    try {
      const blob = exportToExcel(itemsToExport, options);
      const filename = isAdminReport 
        ? 'relatorio_admin_medquest.xlsx' 
        : (questao ? `questao_${questao.id}.xlsx` : 'questoes_medquest.xlsx');
      downloadFile(blob, filename);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      alert('Erro ao exportar para Excel. Por favor, tente novamente.');
    }
  };

  const handleExportSocrative = () => {
    try {
      const blob = exportToSocrative(itemsToExport);
      const filename = 'questoes_socrative.xlsx';
      downloadFile(blob, filename);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao exportar para Socrative:', error);
      alert('Erro ao exportar para Socrative. Por favor, tente novamente.');
    }
  };

  const handleExportPDF = () => {
    try {
      const blob = exportToPDF(itemsToExport, options);
      const filename = isAdminReport 
        ? 'relatorio_admin_medquest.pdf' 
        : (questao ? `questao_${questao.id}.pdf` : 'questoes_medquest.pdf');
      downloadFile(blob, filename);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      alert('Erro ao exportar para PDF. Por favor, tente novamente.');
    }
  };

  const handleExportWord = () => {
    try {
      const blob = exportToWord(itemsToExport, options);
      const filename = isAdminReport 
        ? 'relatorio_admin_medquest.docx' 
        : (questao ? `questao_${questao.id}.docx` : 'questoes_medquest.docx');
      downloadFile(blob, filename);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao exportar para Word:', error);
      alert('Erro ao exportar para Word. Por favor, tente novamente.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-[#0a4d8c] mb-4">Opções de Exportação</h3>
      
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="includeHeader"
            name="includeHeader"
            checked={options.includeHeader}
            onChange={handleOptionChange}
            className="mr-2"
          />
          <label htmlFor="includeHeader">Incluir cabeçalho</label>
        </div>
        
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="includeFooter"
            name="includeFooter"
            checked={options.includeFooter}
            onChange={handleOptionChange}
            className="mr-2"
          />
          <label htmlFor="includeFooter">Incluir rodapé</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeWatermark"
            name="includeWatermark"
            checked={options.includeWatermark}
            onChange={handleOptionChange}
            className="mr-2"
          />
          <label htmlFor="includeWatermark">Incluir marca d'água</label>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Exportar Excel
        </button>
        
        <button
          onClick={handleExportSocrative}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Exportar Socrative
        </button>
        
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Exportar PDF
        </button>
        
        <button
          onClick={handleExportWord}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Exportar Word
        </button>
      </div>
      
      {onClose && (
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
