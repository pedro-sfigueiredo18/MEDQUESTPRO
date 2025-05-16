'use client';

import { useState } from 'react';
import { QuestaoGerada } from '@/hooks/useQuestaoForm';

interface ExportQuestaoProps {
  questao: QuestaoGerada;
  professor?: string;
  faculdade?: string;
  disciplina?: string;
  referencia: string;
}

export default function ExportQuestao({ 
  questao, 
  professor = 'Professor', 
  faculdade = 'Faculdade de Medicina',
  disciplina = 'Medicina',
  referencia
}: ExportQuestaoProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Verificar se é uma questão de múltipla escolha
  const isMultipleChoice = questao.modeloQuestao?.includes('Múltipla Escolha');

  // Converter a questão para o formato esperado pelas funções de exportação
  const prepararQuestaoParaExportacao = () => {
    // Verificar se é uma questão de múltipla escolha
    if (isMultipleChoice) {
      // Verificar se alternativas existe e é um array
      const alternativasArray = Array.isArray(questao.alternativas) 
        ? questao.alternativas 
        : (typeof questao.alternativas === 'string' ? [] : questao.alternativas || []);
      
      // Converter alternativas do formato { texto, isCorreta } para array de strings
      const alternativasTexto = Array.isArray(alternativasArray) 
        ? alternativasArray.map(alt => {
            if (typeof alt === 'string') return alt;
            return alt?.texto || 'Alternativa não disponível';
          })
        : [];
      
      // Encontrar a letra da alternativa correta (A, B, C, D, E)
      const indexCorreta = Array.isArray(alternativasArray) 
        ? alternativasArray.findIndex(alt => alt?.isCorreta)
        : -1;
      const letraCorreta = indexCorreta >= 0 ? String.fromCharCode(65 + indexCorreta) : '';
      
      return {
        professor,
        faculdade,
        disciplina,
        tema: questao.tema || '',
        objetivoAprendizagem: questao.objetivoAprendizagem || '',
        nivelDificuldade: questao.nivelDificuldade || '',
        modeloQuestao: questao.modeloQuestao || '',
        enunciado: questao.enunciadoClinico || questao.enunciado || '',
        comando: questao.comando || 'Qual a conduta mais adequada para este paciente?',
        alternativas: alternativasTexto,
        respostaCorreta: letraCorreta,
        comentarioExplicativo: questao.explicacao || questao.comentarioExplicativo || '',
        tipoQuestao: 'multipla_escolha'
      };
    } else {
      // Para questões dissertativas
      return {
        professor,
        faculdade,
        disciplina,
        tema: questao.tema || '',
        objetivoAprendizagem: questao.objetivoAprendizagem || '',
        nivelDificuldade: questao.nivelDificuldade || '',
        modeloQuestao: questao.modeloQuestao || '',
        enunciado: questao.enunciadoClinico || questao.enunciado || '',
        comando: questao.comando || '',
        comandos: Array.isArray(questao.comandos) ? questao.comandos : [],
        respostaEsperada: questao.respostaEsperada || '',
        distribuicaoPontuacao: questao.distribuicaoPontuacao || '',
        comentarioExplicativo: questao.explicacao || questao.comentarioExplicativo || '',
        tipoQuestao: 'dissertativa'
      };
    }
  };

  // Função para baixar arquivo
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Funções de exportação específicas para questões
  const exportarWord = async () => {
    try {
      setIsExporting(true);
      setExportStatus('Exportando para Word...');
      
      const questaoFormatada = prepararQuestaoParaExportacao();
      
      // Criar HTML para o Word
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Questão MEDQUEST PRO</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; color: #0a4d8c; margin-bottom: 20px; }
            .questao { margin-bottom: 30px; page-break-inside: avoid; }
            .questao-titulo { color: #0a4d8c; font-size: 16px; font-weight: bold; }
            .questao-info { margin-bottom: 10px; }
            .questao-enunciado, .questao-comando { margin-bottom: 10px; }
            .alternativas { margin-left: 20px; margin-top: 10px; margin-bottom: 10px; }
            .alternativa { margin-bottom: 5px; }
            .alternativa-correta { color: green; }
            .comentario { margin-top: 10px; border-left: 3px solid #0a4d8c; padding-left: 10px; }
            .footer { text-align: center; color: #666; font-size: 10px; margin-top: 30px; }
            .watermark { 
              position: absolute; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%) rotate(45deg);
              color: #f0f0f0; 
              font-size: 100px; 
              z-index: -1; 
              opacity: 0.3;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDQUEST PRO</h1>
            <h2>Questão Gerada</h2>
          </div>
          
          <div class="watermark">MD ACADÊMICO</div>
          
          <div class="questao">
            <div class="questao-titulo">Questão</div>
            <div class="questao-info">
              <p><strong>Professor:</strong> ${questaoFormatada.professor}</p>
              <p><strong>Faculdade:</strong> ${questaoFormatada.faculdade}</p>
              <p><strong>Disciplina:</strong> ${questaoFormatada.disciplina}</p>
              <p><strong>Tema:</strong> ${questaoFormatada.tema}</p>
              <p><strong>Objetivo de Aprendizagem:</strong> ${questaoFormatada.objetivoAprendizagem}</p>
              <p><strong>Nível:</strong> ${questaoFormatada.nivelDificuldade}</p>
              <p><strong>Tipo:</strong> ${questaoFormatada.modeloQuestao}</p>
            </div>
            <div class="questao-enunciado">
              <p><strong>Enunciado:</strong></p>
              <p>${questaoFormatada.enunciado || ''}</p>
            </div>
      `;
      
      // Conteúdo específico para cada tipo de questão
      if (questaoFormatada.tipoQuestao === 'multipla_escolha') {
        // Adicionar comando
        htmlContent += `
          <div class="questao-comando">
            <p><strong>Comando:</strong></p>
            <p>${questaoFormatada.comando || ''}</p>
          </div>
        `;
        
        // Adicionar alternativas
        if (questaoFormatada.alternativas && questaoFormatada.alternativas.length > 0) {
          htmlContent += `<div class="alternativas">`;
          questaoFormatada.alternativas.forEach((alternativa, i) => {
            const letra = String.fromCharCode(65 + i); // A, B, C, D, E
            const isCorrect = questaoFormatada.respostaCorreta === letra;
            
            if (isCorrect) {
              htmlContent += `<div class="alternativa alternativa-correta">`;
            } else {
              htmlContent += `<div class="alternativa">`;
            }
            
            htmlContent += `${letra}) ${alternativa}</div>`;
          });
          htmlContent += `</div>`;
        }
        
        // Adicionar resposta correta
        if (questaoFormatada.respostaCorreta) {
          htmlContent += `
            <div class="resposta">
              <p><strong>Resposta Correta:</strong> Alternativa ${questaoFormatada.respostaCorreta}</p>
            </div>
          `;
        }
      } else {
        // Para questões dissertativas
        
        // Adicionar comandos
        if (questaoFormatada.comandos && questaoFormatada.comandos.length > 0) {
          htmlContent += `
            <div class="questao-comando">
              <p><strong>Comandos:</strong></p>
              <div class="comandos">
          `;
          
          questaoFormatada.comandos.forEach((comando, i) => {
            htmlContent += `<p>${comando}</p>`;
          });
          
          htmlContent += `
              </div>
            </div>
          `;
        } else if (questaoFormatada.comando) {
          htmlContent += `
            <div class="questao-comando">
              <p><strong>Comando:</strong></p>
              <p>${questaoFormatada.comando}</p>
            </div>
          `;
        }
        
        // Adicionar resposta esperada
        if (questaoFormatada.respostaEsperada) {
          htmlContent += `
            <div class="resposta-esperada">
              <p><strong>Resposta Esperada:</strong></p>
              <div style="margin-left: 20px;">
                <p>${questaoFormatada.respostaEsperada.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
          `;
        }
        
        // Adicionar distribuição de pontuação
        if (questaoFormatada.distribuicaoPontuacao) {
          htmlContent += `
            <div class="distribuicao-pontuacao">
              <p><strong>Distribuição de Pontuação:</strong></p>
              <div style="margin-left: 20px;">
                <p>${questaoFormatada.distribuicaoPontuacao.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
          `;
        }
      }
      
      // Adicionar comentário explicativo
      if (questaoFormatada.comentarioExplicativo) {
        htmlContent += `
          <div class="comentario">
            <p><strong>Comentário Explicativo:</strong></p>
            <p>${questaoFormatada.comentarioExplicativo.replace(/\n/g, '<br>')}</p>
          </div>
        `;
      }
      
      htmlContent += `
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} MD ACADÊMICO - Todos os direitos reservados</p>
            </div>
          </body>
        </html>
      `;
      
      // Criar blob com o conteúdo HTML
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      
      downloadFile(blob, `questao_${new Date().toISOString().split('T')[0]}.doc`);
      
      setExportStatus('Questão exportada com sucesso para Word!');
    } catch (error) {
      console.error('Erro ao exportar para Word:', error);
      setExportStatus('Erro ao exportar para Word. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportarExcel = async () => {
    try {
      setIsExporting(true);
      setExportStatus('Exportando para Excel...');
      
      const questaoFormatada = prepararQuestaoParaExportacao();
      
      // Criar CSV string com BOM para garantir compatibilidade com caracteres especiais
      let csvContent = "\uFEFF"; // BOM (Byte Order Mark) para UTF-8
      
      if (questaoFormatada.tipoQuestao === 'multipla_escolha') {
        // Adicionar cabeçalho para múltipla escolha
        csvContent += "Professor,Faculdade,Disciplina,Tema,Objetivo de Aprendizagem,Nível de Dificuldade,Modelo da Questão,Enunciado,Comando,Alternativa A,Alternativa B,Alternativa C,Alternativa D,Alternativa E,Resposta Correta,Comentário Explicativo\n";
        
        // Extrair alternativas individuais
        const altA = questaoFormatada.alternativas?.[0] || '';
        const altB = questaoFormatada.alternativas?.[1] || '';
        const altC = questaoFormatada.alternativas?.[2] || '';
        const altD = questaoFormatada.alternativas?.[3] || '';
        const altE = questaoFormatada.alternativas?.[4] || '';
        
        // Adicionar linha
        csvContent += `"${questaoFormatada.professor}","${questaoFormatada.faculdade}","${questaoFormatada.disciplina}","${questaoFormatada.tema}","${questaoFormatada.objetivoAprendizagem}","${questaoFormatada.nivelDificuldade}","${questaoFormatada.modeloQuestao}","${questaoFormatada.enunciado || ''}","${questaoFormatada.comando || ''}","${altA}","${altB}","${altC}","${altD}","${altE}","${questaoFormatada.respostaCorreta || ''}","${questaoFormatada.comentarioExplicativo || ''}"\n`;
      } else {
        // Adicionar cabeçalho para dissertativa
        csvContent += "Professor,Faculdade,Disciplina,Tema,Objetivo de Aprendizagem,Nível de Dificuldade,Modelo da Questão,Enunciado,Comandos,Resposta Esperada,Distribuição de Pontuação,Comentário Explicativo\n";
        
        // Formatar comandos como uma string
        const comandosStr = Array.isArray(questaoFormatada.comandos) 
          ? questaoFormatada.comandos.join('\n') 
          : questaoFormatada.comando || '';
        
        // Adicionar linha
        csvContent += `"${questaoFormatada.professor}","${questaoFormatada.faculdade}","${questaoFormatada.disciplina}","${questaoFormatada.tema}","${questaoFormatada.objetivoAprendizagem}","${questaoFormatada.nivelDificuldade}","${questaoFormatada.modeloQuestao}","${questaoFormatada.enunciado || ''}","${comandosStr}","${questaoFormatada.respostaEsperada || ''}","${questaoFormatada.distribuicaoPontuacao || ''}","${questaoFormatada.comentarioExplicativo || ''}"\n`;
      }
      
      // Criar blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      
      downloadFile(blob, `questao_${new Date().toISOString().split('T')[0]}.csv`);
      
      setExportStatus('Questão exportada com sucesso para Excel!');
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      setExportStatus('Erro ao exportar para Excel. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportarPDF = async () => {
    try {
      setIsExporting(true);
      setExportStatus('Exportando para PDF...');
      
      const questaoFormatada = prepararQuestaoParaExportacao();
      
      // Criar HTML para impressão
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Questão MEDQUEST PRO</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; color: #0a4d8c; margin-bottom: 20px; }
            .questao { margin-bottom: 30px; page-break-inside: avoid; }
            .questao-titulo { color: #0a4d8c; font-size: 16px; font-weight: bold; }
            .questao-info { margin-bottom: 10px; }
            .questao-enunciado, .questao-comando { margin-bottom: 10px; }
            .alternativas { margin-left: 20px; margin-top: 10px; margin-bottom: 10px; }
            .alternativa { margin-bottom: 5px; }
            .alternativa-correta { color: green; }
            .comentario { margin-top: 10px; border-left: 3px solid #0a4d8c; padding-left: 10px; }
            .footer { text-align: center; color: #666; font-size: 10px; margin-top: 30px; }
            .watermark { 
              position: absolute; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%) rotate(45deg);
              color: #f0f0f0; 
              font-size: 100px; 
              z-index: -1; 
              opacity: 0.3;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDQUEST PRO</h1>
            <h2>Questão Gerada</h2>
          </div>
          
          <div class="watermark">MD ACADÊMICO</div>
          
          <div class="questao">
            <div class="questao-titulo">Questão</div>
            <div class="questao-info">
              <p><strong>Professor:</strong> ${questaoFormatada.professor}</p>
              <p><strong>Faculdade:</strong> ${questaoFormatada.faculdade}</p>
              <p><strong>Disciplina:</strong> ${questaoFormatada.disciplina}</p>
              <p><strong>Tema:</strong> ${questaoFormatada.tema}</p>
              <p><strong>Objetivo de Aprendizagem:</strong> ${questaoFormatada.objetivoAprendizagem}</p>
              <p><strong>Nível:</strong> ${questaoFormatada.nivelDificuldade}</p>
              <p><strong>Tipo:</strong> ${questaoFormatada.modeloQuestao}</p>
            </div>
            <div class="questao-enunciado">
              <p><strong>Enunciado:</strong></p>
              <p>${questaoFormatada.enunciado || ''}</p>
            </div>
      `;
      
      // Conteúdo específico para cada tipo de questão
      if (questaoFormatada.tipoQuestao === 'multipla_escolha') {
        // Adicionar comando
        htmlContent += `
          <div class="questao-comando">
            <p><strong>Comando:</strong></p>
            <p>${questaoFormatada.comando || ''}</p>
          </div>
        `;
        
        // Adicionar alternativas
        if (questaoFormatada.alternativas && questaoFormatada.alternativas.length > 0) {
          htmlContent += `<div class="alternativas">`;
          questaoFormatada.alternativas.forEach((alternativa, i) => {
            const letra = String.fromCharCode(65 + i); // A, B, C, D, E
            const isCorrect = questaoFormatada.respostaCorreta === letra;
            
            if (isCorrect) {
              htmlContent += `<div class="alternativa alternativa-correta">`;
            } else {
              htmlContent += `<div class="alternativa">`;
            }
            
            htmlContent += `${letra}) ${alternativa}</div>`;
          });
          htmlContent += `</div>`;
        }
        
        // Adicionar resposta correta
        if (questaoFormatada.respostaCorreta) {
          htmlContent += `
            <div class="resposta">
              <p><strong>Resposta Correta:</strong> Alternativa ${questaoFormatada.respostaCorreta}</p>
            </div>
          `;
        }
      } else {
        // Para questões dissertativas
        
        // Adicionar comandos
        if (questaoFormatada.comandos && questaoFormatada.comandos.length > 0) {
          htmlContent += `
            <div class="questao-comando">
              <p><strong>Comandos:</strong></p>
              <div class="comandos">
          `;
          
          questaoFormatada.comandos.forEach((comando, i) => {
            htmlContent += `<p>${comando}</p>`;
          });
          
          htmlContent += `
              </div>
            </div>
          `;
        } else if (questaoFormatada.comando) {
          htmlContent += `
            <div class="questao-comando">
              <p><strong>Comando:</strong></p>
              <p>${questaoFormatada.comando}</p>
            </div>
          `;
        }
        
        // Adicionar resposta esperada
        if (questaoFormatada.respostaEsperada) {
          htmlContent += `
            <div class="resposta-esperada">
              <p><strong>Resposta Esperada:</strong></p>
              <div style="margin-left: 20px;">
                <p>${questaoFormatada.respostaEsperada.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
          `;
        }
        
        // Adicionar distribuição de pontuação
        if (questaoFormatada.distribuicaoPontuacao) {
          htmlContent += `
            <div class="distribuicao-pontuacao">
              <p><strong>Distribuição de Pontuação:</strong></p>
              <div style="margin-left: 20px;">
                <p>${questaoFormatada.distribuicaoPontuacao.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
          `;
        }
      }
      
      // Adicionar comentário explicativo
      if (questaoFormatada.comentarioExplicativo) {
        htmlContent += `
          <div class="comentario">
            <p><strong>Comentário Explicativo:</strong></p>
            <p>${questaoFormatada.comentarioExplicativo.replace(/\n/g, '<br>')}</p>
          </div>
        `;
      }
      
      htmlContent += `
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} MD ACADÊMICO - Todos os direitos reservados</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()">Imprimir PDF</button>
            </div>
          </body>
        </html>
      `;
      
      // Criar blob com o conteúdo HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Para PDF, abrimos em uma nova janela para impressão
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setExportStatus('Questão exportada com sucesso para PDF!');
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      setExportStatus('Erro ao exportar para PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportarSocrative = async () => {
    try {
      setIsExporting(true);
      setExportStatus('Exportando para Socrative...');
      
      const questaoFormatada = prepararQuestaoParaExportacao();
      
      // Criar CSV string com BOM para garantir compatibilidade com caracteres especiais
      let csvContent = "\uFEFF"; // BOM (Byte Order Mark) para UTF-8
      
      // Adicionar cabeçalho
      csvContent += "Type,Question,Answer A,Answer B,Answer C,Answer D,Answer E,Correct Answer,Explanation\n";
      
      // Adicionar linha
      if (questaoFormatada.tipoQuestao === 'multipla_escolha') {
        csvContent += `"Multiple Choice","${questaoFormatada.enunciado || ''}\n${questaoFormatada.comando || ''}","${questaoFormatada.alternativas?.[0] || ''}","${questaoFormatada.alternativas?.[1] || ''}","${questaoFormatada.alternativas?.[2] || ''}","${questaoFormatada.alternativas?.[3] || ''}","${questaoFormatada.alternativas?.[4] || ''}","${questaoFormatada.respostaCorreta || ''}","${questaoFormatada.comentarioExplicativo || ''}"\n`;
      } else {
        // Para questões dissertativas, usamos o formato "Short Answer" do Socrative
        const comandosStr = Array.isArray(questaoFormatada.comandos) 
          ? questaoFormatada.comandos.join('\n') 
          : questaoFormatada.comando || '';
          
        csvContent += `"Short Answer","${questaoFormatada.enunciado || ''}\n${comandosStr}","","","","","","","${questaoFormatada.respostaEsperada || ''}\n\n${questaoFormatada.comentarioExplicativo || ''}"\n`;
      }
      
      // Criar blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      
      downloadFile(blob, `questao_socrative_${new Date().toISOString().split('T')[0]}.csv`);
      
      setExportStatus('Questão exportada com sucesso para Socrative!');
    } catch (error) {
      console.error('Erro ao exportar para Socrative:', error);
      setExportStatus('Erro ao exportar para Socrative. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={exportarWord}
        disabled={isExporting}
        className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a] disabled:bg-gray-400"
      >
        Exportar para Word
      </button>
      <button
        onClick={exportarExcel}
        disabled={isExporting}
        className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a] disabled:bg-gray-400"
      >
        Exportar para Excel
      </button>
      <button
        onClick={exportarPDF}
        disabled={isExporting}
        className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a] disabled:bg-gray-400"
      >
        Exportar para PDF
      </button>
      <button
        onClick={exportarSocrative}
        disabled={isExporting}
        className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a] disabled:bg-gray-400"
      >
        Exportar para Socrative
      </button>
      
      {exportStatus && (
        <div className="col-span-2 mt-2 text-center">
          <p className={isExporting ? "text-blue-600" : "text-green-600"}>
            {exportStatus}
          </p>
        </div>
      )}
    </div>
  );
}
