'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/';

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            // Confirmação bem-sucedida, redirecionar para a página inicial
            router.push('/criar-questao');
          } else {
            console.error('Erro na confirmação:', error);
            router.push('/?error=confirmation-error');
          }
        } catch (error) {
          console.error('Erro ao processar callback:', error);
          router.push('/?error=callback-error');
        }
      } else {
        // Se não houver código, redirecionar para a página inicial
        router.push(next);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a4d8c]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-4">
          <svg className="animate-spin h-10 w-10 text-[#0a4d8c] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Confirmando seu email
        </h2>
        <p className="text-gray-600">
          Por favor, aguarde enquanto confirmamos seu email...
        </p>
      </div>
    </div>
  );
} 