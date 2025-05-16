// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h2 className="text-2xl font-bold mb-4">Página Não Encontrada</h2>
      <p className="mb-4">Desculpe, não conseguimos encontrar a página que você está procurando.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}

