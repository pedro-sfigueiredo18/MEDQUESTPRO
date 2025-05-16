'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const { user, loading, signInWithPassword, signUp, sendPasswordResetEmail } = useAuth();
  const router = useRouter();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFaculdade, setRegisterFaculdade] = useState('');
  const [registerDisciplina, setRegisterDisciplina] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/criar-questao');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoggingIn(true);
    try {
      const { error } = await signInWithPassword({ email: loginEmail, password: loginPassword });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else {
          setError(error.message || 'Falha no login. Verifique suas credenciais.');
        }
      }
    } catch (err: any) {
      if (err.message.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.');
      } else {
        setError(err.message || 'Falha no login. Verifique suas credenciais.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^[0-9]{6}$/.test(registerPassword)) {
      setError('A senha deve ser um número de 6 dígitos.');
      return;
    }

    setIsRegistering(true);
    try {
      const { error } = await signUp({
        email: registerEmail,
        password: registerPassword,
        data: {
          full_name: registerName,
          faculdade: registerFaculdade,
          disciplina: registerDisciplina,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email já está cadastrado.');
        } else {
          setError(error.message || 'Falha no cadastro. Tente novamente.');
        }
      } else {
        setMessage('Cadastro realizado com sucesso! Por favor, verifique seu email para confirmar sua conta antes de fazer login.');
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterFaculdade('');
        setRegisterDisciplina('');
      }
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setError('Este email já está cadastrado.');
      } else {
        setError(err.message || 'Falha no cadastro. Tente novamente.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginEmail) {
      setError('Por favor, insira seu e-mail no campo de login para redefinir a senha.');
      return;
    }
    setError(null);
    setMessage(null);
    setIsPasswordResetting(true);
    try {
      await sendPasswordResetEmail(loginEmail);
      setMessage('Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.');
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar e-mail de redefinição de senha.');
    } finally {
      setIsPasswordResetting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a4d8c] p-4">
      {/* Logo com tamanho aumentado em 25% */}
      <div className="mb-8">
        <Image src="/images/logo.png" alt="MD ACADÊMICO Logo" width={225} height={112} priority />
      </div>

      {/* App Name Title */}
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        MEDQUEST PRO
      </h1>

      {/* Login/Register Tabs */}
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Cadastro</TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Acesse sua conta MEDQUEST PRO.</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoggingIn}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-500 text-sm">{message}</p>}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button type="submit" className="w-full bg-[#0a4d8c] hover:bg-[#083d70]" disabled={isLoggingIn || isPasswordResetting}>
                  {isLoggingIn ? 'Entrando...' : 'Entrar'}
                </Button>
                <Button variant="link" type="button" onClick={handlePasswordReset} disabled={isLoggingIn || isPasswordResetting}>
                  {isPasswordResetting ? 'Enviando...' : 'Esqueceu a senha?'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro</CardTitle>
              <CardDescription>Crie sua conta para gerar questões.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome Completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha (6 dígitos numéricos)</Label>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-faculdade">Faculdade</Label>
                  <Input
                    id="register-faculdade"
                    type="text"
                    required
                    value={registerFaculdade}
                    onChange={(e) => setRegisterFaculdade(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-disciplina">Disciplina</Label>
                  <Input
                    id="register-disciplina"
                    type="text"
                    required
                    value={registerDisciplina}
                    onChange={(e) => setRegisterDisciplina(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-500 text-sm">{message}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-[#0a4d8c] hover:bg-[#083d70]" disabled={isRegistering}>
                  {isRegistering ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 