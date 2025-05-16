'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuestaoForm } from '@/hooks/useQuestaoForm';
import Image from 'next/image';
import { saveQuestion } from '@/lib/questionService';
import ExportQuestao from '@/components/ExportQuestao';

export default function CriarQuestao() {
  const { currentUser } = useAuth();
  const {
    formData,
    isLoading,
    error,
    questaoGerada,
    searchStatus,
    handleChange,
    handleFileChange,
    handleSubmit,
    resetForm
  } = useQuestaoForm();

  const [tipoReferencia, setTipoReferencia] = useState<'base' | 'upload' | 'web'>('base');
  const [referenciasSelecionadas, setReferenciasSelecionadas] = useState<string[]>([]);
  
  // Simulação de referências do banco de dados
  const referenciasBanco = [
    'Harrison - Medicina Interna, 20ª edição',
    'Tratado de Pneumologia - Sociedade Brasileira de Pneumologia',
    'Williams Textbook of Endocrinology, 14ª edição',
    'Braunwald\'s Heart Disease: A Textbook of Cardiovascular Medicine',
    'Goodman & Gilman\'s The Pharmacological Basis of Therapeutics'
  ];
  
  const handleTipoReferenciaChange = (tipo: 'base' | 'upload' | 'web') => {
    setTipoReferencia(tipo);
    setReferenciasSelecionadas([]);
    
    // Atualizar o formData com o novo tipo de referência
    handleChange({
      target: { name: 'tipoReferencia', value: tipo }
    } as React.ChangeEvent<HTMLInputElement>);
    
    // Limpar o arquivo de referência se necessário
    if (tipo !== 'upload') {
      handleChange({
        target: { name: 'arquivoReferencia', value: null }
      } as any);
    }
  };
  
  const handleReferenciaSelect = (referencia: string) => {
    let novasReferencias: string[];
    
    if (referenciasSelecionadas.includes(referencia)) {
      novasReferencias = referenciasSelecionadas.filter(r => r !== referencia);
    } else {
      novasReferencias = [...referenciasSelecionadas, referencia];
    }
    
    setReferenciasSelecionadas(novasReferencias);
    
    // Atualizar o formData com as novas referências selecionadas
    handleChange({
      target: { name: 'referencia', value: novasReferencias.join('; ') }
    } as React.ChangeEvent<HTMLInputElement>);
  };
  
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
  };
  
  const handleLocalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Determinar a referência com base no tipo selecionado
    let referencia = '';
    if (tipoReferencia === 'base') {
      referencia = referenciasSelecionadas.join('; ');
      
      // Atualizar o formData com a referência final
      handleChange({
        target: { name: 'referencia', value: referencia }
      } as React.ChangeEvent<HTMLInputElement>);
    }
    
    // Chamar o handleSubmit do hook
    handleSubmit(e);
  };
  
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-center text-[#0a4d8c] mb-8">Criar Nova Questão</h1>
      
      {!questaoGerada ? (
        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleLocalSubmit}>
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Tipo de Referência Científica
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${tipoReferencia === 'base' ? 'bg-[#0a4d8c] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleTipoReferenciaChange('base')}
                >
                  Selecionar do Banco de Dados
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${tipoReferencia === 'upload' ? 'bg-[#0a4d8c] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleTipoReferenciaChange('upload')}
                >
                  Upload de Arquivo
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${tipoReferencia === 'web' ? 'bg-[#0a4d8c] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleTipoReferenciaChange('web')}
                >
                  Informar Manualmente
                </button>
              </div>
              
              {tipoReferencia === 'base' && (
                <div className="border border-gray-200 rounded-md p-4 mb-4">
                  <h3 className="font-medium mb-2">Selecione as referências:</h3>
                  <div className="space-y-2">
                    {referenciasBanco.map((ref, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`ref-${index}`}
                          checked={referenciasSelecionadas.includes(ref)}
                          onChange={() => handleReferenciaSelect(ref)}
                          className="mr-2"
                        />
                        <label htmlFor={`ref-${index}`}>{ref}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {tipoReferencia === 'upload' && (
                <div className="border border-gray-200 rounded-md p-4 mb-4">
                  <h3 className="font-medium mb-2">Upload de arquivo:</h3>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleLocalFileChange}
                    className="w-full"
                  />
                  {formData.arquivoReferencia && (
                    <p className="mt-2 text-sm text-green-600">
                      Arquivo selecionado: {formData.arquivoReferencia.name}
                    </p>
                  )}
                </div>
              )}
              
              {tipoReferencia === 'web' && (
                <div>
                  <label htmlFor="referencia" className="block mb-2 font-medium">
                    Referência Científica (Livro ou Artigo)
                  </label>
                  <input
                    type="text"
                    id="referencia"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    placeholder="Ex: Harrison - Medicina Interna, 20ª edição, Capítulo 269"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="tema" className="block mb-2 font-medium">
                Tema da Questão
              </label>
              <input
                type="text"
                id="tema"
                name="tema"
                value={formData.tema}
                onChange={handleChange}
                placeholder="Ex: Infarto Agudo do Miocárdio"
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="objetivoAprendizagem" className="block mb-2 font-medium">
                Objetivo de Aprendizagem
              </label>
              <textarea
                id="objetivoAprendizagem"
                name="objetivoAprendizagem"
                value={formData.objetivoAprendizagem}
                onChange={handleChange}
                placeholder="Ex: Avaliar o conhecimento sobre o tratamento do infarto agudo do miocárdio com supradesnivelamento do segmento ST"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={4}
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="nivelDificuldade" className="block mb-2 font-medium">
                  Nível de Dificuldade
                </label>
                <select
                  id="nivelDificuldade"
                  name="nivelDificuldade"
                  value={formData.nivelDificuldade}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="modeloQuestao" className="block mb-2 font-medium">
                  Modelo da Questão
                </label>
                <select
                  id="modeloQuestao"
                  name="modeloQuestao"
                  value={formData.modeloQuestao}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Múltipla Escolha">Múltipla Escolha</option>
                  <option value="Dissertativa">Dissertativa</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="px-8 py-3 bg-[#0a4d8c] text-white font-medium rounded-md hover:bg-[#083b6f] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Gerando Questão...' : 'Gerar Questão'}
              </button>
            </div>
            
            {isLoading && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0a4d8c]"></div>
                <p className="mt-2 text-[#0a4d8c]">{searchStatus}</p>
              </div>
            )}
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0a4d8c]">Questão Gerada</h2>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Voltar
            </button>
          </div>
          
          <div className="border-b pb-4 mb-4">
            <p className="text-sm text-gray-500">Professor: {currentUser?.name || 'Professor'}</p>
            <p className="text-sm text-gray-500">Faculdade: {currentUser?.faculdade || 'Faculdade de Medicina'}</p>
            <p className="text-sm text-gray-500">Disciplina: {currentUser?.disciplina || 'Medicina'}</p>
            <p className="text-sm text-gray-500">Data de Criação: {new Date().toISOString().split('T')[0]}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-1">Tema da Questão:</h3>
            <p>{questaoGerada.tema}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-1">Objetivo de Aprendizagem:</h3>
            <p>{questaoGerada.objetivoAprendizagem}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-1">Nível de Dificuldade:</h3>
              <p>{questaoGerada.nivelDificuldade}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Modelo da Questão:</h3>
              <p>{questaoGerada.modeloQuestao}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-1">Referência Científica:</h3>
            <p>{formData.referencia}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-md mb-6">
            <h3 className="font-bold mb-4 text-lg">Enunciado:</h3>
            <p className="mb-4">{questaoGerada.enunciadoClinico}</p>
            
            <h3 className="font-bold mb-2">Qual a conduta mais adequada para este paciente?</h3>
            
            {questaoGerada.modeloQuestao.includes('Múltipla Escolha') && (
              <div className="mt-4 space-y-2">
                {questaoGerada.alternativas && questaoGerada.alternativas.length > 0 ? (
                  questaoGerada.alternativas.map((alt, index) => (
                    <div key={index} className="flex items-start">
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)})</span>
                      <p>{alt.texto}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-600">Alternativas não disponíveis</p>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-6 rounded-md mb-6">
            <h3 className="font-bold mb-2 text-[#0a4d8c]">Resposta Correta:</h3>
            {questaoGerada.modeloQuestao.includes('Múltipla Escolha') ? (
              <p className="font-medium">
                Alternativa {String.fromCharCode(65 + questaoGerada.alternativas.findIndex(alt => alt.isCorreta))}
              </p>
            ) : (
              <p className="italic">Questão dissertativa - verificar comentário explicativo</p>
            )}
          </div>
          
          <div className="bg-green-50 p-6 rounded-md">
            <h3 className="font-bold mb-2 text-green-700">Comentário Explicativo:</h3>
            <div className="explanation-text">
              {questaoGerada.explicacao.split('\n').map((paragraph, index) => {
                // Processar negrito (**texto**)
                const processedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                return (
                  <p 
                    key={index} 
                    className={index > 0 ? "mt-2" : ""}
                    dangerouslySetInnerHTML={{ __html: processedText }}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={async () => {
                try {
                  const questaoSalva = await saveQuestion(questaoGerada, formData.referencia);
                  alert(`Questão salva com sucesso! ID: ${questaoSalva.id}`);
                } catch (error) {
                  console.error('Erro ao salvar questão:', error);
                  alert('Erro ao salvar questão. Por favor, tente novamente.');
                }
              }}
              className="px-6 py-2 bg-[#0a4d8c] text-white font-medium rounded-md hover:bg-[#083b6f] transition-colors mr-4"
            >
              Salvar Questão
            </button>
          </div>
          
          {/* Componente de exportação */}
          <ExportQuestao 
            questao={questaoGerada} 
            professor={currentUser?.name || 'Professor'} 
            faculdade={currentUser?.faculdade || 'Faculdade de Medicina'} 
            disciplina={currentUser?.disciplina || 'Medicina'} 
            referencia={formData.referencia}
          />
        </div>
      )}
    </div>
  );
}
