'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ExportQuestao from '@/components/ExportQuestao';
import { getQuestionById } from '@/lib/questionService';
import { useParams } from 'next/navigation';

export default function QuestaoDetalhes() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [questao, setQuestao] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar questão do localStorage ao montar o componente
  useEffect(() => {
    const loadQuestao = async () => {
      try {
        setIsLoading(true);
        setError(null);
        

        // Buscar a questão pelo ID
        const questaoSalva = await getQuestionById(id);
        
        if (!questaoSalva) {
          setError('Questão não encontrada');
          setIsLoading(false);
          return;
        }
        
        // Verificar o tipo de questão (múltipla escolha ou dissertativa)
        const isMultipleChoice = questaoSalva.modeloQuestao?.includes('Múltipla Escolha');
        
        // Formatar a questão para exibição
        const questaoFormatada = {
          id: questaoSalva.id,
          tema: questaoSalva.tema || '',
          disciplina: currentUser?.disciplina || 'Medicina',
          nivelDificuldade: questaoSalva.nivelDificuldade || '',
          modeloQuestao: questaoSalva.modeloQuestao || '',
          dataCriacao: new Date(questaoSalva.dataCriacao || Date.now()).toISOString().split('T')[0],
          professor: currentUser?.name || 'Professor',
          faculdade: currentUser?.faculdade || 'Faculdade de Medicina',
          referencia: questaoSalva.referencia || '',
          objetivoAprendizagem: questaoSalva.objetivoAprendizagem || '',
          enunciado: questaoSalva.enunciadoClinico || '',
          comando: isMultipleChoice 
            ? 'Qual a conduta mais adequada para este paciente?' 
            : (questaoSalva.comando || ''),
          alternativas: isMultipleChoice && Array.isArray(questaoSalva.alternativas) 
            ? questaoSalva.alternativas.map(alt => alt.texto || '') 
            : [],
          respostaCorreta: isMultipleChoice && Array.isArray(questaoSalva.alternativas)
            ? String.fromCharCode(65 + questaoSalva.alternativas.findIndex(alt => alt.isCorreta)) 
            : '',
          comentarioExplicativo: questaoSalva.explicacao || '',
          // Campos específicos para questões dissertativas
          comandos: !isMultipleChoice ? (questaoSalva.comandos || []) : [],
          respostaEsperada: !isMultipleChoice ? (questaoSalva.respostaEsperada || questaoSalva.respostaCorreta || '') : '',
          distribuicaoPontuacao: !isMultipleChoice ? (questaoSalva.distribuicaoPontuacao || questaoSalva.comentarioExplicativo || '') : ''
        };
        
        setQuestao(questaoFormatada);
      } catch (error) {
        console.error('Erro ao carregar questão:', error);
        setError('Erro ao carregar questão. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestao();
  }, [id, currentUser]);
  
  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Carregando questão...</p>
        </div>
      </div>
    );
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/questoes')}
            className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a]"
          >
            Voltar para Minhas Questões
          </button>
        </div>
      </div>
    );
  }
  
  // Renderizar quando não há questão
  if (!questao) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">Questão não encontrada</p>
          <button
            onClick={() => router.push('/questoes')}
            className="px-4 py-2 bg-[#0a4d8c] text-white rounded-md hover:bg-[#083b6a]"
          >
            Voltar para Minhas Questões
          </button>
        </div>
      </div>
    );
  }
  
  // Verificar se é uma questão de múltipla escolha
  const isMultipleChoice = questao.modeloQuestao?.includes('Múltipla Escolha');
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#0a4d8c]">Detalhes da Questão</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/questoes')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Voltar
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Disciplina</p>
            <p className="font-medium">{questao.disciplina}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tema</p>
            <p className="font-medium">{questao.tema}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nível de Dificuldade</p>
            <p className="font-medium">{questao.nivelDificuldade}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Modelo da Questão</p>
            <p className="font-medium">{questao.modeloQuestao}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Referência</p>
            <p className="font-medium">{questao.referencia}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Objetivo de Aprendizagem</p>
            <p className="font-medium">{questao.objetivoAprendizagem}</p>
          </div>
        </div>
        
        {/* Exibição para questões de múltipla escolha */}
        {isMultipleChoice && (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Enunciado</h3>
              <p className="text-gray-800 whitespace-pre-line">{questao.enunciado}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Comando</h3>
              <p className="text-gray-800">{questao.comando}</p>
            </div>
            
            {questao.alternativas && questao.alternativas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Alternativas</h3>
                <div className="space-y-2">
                  {questao.alternativas.map((alternativa, index) => {
                    const letra = String.fromCharCode(65 + index); // A, B, C, D, E
                    const isCorrect = questao.respostaCorreta === letra;
                    
                    return (
                      <div 
                        key={letra} 
                        className={`p-3 rounded-md ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                      >
                        <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                          {letra})
                        </span>{' '}
                        {alternativa}
                        {isCorrect && (
                          <span className="ml-2 text-green-700 font-medium">(Resposta correta)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {questao.comentarioExplicativo && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Comentário Explicativo</h3>
                <div className="p-4 bg-blue-50 border-l-4 border-[#0a4d8c] rounded-r-md">
                  <p className="text-gray-800 whitespace-pre-line">{questao.comentarioExplicativo}</p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Exibição para questões dissertativas */}
        {!isMultipleChoice && (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Enunciado</h3>
              <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-line">{questao.enunciado}</p>
              </div>
              
              <h4 className="text-lg font-semibold text-[#0a4d8c] mb-2">Comandos</h4>
              {Array.isArray(questao.comandos) && questao.comandos.length > 0 ? (
                <div className="space-y-2">
                  {questao.comandos.map((comando, index) => (
                    <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-gray-800 whitespace-pre-line">{comando}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-gray-800 whitespace-pre-line">{questao.comando}</p>
                </div>
              )}
            </div>
            
            {questao.respostaEsperada && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Resposta Esperada</h3>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-gray-800 whitespace-pre-line">{questao.respostaEsperada}</p>
                </div>
              </div>
            )}
            
            {questao.distribuicaoPontuacao && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Distribuição de Pontuação</h3>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-gray-800 whitespace-pre-line">{questao.distribuicaoPontuacao}</p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Componente de exportação */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-[#0a4d8c] mb-2">Exportar Questão</h3>
          <ExportQuestao 
            questao={questao} 
            professor={currentUser?.name || 'Professor'} 
            faculdade={currentUser?.faculdade || 'Faculdade de Medicina'} 
            disciplina={currentUser?.disciplina || 'Medicina'} 
            referencia={questao.referencia}
          />
        </div>
      </div>
      
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
