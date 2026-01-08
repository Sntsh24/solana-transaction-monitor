# Solana Transaction Monitor

A real-time DCA pattern detection and monitoring tool for Solana blockchain transactions. Features a dedicated **$ORE Token Dashboard** with whale tracking, DCA detection, and advanced filtering.

## Features

### Main Monitor
- Real-time token transfer monitoring
- Token metadata (name, symbol, market cap)
- Pump.fun and DEXScreener integration
- Auto-refresh every 10 seconds

### $ORE Token Dashboard
- **DCA Pattern Detection** - Automatically identifies wallets doing dollar-cost averaging (buy or sell)
- **Whale Tracking** - Highlights transactions over 1000 ORE
- **Advanced Filtering** - Filter by type (buy/sell), time range, amount, and whale-only
- **Real-time Metrics** - Price, market cap, volume, whale count, active DCA strategies
- **Three View Modes** - Transactions, DCA Patterns, and Whales

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

Get your free Helius API key at: https://helius.dev

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

- **Main Monitor**: http://localhost:3000/
- **$ORE Dashboard**: http://localhost:3000/ore

## Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment instructions to access the dashboard on your phone or from anywhere.

**Quick Deploy:**
1. Go to [vercel.com](https://vercel.com)
2. Import this repository
3. Add `NEXT_PUBLIC_HELIUS_RPC_URL` environment variable
4. Deploy!

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Solana Web3.js** - Blockchain interaction
- **Helius RPC** - Transaction data
- **Jupiter API** - Token pricing and market data

## DCA Detection Algorithm

The app identifies DCA patterns by:
1. Grouping transactions by wallet address
2. Analyzing transaction frequency and regularity
3. Detecting patterns with 3+ similar transactions
4. Classifying frequency (hourly, daily, weekly)
5. Determining if strategy is still active

## Configuration

- **Whale Threshold**: Edit `WHALE_THRESHOLD` in `src/lib/oreMonitor.ts` (default: 1000 ORE)
- **Update Interval**: Edit `UPDATE_INTERVAL` in components (default: 15 seconds)
- **Transaction Limit**: Configurable in component settings

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT
