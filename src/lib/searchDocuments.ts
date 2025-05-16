// Implementação da função search_documents para buscar dados vetorizados
// Esta é uma simulação da função mencionada no modelo de questão

export type DocumentSearchResult = {
  content: string;
  source: string;
  relevance: number;
};

export async function searchDocuments(query: string): Promise<DocumentSearchResult[]> {
  console.log(`Buscando documentos para: ${query}`);
  
  // Simulação de tempo de processamento para busca em dados vetorizados
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Normalizar a consulta para facilitar a correspondência
  const normalizedQuery = query.toLowerCase();
  
  // Dados simulados para diferentes consultas relacionadas a cardiologia
  if (normalizedQuery.includes('infarto') || 
      normalizedQuery.includes('coronariana') || 
      normalizedQuery.includes('cardio') || 
      normalizedQuery.includes('coração') || 
      normalizedQuery.includes('miocárdio')) {
    return [
      {
        content: `O tratamento do infarto agudo do miocárdio com supradesnivelamento do segmento ST (IAMCSST) deve ser iniciado o mais rapidamente possível. A angioplastia primária é a estratégia de reperfusão preferencial quando disponível em tempo hábil (até 90 minutos do primeiro contato médico). O protocolo farmacológico atual recomenda ácido acetilsalicílico 300mg, um inibidor de P2Y12 potente (ticagrelor 180mg ou prasugrel 60mg, preferencialmente ao clopidogrel) e anticoagulação com heparina não fracionada durante o procedimento. Quando a angioplastia primária não está disponível em tempo adequado, a terapia trombolítica deve ser considerada, idealmente nos primeiros 30 minutos após o primeiro contato médico.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 269: Infarto do Miocárdio com Supradesnivelamento do Segmento ST',
        relevance: 0.95
      },
      {
        content: `Para pacientes com IAMCSST, a terapia antitrombótica adjuvante à reperfusão inclui: 1) Aspirina 162-325 mg (mastigada ou dissolvida, não revestida) como dose de ataque, seguida de 81-325 mg/dia; 2) Inibidor de P2Y12: ticagrelor 180 mg como dose de ataque, seguido de 90 mg duas vezes ao dia, ou prasugrel 60 mg como dose de ataque, seguido de 10 mg/dia (ambos preferíveis ao clopidogrel para pacientes submetidos à ICP primária); 3) Anticoagulante: heparina não fracionada (HNF) em bolus IV ajustado ao peso (70-100 U/kg) ou enoxaparina 0,5 mg/kg IV seguida de 1 mg/kg SC a cada 12 horas.`,
        source: 'Diretrizes da American Heart Association para o Manejo do IAMCSST, 2022',
        relevance: 0.92
      },
      {
        content: `Estudos clínicos demonstraram que o ticagrelor e o prasugrel são superiores ao clopidogrel na redução de eventos cardiovasculares em pacientes com síndrome coronariana aguda, especialmente naqueles submetidos à intervenção coronariana percutânea. O estudo PLATO mostrou que o ticagrelor reduziu significativamente a taxa de morte por causas vasculares, infarto do miocárdio ou AVC em comparação com o clopidogrel (9,8% vs. 11,7%, p<0,001), sem aumento significativo de sangramento maior. O estudo TRITON-TIMI 38 demonstrou que o prasugrel reduziu significativamente eventos isquêmicos em comparação com o clopidogrel (9,9% vs. 12,1%, p<0,001), mas com aumento de sangramento maior.`,
        source: 'Journal of the American College of Cardiology, 2020; 75(14): 1682-1695',
        relevance: 0.88
      }
    ];
  } else if (normalizedQuery.includes('hipertensão') || 
             normalizedQuery.includes('pressão arterial') || 
             normalizedQuery.includes('pressão alta')) {
    return [
      {
        content: `O tratamento da hipertensão arterial deve ser individualizado considerando fatores como idade, comorbidades, tolerância e custo. As principais classes de anti-hipertensivos incluem diuréticos, inibidores da enzima conversora de angiotensina (IECA), bloqueadores dos receptores de angiotensina II (BRA), bloqueadores dos canais de cálcio (BCC) e betabloqueadores. Para a maioria dos pacientes, a terapia inicial pode ser com um IECA, BRA, BCC ou diurético tiazídico. A combinação de duas ou mais classes em doses baixas frequentemente proporciona melhor controle da pressão arterial com menos efeitos colaterais do que doses mais altas de um único agente.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 271: Hipertensão Arterial',
        relevance: 0.94
      }
    ];
  } else if (normalizedQuery.includes('diabetes') || 
             normalizedQuery.includes('glicemia') || 
             normalizedQuery.includes('insulina')) {
    return [
      {
        content: `O tratamento do diabetes mellitus tipo 2 deve ser individualizado, considerando fatores como idade, comorbidades, risco de hipoglicemia e preferências do paciente. A metformina permanece como a terapia de primeira linha, devido à sua eficácia, segurança, baixo custo e potenciais benefícios cardiovasculares. Para pacientes que não atingem as metas glicêmicas com metformina, as opções de segunda linha incluem inibidores de SGLT2, agonistas do receptor de GLP-1, inibidores de DPP-4, sulfonilureias, tiazolidinedionas e insulina. Os inibidores de SGLT2 e agonistas do receptor de GLP-1 são preferidos em pacientes com doença cardiovascular estabelecida ou alto risco cardiovascular, devido aos seus benefícios comprovados na redução de eventos cardiovasculares.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 396: Diabetes Mellitus',
        relevance: 0.93
      }
    ];
  } else if (normalizedQuery.includes('pneumonia') || 
             normalizedQuery.includes('respiratória') || 
             normalizedQuery.includes('pulmão') || 
             normalizedQuery.includes('pulmonar')) {
    return [
      {
        content: `O tratamento da pneumonia adquirida na comunidade (PAC) deve ser iniciado o mais rapidamente possível após o diagnóstico, idealmente dentro de 4 horas. A escolha do antibiótico deve considerar a gravidade da doença, fatores de risco para patógenos resistentes e o ambiente de tratamento (ambulatorial vs. hospitalar). Para pacientes ambulatoriais sem comorbidades, recomenda-se monoterapia com um macrolídeo (azitromicina ou claritromicina) ou doxiciclina. Para pacientes ambulatoriais com comorbidades, recomenda-se uma fluoroquinolona respiratória (levofloxacino, moxifloxacino) ou a combinação de um beta-lactâmico (amoxicilina, amoxicilina-clavulanato) com um macrolídeo. Para pacientes hospitalizados em enfermaria, recomenda-se a combinação de um beta-lactâmico (ceftriaxona, cefotaxima, ampicilina-sulbactam) com um macrolídeo ou monoterapia com uma fluoroquinolona respiratória.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 121: Pneumonia',
        relevance: 0.91
      }
    ];
  } else if (normalizedQuery.includes('antibiótico') || 
             normalizedQuery.includes('infecção') || 
             normalizedQuery.includes('bacteriana')) {
    return [
      {
        content: `A escolha do antibiótico deve ser baseada no patógeno suspeito, no local da infecção, na gravidade da doença, nos fatores de risco do paciente para resistência antimicrobiana e nas características farmacológicas do medicamento. Para infecções não complicadas do trato urinário, as opções de primeira linha incluem nitrofurantoína, fosfomicina e trimetoprima-sulfametoxazol (se a resistência local for <20%). Para infecções de pele e tecidos moles não complicadas, as opções incluem cefalexina, dicloxacilina ou clindamicina. Para pneumonia adquirida na comunidade em pacientes ambulatoriais, as opções incluem azitromicina, doxiciclina ou uma fluoroquinolona respiratória. Para infecções intra-abdominais, recomenda-se terapia combinada com um beta-lactâmico/inibidor de beta-lactamase ou uma cefalosporina de terceira geração, mais metronidazol.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 139: Tratamento Antimicrobiano',
        relevance: 0.90
      }
    ];
  } else if (normalizedQuery.includes('câncer') || 
             normalizedQuery.includes('oncologia') || 
             normalizedQuery.includes('tumor') || 
             normalizedQuery.includes('neoplasia')) {
    return [
      {
        content: `O tratamento do câncer é multidisciplinar e pode incluir cirurgia, radioterapia, quimioterapia, terapia-alvo, imunoterapia ou uma combinação dessas modalidades. A escolha do tratamento depende do tipo e estágio do câncer, das características moleculares do tumor, da condição clínica do paciente e das suas preferências. Para muitos tumores sólidos em estágio inicial, a cirurgia é o tratamento primário com intenção curativa. A radioterapia pode ser usada como tratamento definitivo, adjuvante ou paliativo. A quimioterapia pode ser administrada como tratamento neoadjuvante (antes da cirurgia), adjuvante (após a cirurgia) ou paliativo. As terapias-alvo, como inibidores de tirosina quinase e anticorpos monoclonais, são direcionadas a alterações moleculares específicas presentes nas células tumorais. A imunoterapia, como os inibidores de checkpoint imunológico (anti-PD-1, anti-PD-L1, anti-CTLA-4), visa potencializar a resposta imune do próprio paciente contra o tumor.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 69: Princípios de Terapia do Câncer',
        relevance: 0.92
      }
    ];
  } else if (normalizedQuery.includes('acidente vascular') || 
             normalizedQuery.includes('avc') || 
             normalizedQuery.includes('derrame') || 
             normalizedQuery.includes('isquemia cerebral')) {
    return [
      {
        content: `O tratamento do acidente vascular cerebral (AVC) isquêmico agudo inclui terapia de reperfusão, medidas de suporte e prevenção de complicações. A terapia trombolítica com alteplase (rt-PA) intravenosa é recomendada para pacientes elegíveis dentro de 4,5 horas do início dos sintomas. A trombectomia mecânica é indicada para pacientes com oclusão de grandes vasos da circulação anterior dentro de 24 horas do início dos sintomas. Medidas adicionais incluem controle da pressão arterial (manter <185/110 mmHg antes da trombólise e <180/105 mmHg após), controle da glicemia, prevenção de trombose venosa profunda, tratamento da febre e manejo das complicações neurológicas. A prevenção secundária deve ser iniciada precocemente e inclui antiplaquetários (AAS, clopidogrel) ou anticoagulantes (para AVC cardioembólico), estatinas, controle da pressão arterial e modificação de fatores de risco.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 419: Doença Cerebrovascular',
        relevance: 0.93
      }
    ];
  } else {
    // Para qualquer outra consulta, retornar dados genéricos com relevância moderada
    return [
      {
        content: `A medicina baseada em evidências utiliza as melhores evidências científicas disponíveis para orientar as decisões clínicas. A hierarquia das evidências, do nível mais alto para o mais baixo, geralmente inclui: revisões sistemáticas e meta-análises de ensaios clínicos randomizados, ensaios clínicos randomizados individuais, estudos de coorte, estudos caso-controle, séries de casos e relatos de casos, e opinião de especialistas. Na prática clínica, é importante considerar não apenas a qualidade da evidência, mas também a relevância clínica, a aplicabilidade ao paciente individual e as preferências do paciente. O processo de tomada de decisão clínica deve integrar a melhor evidência disponível com a experiência clínica do médico e os valores e preferências do paciente.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 3: Medicina Baseada em Evidências',
        relevance: 0.75
      },
      {
        content: `A anamnese e o exame físico continuam sendo os pilares fundamentais da avaliação médica. Uma anamnese completa deve incluir a queixa principal, história da doença atual, antecedentes médicos, medicamentos em uso, alergias, histórico familiar, histórico social e revisão de sistemas. O exame físico deve ser sistemático e direcionado, com atenção especial às áreas relevantes para a queixa do paciente. A combinação de uma anamnese detalhada e um exame físico cuidadoso frequentemente leva ao diagnóstico correto, orienta a seleção de exames complementares e estabelece a base para uma relação médico-paciente efetiva.`,
        source: 'Harrison - Medicina Interna, 20ª edição, Capítulo 1: A Prática da Medicina',
        relevance: 0.70
      }
    ];
  }
}
