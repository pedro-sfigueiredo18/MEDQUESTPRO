import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#0a4d8c] shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="bg-white p-2 rounded">
          {/* Assuming logo.png is in public/images */}
          <Image src="/images/logo.png" alt="MEDQUEST PRO Logo" width={150} height={75} priority />
        </Link>
        {/* Add navigation or user menu items here if needed in the future */}
      </div>
    </header>
  );
}

