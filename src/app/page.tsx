import TransactionList from '@/components/TransactionList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Solana Transaction Monitor</h1>
        <TransactionList />
      </div>
    </main>
  );
}