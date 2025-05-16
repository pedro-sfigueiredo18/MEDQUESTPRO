'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { getAllQuestions } from '@/lib/questionService';
import { 
  exportToWord, 
  exportToExcel, 
  exportToPDF, 
  exportToSocrative, 
  downloadFile 
} from '@/lib/exportUtils';

export default function Questoes() {
  const { currentUser } = useAuth();
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestoes, setSelectedQuestoes] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  
  // Carregar questões do localStorage ao montar o componente
  useEffect(() => {
    const loadQuestoes = async () => {
      try {
        setIsLoading(true);

        // Buscar todas as questões
        const questoesSalvas = await getAllQuestions();
        
        // Formatar as questões para exibição
        const questoesFormatadas = questoesSalvas.map(q => ({
          id: q.id,
          tema: q.tema || 'Sem tema',
          disciplina: currentUser?.disciplina || 'Medicina',
          dificuldade: q.nivelDificuldade || 'Médio',
          tipo: q.modeloQuestao || 'Múltipla Escolha',
          data: q.dataCriacao ? new Date(q.dataCriacao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          professor: currentUser?.name || 'Professor',
          faculdade: currentUser?.faculdade || 'Faculdade de Medicina',
          referencia: q.referencia || '',
          objetivoAprendizagem: q.objetivoAprendizagem || '',
          enunciado: q.enunciadoClinico || '',
          comando: q.comando || 'Qual a conduta mais adequada para este paciente?',
          alternativas: Array.isArray(q.alternativas) ? q.alternativas.map(alt => alt.texto || '') : [],
          respostaCorreta: q.alternativas && Array.isArray(q.alternativas) ? 
            String.fromCharCode(65 + q.alternativas.findIndex(alt => alt.isCorreta)) : '',
          comentarioExplicativo: q.explicacao || ''
        }));
        
        // Se não houver questões salvas, usar questões de exemplo
        if (questoesFormatadas.length === 0) {
          setQuestoes(questoesExemplo);
        } else {
          setQuestoes(questoesFormatadas);
        }
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
        // Em caso de erro, usar questões de exemplo
        setQuestoes(questoesExemplo);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestoes();
  }, [currentUser]);
  
  // Questões de exemplo para quando não há questões salvas
  const questoesExemplo = [
    {
      id: '1',
      tema: 'Infarto Agudo do Miocárdio',
      disciplina: 'Cardiologia',
      dificuldade: 'Médio',
      tipo: 'Múltipla Escolha',
      data: '2025-04-22',
      professor: currentUser?.name || 'Professor',
      faculdade: currentUser?.faculdade || 'Faculdade de Medicina',
      referencia: 'Harrison - Medicina Interna, 20ª edição, Capítulo 269',
      objetivoAprendizagem: 'Avaliar o conhecimento sobre o tratamento do infarto agudo do miocárdio com supradesnivelamento do segmento ST',
      enunciado: 'Paciente masculino, 62 anos, tabagista, hipertenso e diabético, dá entrada no pronto-socorro com dor precordial em aperto, de forte intensidade, com irradiação para o membro superior esquerdo, iniciada há 40 minutos. Ao exame físico apresenta-se hipotenso (PA 90x60 mmHg), taquicárdico (FC 110 bpm), com sudorese fria e extremidades frias. O eletrocardiograma mostra supradesnivelamento do segmento ST de 3 mm em derivações de parede anterior (V1 a V4).',
      comando: 'Qual a conduta mais adequada para este paciente?',
      alternativas: [
        'Administrar AAS, clopidogrel, heparina e realizar trombólise com alteplase.',
        'Administrar AAS, clopidogrel, heparina e encaminhar para angioplastia primária.',
        'Administrar AAS, clopidogrel, heparina e iniciar tratamento conservador com betabloqueador e estatina.',
        'Administrar AAS, clopidogrel, heparina e realizar ecocardiograma para avaliar função ventricular antes de decidir a conduta.',
        'Administrar AAS, clopidogrel, heparina e solicitar dosagem de troponina para confirmar o diagnóstico antes de decidir a conduta.'
      ],
      respostaCorreta: 'B',
      comentarioExplicativo: 'O paciente apresenta um quadro clínico típico de infarto agudo do miocárdio com supradesnivelamento do segmento ST (IAMCSST) de parede anterior. Neste cenário, a angioplastia primária é o tratamento de escolha quando disponível em tempo hábil (idealmente em até 90 minutos do primeiro contato médico). A trombólise seria uma alternativa caso a angioplastia não estivesse disponível em tempo adequado. O tratamento inicial deve incluir antiagregantes plaquetários (AAS e clopidogrel) e anticoagulação com heparina. Não se deve aguardar resultados de exames complementares como troponina ou ecocardiograma para iniciar o tratamento de reperfusão em um caso típico de IAMCSST.'
    },
    {
      id: '2',
      tema: 'Asma Brônquica',
      disciplina: 'Pneumologia',
      dificuldade: 'Fácil',
      tipo: 'Dissertativa',
      data: '2025-04-21',
      professor: currentUser?.name || 'Professor',
      faculdade: currentUser?.faculdade || 'Faculdade de Medicina',
      referencia: 'Tratado de Pneumologia - Sociedade Brasileira de Pneumologia',
      objetivoAprendizagem: 'Avaliar o conhecimento sobre o manejo da exacerbação de asma na emergência',
      enunciado: 'Paciente feminina, 25 anos, com história de asma desde a infância, comparece ao pronto-socorro com queixa de dispneia progressiva, tosse seca e chiado no peito há 2 dias. Refere que vem usando salbutamol spray a cada 2 horas, sem melhora significativa. Ao exame físico: taquipneica (FR 28 irpm), taquicárdica (FC 110 bpm), saturação de O2 92% em ar ambiente, sibilos expiratórios difusos à ausculta pulmonar.',
      comando: 'Qual a conduta mais adequada para esta paciente?',
      alternativas: [],
      respostaCorreta: '',
      comentarioExplicativo: 'A paciente apresenta uma exacerbação moderada a grave de asma, caracterizada por dispneia progressiva, uso frequente de broncodilatador de resgate sem melhora adequada, taquipneia, taquicardia e saturação de O2 reduzida. Neste cenário, a conduta mais adequada inclui a administração de broncodilatadores de curta ação (salbutamol e brometo de ipratrópio) por via inalatória e corticosteroides sistêmicos (via intravenosa na emergência). A paciente deve permanecer em observação para avaliação da resposta ao tratamento inicial. A adrenalina subcutânea não é tratamento de primeira linha para asma. A aminofilina tem uso limitado devido ao seu perfil de segurança. A antibioticoterapia não está indicada na ausência de sinais de infecção bacteriana. A intubação orotraqueal é reservada para casos de insuficiência respiratória iminente ou estabelecida.'
    },
    {
      id: '3',
      tema: 'Diabetes Mellitus Tipo 2',
      disciplina: 'Endocrinologia',
      dificuldade: 'Difícil',
      tipo: 'Múltipla Escolha',
      data: '2025-04-20',
      professor: currentUser?.name || 'Professor',
      faculdade: currentUser?.faculdade || 'Faculdade de Medicina',
      referencia: 'Williams Textbook of Endocrinology, 14ª edição',
      objetivoAprendizagem: 'Avaliar o conhecimento sobre a atualização terapêutica do diabetes mellitus tipo 2',
      enunciado: 'Paciente masculino, 58 anos, com diagnóstico de diabetes mellitus tipo 2 há 10 anos, em uso de metformina 1000mg 2x/dia e glibenclamida 5mg 2x/dia. Vem à consulta de rotina com queixas de poliúria, polidipsia e perda de peso de 3kg nos últimos 2 meses. Traz exames recentes: glicemia de jejum 210 mg/dL, HbA1c 9,2%, creatinina 1,1 mg/dL, microalbuminúria negativa, colesterol total 220 mg/dL, HDL 38 mg/dL, LDL 142 mg/dL, triglicerídeos 200 mg/dL.',
      comando: 'Qual a melhor conduta terapêutica para este paciente?',
      alternativas: [
        'Aumentar a dose de glibenclamida para 10mg 2x/dia.',
        'Substituir a glibenclamida por gliclazida e manter a metformina.',
        'Manter as medicações atuais e adicionar insulina NPH ao esquema terapêutico.',
        'Manter metformina e adicionar um inibidor de SGLT2.',
        'Suspender os antidiabéticos orais e iniciar esquema basal-bolus de insulina.'
      ],
      respostaCorreta: 'D',
      comentarioExplicativo: 'O paciente apresenta diabetes mellitus tipo 2 com controle glicêmico inadequado (HbA1c 9,2%) em uso de dois antidiabéticos orais (metformina e sulfonilureia). Considerando a função renal preservada e a ausência de microalbuminúria, a adição de um inibidor de SGLT2 seria a melhor opção terapêutica. Os inibidores de SGLT2 têm demonstrado benefícios cardiovasculares e renais, além de promoverem perda de peso e reduzirem a HbA1c. Aumentar a dose de glibenclamida aumentaria o risco de hipoglicemia sem benefício cardiovascular. A troca entre sulfonilureias teria impacto limitado. A insulinização é uma opção, mas geralmente reservada para casos mais graves ou quando outras opções orais falham. O esquema basal-bolus seria excessivo neste momento e dificultaria a adesão ao tratamento.'
    }
  ];
  
  // Função para alternar a seleção de uma questão
  const toggleQuestaoSelection = (questao: any) => {
    if (selectedQuestoes.some(q => q.id === questao.id)) {
      setSelectedQuestoes(selectedQuestoes.filter(q => q.id !== questao.id));
    } else {
      setSelectedQuestoes([...selectedQuestoes, questao]);
    }
  };
  
  // Função para alternar a seleção de todas as questões
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestoes([]);
    } else {
      setSelectedQuestoes([...questoes]);
    }
    setSelectAll(!selectAll);
  };
  
  // Funções de exportação para múltiplas questões
  const exportarWord = async () => {
    if (selectedQuestoes.length === 0) {
      setExportStatus('Selecione pelo menos uma questão para exportar.');
      return;
    }
    
    try {
      setIsExporting(true);
      setExportStatus('Exportando para Word...');
      
      const questoesFormatadas = selectedQuestoes.map(q => ({
        professor: q.professor,
        faculdade: q.faculdade,
        disciplina: q.disciplina,
        tema: q.tema,
        objetivoAprendizagem: q.objetivoAprendizagem,
        nivelDificuldade: q.dificuldade,
        modeloQuestao: q.tipo,
        enunciado: q.enunciado,
        comando: q.comando,
        alternativas: q.alternativas,
        respostaCorreta: q.respostaCorreta,
        comentarioExplicativo: q.comentarioExplicativo
      }));
      
      const blob = exportToWord(questoesFormatadas, { includeHeader: true, includeFooter: true, includeWatermark: true });
      
      downloadFile(blob, `questoes_${new Date().toISOString().split('T')[0]}.doc`);
      
      setExportStatus(`${selectedQuestoes.length} questões exportadas com sucesso para Word!`);
    } catch (error) {
      console.error('Erro ao exportar para Word:', error);
      setExportStatus('Erro ao exportar para Word. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportarExcel = async () => {
    if (selectedQuestoes.length === 0) {
      setExportStatus('Selecione pelo menos uma questão para exportar.');
      return;
    }
    
    try {
      setIsExporting(true);
      setExportStatus('Exportando para Excel...');
      
      const questoesFormatadas = selectedQuestoes.map(q => ({
        professor: q.professor,
        faculdade: q.faculdade,
        disciplina: q.disciplina,
        tema: q.tema,
        objetivoAprendizagem: q.objetivoAprendizagem,
        nivelDificuldade: q.dificuldade,
        modeloQuestao: q.tipo,
        enunciado: q.enunciado,
        comando: q.comando,
        alternativas: q.alternativas,
        respostaCorreta: q.respostaCorreta,
        comentarioExplicativo: q.comentarioExplicativo
      }));
      
      const blob = exportToExcel(questoesFormatadas, { includeHeader: true });
      
      downloadFile(blob, `questoes_${new Date().toISOString().split('T')[0]}.csv`);
      
      setExportStatus(`${selectedQuestoes.length} questões exportadas com sucesso para Excel!`);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      setExportStatus('Erro ao exportar para Excel. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportarPDF = async () => {
    if (selectedQuestoes.length === 0) {
      setExportStatus('Selecione pelo menos uma questão para exportar.');
      return;
    }
    
    try {
      setIsExporting(true);
      setExportStatus('Exportando para PDF...');
      
      const questoesFormatadas = selectedQuestoes.map(q => ({
        professor: q.professor,
        faculdade: q.faculdade,
        disciplina: q.disciplina,
        tema: q.tema,
        objetivoAprendizagem: q.objetivoAprendizagem,
        nivelDificuldade: q.dificuldade,
        modeloQuestao: q.tipo,
        enunciado: q.enunciado,
        comando: q.comando,
        alternativas: q.alternativas,
        respostaCorreta: q.respostaCorreta,
        comentarioExplicativo: q.comentarioExplicativo
      }));
      
      const blob = exportToPDF(questoesFormatadas, { includeHeader: true, includeFooter: true, includeWatermark: true });
      
      // Para PDF, abrimos em uma nova janela para impressão
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setExportStatus(`${selectedQuestoes.length} questões exportadas com sucesso para PDF!`);
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      setExportStatus('Erro ao exportar para PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportarSocrative = async () => {
    if (selectedQuestoes.length === 0) {
      setExportStatus('Selecione pelo menos uma questão para exportar.');
      return;
    }
    
    try {
      setIsExporting(true);
      setExportStatus('Exportando para Socrative...');
      
      const questoesFormatadas = selectedQuestoes.map(q => ({
        professor: q.professor,
        faculdade: q.faculdade,
        disciplina: q.disciplina,
        tema: q.tema,
        objetivoAprendizagem: q.objetivoAprendizagem,
        nivelDificuldade: q.dificuldade,
        modeloQuestao: q.tipo,
        enunciado: q.enunciado,
        comando: q.comando,
        alternativas: q.alternativas,
        respostaCorreta: q.respostaCorreta,
        comentarioExplicativo: q.comentarioExplicativo
      }));
      
      const blob = exportToSocrative(questoesFormatadas);
      
      downloadFile(blob, `questoes_socrative_${new Date().toISOString().split('T')[0]}.csv`);
      
      setExportStatus(`${selectedQuestoes.length} questões exportadas com sucesso para Socrative!`);
    } catch (error) {
      console.error('Erro ao exportar para Socrative:', error);
      setExportStatus('Erro ao exportar para Socrative. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#0a4d8c]">Minhas Questões</h1>
        <Link href="/criar-questao">
          <button className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a]">
            Nova Questão
          </button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Carregando questões...</p>
        </div>
      ) : questoes.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">Você ainda não tem questões salvas.</p>
          <Link href="/criar-questao">
            <button className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a]">
              Criar Primeira Questão
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Painel de exportação */}
          <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#0a4d8c] mb-2">Exportação em Lote</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedQuestoes.length === 0 
                    ? 'Selecione as questões que deseja exportar' 
                    : `${selectedQuestoes.length} questões selecionadas`}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={exportarWord}
                  disabled={isExporting || selectedQuestoes.length === 0}
                  className="px-3 py-1 bg-[#0a4d8c] text-white text-sm font-medium rounded-md hover:bg-[#083b6f] transition-colors disabled:opacity-50"
                >
                  Word
                </button>
                
                <button
                  onClick={exportarExcel}
                  disabled={isExporting || selectedQuestoes.length === 0}
                  className="px-3 py-1 bg-[#0a4d8c] text-white text-sm font-medium rounded-md hover:bg-[#083b6f] transition-colors disabled:opacity-50"
                >
                  Excel
                </button>
                
                <button
                  onClick={exportarPDF}
                  disabled={isExporting || selectedQuestoes.length === 0}
                  className="px-3 py-1 bg-[#0a4d8c] text-white text-sm font-medium rounded-md hover:bg-[#083b6f] transition-colors disabled:opacity-50"
                >
                  PDF
                </button>
                
                <button
                  onClick={exportarSocrative}
                  disabled={isExporting || selectedQuestoes.length === 0}
                  className="px-3 py-1 bg-[#0a4d8c] text-white text-sm font-medium rounded-md hover:bg-[#083b6f] transition-colors disabled:opacity-50"
                >
                  Socrative
                </button>
              </div>
            </div>
            
            {exportStatus && (
              <div className={`mt-2 p-2 rounded-md ${exportStatus.includes('Erro') || exportStatus.includes('Selecione') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {exportStatus}
              </div>
            )}
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-[#0a4d8c] focus:ring-[#0a4d8c] border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TEMA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DISCIPLINA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DIFICULDADE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TIPO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questoes.map((questao) => (
                  <tr 
                    key={questao.id}
                    className={selectedQuestoes.some(q => q.id === questao.id) ? 'bg-blue-50' : ''}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedQuestoes.some(q => q.id === questao.id)}
                          onChange={() => toggleQuestaoSelection(questao)}
                          className="h-4 w-4 text-[#0a4d8c] focus:ring-[#0a4d8c] border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{questao.tema}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{questao.disciplina}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{questao.dificuldade}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{questao.tipo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{questao.data}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/questoes/${questao.id}`} className="text-[#0a4d8c] hover:text-[#083b6a] mr-4">
                        Visualizar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      <div className="mt-8 text-center opacity-30">
        <Image 
          src="/images/logo.png" 
          alt="MD ACADÊMICO Logo" 
          width={200} 
          height={80} 
          className="mx-auto"
        />
      </div>
    </div>
  );
}
