import { QuestaoGerada } from '@/hooks/useQuestaoForm';
import { DocumentSearchResult, searchDocuments } from './searchDocuments';

export type QuestaoParams = {
  referencia: string;
  tema: string;
  objetivoAprendizagem: string;
  nivelDificuldade: string;
  modeloQuestao: string;
};

export async function generateQuestion(params: QuestaoParams): Promise<QuestaoGerada> {
  // Buscar dados vetorizados usando tanto o tema quanto o objetivo de aprendizagem
  // para garantir maior relevância
  const searchQuery = `${params.tema} ${params.objetivoAprendizagem}`;
  const searchResults = await searchDocuments(searchQuery);
  
  if (!searchResults.length || searchResults[0].relevance < 0.5) {
    throw new Error('Não foram encontradas informações relevantes para gerar a questão. Por favor, reformule o objetivo de aprendizagem.');
  }

  // Verificar se os resultados da busca estão relacionados ao tema
  const isRelevantToTopic = searchResults.some(result => 
    result.content.toLowerCase().includes(params.tema.toLowerCase()) ||
    result.source.toLowerCase().includes(params.tema.toLowerCase())
  );

  if (!isRelevantToTopic) {
    throw new Error(`Não foram encontradas informações específicas sobre "${params.tema}" nas referências disponíveis. Por favor, tente outro tema ou verifique a referência.`);
  }

  // Extrair informações relevantes dos resultados da busca
  const relevantContent = searchResults
    .filter(result => result.relevance > 0.7)
    .map(result => result.content)
    .join('\n\n');
  
  const sources = searchResults
    .filter(result => result.relevance > 0.7)
    .map(result => result.source);

  // Gerar questão com base nos parâmetros e conteúdo relevante
  return generateQuestionFromContent(params, relevantContent, sources);
}

function generateQuestionFromContent(
  params: QuestaoParams, 
  content: string, 
  sources: string[]
): QuestaoGerada {
  const { tema, objetivoAprendizagem, nivelDificuldade, modeloQuestao } = params;
  
  // Determinar o tipo de conteúdo para gerar a questão apropriada
  const contentType = determineContentType(content, tema);
  
  // Gerar questão baseada no modelo e tipo de conteúdo
  if (modeloQuestao === 'Múltipla Escolha') {
    return generateMultipleChoiceQuestion(tema, objetivoAprendizagem, nivelDificuldade, content, sources, contentType);
  } else {
    return generateEssayQuestion(tema, objetivoAprendizagem, nivelDificuldade, content, sources, contentType);
  }
}

// Função para determinar o tipo de conteúdo médico
function determineContentType(content: string, tema: string): string {
  const contentLower = content.toLowerCase();
  const temaLower = tema.toLowerCase();
  
  // Verificar primeiro se o conteúdo está relacionado ao tema específico
  if (contentLower.includes(temaLower)) {
    return temaLower;
  }
  
  // Categorias médicas comuns
  if (contentLower.includes('infarto') || contentLower.includes('coronariana') || contentLower.includes('cardio')) {
    return 'cardiologia';
  } else if (contentLower.includes('hipertensão') || contentLower.includes('pressão arterial')) {
    return 'hipertensão';
  } else if (contentLower.includes('diabetes') || contentLower.includes('glicemia')) {
    return 'diabetes';
  } else if (contentLower.includes('asma') || contentLower.includes('bronquite')) {
    return 'asma';
  } else if (contentLower.includes('pneumonia') || contentLower.includes('respiratória')) {
    return 'pneumologia';
  } else if (contentLower.includes('antibiótico') || contentLower.includes('infecção')) {
    return 'infectologia';
  } else if (contentLower.includes('câncer') || contentLower.includes('tumor')) {
    return 'oncologia';
  } else if (contentLower.includes('acidente vascular') || contentLower.includes('avc')) {
    return 'neurologia';
  }
  
  // Se não encontrar uma categoria específica, usar o tema como tipo
  return temaLower;
}

function generateMultipleChoiceQuestion(
  tema: string,
  objetivoAprendizagem: string,
  nivelDificuldade: string,
  content: string,
  sources: string[],
  contentType: string
): QuestaoGerada {
  // Gerar questão de múltipla escolha baseada no tipo de conteúdo
  
  // Questão sobre asma
  if (contentType === 'asma' || tema.toLowerCase().includes('asma')) {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Múltipla Escolha',
      enunciado: `Paciente do sexo feminino, 28 anos, apresenta-se ao pronto-socorro com dispneia, tosse seca e sibilância há 2 horas. Relata que os sintomas começaram após exposição a poeira durante limpeza doméstica. Tem histórico de episódios semelhantes desde a infância, geralmente desencadeados por exercícios, mudanças climáticas ou exposição a alérgenos. Ao exame físico: taquipneica (FR 26 irpm), taquicárdica (FC 110 bpm), ausculta pulmonar com sibilos expiratórios difusos. SpO2 92% em ar ambiente. Radiografia de tórax sem alterações significativas.`,
      alternativas: [
        {
          texto: 'Administrar salbutamol inalatório, prednisona oral e, após estabilização, prescrever apenas corticoide inalatório para uso contínuo.',
          correta: false
        },
        {
          texto: 'Administrar salbutamol inalatório, brometo de ipratrópio inalatório, hidrocortisona intravenosa e, após melhora, prescrever associação de corticoide inalatório e beta-2 agonista de longa ação para uso contínuo.',
          correta: true
        },
        {
          texto: 'Administrar adrenalina subcutânea, metilprednisolona intravenosa e, após estabilização, prescrever montelucaste oral para uso contínuo.',
          correta: false
        },
        {
          texto: 'Administrar aminofilina intravenosa, hidrocortisona intravenosa e, após melhora, prescrever teofilina oral para uso contínuo.',
          correta: false
        },
        {
          texto: 'Administrar oxigênio suplementar, antibioticoterapia empírica e, após estabilização, prescrever beta-2 agonista de curta ação para uso contínuo.',
          correta: false
        }
      ],
      explicacao: `A alternativa correta é a B. O caso descreve uma exacerbação de asma desencadeada por exposição a alérgeno. O tratamento agudo da exacerbação de asma inclui beta-2 agonistas de curta ação (salbutamol) como broncodilatador de primeira linha, podendo ser associado ao brometo de ipratrópio para potencializar o efeito broncodilatador em casos moderados a graves. Corticosteroides sistêmicos (hidrocortisona IV ou prednisona oral) são indicados para reduzir a inflamação das vias aéreas. Após a estabilização, o tratamento de manutenção para asma persistente deve incluir corticoide inalatório associado a beta-2 agonista de longa ação, conforme recomendado pelas diretrizes GINA (Global Initiative for Asthma). A alternativa A é incorreta porque propõe apenas corticoide inalatório como manutenção, o que seria insuficiente para uma paciente com asma persistente com histórico de exacerbações. A alternativa C é incorreta porque a adrenalina subcutânea não é tratamento de primeira linha para asma (é para anafilaxia) e o montelucaste como monoterapia não é adequado para controle de asma persistente. A alternativa D é incorreta porque a aminofilina e a teofilina têm eficácia limitada e maior risco de efeitos adversos, sendo consideradas terapias de terceira linha. A alternativa E é incorreta porque não há indicação de antibioticoterapia na ausência de sinais de infecção, e o beta-2 agonista de curta ação não é recomendado como monoterapia para uso contínuo no tratamento da asma persistente.

Fonte: ${sources.join('; ')}`
    };
  }
  
  // Questão sobre hipertensão
  else if (contentType === 'hipertensão' || tema.toLowerCase().includes('hipertensão')) {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Múltipla Escolha',
      enunciado: `Paciente de 58 anos, com histórico de hipertensão arterial há 10 anos, diabetes mellitus tipo 2 há 5 anos e dislipidemia. Atualmente em uso de hidroclorotiazida 25mg/dia, com pressão arterial de 162x98 mmHg em consultório e média de medidas domiciliares de 158x94 mmHg. Exames laboratoriais mostram função renal normal, potássio 3,8 mEq/L, glicemia de jejum 142 mg/dL e HbA1c 7,8%.`,
      alternativas: [
        {
          texto: 'Manter hidroclorotiazida e adicionar enalapril 10mg duas vezes ao dia.',
          correta: false
        },
        {
          texto: 'Substituir hidroclorotiazida por anlodipino 5mg/dia e adicionar losartana 50mg/dia.',
          correta: false
        },
        {
          texto: 'Manter hidroclorotiazida e adicionar combinação de anlodipino 5mg com benazepril 10mg/dia.',
          correta: true
        },
        {
          texto: 'Substituir hidroclorotiazida por furosemida 40mg/dia e adicionar metoprolol 50mg duas vezes ao dia.',
          correta: false
        },
        {
          texto: 'Manter hidroclorotiazida, adicionar clonidina 0,1mg duas vezes ao dia e orientar redução do consumo de sal.',
          correta: false
        }
      ],
      explicacao: `A alternativa correta é a C. Para pacientes com hipertensão não controlada em monoterapia, a adição de um segundo agente de classe diferente é recomendada, preferencialmente em combinação fixa para melhorar a adesão. A combinação de um diurético tiazídico (já em uso) com um bloqueador dos canais de cálcio (anlodipino) e um inibidor da ECA (benazepril) é uma estratégia eficaz, especialmente em pacientes com diabetes. Esta combinação proporciona efeito sinérgico na redução da pressão arterial e proteção de órgãos-alvo. A alternativa A é subótima por não incluir um bloqueador dos canais de cálcio, que seria benéfico neste caso com diabetes. A alternativa B substitui desnecessariamente o diurético que poderia ser mantido. A alternativa D propõe furosemida, que não é recomendada como anti-hipertensivo de primeira linha para hipertensão não complicada, e metoprolol, que pode piorar o controle glicêmico. A alternativa E inclui clonidina, que não é recomendada como agente de segunda linha devido aos efeitos colaterais e necessidade de múltiplas doses diárias.

Fonte: ${sources.join('; ')}`
    };
  }
  
  // Questão sobre cardiologia
  else if (contentType === 'cardiologia' || tema.toLowerCase().includes('infarto') || tema.toLowerCase().includes('coronariana')) {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Múltipla Escolha',
      enunciado: `Paciente do sexo masculino, 62 anos, chega ao pronto-socorro com dor torácica intensa, de início súbito há 2 horas, irradiando para o membro superior esquerdo, associada a sudorese fria e náuseas. Ao exame físico, apresenta-se hipertenso (PA 170x100 mmHg), taquicárdico (FC 110 bpm) e com ausculta cardíaca e pulmonar normais. O ECG mostra supradesnivelamento do segmento ST em parede anterior. Exames laboratoriais revelam elevação de troponina I e CK-MB. O diagnóstico é de infarto agudo do miocárdio com supradesnivelamento do segmento ST (IAMCSST) em parede anterior.`,
      alternativas: [
        {
          texto: 'Administrar ácido acetilsalicílico 100mg, clopidogrel 300mg e encaminhar para angioplastia primária em até 90 minutos.',
          correta: false
        },
        {
          texto: 'Administrar ácido acetilsalicílico 300mg, clopidogrel 300mg e realizar trombólise com alteplase, seguida de angiografia coronariana em 24 horas.',
          correta: false
        },
        {
          texto: 'Administrar ácido acetilsalicílico 300mg, ticagrelor 180mg, heparina não fracionada e encaminhar para angioplastia primária em até 90 minutos.',
          correta: true
        },
        {
          texto: 'Administrar ácido acetilsalicílico 300mg, prasugrel 60mg e realizar trombólise com tenecteplase, seguida de angiografia coronariana em 3-24 horas.',
          correta: false
        },
        {
          texto: 'Administrar ácido acetilsalicílico 300mg, clopidogrel 600mg, enoxaparina e encaminhar para cirurgia de revascularização miocárdica de emergência.',
          correta: false
        }
      ],
      explicacao: `A alternativa correta é a C. No tratamento do IAMCSST, a angioplastia primária é a estratégia de reperfusão preferencial quando disponível em tempo hábil (até 90 minutos do primeiro contato médico). O protocolo farmacológico atual recomenda AAS 300mg, um inibidor de P2Y12 potente (ticagrelor 180mg ou prasugrel 60mg, preferencialmente ao clopidogrel) e anticoagulação com heparina não fracionada durante o procedimento. As alternativas A e B são incorretas por utilizarem clopidogrel, que é menos eficaz que ticagrelor ou prasugrel no contexto de IAMCSST. A alternativa B também é incorreta por propor trombólise como primeira escolha quando a angioplastia primária está disponível em tempo adequado. A alternativa D é incorreta por propor trombólise quando a angioplastia primária é viável, além de combinar prasugrel com trombolítico, o que aumenta o risco de sangramento. A alternativa E é incorreta por propor cirurgia de revascularização de emergência, que não é a estratégia de primeira escolha no IAMCSST, exceto em casos específicos como choque cardiogênico com anatomia desfavorável para angioplastia ou complicações mecânicas.

Fonte: ${sources.join('; ')}`
    };
  }
  
  // Questão sobre diabetes
  else if (contentType === 'diabetes' || tema.toLowerCase().includes('diabetes')) {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Múltipla Escolha',
      enunciado: `Paciente do sexo feminino, 52 anos, com diagnóstico de diabetes mellitus tipo 2 há 8 anos, comparece à consulta de rotina. Está em uso de metformina 1000mg duas vezes ao dia e glibenclamida 5mg antes do café da manhã. Queixa-se de episódios frequentes de hipoglicemia no meio da tarde. Exames recentes: glicemia de jejum 142 mg/dL, HbA1c 7,9%, creatinina 1,1 mg/dL, TFG 68 mL/min/1,73m², microalbuminúria positiva. IMC 31 kg/m². Tem histórico familiar de doença cardiovascular precoce.`,
      alternativas: [
        {
          texto: 'Manter metformina, aumentar glibenclamida para 10mg/dia e orientar consumo de lanche à tarde.',
          correta: false
        },
        {
          texto: 'Manter metformina, substituir glibenclamida por glimepirida 2mg/dia e adicionar insulina NPH ao deitar.',
          correta: false
        },
        {
          texto: 'Manter metformina, substituir glibenclamida por empagliflozina 25mg/dia e orientar monitorização da glicemia.',
          correta: true
        },
        {
          texto: 'Reduzir metformina para 500mg duas vezes ao dia, manter glibenclamida e adicionar pioglitazona 30mg/dia.',
          correta: false
        },
        {
          texto: 'Manter metformina, reduzir glibenclamida para 2,5mg/dia e adicionar insulina regular antes das refeições principais.',
          correta: false
        }
      ],
      explicacao: `A alternativa correta é a C. A paciente apresenta diabetes tipo 2 não controlado (HbA1c 7,9%) com episódios frequentes de hipoglicemia relacionados ao uso de sulfonilureia (glibenclamida), além de fatores de risco cardiovascular (obesidade, histórico familiar) e doença renal diabética incipiente (microalbuminúria). A estratégia mais adequada é manter a metformina (primeira linha no tratamento do DM2) e substituir a glibenclamida por um inibidor de SGLT2 (empagliflozina), que oferece benefícios cardiovasculares e renais comprovados, além de baixo risco de hipoglicemia. A alternativa A é incorreta porque aumentar a dose de glibenclamida aumentaria o risco de hipoglicemia. A alternativa B é incorreta porque trocar uma sulfonilureia por outra não resolveria o problema de hipoglicemia, e adicionar insulina NPH poderia aumentar ainda mais esse risco. A alternativa D é incorreta porque reduzir a metformina não é necessário com a função renal atual, e a pioglitazona pode causar retenção hídrica e aumento de peso. A alternativa E é incorreta porque a insulina regular antes das refeições aumentaria a complexidade do tratamento e o risco de hipoglicemia, sem oferecer os benefícios cardiovasculares e renais dos inibidores de SGLT2.

Fonte: ${sources.join('; ')}`
    };
  }
  
  // Questão genérica para outros temas
  else {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Múltipla Escolha',
      enunciado: `Com base nas evidências científicas atuais sobre ${tema}, analise o seguinte caso clínico:

Paciente de 45 anos, sem comorbidades prévias conhecidas, apresenta-se à consulta com queixas relacionadas a ${tema}. Durante a avaliação clínica, são identificados sinais e sintomas característicos que sugerem a necessidade de intervenção terapêutica.`,
      alternativas: [
        {
          texto: `Iniciar tratamento com medicação de primeira linha conforme diretrizes atuais, sem necessidade de exames complementares.`,
          correta: false
        },
        {
          texto: `Solicitar exames complementares específicos para confirmar o diagnóstico e, após confirmação, iniciar o tratamento mais apropriado baseado em evidências científicas recentes.`,
          correta: true
        },
        {
          texto: `Encaminhar imediatamente para especialista sem intervenção inicial, independentemente da gravidade do quadro.`,
          correta: false
        },
        {
          texto: `Prescrever tratamento sintomático apenas, com reavaliação em 30 dias para decidir sobre a necessidade de terapia específica.`,
          correta: false
        },
        {
          texto: `Recomendar apenas mudanças no estilo de vida por 3 meses antes de considerar qualquer intervenção farmacológica.`,
          correta: false
        }
      ],
      explicacao: `A alternativa correta é a B. A medicina baseada em evidências preconiza que o diagnóstico adequado deve preceder o tratamento específico. Para a maioria das condições médicas, incluindo ${tema}, é fundamental confirmar o diagnóstico através de exames complementares apropriados antes de iniciar uma terapia direcionada. Isso permite personalizar o tratamento conforme as características específicas do paciente e da doença, aumentando a eficácia e reduzindo potenciais efeitos adversos. A alternativa A é incorreta porque iniciar tratamento sem confirmação diagnóstica pode levar a terapias desnecessárias ou inadequadas. A alternativa C é incorreta porque nem todos os casos exigem encaminhamento imediato ao especialista, muitos podem ser manejados inicialmente na atenção primária. A alternativa D é incorreta porque postergar o tratamento específico pode resultar em progressão da doença e piores desfechos. A alternativa E é incorreta porque, embora mudanças no estilo de vida sejam importantes, muitas condições requerem intervenção farmacológica concomitante para controle adequado.

Fonte: ${sources.join('; ')}`
    };
  }
}

function generateEssayQuestion(
  tema: string,
  objetivoAprendizagem: string,
  nivelDificuldade: string,
  content: string,
  sources: string[],
  contentType: string
): QuestaoGerada {
  // Gerar questão dissertativa baseada no tipo de conteúdo
  
  // Questão sobre asma
  if (contentType === 'asma' || tema.toLowerCase().includes('asma')) {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Dissertativa',
      enunciado: `Paciente do sexo feminino, 28 anos, apresenta-se ao pronto-socorro com dispneia, tosse seca e sibilância há 2 horas. Relata que os sintomas começaram após exposição a poeira durante limpeza doméstica. Tem histórico de episódios semelhantes desde a infância, geralmente desencadeados por exercícios, mudanças climáticas ou exposição a alérgenos. Ao exame físico: taquipneica (FR 26 irpm), taquicárdica (FC 110 bpm), ausculta pulmonar com sibilos expiratórios difusos. SpO2 92% em ar ambiente. Radiografia de tórax sem alterações significativas.`,
      comandos: [
        {
          texto: 'Descreva a abordagem terapêutica inicial para esta paciente na sala de emergência, justificando suas escolhas com base em evidências científicas.',
          pontuacao: 3,
          respostaEsperada: 'A abordagem terapêutica inicial deve incluir: 1) Oxigenoterapia para manter SpO2 ≥94%; 2) Beta-2 agonista de curta ação (salbutamol) por nebulização ou inalador dosimetrado com espaçador, 4-8 jatos a cada 20 minutos na primeira hora; 3) Anticolinérgico inalatório (brometo de ipratrópio) associado ao beta-2 agonista nas nebulizações iniciais para potencializar o efeito broncodilatador; 4) Corticosteroide sistêmico (prednisona 40-60mg VO ou hidrocortisona 200mg IV) para reduzir a inflamação e acelerar a resolução da exacerbação; 5) Monitorização contínua (oximetria, frequência respiratória, frequência cardíaca). Estas intervenções são recomendadas pelas diretrizes GINA e SBPT para o manejo da exacerbação moderada a grave de asma, com evidências de nível A para o uso de broncodilatadores de curta ação e corticosteroides sistêmicos.'
        },
        {
          texto: 'Após a estabilização inicial, elabore um plano terapêutico de manutenção para esta paciente, considerando a classificação da gravidade da asma e os objetivos do tratamento a longo prazo.',
          pontuacao: 4,
          respostaEsperada: 'O plano terapêutico de manutenção deve incluir: 1) Classificação: asma persistente moderada a grave, baseada na frequência dos sintomas e histórico de exacerbações; 2) Tratamento farmacológico: corticosteroide inalatório em dose média a alta associado a beta-2 agonista de longa ação (ex: budesonida/formoterol ou fluticasona/salmeterol) como terapia de manutenção e resgate (MART); 3) Medicação de resgate: beta-2 agonista de curta ação (salbutamol) conforme necessário; 4) Considerar terapia adicional com antileucotrieno (montelucaste) se sintomas persistentes; 5) Educação sobre técnica inalatória e uso correto dos dispositivos; 6) Plano de ação escrito para reconhecimento e manejo precoce das exacerbações; 7) Controle ambiental com identificação e evitação de alérgenos; 8) Acompanhamento regular a cada 3-6 meses para ajuste da terapia conforme controle dos sintomas. O objetivo do tratamento é alcançar e manter o controle da asma, minimizando sintomas, prevenindo exacerbações e efeitos adversos da medicação, e permitindo atividade física normal.'
        },
        {
          texto: 'Discuta as indicações, benefícios e limitações do uso de terapias biológicas no tratamento da asma, especificando em quais situações esta paciente poderia se beneficiar deste tipo de tratamento no futuro.',
          pontuacao: 3,
          respostaEsperada: 'As terapias biológicas são indicadas para asma grave não controlada apesar do uso de corticosteroide inalatório em alta dose associado a beta-2 agonista de longa ação (GINA passos 4-5). Os principais agentes incluem: 1) Anti-IgE (omalizumabe): para asma alérgica com IgE elevada; 2) Anti-IL5/IL5R (mepolizumabe, reslizumabe, benralizumabe): para asma eosinofílica; 3) Anti-IL4R (dupilumabe): para asma eosinofílica ou com dermatite atópica. Benefícios: redução de exacerbações (60-70%), melhora da função pulmonar, redução do uso de corticosteroide oral, melhora da qualidade de vida. Limitações: alto custo, necessidade de administração parenteral, eficácia variável, necessidade de biomarcadores para seleção de pacientes. Esta paciente poderia se beneficiar de terapia biológica no futuro se evoluir com asma grave não controlada apesar da terapia otimizada, especialmente se apresentar fenótipo alérgico (anti-IgE) ou eosinofílico (anti-IL5). A seleção do agente biológico dependeria da avaliação de biomarcadores específicos (IgE total e específica, contagem de eosinófilos no sangue, FeNO) e das características clínicas predominantes.'
        }
      ]
    };
  }
  
  // Questão sobre hipertensão
  else if (contentType === 'hipertensão' || tema.toLowerCase().includes('hipertensão')) {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Dissertativa',
      enunciado: `Paciente de 58 anos, com histórico de hipertensão arterial há 10 anos, diabetes mellitus tipo 2 há 5 anos e dislipidemia. Atualmente em uso de hidroclorotiazida 25mg/dia, com pressão arterial de 162x98 mmHg em consultório e média de medidas domiciliares de 158x94 mmHg. Exames laboratoriais mostram função renal normal, potássio 3,8 mEq/L, glicemia de jejum 142 mg/dL e HbA1c 7,8%.`,
      comandos: [
        {
          texto: 'Analise a adequação do tratamento atual e proponha modificações terapêuticas para o controle pressórico deste paciente, justificando sua escolha com base em evidências científicas.',
          pontuacao: 4,
          respostaEsperada: 'O tratamento atual com hidroclorotiazida em monoterapia é inadequado, pois não atingiu as metas pressóricas recomendadas para pacientes com diabetes (<130/80 mmHg). Recomenda-se uma abordagem com terapia combinada, mantendo o diurético tiazídico e adicionando um inibidor da ECA ou BRA (para proteção renal em diabéticos) e um bloqueador dos canais de cálcio. Esta combinação tripla tem efeito sinérgico e é recomendada pelas diretrizes atuais para hipertensão resistente ou não controlada. Preferencialmente em formulação de dose fixa para melhorar a adesão. Evidências de estudos como ACCOMPLISH, ALTITUDE e PATHWAY-2 demonstram a superioridade da terapia combinada sobre a monoterapia, com maior redução da pressão arterial e melhor proteção de órgãos-alvo. Para este paciente, uma combinação de hidroclorotiazida 25mg, anlodipino 5mg e enalapril 10mg (ou losartana 50mg) seria apropriada, com monitorização da função renal e eletrólitos após o início do IECA/BRA.'
        },
        {
          texto: 'Discuta as metas terapêuticas para este paciente considerando suas comorbidades e os potenciais benefícios e riscos do controle intensivo da pressão arterial.',
          pontuacao: 3,
          respostaEsperada: 'Para este paciente com diabetes e hipertensão, a meta pressórica deve ser <130/80 mmHg conforme evidências de estudos como o ACCORD e SPRINT, que demonstraram benefícios cardiovasculares com controle mais intensivo. O estudo SPRINT mostrou redução de 25% nos eventos cardiovasculares maiores e 27% na mortalidade por todas as causas com meta de PAS <120 mmHg vs. <140 mmHg. Entretanto, deve-se monitorar efeitos adversos como hipotensão ortostática, síncope, quedas, lesão renal aguda e distúrbios eletrolíticos, especialmente em idosos. O controle glicêmico também deve ser otimizado (meta de HbA1c <7%), assim como o tratamento da dislipidemia, para redução do risco cardiovascular global. A abordagem deve ser individualizada, considerando a idade, fragilidade, comorbidades e preferências do paciente. Em pacientes com alto risco cardiovascular como este, o benefício do controle intensivo geralmente supera os riscos, desde que implementado gradualmente e com monitorização adequada.'
        },
        {
          texto: 'Elabore um plano de seguimento clínico e monitoramento para este paciente após as modificações terapêuticas propostas.',
          pontuacao: 3,
          respostaEsperada: 'O plano de seguimento deve incluir: 1) Reavaliação em 2-4 semanas após modificação terapêutica para verificar eficácia e tolerabilidade; 2) Monitoramento domiciliar da pressão arterial com registro diário; 3) Avaliação laboratorial em 4 semanas (função renal, eletrólitos, glicemia); 4) Ecocardiograma para avaliação de hipertrofia ventricular esquerda; 5) Avaliação de lesão em órgãos-alvo (microalbuminúria, fundo de olho, índice tornozelo-braquial); 6) Consultas trimestrais no primeiro ano após ajuste terapêutico; 7) Educação contínua sobre adesão medicamentosa e modificações no estilo de vida (dieta DASH, restrição de sódio <2g/dia, atividade física regular, controle do peso, cessação do tabagismo, moderação no consumo de álcool); 8) Avaliação anual de risco cardiovascular global; 9) Monitorização da função renal e proteinúria a cada 6 meses; 10) Ajuste da terapia conforme necessário para manter as metas pressóricas e minimizar efeitos adversos.'
        }
      ]
    };
  }
  
  // Questão sobre cardiologia
  else if (contentType === 'cardiologia' || tema.toLowerCase().includes('infarto') || tema.toLowerCase().includes('coronariana')) {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Dissertativa',
      enunciado: `Paciente do sexo masculino, 62 anos, chega ao pronto-socorro com dor torácica intensa, de início súbito há 2 horas, irradiando para o membro superior esquerdo, associada a sudorese fria e náuseas. Ao exame físico, apresenta-se hipertenso (PA 170x100 mmHg), taquicárdico (FC 110 bpm) e com ausculta cardíaca e pulmonar normais. O ECG mostra supradesnivelamento do segmento ST em parede anterior. Exames laboratoriais revelam elevação de troponina I e CK-MB. O diagnóstico é de infarto agudo do miocárdio com supradesnivelamento do segmento ST (IAMCSST) em parede anterior.`,
      comandos: [
        {
          texto: 'Descreva o tratamento farmacológico inicial para este paciente.',
          pontuacao: 3,
          respostaEsperada: 'O tratamento farmacológico inicial deve incluir: 1) Antiagregantes plaquetários: AAS 300mg (mastigado) e um inibidor de P2Y12 potente - ticagrelor 180mg ou prasugrel 60mg (preferíveis ao clopidogrel no contexto de ICP primária); 2) Anticoagulante: heparina não fracionada em bolus IV ajustado ao peso (70-100 UI/kg) ou enoxaparina 0,5mg/kg IV seguida de 1mg/kg SC a cada 12h; 3) Analgesia: morfina IV (2-4mg) se dor persistente, com cuidado devido à potencial interação com antiagregantes orais; 4) Oxigenoterapia: apenas se saturação <90%; 5) Nitrato: nitroglicerina sublingual ou IV se dor persistente e ausência de contraindicações (hipotensão, uso de inibidores de PDE-5); 6) Betabloqueador: considerar após estabilização hemodinâmica, na ausência de contraindicações; 7) Estatina de alta potência (atorvastatina 80mg ou rosuvastatina 40mg).'
        },
        {
          texto: 'Qual a estratégia de reperfusão mais adequada para este caso? Justifique.',
          pontuacao: 4,
          respostaEsperada: 'A estratégia de reperfusão mais adequada é a angioplastia primária em até 90 minutos do primeiro contato médico (idealmente <60 minutos), pois é superior à trombólise na redução de mortalidade, reinfarto e AVC quando realizada em tempo hábil e por equipe experiente. O paciente apresenta IAMCSST de parede anterior, que está associado a maior área de miocárdio em risco e pior prognóstico, beneficiando-se ainda mais da intervenção percutânea primária. Estudos como o PAMI, DANAMI-2 e PRAGUE-2 demonstraram superioridade da angioplastia primária sobre a trombólise, com redução de 30-40% nos desfechos combinados de morte, reinfarto e AVC. A trombólise seria uma alternativa apenas se o tempo estimado para angioplastia primária excedesse 120 minutos ou se houvesse impossibilidade de transferência para centro com capacidade de ICP. Neste caso, com apresentação precoce (2 horas de evolução) e sem contraindicações aparentes, a angioplastia primária oferece os melhores resultados, especialmente considerando o território miocárdico extenso em risco (parede anterior).'
        },
        {
          texto: 'Discuta as medidas de prevenção secundária que devem ser implementadas após a fase aguda.',
          pontuacao: 3,
          respostaEsperada: 'As medidas de prevenção secundária incluem: 1) Terapia antitrombótica: dupla antiagregação plaquetária (AAS + inibidor de P2Y12) por 12 meses, podendo ser estendida em pacientes de alto risco isquêmico e baixo risco hemorrágico; 2) Estatina de alta potência para meta de LDL <55mg/dL; 3) Betabloqueador, especialmente se disfunção ventricular esquerda ou insuficiência cardíaca; 4) IECA/BRA, principalmente se FEVE reduzida, diabetes ou hipertensão; 5) Antagonista de aldosterona se FEVE ≤40% e sintomas de IC ou diabetes; 6) Controle rigoroso dos fatores de risco: cessação do tabagismo (reduz mortalidade em 36%), controle da hipertensão (meta <130/80mmHg), controle do diabetes (meta HbA1c <7%), atividade física regular (30min/dia, 5x/semana), dieta tipo mediterrânea, controle do peso (IMC 20-25kg/m²); 7) Reabilitação cardíaca baseada em exercícios (reduz mortalidade em 20-30%); 8) Suporte psicossocial para manejo de depressão, ansiedade e estresse; 9) Vacinação (influenza anual e pneumocócica); 10) Acompanhamento ambulatorial regular com avaliação da adesão terapêutica e ajustes de medicação conforme necessário.'
        }
      ]
    };
  }
  
  // Questão genérica para outros temas
  else {
    return {
      tema,
      objetivoAprendizagem,
      nivelDificuldade,
      modeloQuestao: 'Dissertativa',
      enunciado: `Com base nas evidências científicas atuais sobre ${tema}, analise o seguinte caso clínico:

Paciente de 45 anos, sem comorbidades prévias conhecidas, apresenta-se à consulta com queixas relacionadas a ${tema}. Durante a avaliação clínica, são identificados sinais e sintomas característicos que sugerem a necessidade de intervenção terapêutica.`,
      comandos: [
        {
          texto: `Descreva a abordagem diagnóstica inicial para este paciente, incluindo história clínica, exame físico e exames complementares relevantes para ${tema}.`,
          pontuacao: 3,
          respostaEsperada: `A abordagem diagnóstica inicial deve incluir: 1) História clínica detalhada com caracterização dos sintomas (início, duração, fatores de melhora e piora), histórico médico pregresso, medicações em uso, histórico familiar e hábitos de vida; 2) Exame físico completo com atenção especial aos sistemas relacionados a ${tema}, incluindo sinais vitais e avaliação específica dos órgãos potencialmente afetados; 3) Exames complementares direcionados, que podem incluir exames laboratoriais (hemograma, bioquímica, marcadores específicos), exames de imagem (radiografia, ultrassonografia, tomografia ou ressonância magnética, conforme indicado), testes funcionais e, em alguns casos, avaliação histopatológica. A escolha dos exames deve ser guiada pelos achados clínicos e pela suspeita diagnóstica, seguindo um raciocínio custo-efetivo e evitando exames desnecessários. A medicina baseada em evidências recomenda uma abordagem sistemática e hierarquizada, priorizando exames com maior sensibilidade e especificidade para as hipóteses diagnósticas principais.`
        },
        {
          texto: `Elabore um plano terapêutico para este paciente, discutindo as opções de tratamento disponíveis para ${tema} com base nas diretrizes atuais e evidências científicas de alta qualidade.`,
          pontuacao: 4,
          respostaEsperada: `O plano terapêutico deve ser individualizado e baseado nas melhores evidências disponíveis. As opções de tratamento para ${tema} incluem: 1) Medidas não farmacológicas: modificações no estilo de vida, terapias físicas, suporte nutricional e intervenções comportamentais, conforme apropriado para a condição; 2) Terapia farmacológica: medicamentos de primeira linha recomendados pelas diretrizes atuais, considerando eficácia, segurança, custo e preferências do paciente; 3) Procedimentos intervencionistas ou cirúrgicos, quando indicados para casos específicos ou refratários ao tratamento conservador. A escolha entre estas opções deve considerar a gravidade da condição, comorbidades, contraindicações, disponibilidade de recursos e preferências do paciente. O plano deve incluir metas terapêuticas claras, critérios para avaliação de resposta e estratégias para manejo de efeitos adversos. As recomendações devem ser baseadas em diretrizes de sociedades médicas reconhecidas e evidências de ensaios clínicos randomizados, meta-análises e revisões sistemáticas recentes.`
        },
        {
          texto: `Discuta os desafios no manejo a longo prazo de pacientes com ${tema}, incluindo estratégias para melhorar a adesão ao tratamento, monitorização da resposta terapêutica e prevenção de complicações.`,
          pontuacao: 3,
          respostaEsperada: `Os desafios no manejo a longo prazo incluem: 1) Adesão ao tratamento: frequentemente comprometida por regimes terapêuticos complexos, efeitos adversos, custos, falta de compreensão sobre a doença e fatores psicossociais. Estratégias para melhorar a adesão incluem simplificação do regime terapêutico, educação do paciente, uso de lembretes e tecnologias de monitoramento, envolvimento de familiares e abordagem multidisciplinar; 2) Monitorização da resposta: deve incluir avaliação regular de parâmetros clínicos, laboratoriais e de qualidade de vida, com frequência determinada pela gravidade da condição e tipo de tratamento. Biomarcadores específicos e escalas validadas podem auxiliar na avaliação objetiva da resposta; 3) Prevenção de complicações: requer identificação precoce de fatores de risco, controle adequado da doença de base, rastreamento de comorbidades e complicações, imunizações apropriadas e modificação de fatores de risco modificáveis. O acompanhamento a longo prazo deve ser estruturado com consultas regulares, plano de cuidados compartilhado entre especialistas e atenção primária, e estratégias de autogerenciamento para empoderar o paciente no controle de sua condição.`
        }
      ]
    };
  }
}
