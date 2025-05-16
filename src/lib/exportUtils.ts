// Utilitários para exportação de questões em diferentes formatos
import { Questao } from '@/types/questao';

// Tipo para as opções de exportação
export type ExportOptions = {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeWatermark?: boolean;
};

// Função simplificada para exportar para Excel (formato geral)
export const exportToExcel = (questoes: Questao[], options: ExportOptions = {}) => {
  // Criar CSV string
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Adicionar cabeçalho
  csvContent += "Professor,Faculdade,Disciplina,Tema,Objetivo de Aprendizagem,Nível de Dificuldade,Modelo da Questão,Enunciado,Comando,Alternativa A,Alternativa B,Alternativa C,Alternativa D,Alternativa E,Resposta Correta,Comentário Explicativo\n";
  
  // Adicionar linhas
  questoes.forEach(q => {
    // Extrair alternativas individuais
    const altA = q.alternativas?.[0] || '';
    const altB = q.alternativas?.[1] || '';
    const altC = q.alternativas?.[2] || '';
    const altD = q.alternativas?.[3] || '';
    const altE = q.alternativas?.[4] || '';
    
    csvContent += `"${q.professor}","${q.faculdade}","${q.disciplina}","${q.tema}","${q.objetivoAprendizagem}","${q.nivelDificuldade}","${q.modeloQuestao}","${q.enunciado || ''}","${q.comando || ''}","${altA}","${altB}","${altC}","${altD}","${altE}","${q.respostaCorreta || ''}","${q.comentarioExplicativo || ''}"\n`;
  });
  
  // Criar blob
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return blob;
};

// Função simplificada para exportar para Excel no formato Socrative
export const exportToSocrative = (questoes: Questao[]) => {
  // Criar CSV string
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Adicionar cabeçalho
  csvContent += "Type,Question,Answer A,Answer B,Answer C,Answer D,Answer E,Correct Answer,Explanation\n";
  
  // Adicionar linhas
  questoes.forEach(q => {
    if (q.modeloQuestao.includes('Múltipla Escolha') || q.modeloQuestao.includes('Multiple Choice')) {
      csvContent += `"Multiple Choice","${q.enunciado || ''}\n${q.comando || ''}","${q.alternativas?.[0] || ''}","${q.alternativas?.[1] || ''}","${q.alternativas?.[2] || ''}","${q.alternativas?.[3] || ''}","${q.alternativas?.[4] || ''}","${q.respostaCorreta || ''}","${q.comentarioExplicativo || ''}"\n`;
    } else {
      csvContent += `"Short Answer","${q.enunciado || ''}\n${q.comando || ''}","","","","","","","${q.comentarioExplicativo || ''}"\n`;
    }
  });
  
  // Criar blob
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return blob;
};

// Função simplificada para exportar para PDF (usando HTML para impressão)
export const exportToPDF = (questoes: Questao[], options: ExportOptions = {}) => {
  // Criar HTML para impressão
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Questões MEDQUEST PRO</title>
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
  `;
  
  // Adicionar cabeçalho
  if (options.includeHeader) {
    htmlContent += `
      <div class="header">
        <h1>MEDQUEST PRO</h1>
        <h2>Questões Geradas</h2>
      </div>
    `;
  }
  
  // Adicionar marca d'água
  if (options.includeWatermark) {
    htmlContent += `
      <div class="watermark">MD ACADÊMICO</div>
    `;
  }
  
  // Adicionar questões
  questoes.forEach((questao, index) => {
    htmlContent += `
      <div class="questao">
        <div class="questao-titulo">Questão ${index + 1}</div>
        <div class="questao-info">
          <p><strong>Professor:</strong> ${questao.professor || 'Professor'}</p>
          <p><strong>Faculdade:</strong> ${questao.faculdade || 'Faculdade de Medicina'}</p>
          <p><strong>Disciplina:</strong> ${questao.disciplina || 'Medicina'}</p>
          <p><strong>Tema:</strong> ${questao.tema}</p>
          <p><strong>Objetivo de Aprendizagem:</strong> ${questao.objetivoAprendizagem}</p>
          <p><strong>Nível:</strong> ${questao.nivelDificuldade}</p>
          <p><strong>Tipo:</strong> ${questao.modeloQuestao}</p>
        </div>
        <div class="questao-enunciado">
          <p><strong>Enunciado:</strong></p>
          <p>${questao.enunciado || ''}</p>
        </div>
        <div class="questao-comando">
          <p><strong>Comando:</strong></p>
          <p>${questao.comando || ''}</p>
        </div>
    `;
    
    // Adicionar alternativas se for múltipla escolha
    if ((questao.modeloQuestao.includes('Múltipla Escolha') || questao.modeloQuestao.includes('Multiple Choice')) && questao.alternativas && questao.alternativas.length > 0) {
      htmlContent += `<div class="alternativas">`;
      questao.alternativas.forEach((alternativa, i) => {
        const letra = String.fromCharCode(65 + i); // A, B, C, D, E
        const isCorrect = questao.respostaCorreta === letra;
        
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
    if (questao.respostaCorreta) {
      htmlContent += `
        <div class="resposta">
          <p><strong>Resposta Correta:</strong> Alternativa ${questao.respostaCorreta}</p>
        </div>
      `;
    }
    
    // Adicionar comentário explicativo
    if (questao.comentarioExplicativo) {
      htmlContent += `
        <div class="comentario">
          <p><strong>Comentário Explicativo:</strong></p>
          <p>${questao.comentarioExplicativo}</p>
        </div>
      `;
    }
    
    htmlContent += `</div>`;
  });
  
  // Adicionar rodapé
  if (options.includeFooter) {
    htmlContent += `
      <div class="footer">
        <p>© ${new Date().getFullYear()} MD Ensino - Todos os direitos reservados</p>
      </div>
    `;
  }
  
  // Adicionar botão de impressão
  htmlContent += `
    <div class="no-print" style="text-align: center; margin-top: 20px;">
      <button onclick="window.print()">Imprimir PDF</button>
    </div>
  `;
  
  // Fechar HTML
  htmlContent += `
    </body>
    </html>
  `;
  
  // Criar blob com o conteúdo HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return blob;
};

// Função simplificada para exportar para Word (usando HTML)
export const exportToWord = (questoes: Questao[], options: ExportOptions = {}) => {
  // Usar o mesmo HTML do PDF, mas sem o botão de impressão
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Questões MEDQUEST PRO</title>
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
  `;
  
  // Adicionar cabeçalho
  if (options.includeHeader) {
    htmlContent += `
      <div class="header">
        <h1>MEDQUEST PRO</h1>
        <h2>Questões Geradas</h2>
      </div>
    `;
  }
  
  // Adicionar marca d'água
  if (options.includeWatermark) {
    htmlContent += `
      <div class="watermark">MD ACADÊMICO</div>
    `;
  }
  
  // Adicionar questões
  questoes.forEach((questao, index) => {
    htmlContent += `
      <div class="questao">
        <div class="questao-titulo">Questão ${index + 1}</div>
        <div class="questao-info">
          <p><strong>Professor:</strong> ${questao.professor || 'Professor'}</p>
          <p><strong>Faculdade:</strong> ${questao.faculdade || 'Faculdade de Medicina'}</p>
          <p><strong>Disciplina:</strong> ${questao.disciplina || 'Medicina'}</p>
          <p><strong>Tema:</strong> ${questao.tema}</p>
          <p><strong>Objetivo de Aprendizagem:</strong> ${questao.objetivoAprendizagem}</p>
          <p><strong>Nível:</strong> ${questao.nivelDificuldade}</p>
          <p><strong>Tipo:</strong> ${questao.modeloQuestao}</p>
        </div>
        <div class="questao-enunciado">
          <p><strong>Enunciado:</strong></p>
          <p>${questao.enunciado || ''}</p>
        </div>
        <div class="questao-comando">
          <p><strong>Comando:</strong></p>
          <p>${questao.comando || ''}</p>
        </div>
    `;
    
    // Adicionar alternativas se for múltipla escolha
    if ((questao.modeloQuestao.includes('Múltipla Escolha') || questao.modeloQuestao.includes('Multiple Choice')) && questao.alternativas && questao.alternativas.length > 0) {
      htmlContent += `<div class="alternativas">`;
      questao.alternativas.forEach((alternativa, i) => {
        const letra = String.fromCharCode(65 + i); // A, B, C, D, E
        const isCorrect = questao.respostaCorreta === letra;
        
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
    if (questao.respostaCorreta) {
      htmlContent += `
        <div class="resposta">
          <p><strong>Resposta Correta:</strong> Alternativa ${questao.respostaCorreta}</p>
        </div>
      `;
    }
    
    // Adicionar comentário explicativo
    if (questao.comentarioExplicativo) {
      htmlContent += `
        <div class="comentario">
          <p><strong>Comentário Explicativo:</strong></p>
          <p>${questao.comentarioExplicativo}</p>
        </div>
      `;
    }
    
    htmlContent += `</div>`;
  });
  
  // Adicionar rodapé
  if (options.includeFooter) {
    htmlContent += `
      <div class="footer">
        <p>© ${new Date().getFullYear()} MD Ensino - Todos os direitos reservados</p>
      </div>
    `;
  }
  
  // Fechar HTML
  htmlContent += `
    </body>
    </html>
  `;
  
  // Criar blob com o conteúdo HTML
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  return blob;
};

// Função para baixar arquivo
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
