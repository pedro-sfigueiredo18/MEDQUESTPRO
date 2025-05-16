'use client';

/**
 * Serviço para integração com o webhook do N8n
 * Este serviço permite enviar dados para o webhook do N8n e processar a resposta
 */

// URL do webhook do N8n (teste)
const WEBHOOK_URL = 'https://n8n.mdensino.com.br/webhook-test/medquest';

// Interface para os dados enviados ao webhook
export interface WebhookRequestData {
  tema: string;
  objetivo: string;
  dificuldade: string;
  modelo: string;
  arquivo?: string;
}

// Interface para a resposta do webhook
export interface WebhookResponseData {
  output: string;
}

// Interface para a questão processada
export interface ProcessedQuestion {
  tema: string;
  objetivoAprendizagem: string;
  nivelDificuldade: string;
  modeloQuestao: string;
  enunciadoClinico: string;
  alternativas?: {
    texto: string;
    isCorreta: boolean;
  }[];
  explicacao?: string;
  comando?: string;
  comandos?: string[];
  respostaEsperada?: string;
  respostaCorreta?: string;
  distribuicaoPontuacao?: string;
  comentarioExplicativo?: string;
}

/**
 * Processa o texto completo e extrai todas as seções de uma vez
 * @param texto Texto completo da questão
 * @returns Questão processada
 */
const processarTextoCompleto = (texto: string): ProcessedQuestion => {
  console.log('[WEBHOOK_PROCESS] Iniciando processamento de texto completo');
  
  // Normalizar quebras de linha para facilitar o processamento
  let textoNormalizado = texto
    .replace(/\\n/g, '\n')  // Converter \n literal para quebra de linha real
    .replace(/\r\n/g, '\n') // Normalizar quebras de linha Windows
    .replace(/\n{3,}/g, '\n\n'); // Reduzir múltiplas quebras para no máximo duas
  
  console.log('[WEBHOOK_PROCESS] Texto normalizado (primeiros 200 caracteres):', 
             textoNormalizado.substring(0, 200).replace(/\n/g, '\\n') + '...');
  
  // Dividir o texto em seções principais usando padrões de cabeçalho
  const secoes: Record<string, string | string[]> = {};
  
  // Extrair Tema
  const temaMatch = textoNormalizado.match(/\*\*Tema( da Questão)?:\*\*(.*?)(?=\*\*Objetivo|\*\*Nível|\*\*Modelo|\*\*Enunciado|\*\*Referência|\s*$)/s);
  if (temaMatch) {
    secoes.tema = temaMatch[2].trim();
    console.log('[WEBHOOK_PROCESS] Tema extraído:', secoes.tema);
  }
  
  // Extrair Objetivo de Aprendizagem
  const objetivoMatch = textoNormalizado.match(/\*\*Objetivo( de Aprendizagem)?:\*\*(.*?)(?=\*\*Nível|\*\*Modelo|\*\*Enunciado|\*\*Referência|\s*$)/s);
  if (objetivoMatch) {
    secoes.objetivoAprendizagem = objetivoMatch[2].trim();
    console.log('[WEBHOOK_PROCESS] Objetivo extraído (primeiros 50 caracteres):', 
               secoes.objetivoAprendizagem.substring(0, 50) + '...');
  }
  
  // Extrair Nível de Dificuldade
  const dificuldadeMatch = textoNormalizado.match(/\*\*Nível( de Dificuldade)?:\*\*(.*?)(?=\*\*Modelo|\*\*Enunciado|\*\*Referência|\s*$)/s);
  if (dificuldadeMatch) {
    secoes.nivelDificuldade = dificuldadeMatch[2].trim();
    console.log('[WEBHOOK_PROCESS] Nível de Dificuldade extraído:', secoes.nivelDificuldade);
  } else {
    secoes.nivelDificuldade = 'Médio'; // Valor padrão
  }
  
  // Extrair Referência Científica
  const referenciaMatch = textoNormalizado.match(/\*\*Referência( Científica)?:\*\*(.*?)(?=\*\*Tema|\*\*Objetivo|\*\*Nível|\*\*Modelo|\*\*Enunciado|\s*$)/s);
  if (referenciaMatch) {
    secoes.referencia = referenciaMatch[2].trim();
    console.log('[WEBHOOK_PROCESS] Referência extraída:', secoes.referencia);
  }
  
  // Extrair Modelo
  const modeloMatch = textoNormalizado.match(/\*\*Modelo( da Questão)?:\*\*(.*?)(?=\*\*Enunciado|\*\*Referência|\s*$)/s);
  if (modeloMatch) {
    secoes.modeloQuestao = modeloMatch[2].trim();
    console.log('[WEBHOOK_PROCESS] Modelo extraído:', secoes.modeloQuestao);
  } else {
    secoes.modeloQuestao = 'Múltipla Escolha'; // Valor padrão
  }
  
  // Extrair Enunciado Clínico
  const enunciadoMatch = textoNormalizado.match(/\*\*Enunciado( Clínico)?( Detalhado)?:\*\*(.*?)(?=\*\*Alternativas|\*\*Comandos|\*\*Comando|\*\*Explicação|\*\*Resposta|\s*$)/s);
  if (enunciadoMatch) {
    secoes.enunciadoClinico = enunciadoMatch[3].trim();
    console.log('[WEBHOOK_PROCESS] Enunciado extraído (primeiros 50 caracteres):', 
               secoes.enunciadoClinico.substring(0, 50) + '...');
  }
  
  // Verificar se é uma questão de múltipla escolha ou dissertativa
  const isMultipleChoice = secoes.modeloQuestao?.toString().toLowerCase().includes('múltipla escolha');
  
  if (isMultipleChoice) {
    // Processar como questão de múltipla escolha
    
    // Extrair Alternativas - usando padrões mais flexíveis
    let alternativasTexto = '';
    
    // Padrão 1: Formato padrão com **Alternativas:**
    const alternativasMatch = textoNormalizado.match(/\*\*Alternativas:\*\*(.*?)(?=\*\*Explicação|\*\*Resposta|\*\*Comentário|\s*$)/s);
    
    // Padrão 2: Formato alternativo com letras a), b), c)
    const alternativasMatch2 = !alternativasMatch && textoNormalizado.match(/(?:\n|\s)([a-e]\).*?)(?=\*\*Explicação|\*\*Resposta|\*\*Comentário|\n\s*\*\*|\s*$)/s);
    
    // Padrão 3: Buscar qualquer conteúdo entre Enunciado e Explicação/Resposta/Comentário
    const explicacaoMatch = textoNormalizado.match(/\*\*Explicação:\*\*(.*?)(?=\s*$)/s);
    const respostaMatch = textoNormalizado.match(/\*\*Resposta( Correta)?:\*\*(.*?)(?=\*\*Explicação|\*\*Comentário|\s*$)/si);
    const comentarioMatch = textoNormalizado.match(/\*\*Comentário( Explicativo)?:\*\*(.*?)(?=\s*$)/si);
    
    const fimEnunciado = enunciadoMatch ? textoNormalizado.indexOf(enunciadoMatch[0]) + enunciadoMatch[0].length : 0;
    const inicioExplicacao = explicacaoMatch ? textoNormalizado.indexOf(explicacaoMatch[0]) : textoNormalizado.length;
    const inicioResposta = respostaMatch ? textoNormalizado.indexOf(respostaMatch[0]) : textoNormalizado.length;
    const inicioComentario = comentarioMatch ? textoNormalizado.indexOf(comentarioMatch[0]) : textoNormalizado.length;
    
    const fimAlternativas = Math.min(
      inicioExplicacao, 
      inicioResposta, 
      inicioComentario
    );
    
    const alternativasMatch3 = !alternativasMatch && !alternativasMatch2 && 
      enunciadoMatch && fimAlternativas > fimEnunciado && 
      textoNormalizado.substring(fimEnunciado, fimAlternativas);
    
    if (alternativasMatch) {
      alternativasTexto = alternativasMatch[1].trim();
      console.log('[WEBHOOK_PROCESS] Alternativas extraídas com padrão 1 (primeiros 50 caracteres):', 
                 alternativasTexto.substring(0, 50) + '...');
    } else if (alternativasMatch2) {
      alternativasTexto = alternativasMatch2[1].trim();
      console.log('[WEBHOOK_PROCESS] Alternativas extraídas com padrão 2 (primeiros 50 caracteres):', 
                 alternativasTexto.substring(0, 50) + '...');
    } else if (alternativasMatch3) {
      alternativasTexto = alternativasMatch3.trim();
      console.log('[WEBHOOK_PROCESS] Alternativas extraídas com padrão 3 (primeiros 50 caracteres):', 
                 alternativasTexto.substring(0, 50) + '...');
    } else {
      // Buscar qualquer texto que pareça ser alternativas (a-e seguido de texto)
      const altTexto = textoNormalizado.match(/([a-e]\).*?[a-e]\).*?[a-e]\))/s);
      if (altTexto) {
        alternativasTexto = altTexto[1].trim();
        console.log('[WEBHOOK_PROCESS] Alternativas extraídas com busca de emergência (primeiros 50 caracteres):', 
                   alternativasTexto.substring(0, 50) + '...');
      } else {
        console.log('[WEBHOOK_PROCESS] Não foi possível extrair alternativas com nenhum padrão');
      }
    }
    
    // Extrair Explicação
    if (explicacaoMatch) {
      secoes.explicacao = explicacaoMatch[1].trim();
      console.log('[WEBHOOK_PROCESS] Explicação extraída (primeiros 50 caracteres):', 
                 secoes.explicacao.substring(0, 50) + '...');
    }
    
    // Extrair Resposta Correta
    if (respostaMatch) {
      secoes.respostaCorreta = respostaMatch[2].trim();
      console.log('[WEBHOOK_PROCESS] Resposta correta extraída:', secoes.respostaCorreta);
    }
    
    // Extrair Comentário Explicativo
    if (comentarioMatch) {
      secoes.comentarioExplicativo = comentarioMatch[2].trim();
      console.log('[WEBHOOK_PROCESS] Comentário explicativo extraído (primeiros 50 caracteres):', 
                 secoes.comentarioExplicativo.substring(0, 50) + '...');
    }
    
    // Processar alternativas e identificar a correta
    const alternativas = processarAlternativas(alternativasTexto, secoes.explicacao?.toString() || secoes.comentarioExplicativo?.toString() || '');
    
    return {
      tema: secoes.tema?.toString() || '',
      objetivoAprendizagem: secoes.objetivoAprendizagem?.toString() || '',
      nivelDificuldade: secoes.nivelDificuldade?.toString() || '',
      modeloQuestao: secoes.modeloQuestao?.toString() || '',
      enunciadoClinico: secoes.enunciadoClinico?.toString() || '',
      alternativas,
      explicacao: secoes.explicacao?.toString() || secoes.comentarioExplicativo?.toString() || '',
      respostaCorreta: secoes.respostaCorreta?.toString() || ''
    };
  } else {
    // Processar como questão dissertativa
    
    // Extrair Comando/Comandos
    const comandoMatch = textoNormalizado.match(/\*\*Comando:\*\*(.*?)(?=\*\*Resposta|\*\*Explicação|\*\*Comentário|\s*$)/s);
    const comandosMatch = textoNormalizado.match(/\*\*Comandos:\*\*(.*?)(?=\*\*Resposta|\*\*Explicação|\*\*Comentário|\s*$)/s);
    let comandos: string[] = [];
    let comando = '';
    
    if (comandosMatch) {
      // Tentar extrair comandos individuais (A), B), C), etc.)
      const comandosTexto = comandosMatch[1].trim();
      const comandosIndividuais = comandosTexto.match(/[A-Z]\)(.*?)(?=[A-Z]\)|\s*$)/gs);
      
      if (comandosIndividuais && comandosIndividuais.length > 0) {
        comandos = comandosIndividuais.map(cmd => cmd.trim());
        console.log('[WEBHOOK_PROCESS] Comandos individuais extraídos:', comandos.length);
      } else {
        // Se não conseguiu extrair comandos individuais, usar o texto completo
        comandos = [comandosTexto];
        console.log('[WEBHOOK_PROCESS] Usando texto completo de comandos');
      }
      
      secoes.comandos = comandos;
    } else if (comandoMatch) {
      comando = comandoMatch[1].trim();
      secoes.comando = comando;
      console.log('[WEBHOOK_PROCESS] Comando extraído:', comando);
    } else {
      // Tentar extrair comando da seção "Qual a conduta mais adequada para este paciente?"
      const condutaMatch = textoNormalizado.match(/Qual a conduta mais adequada para este paciente\?/i);
      if (condutaMatch) {
        comando = condutaMatch[0];
        secoes.comando = comando;
        console.log('[WEBHOOK_PROCESS] Comando extraído de pergunta padrão:', comando);
      }
    }
    
    // Extrair Resposta Esperada/Correta
    const respostaEsperadaMatch = textoNormalizado.match(/\*\*Resposta esperada:\*\*(.*?)(?=\*\*Distribuição|\*\*Explicação|\*\*Comentário|\s*$)/si);
    const respostaCorretaMatch = textoNormalizado.match(/\*\*Resposta( Correta)?:\*\*(.*?)(?=\*\*Distribuição|\*\*Explicação|\*\*Comentário|\s*$)/si);
    
    if (respostaEsperadaMatch) {
      secoes.respostaEsperada = respostaEsperadaMatch[1].trim();
      console.log('[WEBHOOK_PROCESS] Resposta esperada extraída (primeiros 50 caracteres):', 
                 secoes.respostaEsperada.substring(0, 50) + '...');
    } else if (respostaCorretaMatch) {
      secoes.respostaEsperada = respostaCorretaMatch[2].trim();
      secoes.respostaCorreta = respostaCorretaMatch[2].trim();
      console.log('[WEBHOOK_PROCESS] Resposta correta extraída como resposta esperada (primeiros 50 caracteres):', 
                 secoes.respostaEsperada.substring(0, 50) + '...');
    }
    
    // Extrair Distribuição de Pontuação
    const pontuacaoMatch = textoNormalizado.match(/\*\*Distribuição de pontuação:\*\*(.*?)(?=\*\*Explicação|\*\*Comentário|\s*$)/si);
    if (pontuacaoMatch) {
      secoes.distribuicaoPontuacao = pontuacaoMatch[1].trim();
      console.log('[WEBHOOK_PROCESS] Distribuição de pontuação extraída (primeiros 50 caracteres):', 
                 secoes.distribuicaoPontuacao.substring(0, 50) + '...');
    }
    
    // Extrair Explicação/Comentário (opcional para dissertativas)
    const explicacaoMatch = textoNormalizado.match(/\*\*Explicação:\*\*(.*?)(?=\s*$)/s);
    const comentarioMatch = textoNormalizado.match(/\*\*Comentário( Explicativo)?:\*\*(.*?)(?=\s*$)/si);
    
    if (explicacaoMatch) {
      secoes.explicacao = explicacaoMatch[1].trim();
      console.log('[WEBHOOK_PROCESS] Explicação extraída (primeiros 50 caracteres):', 
                 secoes.explicacao.substring(0, 50) + '...');
    } else if (comentarioMatch) {
      secoes.explicacao = comentarioMatch[2].trim();
      secoes.comentarioExplicativo = comentarioMatch[2].trim();
      console.log('[WEBHOOK_PROCESS] Comentário explicativo extraído como explicação (primeiros 50 caracteres):', 
                 secoes.explicacao.substring(0, 50) + '...');
      
      // Se não temos distribuição de pontuação, usar o comentário explicativo
      if (!secoes.distribuicaoPontuacao) {
        secoes.distribuicaoPontuacao = comentarioMatch[2].trim();
        console.log('[WEBHOOK_PROCESS] Usando comentário explicativo como distribuição de pontuação');
      }
    }
    
    // Construir o enunciado completo para questões dissertativas
    // Incluir os comandos no enunciado, conforme solicitado
    let enunciadoCompleto = secoes.enunciadoClinico?.toString() || '';
    
    // Adicionar comando ou comandos ao enunciado
    if (Array.isArray(secoes.comandos) && secoes.comandos.length > 0) {
      // Não adicionar comandos ao enunciado, serão exibidos separadamente
    } else if (secoes.comando) {
      // Não adicionar comando ao enunciado, será exibido separadamente
    }
    
    return {
      tema: secoes.tema?.toString() || '',
      objetivoAprendizagem: secoes.objetivoAprendizagem?.toString() || '',
      nivelDificuldade: secoes.nivelDificuldade?.toString() || '',
      modeloQuestao: secoes.modeloQuestao?.toString() || '',
      enunciadoClinico: enunciadoCompleto || secoes.enunciadoClinico?.toString() || '',
      comando: secoes.comando?.toString() || '',
      comandos: Array.isArray(secoes.comandos) ? secoes.comandos : [],
      respostaEsperada: secoes.respostaEsperada?.toString() || '',
      respostaCorreta: secoes.respostaCorreta?.toString() || '',
      distribuicaoPontuacao: secoes.distribuicaoPontuacao?.toString() || '',
      comentarioExplicativo: secoes.comentarioExplicativo?.toString() || '',
      explicacao: secoes.explicacao?.toString() || ''
    };
  }
};

/**
 * Função para processar as alternativas e identificar a correta
 * @param texto Texto das alternativas
 * @param explicacao Texto da explicação
 * @returns Array de alternativas processadas
 */
const processarAlternativas = (texto: string, explicacao: string): { texto: string; isCorreta: boolean }[] => {
  console.log('[WEBHOOK_PROCESS] Processando alternativas');
  
  // Se não temos texto de alternativas, criar alternativas padrão
  if (!texto || texto.trim() === '') {
    console.log('[WEBHOOK_PROCESS] Texto de alternativas vazio, criando alternativas padrão');
    return [
      { texto: 'Alternativa A (padrão)', isCorreta: true },
      { texto: 'Alternativa B (padrão)', isCorreta: false },
      { texto: 'Alternativa C (padrão)', isCorreta: false },
      { texto: 'Alternativa D (padrão)', isCorreta: false },
      { texto: 'Alternativa E (padrão)', isCorreta: false }
    ];
  }
  
  // Padrões para extrair alternativas - mais flexíveis
  const padroes = [
    // Padrão 1: Formato a) Texto da alternativa
    /\(?([a-e])\)?\s*(.*?)(?=\n\s*\(?[a-e]\)?|\s*$)/gis,
    
    // Padrão 2: Formato com letras maiúsculas A) Texto da alternativa
    /\(?([A-E])\)?\s*(.*?)(?=\n\s*\(?[A-E]\)?|\s*$)/gis,
    
    // Padrão 3: Formato com letras e parênteses (a) Texto da alternativa
    /\(([a-e])\)\s*(.*?)(?=\n\s*\([a-e]\)|\s*$)/gis
  ];
  
  let alternativasArray = [];
  
  // Tentar cada padrão até encontrar alternativas
  for (const padrao of padroes) {
    let match;
    const tempArray = [];
    
    // Reset do regex para começar do início
    padrao.lastIndex = 0;
    
    // Extrair cada alternativa com o padrão atual
    while ((match = padrao.exec(texto)) !== null) {
      tempArray.push({
        letra: match[1].toLowerCase(),
        texto: match[2].trim()
      });
    }
    
    // Se encontrou alternativas com este padrão, usar e sair do loop
    if (tempArray.length > 0) {
      alternativasArray = tempArray;
      console.log('[WEBHOOK_PROCESS] Alternativas encontradas com padrão:', alternativasArray.length);
      break;
    }
  }
  
  // Se ainda não encontrou alternativas, tentar dividir por linhas
  if (alternativasArray.length === 0) {
    console.log('[WEBHOOK_PROCESS] Tentando extrair alternativas por linhas');
    const linhas = texto.split('\n').filter(l => l.trim() !== '');
    
    // Verificar se cada linha começa com a), b), etc.
    for (const linha of linhas) {
      const match = linha.match(/^\s*\(?([a-e])\)?\s*(.*)/i);
      if (match) {
        alternativasArray.push({
          letra: match[1].toLowerCase(),
          texto: match[2].trim()
        });
      }
    }
  }
  
  console.log('[WEBHOOK_PROCESS] Total de alternativas encontradas:', alternativasArray.length);
  
  // Se ainda não encontrou alternativas, criar alternativas padrão
  if (alternativasArray.length === 0) {
    console.log('[WEBHOOK_PROCESS] Não foi possível extrair alternativas, criando alternativas padrão');
    return [
      { texto: 'Alternativa A (padrão)', isCorreta: true },
      { texto: 'Alternativa B (padrão)', isCorreta: false },
      { texto: 'Alternativa C (padrão)', isCorreta: false },
      { texto: 'Alternativa D (padrão)', isCorreta: false },
      { texto: 'Alternativa E (padrão)', isCorreta: false }
    ];
  }
  
  // Identificar a alternativa correta
  let letraCorreta = null;
  
  // Verificar marcador de check (✅)
  for (const alt of alternativasArray) {
    if (alt.texto.includes('✅')) {
      letraCorreta = alt.letra;
      // Remover o marcador do texto
      alt.texto = alt.texto.replace('✅', '').trim();
      console.log('[WEBHOOK_PROCESS] Alternativa correta identificada pelo ✅:', letraCorreta);
      break;
    }
  }
  
  // Se não encontrou pelo check, procurar na explicação
  if (!letraCorreta) {
    const corretaPatterns = [
      /alternativa correta[^a-e]*([a-e])/i,
      /correta[^a-e]*([a-e])/i,
      /gabarito[^a-e]*([a-e])/i,
      /resposta[^a-e]*([a-e])/i,
      /letra ([a-e])/i,
      /opção ([a-e])/i,
      /\(([a-e])\)\s*está correta/i
    ];
    
    for (const pattern of corretaPatterns) {
      const match = explicacao.match(pattern);
      if (match) {
        letraCorreta = match[1].toLowerCase();
        console.log('[WEBHOOK_PROCESS] Alternativa correta identificada na explicação:', letraCorreta);
        break;
      }
    }
  }
  
  // Criar o array final de alternativas
  const alternativasFinal = alternativasArray.map(alt => ({
    texto: alt.texto,
    isCorreta: alt.letra === letraCorreta
  }));
  
  // Se não encontrou nenhuma alternativa correta, marcar a primeira como correta
  if (alternativasFinal.length > 0 && !alternativasFinal.some(alt => alt.isCorreta)) {
    alternativasFinal[0].isCorreta = true;
    console.log('[WEBHOOK_PROCESS] Nenhuma alternativa correta identificada, marcando a primeira como correta');
  }
  
  console.log('[WEBHOOK_PROCESS] Alternativas processadas:', alternativasFinal);
  return alternativasFinal;
};

/**
 * Envia dados para o webhook do N8n
 * @param data Dados a serem enviados
 * @returns Resposta do webhook
 */
export async function sendToWebhook(data: WebhookRequestData): Promise<WebhookResponseData> {
  try {
    console.log('[WEBHOOK] Iniciando envio de dados para o webhook:', JSON.stringify(data, null, 2));
    
    // Aumentar o timeout para 2 minutos (120000ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[WEBHOOK] Timeout de 2 minutos atingido, abortando requisição');
      controller.abort();
    }, 120000);
    
    console.log('[WEBHOOK] Enviando requisição POST para:', WEBHOOK_URL);
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('[WEBHOOK] Resposta recebida, status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('[WEBHOOK] Resposta com erro:', response.status, response.statusText);
      throw new Error(`Erro ao enviar dados para o webhook: ${response.status} ${response.statusText}`);
    }

    // Obter o texto da resposta primeiro para debug
    const responseText = await response.text();
    console.log('[WEBHOOK] Resposta em texto:', responseText);
    
    // Tentar converter para JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('[WEBHOOK] Resposta convertida para JSON:', JSON.stringify(responseData, null, 2));
    } catch (jsonError) {
      console.error('[WEBHOOK] Erro ao converter resposta para JSON:', jsonError);
      // Criar um objeto com o texto bruto como fallback
      responseData = { output: responseText };
      console.log('[WEBHOOK] Usando texto bruto como output');
    }
    
    return responseData;
  } catch (error) {
    console.error('[WEBHOOK] Erro ao enviar dados para o webhook:', error);
    throw error;
  }
}

/**
 * Processa a resposta do webhook e extrai a questão
 * @param response Resposta do webhook
 * @returns Questão processada
 */
export function processWebhookResponse(response: any): ProcessedQuestion {
  try {
    console.log('[WEBHOOK_PROCESS] Iniciando processamento da resposta:', JSON.stringify(response, null, 2));
    
    // Tratamento mais flexível para qualquer formato de resposta
    let output = '';
    
    // Caso 1: Resposta é um array (formato comum do N8N)
    if (Array.isArray(response)) {
      console.log('[WEBHOOK_PROCESS] Resposta é um array com', response.length, 'itens');
      if (response.length > 0) {
        const firstItem = response[0];
        console.log('[WEBHOOK_PROCESS] Primeiro item do array:', JSON.stringify(firstItem, null, 2));
        
        // Tentar extrair output do primeiro item
        if (firstItem && typeof firstItem.output === 'string') {
          output = firstItem.output;
          console.log('[WEBHOOK_PROCESS] Extraído output do primeiro item do array');
        } 
        // Se o primeiro item for uma string, usar diretamente
        else if (typeof firstItem === 'string') {
          output = firstItem;
          console.log('[WEBHOOK_PROCESS] Primeiro item do array é uma string, usando diretamente');
        }
        // Se o primeiro item for um objeto sem propriedade output, tentar usar o objeto inteiro
        else if (firstItem && typeof firstItem === 'object') {
          output = JSON.stringify(firstItem);
          console.log('[WEBHOOK_PROCESS] Usando objeto inteiro como output');
        }
      }
    } 
    // Caso 2: Resposta é um objeto com propriedade output
    else if (response && typeof response.output === 'string') {
      output = response.output;
      console.log('[WEBHOOK_PROCESS] Extraído output do objeto de resposta');
    }
    // Caso 3: Resposta é uma string
    else if (typeof response === 'string') {
      output = response;
      console.log('[WEBHOOK_PROCESS] Resposta é uma string, usando diretamente');
    }
    // Caso 4: Resposta é um objeto sem propriedade output
    else if (response && typeof response === 'object') {
      // Tentar converter o objeto inteiro para string
      output = JSON.stringify(response);
      console.log('[WEBHOOK_PROCESS] Convertendo objeto inteiro para string');
    }
    
    // Se ainda não temos output, criar um erro genérico
    if (!output) {
      console.error('[WEBHOOK_PROCESS] Não foi possível extrair conteúdo da resposta:', response);
      throw new Error('Não foi possível extrair conteúdo da resposta do N8N');
    }
    
    console.log('[WEBHOOK_PROCESS] Output extraído (primeiros 200 caracteres):', output.substring(0, 200) + '...');
    
    // Usar a nova abordagem de processamento baseada em seções
    return processarTextoCompleto(output);
  } catch (error) {
    console.error('[WEBHOOK_PROCESS] Erro ao processar resposta do webhook:', error);
    throw error;
  }
}
