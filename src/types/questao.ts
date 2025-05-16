export type Questao = {
  id: string;
  professor: string;
  faculdade: string;
  disciplina: string;
  referencia: string;
  tema: string;
  objetivoAprendizagem: string;
  nivelDificuldade: 'Fácil' | 'Médio' | 'Difícil';
  modeloQuestao: 'Múltipla Escolha' | 'Dissertativa';
  enunciado?: string;
  comando?: string;
  alternativas?: string[];
  respostaCorreta?: string;
  comentarioExplicativo?: string;
  dataCriacao: string;
};
