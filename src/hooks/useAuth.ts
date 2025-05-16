'use client';

import { useState, useEffect } from 'react';

// Tipo para usuário
export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // Em uma aplicação real, nunca armazenamos senhas em texto puro
  faculdade?: string; // Campo adicionado para a nova funcionalidade
  role?: 'admin' | 'faculdade_admin' | 'professor'; // Níveis de acesso
};

// Usuário administrador padrão pré-cadastrado
const DEFAULT_ADMIN: User = {
  id: 'admin-default-id',
  name: 'Administrador',
  email: 'admin@mdacademico.com',
  password: '123456',
  role: 'admin'
};

// Usuário fornecido pelo cliente
const PEDRO_USER: User = {
  id: 'pedro-user-id',
  name: 'Pedro Figueiredo',
  email: 'pedro_sfigueiredo@hotmail.com',
  password: '180971',
  role: 'admin'
};

// Simulação de banco de dados de usuários
const USERS_KEY = 'medquest_users';
const CURRENT_USER_KEY = 'medquest_current_user';

// Hook para gerenciar autenticação
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar o banco de dados de usuários se não existir
  useEffect(() => {
    // Verificar se já existem usuários cadastrados
    const users = getUsers();
    let usersUpdated = false;

    // Adicionar usuário admin padrão se não existir
    if (!users.some(user => user.email === DEFAULT_ADMIN.email)) {
      users.push(DEFAULT_ADMIN);
      usersUpdated = true;
      console.log('Usuário admin padrão adicionado');
    }

    // Adicionar usuário Pedro se não existir
    if (!users.some(user => user.email === PEDRO_USER.email)) {
      users.push(PEDRO_USER);
      usersUpdated = true;
      console.log('Usuário Pedro adicionado');
    }

    // Salvar usuários atualizados
    if (usersUpdated) {
      saveUsers(users);
    }
  }, []);

  // Carregar usuário atual do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      console.log('Tentando carregar usuário atual do localStorage:', storedUser ? 'Encontrado' : 'Não encontrado');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuário carregado com sucesso:', parsedUser.email);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('Erro ao fazer parse do usuário armazenado:', error);
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para registrar um novo usuário
  const register = (name: string, email: string, password: string, faculdade?: string): { success: boolean; message: string } => {
    console.log(`Tentando registrar usuário: ${email}`);
    
    try {
      // Validar formato de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'E-mail inválido.' };
      }

      // Validar senha (6 dígitos numéricos)
      if (password.length !== 6 || !/^\d+$/.test(password)) {
        return { success: false, message: 'A senha deve conter exatamente 6 dígitos numéricos.' };
      }

      // Verificar se o e-mail já está em uso
      const users = getUsers();
      if (users.some(user => user.email === email)) {
        return { success: false, message: 'Este e-mail já está em uso.' };
      }

      // Criar novo usuário
      const newUser: User = {
        id: generateId(),
        name,
        email,
        password,
        faculdade,
        role: 'professor' // Por padrão, novos usuários são professores
      };

      // Adicionar ao "banco de dados"
      users.push(newUser);
      saveUsers(users);
      console.log(`Usuário registrado com sucesso: ${email}`);

      return { success: true, message: 'Cadastro realizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { success: false, message: 'Ocorreu um erro ao registrar o usuário. Por favor, tente novamente.' };
    }
  };

  // Função para fazer login
  const login = (email: string, password: string): { success: boolean; message: string } => {
    console.log(`Tentando fazer login com email: ${email}`);
    
    try {
      const users = getUsers();
      console.log(`Total de usuários cadastrados: ${users.length}`);
      
      const user = users.find(u => u.email === email);
      if (!user) {
        console.log(`Usuário não encontrado: ${email}`);
        return { success: false, message: 'E-mail não encontrado.' };
      }

      if (user.password !== password) {
        console.log(`Senha incorreta para usuário: ${email}`);
        return { success: false, message: 'Senha incorreta.' };
      }

      // Armazenar usuário atual
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      console.log(`Login realizado com sucesso: ${email}`);

      return { success: true, message: 'Login realizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: 'Ocorreu um erro ao fazer login. Por favor, tente novamente.' };
    }
  };

  // Função para fazer logout
  const logout = () => {
    console.log('Realizando logout');
    setCurrentUser(null);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Erro ao remover usuário do localStorage:', error);
    }
  };

  // Função para resetar senha (simulação)
  const resetPassword = (email: string): { success: boolean; message: string } => {
    console.log(`Tentando resetar senha para: ${email}`);
    
    try {
      const users = getUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        console.log(`E-mail não encontrado para reset de senha: ${email}`);
        return { success: false, message: 'E-mail não encontrado.' };
      }

      // Em uma aplicação real, enviaríamos um e-mail com link para redefinir a senha
      // Aqui apenas simulamos o sucesso da operação
      console.log(`Reset de senha solicitado com sucesso para: ${email}`);
      return { 
        success: true, 
        message: 'Instruções para redefinição de senha foram enviadas para seu e-mail.' 
      };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { success: false, message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.' };
    }
  };

  // Função auxiliar para obter usuários do localStorage
  const getUsers = (): User[] => {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) {
        try {
          return JSON.parse(storedUsers);
        } catch (error) {
          console.error('Erro ao fazer parse dos usuários armazenados:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage para obter usuários:', error);
    }
    return [];
  };

  // Função auxiliar para salvar usuários no localStorage
  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários no localStorage:', error);
    }
  };

  // Função auxiliar para gerar ID único
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Função para atualizar perfil de usuário
  const updateUserProfile = (userId: string, updates: Partial<User>): { success: boolean; message: string } => {
    try {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, message: 'Usuário não encontrado.' };
      }
      
      // Atualizar os campos fornecidos
      users[userIndex] = { ...users[userIndex], ...updates };
      saveUsers(users);
      
      // Se o usuário atual foi atualizado, atualizar também o estado e o localStorage
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
      
      return { success: true, message: 'Perfil atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: 'Ocorreu um erro ao atualizar o perfil. Por favor, tente novamente.' };
    }
  };

  // Função para obter todos os usuários (apenas para administradores)
  const getAllUsers = (): User[] => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'faculdade_admin') {
      console.warn('Tentativa não autorizada de acessar lista de usuários');
      return [];
    }
    
    const users = getUsers();
    
    // Se for admin de faculdade, filtrar apenas usuários da mesma faculdade
    if (currentUser?.role === 'faculdade_admin' && currentUser?.faculdade) {
      return users.filter(user => user.faculdade === currentUser.faculdade);
    }
    
    return users;
  };

  return {
    currentUser,
    isLoading,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    getAllUsers
  };
}
