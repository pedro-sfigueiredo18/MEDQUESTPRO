'use client';

import { useState } from 'react';
import { 
  sendToWebhook, 
  processWebhookResponse, 
  WebhookRequestData, 
  ProcessedQuestion
} from '@/lib/webhookService';

export function useWebhookIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questao, setQuestao] = useState<ProcessedQuestion | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');
  
  /**
   * Gera uma questão utilizando o webhook do N8n
   * @param data Dados para geração da questão
   */
  const gerarQuestaoViaWebhook = async (data: WebhookRequestData) => {
    setIsLoading(true);
    setError(null);
    setQuestao(null);
    setPollingStatus('A questão está sendo gerada...');
    
    try {
      // Adicionar um retry mechanism para tentar novamente em caso de falha
      let response = null;
      let attempts = 0;
      const maxAttempts = 3; // Manter 3 tentativas conforme solicitado
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`Tentativa ${attempts + 1} de enviar dados para o webhook`);
          setPollingStatus(`A questão está sendo gerada... (tentativa ${attempts + 1})`);
          
          // Enviar dados para o webhook
          response = await sendToWebhook(data);
          
          // Verificação simplificada da resposta
          if (!response) {
            console.warn('Resposta vazia do webhook, mas continuando processamento');
            // Não lançar erro, apenas registrar aviso
          }
          
          // Log da resposta completa para depuração
          console.log('Resposta recebida do webhook:', JSON.stringify(response, null, 2));
          
          // Aceitar qualquer resposta que não seja null/undefined
          console.log('Resposta considerada válida, continuando processamento');
          break; // Se chegou aqui, a requisição foi bem-sucedida
        } catch (error) {
          attempts++;
          lastError = error;
          console.error(`Erro na tentativa ${attempts}:`, error);
          
          if (attempts >= maxAttempts) {
            console.error('Todas as tentativas falharam');
            break; // Sair do loop após todas as tentativas
          }
          
          // Esperar mais tempo antes de tentar novamente (backoff exponencial)
          const waitTime = 10000 * attempts; // 10s, 20s, 30s
          console.log(`Aguardando ${waitTime/1000} segundos antes da próxima tentativa...`);
          setPollingStatus(`Tentativa ${attempts} falhou. Tentando novamente em ${waitTime/1000} segundos...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      if (!response) {
        throw new Error(lastError?.message || 'Não foi possível obter resposta do webhook após múltiplas tentativas');
      }
      
      console.log('Resposta obtida com sucesso, processando...');
      setPollingStatus('Processando questão recebida...');
      
      try {
        console.log('[WEBHOOK_INTEGRATION] Tentando processar resposta do N8N:', JSON.stringify(response, null, 2));
        
        // Abordagem direta para processar a resposta do N8N
        let processedQuestion;
        
        // Verificar se a resposta é um array (formato comum do N8N)
        if (Array.isArray(response) && response.length > 0 && response[0].output) {
          console.log('[WEBHOOK_INTEGRATION] Detectado formato de array com output');
          processedQuestion = processWebhookResponse(response);
        } 
        // Verificar se a resposta é um objeto com propriedade output
        else if (response && typeof response.output === 'string') {
          console.log('[WEBHOOK_INTEGRATION] Detectado formato de objeto com output');
          processedQuestion = processWebhookResponse(response);
        }
        // Tentar processar diretamente a resposta como string
        else {
          console.log('[WEBHOOK_INTEGRATION] Tentando processar resposta diretamente');
          // Criar um objeto com a propriedade output para compatibilidade
          const wrappedResponse = { output: JSON.stringify(response) };
          processedQuestion = processWebhookResponse(wrappedResponse);
        }
        
        console.log('[WEBHOOK_INTEGRATION] Questão processada com sucesso:', processedQuestion);
        
        // Atualizar estado com a questão processada
        setQuestao(processedQuestion);
        setPollingStatus('Questão gerada com sucesso!');
        
        return processedQuestion;
      } catch (processError) {
        console.error('Erro ao processar a resposta do webhook:', processError);
        throw new Error(`Erro ao processar a questão: ${processError.message}`);
      }
    } catch (err) {
      console.error('Erro ao gerar questão via webhook:', err);
      
      // Mensagens de erro mais amigáveis e específicas
      let errorMessage = 'Erro ao gerar questão. Tente novamente.';
      
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('Timeout')) {
          errorMessage = 'O servidor demorou muito para responder. Tente novamente mais tarde.';
        } else if (err.message.includes('network') || err.message.includes('Network')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
        } else if (err.message.includes('formato inválido') || err.message.includes('incompleta')) {
          errorMessage = 'A questão gerada está em formato inválido. Entre em contato com o suporte.';
        } else {
          errorMessage = `Erro: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setPollingStatus('Erro ao gerar questão.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    questao,
    pollingStatus,
    gerarQuestaoViaWebhook
  };
}
