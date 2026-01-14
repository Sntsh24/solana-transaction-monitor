import TransactionList from '@/components/TransactionList';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Solana Transaction Monitor</h1>
          <Link
            href="/ore"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            $ORE Dashboard →
          </Link>
        </div>
        <TransactionList />
      </div>
    </main>
  );
}