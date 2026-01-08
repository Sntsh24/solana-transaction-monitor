import OreTokenDashboard from '@/components/OreTokenDashboard';
import Link from 'next/link';

export default function OrePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              ← Back to Monitor
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">$ORE Token Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring, DCA detection, and whale tracking for $ORE token</p>
        </div>
        <OreTokenDashboard />
      </div>
    </main>
  );
}
