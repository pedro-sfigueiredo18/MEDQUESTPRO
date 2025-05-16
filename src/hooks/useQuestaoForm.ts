'use client';

import { useState, useEffect } from 'react';
import { saveQuestion, type QuestionFromDB } from '@/lib/questionService';
import { useWebhookIntegration } from '@/hooks/useWebhookIntegration';
import type { ProcessedQuestion } from '@/lib/webhookService';
import { useAuth } from '@/hooks/useAuth';

// Interface para questão gerada
export interface QuestaoGerada {
  tema: string;
  objetivoAprendizagem: string;
  nivelDificuldade: string;
  modeloQuestao: string;
  enunciadoClinico: string;
  alternativas: {
    texto: string;
    isCorreta: boolean;
  }[];
  explicacao: string;
}

// Hook atualizado para integrar com o webhook do N8n
export function useQuestaoForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    referencia: '',
    tema: '',
    objetivoAprendizagem: '',
    nivelDificuldade: 'Médio',
    modeloQuestao: 'Múltipla Escolha',
    tipoReferencia: 'base',
    arquivoReferencia: null as File | null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [questaoGerada, setQuestaoGerada] = useState<QuestaoGerada | null>(null);
  const [searchStatus, setSearchStatus] = useState('');
  
  // Usar o hook de integração com webhook
  const { gerarQuestaoViaWebhook, pollingStatus, questao } = useWebhookIntegration();

  // Atualizar o status de busca com base no status de polling
  useEffect(() => {
    if (pollingStatus) {
      setSearchStatus(pollingStatus);
    }
  }, [pollingStatus]);

  // Atualizar o estado da questão quando o webhook retornar
  useEffect(() => {
    if (questao) {
      // Garantir que a questão tenha todas as propriedades necessárias
      const questaoFormatada: QuestaoGerada = {
        tema: questao.tema || '',
        objetivoAprendizagem: questao.objetivoAprendizagem || '',
        nivelDificuldade: questao.nivelDificuldade || '',
        modeloQuestao: questao.modeloQuestao || '',
        enunciadoClinico: questao.enunciadoClinico || '',
        alternativas: questao.alternativas?.map(alt => ({
          texto: alt.texto || '',
          isCorreta: alt.isCorreta || false
        })) || [],
        explicacao: questao.explicacao || ''
      };
      setQuestaoGerada(questaoFormatada);
      setSearchStatus('Questão gerada com sucesso!');
    }
  }, [questao]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        arquivoReferencia: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setQuestaoGerada(null);
    setSearchStatus('Iniciando processamento da solicitação...');

    try {
      // Validar formulário
      if (!formData.tema || !formData.objetivoAprendizagem) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      if (formData.tipoReferencia === 'base' && !formData.referencia) {
        throw new Error('Por favor, selecione uma referência da base de dados.');
      }

      if (formData.tipoReferencia === 'upload' && !formData.arquivoReferencia) {
        throw new Error('Por favor, faça upload de um arquivo de referência.');
      }

      if (formData.tipoReferencia === 'web' && !formData.referencia) {
        throw new Error('Por favor, informe uma URL ou referência web.');
      }

      // Preparar URL do arquivo para envio ao webhook
      let arquivoUrl = '';
      
      // Simular processamento de upload de arquivo se necessário
      if (formData.tipoReferencia === 'upload' && formData.arquivoReferencia) {
        setSearchStatus('Processando arquivo de referência...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Simular URL de arquivo após upload
        arquivoUrl = `https://storage.mdacademico.com.br/uploads/${formData.arquivoReferencia.name}`;
      } else if (formData.tipoReferencia === 'web') {
        // Usar a URL informada diretamente
        arquivoUrl = formData.referencia;
      } else {
        // Para referências da base de dados, usar a referência como URL
        arquivoUrl = `https://storage.mdacademico.com.br/referencias/${formData.referencia}`;
      }

      // Preparar dados para envio ao webhook
      const webhookData = {
        tema: formData.tema,
        objetivo: formData.objetivoAprendizagem,
        dificuldade: formData.nivelDificuldade,
        modelo: formData.modeloQuestao,
        arquivo: arquivoUrl
      };

      // Enviar dados para o webhook e iniciar polling
      const questaoProcessada = await gerarQuestaoViaWebhook(webhookData);
      
      if (questaoProcessada && currentUser?.id) {
        // Converter a questão processada para o formato esperado
        const questaoParaSalvar: QuestaoGerada = {
          tema: questaoProcessada.tema || '',
          objetivoAprendizagem: questaoProcessada.objetivoAprendizagem || '',
          nivelDificuldade: questaoProcessada.nivelDificuldade || '',
          modeloQuestao: questaoProcessada.modeloQuestao || '',
          enunciadoClinico: questaoProcessada.enunciadoClinico || '',
          alternativas: questaoProcessada.alternativas?.map(alt => ({
            texto: alt.texto || '',
            isCorreta: alt.isCorreta || false
          })) || [],
          explicacao: questaoProcessada.explicacao || ''
        };

        // Salvar no banco de dados
        setSearchStatus('Salvando questão no banco de dados...');
        const questaoSalva = await saveQuestion(questaoParaSalvar, formData.referencia, currentUser.id);
        
        // Atualizar o estado com a questão salva
        const questaoFormatada: QuestaoGerada = {
          tema: questaoSalva.theme || '',
          objetivoAprendizagem: questaoSalva.learning_objective || '',
          nivelDificuldade: questaoSalva.difficulty || '',
          modeloQuestao: questaoSalva.question_type || '',
          enunciadoClinico: questaoSalva.statement || '',
          alternativas: [], // As alternativas serão carregadas separadamente
          explicacao: '' // A explicação será carregada separadamente
        };
        setQuestaoGerada(questaoFormatada);
      }
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao gerar a questão. Por favor, tente novamente.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    error,
    questaoGerada,
    searchStatus,
    handleChange,
    handleFileChange,
    handleSubmit,
    resetForm: () => {
      setFormData({
        referencia: '',
        tema: '',
        objetivoAprendizagem: '',
        nivelDificuldade: 'Médio',
        modeloQuestao: 'Múltipla Escolha',
        tipoReferencia: 'base',
        arquivoReferencia: null,
      });
      setQuestaoGerada(null);
    }
  };
}
