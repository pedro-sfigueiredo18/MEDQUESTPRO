'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  
  return (
    <nav className="bg-[#0a4d8c] text-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <Link href="/criar-questao" className="hover:text-gray-200">
              Criar Questão
            </Link>
            <Link href="/questoes" className="hover:text-gray-200">
              Minhas Questões
            </Link>
            {(currentUser?.role === 'admin' || currentUser?.role === 'faculdade_admin') && (
              <Link href="/admin" className="hover:text-gray-200">
                Painel Administrativo
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {currentUser?.name}
              {currentUser?.role === 'admin' && ' (Admin)'}
              {currentUser?.role === 'faculdade_admin' && ' (Admin Faculdade)'}
            </span>
            <button 
              onClick={logout}
              className="text-sm hover:text-gray-200"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
