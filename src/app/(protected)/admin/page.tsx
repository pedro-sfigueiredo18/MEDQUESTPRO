'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { getAllQuestions, initializeDB } from '@/lib/questionService';
import { downloadFile } from '@/lib/exportUtils';

// Tipo para usuário
type Usuario = {
  id: string;
  nome: string;
  email: string;
  faculdade: string;
  disciplina: string;
  nivelAcesso: 'Administrador Geral' | 'Administrador de Faculdade' | 'Professor';
  senha?: string;
};

// Tipo para o formulário de usuário
type FormUsuario = Omit<Usuario, 'id'> & { id?: string };

export default function Admin() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'estatisticas'>('usuarios');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  
  // Estado para gerenciar usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'criar' | 'editar'>('criar');
  const [formUsuario, setFormUsuario] = useState<FormUsuario>({
    nome: '',
    email: '',
    faculdade: '',
    disciplina: '',
    nivelAcesso: 'Professor',
    senha: ''
  });
  const [usuarioParaRemover, setUsuarioParaRemover] = useState<Usuario | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Carregar usuários do localStorage ao montar o componente
  useEffect(() => {
    const usuariosSalvos = localStorage.getItem('usuarios');
    if (usuariosSalvos) {
      setUsuarios(JSON.parse(usuariosSalvos));
    } else {
      // Usuários iniciais
      const usuariosIniciais = [
        {
          id: '1',
          nome: 'Administrador',
          email: 'admin@mdacademico.com',
          faculdade: 'MD Acadêmico',
          disciplina: 'Administração',
          nivelAcesso: 'Administrador Geral' as const
        },
        {
          id: '2',
          nome: 'Pedro Figueiredo',
          email: 'pedro_sfigueiredo@hotmail.com',
          faculdade: 'Faculdade de Medicina',
          disciplina: 'Cardiologia',
          nivelAcesso: 'Administrador Geral' as const
        },
        {
          id: '3',
          nome: 'Maria Silva',
          email: 'maria.silva@exemplo.com',
          faculdade: 'Universidade Federal',
          disciplina: 'Pneumologia',
          nivelAcesso: 'Administrador de Faculdade' as const
        },
        {
          id: '4',
          nome: 'João Santos',
          email: 'joao.santos@exemplo.com',
          faculdade: 'Universidade Federal',
          disciplina: 'Endocrinologia',
          nivelAcesso: 'Professor' as const
        }
      ];
      setUsuarios(usuariosIniciais);
      localStorage.setItem('usuarios', JSON.stringify(usuariosIniciais));
    }
  }, []);
  
  // Salvar usuários no localStorage quando houver alterações
  useEffect(() => {
    if (usuarios.length > 0) {
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
  }, [usuarios]);
  
  // Simulação de estatísticas
  const estatisticas = {
    totalQuestoes: 42,
    questoesPorFaculdade: [
      { faculdade: 'Faculdade de Medicina', quantidade: 18 },
      { faculdade: 'Universidade Federal', quantidade: 24 }
    ],
    questoesPorDisciplina: [
      { disciplina: 'Cardiologia', quantidade: 12 },
      { disciplina: 'Pneumologia', quantidade: 15 },
      { disciplina: 'Endocrinologia', quantidade: 8 },
      { disciplina: 'Neurologia', quantidade: 7 }
    ],
    questoesPorNivel: [
      { nivel: 'Fácil', quantidade: 15 },
      { nivel: 'Médio', quantidade: 20 },
      { nivel: 'Difícil', quantidade: 7 }
    ],
    questoesPorTipo: [
      { tipo: 'Múltipla Escolha', quantidade: 35 },
      { tipo: 'Dissertativa', quantidade: 7 }
    ]
  };
  
  // Funções para gerenciar usuários
  const abrirModalCriarUsuario = () => {
    setFormUsuario({
      nome: '',
      email: '',
      faculdade: '',
      disciplina: '',
      nivelAcesso: 'Professor',
      senha: ''
    });
    setModalMode('criar');
    setShowModal(true);
  };
  
  const abrirModalEditarUsuario = (usuario: Usuario) => {
    setFormUsuario({
      ...usuario,
      senha: '' // Não exibir senha atual
    });
    setModalMode('editar');
    setShowModal(true);
  };
  
  const abrirModalConfirmacaoRemover = (usuario: Usuario) => {
    setUsuarioParaRemover(usuario);
    setShowConfirmModal(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormUsuario(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'criar') {
      // Criar novo usuário
      const novoUsuario: Usuario = {
        ...formUsuario,
        id: Date.now().toString() // ID único baseado no timestamp
      };
      setUsuarios(prev => [...prev, novoUsuario]);
    } else {
      // Editar usuário existente
      setUsuarios(prev => prev.map(u => 
        u.id === formUsuario.id ? { ...formUsuario, id: u.id } : u
      ));
    }
    
    setShowModal(false);
  };
  
  const handleRemoverUsuario = () => {
    if (usuarioParaRemover) {
      setUsuarios(prev => prev.filter(u => u.id !== usuarioParaRemover.id));
      setShowConfirmModal(false);
      setUsuarioParaRemover(null);
    }
  };
  
  // Funções de exportação para relatórios administrativos
  const exportarWord = async () => {
    try {
      setIsExporting(true);
      setExportStatus('Exportando relatório para Word...');
      
      // Criar conteúdo HTML para o relatório
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório Administrativo - MEDQUEST PRO</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0a4d8c; text-align: center; }
            h2 { color: #0a4d8c; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .chart { margin: 15px 0; height: 20px; background-color: #f0f0f0; position: relative; }
            .bar { height: 20px; background-color: #0a4d8c; }
            .watermark { text-align: center; color: #cccccc; margin-top: 50px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Relatório Administrativo - MEDQUEST PRO</h1>
          <p>Data: ${new Date().toLocaleDateString()}</p>
          <p>Gerado por: ${currentUser?.name || 'Administrador'}</p>
          
          <h2>Resumo</h2>
          <p>Total de Questões: ${estatisticas.totalQuestoes}</p>
          <p>Total de Usuários: ${usuarios.length}</p>
          
          <h2>Questões por Faculdade</h2>
          <table>
            <tr>
              <th>Faculdade</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorFaculdade.map(item => `
              <tr>
                <td>${item.faculdade}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Questões por Disciplina</h2>
          <table>
            <tr>
              <th>Disciplina</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorDisciplina.map(item => `
              <tr>
                <td>${item.disciplina}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Questões por Nível de Dificuldade</h2>
          <table>
            <tr>
              <th>Nível</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorNivel.map(item => `
              <tr>
                <td>${item.nivel}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Questões por Tipo</h2>
          <table>
            <tr>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorTipo.map(item => `
              <tr>
                <td>${item.tipo}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Lista de Usuários</h2>
          <table>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Faculdade</th>
              <th>Disciplina</th>
              <th>Nível de Acesso</th>
            </tr>
            ${usuarios.map(user => `
              <tr>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.faculdade}</td>
                <td>${user.disciplina}</td>
                <td>${user.nivelAcesso}</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="watermark">MD ACADÊMICO</div>
          <div class="footer">© ${new Date().getFullYear()} MD Ensino - Todos os direitos reservados</div>
        </body>
        </html>
      `;
      
      // Converter HTML para Blob com codificação UTF-8
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-word;charset=utf-8' });
      
      // Adicionar extensão .doc para que o sistema abra com o Word
      downloadFile(blob, `relatorio_admin_${new Date().toISOString().split('T')[0]}.doc`);
      
      setExportStatus('Relatório exportado com sucesso para Word!');
    } catch (error) {
      console.error('Erro ao exportar relatório para Word:', error);
      setExportStatus('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportarExcel = async () => {
    try {
      setIsExporting(true);
      setExportStatus('Exportando relatório para Excel...');
      
      // Criar dados para o relatório em Excel
      // Adicionar BOM (Byte Order Mark) para garantir que o Excel reconheça o arquivo como UTF-8
      let csvContent = "\uFEFF";
      
      // Informações gerais
      csvContent += "Relatório Administrativo - MEDQUEST PRO\n";
      csvContent += `Data: ${new Date().toLocaleDateString()}\n`;
      csvContent += `Gerado por: ${currentUser?.name || 'Administrador'}\n\n`;
      
      // Resumo
      csvContent += "Resumo\n";
      csvContent += `Total de Questões,${estatisticas.totalQuestoes}\n`;
      csvContent += `Total de Usuários,${usuarios.length}\n\n`;
      
      // Questões por Faculdade
      csvContent += "Questões por Faculdade\n";
      csvContent += "Faculdade,Quantidade,Percentual\n";
      estatisticas.questoesPorFaculdade.forEach(item => {
        csvContent += `"${item.faculdade}",${item.quantidade},${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%\n`;
      });
      csvContent += "\n";
      
      // Questões por Disciplina
      csvContent += "Questões por Disciplina\n";
      csvContent += "Disciplina,Quantidade,Percentual\n";
      estatisticas.questoesPorDisciplina.forEach(item => {
        csvContent += `"${item.disciplina}",${item.quantidade},${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%\n`;
      });
      csvContent += "\n";
      
      // Questões por Nível
      csvContent += "Questões por Nível de Dificuldade\n";
      csvContent += "Nível,Quantidade,Percentual\n";
      estatisticas.questoesPorNivel.forEach(item => {
        csvContent += `"${item.nivel}",${item.quantidade},${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%\n`;
      });
      csvContent += "\n";
      
      // Questões por Tipo
      csvContent += "Questões por Tipo\n";
      csvContent += "Tipo,Quantidade,Percentual\n";
      estatisticas.questoesPorTipo.forEach(item => {
        csvContent += `"${item.tipo}",${item.quantidade},${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%\n`;
      });
      csvContent += "\n";
      
      // Lista de Usuários
      csvContent += "Lista de Usuários\n";
      csvContent += "Nome,E-mail,Faculdade,Disciplina,Nível de Acesso\n";
      usuarios.forEach(user => {
        csvContent += `"${user.nome}","${user.email}","${user.faculdade}","${user.disciplina}","${user.nivelAcesso}"\n`;
      });
      
      // Criar blob com codificação UTF-8
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      
      downloadFile(blob, `relatorio_admin_${new Date().toISOString().split('T')[0]}.csv`);
      
      setExportStatus('Relatório exportado com sucesso para Excel!');
    } catch (error) {
      console.error('Erro ao exportar relatório para Excel:', error);
      setExportStatus('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportarPDF = async () => {
    try {
      setIsExporting(true);
      setExportStatus('Exportando relatório para PDF...');
      
      // Criar conteúdo HTML para o relatório (será convertido para PDF pelo navegador)
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório Administrativo - MEDQUEST PRO</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0a4d8c; text-align: center; }
            h2 { color: #0a4d8c; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .chart { margin: 15px 0; height: 20px; background-color: #f0f0f0; position: relative; }
            .bar { height: 20px; background-color: #0a4d8c; }
            .watermark { 
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              font-size: 100px;
              color: rgba(200, 200, 200, 0.2);
              z-index: -1;
            }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .pagebreak { page-break-before: always; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">MD ACADÊMICO</div>
          
          <h1>Relatório Administrativo - MEDQUEST PRO</h1>
          <p>Data: ${new Date().toLocaleDateString()}</p>
          <p>Gerado por: ${currentUser?.name || 'Administrador'}</p>
          
          <h2>Resumo</h2>
          <p>Total de Questões: ${estatisticas.totalQuestoes}</p>
          <p>Total de Usuários: ${usuarios.length}</p>
          
          <h2>Questões por Faculdade</h2>
          <table>
            <tr>
              <th>Faculdade</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorFaculdade.map(item => `
              <tr>
                <td>${item.faculdade}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Questões por Disciplina</h2>
          <table>
            <tr>
              <th>Disciplina</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorDisciplina.map(item => `
              <tr>
                <td>${item.disciplina}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <div class="pagebreak"></div>
          <div class="watermark">MD ACADÊMICO</div>
          
          <h2>Questões por Nível de Dificuldade</h2>
          <table>
            <tr>
              <th>Nível</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorNivel.map(item => `
              <tr>
                <td>${item.nivel}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Questões por Tipo</h2>
          <table>
            <tr>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Percentual</th>
              <th>Gráfico</th>
            </tr>
            ${estatisticas.questoesPorTipo.map(item => `
              <tr>
                <td>${item.tipo}</td>
                <td>${item.quantidade}</td>
                <td>${((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%</td>
                <td>
                  <div class="chart">
                    <div class="bar" style="width: ${(item.quantidade / estatisticas.totalQuestoes) * 100}%;"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Lista de Usuários</h2>
          <table>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Faculdade</th>
              <th>Disciplina</th>
              <th>Nível de Acesso</th>
            </tr>
            ${usuarios.map(user => `
              <tr>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.faculdade}</td>
                <td>${user.disciplina}</td>
                <td>${user.nivelAcesso}</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="footer">© ${new Date().getFullYear()} MD Ensino - Todos os direitos reservados</div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Imprimir PDF</button>
          </div>
          
          <script>
            // Script para imprimir automaticamente quando a página carregar
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;
      
      // Criar um Blob com o HTML e codificação UTF-8
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      
      // Abrir em uma nova janela para impressão
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setExportStatus('Relatório exportado com sucesso para PDF!');
    } catch (error) {
      console.error('Erro ao exportar relatório para PDF:', error);
      setExportStatus('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0a4d8c] mb-6">Painel Administrativo</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'usuarios' ? 'border-b-2 border-[#0a4d8c] text-[#0a4d8c]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('usuarios')}
        >
          Usuários
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'estatisticas' ? 'border-b-2 border-[#0a4d8c] text-[#0a4d8c]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('estatisticas')}
        >
          Estatísticas
        </button>
      </div>
      
      {activeTab === 'usuarios' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
            <button
              onClick={abrirModalCriarUsuario}
              className="px-4 py-2 bg-[#0a4d8c] text-white rounded hover:bg-[#083b6f] transition-colors"
            >
              Novo Usuário
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Nome</th>
                  <th className="py-2 px-4 border">E-mail</th>
                  <th className="py-2 px-4 border">Faculdade</th>
                  <th className="py-2 px-4 border">Disciplina</th>
                  <th className="py-2 px-4 border">Nível de Acesso</th>
                  <th className="py-2 px-4 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td className="py-2 px-4 border">{usuario.nome}</td>
                    <td className="py-2 px-4 border">{usuario.email}</td>
                    <td className="py-2 px-4 border">{usuario.faculdade}</td>
                    <td className="py-2 px-4 border">{usuario.disciplina}</td>
                    <td className="py-2 px-4 border">{usuario.nivelAcesso}</td>
                    <td className="py-2 px-4 border">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => abrirModalEditarUsuario(usuario)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => abrirModalConfirmacaoRemover(usuario)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'estatisticas' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Estatísticas do Sistema</h2>
            <div className="flex space-x-2">
              <button
                onClick={exportarWord}
                disabled={isExporting}
                className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Exportar Word
              </button>
              <button
                onClick={exportarExcel}
                disabled={isExporting}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Exportar Excel
              </button>
              <button
                onClick={exportarPDF}
                disabled={isExporting}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Exportar PDF
              </button>
            </div>
          </div>
          
          {exportStatus && (
            <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded">
              {exportStatus}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">Questões por Faculdade</h3>
              <div className="space-y-2">
                {estatisticas.questoesPorFaculdade.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span>{item.faculdade}</span>
                      <span>{item.quantidade} ({((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-[#0a4d8c] h-2 rounded-full" 
                        style={{ width: `${(item.quantidade / estatisticas.totalQuestoes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">Questões por Disciplina</h3>
              <div className="space-y-2">
                {estatisticas.questoesPorDisciplina.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span>{item.disciplina}</span>
                      <span>{item.quantidade} ({((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-[#0a4d8c] h-2 rounded-full" 
                        style={{ width: `${(item.quantidade / estatisticas.totalQuestoes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">Questões por Nível de Dificuldade</h3>
              <div className="space-y-2">
                {estatisticas.questoesPorNivel.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span>{item.nivel}</span>
                      <span>{item.quantidade} ({((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-[#0a4d8c] h-2 rounded-full" 
                        style={{ width: `${(item.quantidade / estatisticas.totalQuestoes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">Questões por Tipo</h3>
              <div className="space-y-2">
                {estatisticas.questoesPorTipo.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span>{item.tipo}</span>
                      <span>{item.quantidade} ({((item.quantidade / estatisticas.totalQuestoes) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-[#0a4d8c] h-2 rounded-full" 
                        style={{ width: `${(item.quantidade / estatisticas.totalQuestoes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para criar/editar usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-[#0a4d8c] mb-4">
              {modalMode === 'criar' ? 'Novo Usuário' : 'Editar Usuário'}
            </h3>
            
            <form onSubmit={handleSubmitUsuario}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formUsuario.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formUsuario.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Faculdade</label>
                <input
                  type="text"
                  name="faculdade"
                  value={formUsuario.faculdade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Disciplina</label>
                <input
                  type="text"
                  name="disciplina"
                  value={formUsuario.disciplina}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Nível de Acesso</label>
                <select
                  name="nivelAcesso"
                  value={formUsuario.nivelAcesso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="Professor">Professor</option>
                  <option value="Administrador de Faculdade">Administrador de Faculdade</option>
                  <option value="Administrador Geral">Administrador Geral</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Senha {modalMode === 'editar' && '(deixe em branco para manter a atual)'}</label>
                <input
                  type="password"
                  name="senha"
                  value={formUsuario.senha}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required={modalMode === 'criar'}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0a4d8c] text-white rounded hover:bg-[#083b6f] transition-colors"
                >
                  {modalMode === 'criar' ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de confirmação para remover usuário */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-red-600 mb-4">Confirmar Remoção</h3>
            
            <p className="mb-4">
              Tem certeza que deseja remover o usuário <strong>{usuarioParaRemover?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoverUsuario}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
