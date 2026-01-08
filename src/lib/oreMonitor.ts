import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;

// TODO: Replace with actual $ORE token mint address
export const ORE_TOKEN_MINT = 'PASTE_ORE_MINT_ADDRESS_HERE';

export interface OreTransaction {
    signature: string;
    timestamp: string;
    walletAddress: string;
    type: 'buy' | 'sell';
    amount: number;
    pricePerToken?: number;
    totalValue?: number;
    isWhale: boolean;
}

export interface OreDCAPattern {
    walletAddress: string;
    tokenMint: string;
    transactions: OreTransaction[];
    totalAmount: number;
    totalValue: number;
    averageAmount: number;
    averageInterval: number; // in seconds
    frequency: 'hourly' | 'daily' | 'weekly' | 'irregular';
    type: 'buy' | 'sell';
    firstTransaction: string;
    lastTransaction: string;
    isActive: boolean;
}

export interface OreMetrics {
    price: number;
    marketCap: number;
    volume24h: number;
    holders: number;
    transactions24h: number;
    uniqueTraders24h: number;
    topHolders: Array<{
        address: string;
        balance: number;
        percentage: number;
    }>;
}

const connection = (() => {
    if (!HELIUS_RPC_URL) {
        throw new Error('Helius RPC URL not configured');
    }
    return new Connection(HELIUS_RPC_URL, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
    });
})();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const WHALE_THRESHOLD = 1000; // Transactions above this amount are considered "whale" transactions

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Cache-Control': 'no-cache',
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
};

export const getOreTransactions = async (limit: number = 50): Promise<OreTransaction[]> => {
    try {
        if (ORE_TOKEN_MINT === 'PASTE_ORE_MINT_ADDRESS_HERE') {
            throw new Error('ORE token mint address not configured');
        }

        const oreMint = new PublicKey(ORE_TOKEN_MINT);

        // Get signatures for the ORE token
        const signatures = await connection.getSignaturesForAddress(
            oreMint,
            { limit: limit * 2 }
        );

        const transactions: OreTransaction[] = [];

        for (const sig of signatures) {
            try {
                if (transactions.length >= limit) break;
                await sleep(500); // Rate limiting

                const tx = await connection.getParsedTransaction(sig.signature, {
                    maxSupportedTransactionVersion: 0
                });

                if (!tx?.meta || !tx.blockTime) continue;

                const oreTransaction = parseOreTransaction(tx, sig.signature);
                if (oreTransaction) {
                    transactions.push(oreTransaction);
                }

            } catch (error) {
                console.warn('Error processing ORE transaction:', error);
                continue;
            }
        }

        return transactions;
    } catch (error) {
        console.error('Error fetching ORE transactions:', error);
        return [];
    }
};

const parseOreTransaction = (tx: ParsedTransactionWithMeta, signature: string): OreTransaction | null => {
    try {
        if (!tx.meta?.postTokenBalances || !tx.blockTime) return null;

        // Find ORE token balance changes
        const preBalances = tx.meta.preTokenBalances || [];
        const postBalances = tx.meta.postTokenBalances || [];

        for (let i = 0; i < postBalances.length; i++) {
            const postBalance = postBalances[i];
            if (postBalance.mint !== ORE_TOKEN_MINT) continue;

            const preBalance = preBalances.find(b => b.accountIndex === postBalance.accountIndex);
            const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
            const postAmount = postBalance.uiTokenAmount?.uiAmount || 0;
            const amountChange = postAmount - preAmount;

            if (Math.abs(amountChange) < 0.0001) continue; // Ignore tiny changes

            const walletAddress = tx.transaction.message.accountKeys[0].pubkey.toString();

            return {
                signature,
                timestamp: new Date(tx.blockTime * 1000).toISOString(),
                walletAddress,
                type: amountChange > 0 ? 'buy' : 'sell',
                amount: Math.abs(amountChange),
                isWhale: Math.abs(amountChange) >= WHALE_THRESHOLD,
            };
        }

        return null;
    } catch (error) {
        console.warn('Error parsing ORE transaction:', error);
        return null;
    }
};

export const detectOreDCAPatterns = (transactions: OreTransaction[]): OreDCAPattern[] => {
    // Group transactions by wallet
    const walletTransactions = new Map<string, OreTransaction[]>();

    transactions.forEach(tx => {
        const existing = walletTransactions.get(tx.walletAddress) || [];
        existing.push(tx);
        walletTransactions.set(tx.walletAddress, existing);
    });

    const dcaPatterns: OreDCAPattern[] = [];

    walletTransactions.forEach((txs, walletAddress) => {
        // Need at least 3 transactions to identify a DCA pattern
        if (txs.length < 3) return;

        // Sort by timestamp
        const sortedTxs = [...txs].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Analyze for buy DCA pattern
        const buyTxs = sortedTxs.filter(tx => tx.type === 'buy');
        if (buyTxs.length >= 3) {
            const buyPattern = analyzeDCAPattern(walletAddress, ORE_TOKEN_MINT, buyTxs, 'buy');
            if (buyPattern) dcaPatterns.push(buyPattern);
        }

        // Analyze for sell DCA pattern
        const sellTxs = sortedTxs.filter(tx => tx.type === 'sell');
        if (sellTxs.length >= 3) {
            const sellPattern = analyzeDCAPattern(walletAddress, ORE_TOKEN_MINT, sellTxs, 'sell');
            if (sellPattern) dcaPatterns.push(sellPattern);
        }
    });

    return dcaPatterns.sort((a, b) => b.totalAmount - a.totalAmount);
};

const analyzeDCAPattern = (
    walletAddress: string,
    tokenMint: string,
    transactions: OreTransaction[],
    type: 'buy' | 'sell'
): OreDCAPattern | null => {
    if (transactions.length < 3) return null;

    // Calculate intervals between transactions
    const intervals: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
        const interval = new Date(transactions[i].timestamp).getTime() -
                        new Date(transactions[i - 1].timestamp).getTime();
        intervals.push(interval / 1000); // Convert to seconds
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Check if intervals are somewhat regular (allow 50% variance)
    const intervalVariance = intervals.map(i => Math.abs(i - averageInterval) / averageInterval);
    const isRegular = intervalVariance.filter(v => v < 0.5).length / intervalVariance.length > 0.6;

    if (!isRegular) return null; // Not a DCA pattern

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalValue = transactions.reduce((sum, tx) => sum + (tx.totalValue || 0), 0);
    const averageAmount = totalAmount / transactions.length;

    // Determine frequency
    let frequency: 'hourly' | 'daily' | 'weekly' | 'irregular';
    if (averageInterval < 3600 * 2) frequency = 'hourly';
    else if (averageInterval < 86400 * 2) frequency = 'daily';
    else if (averageInterval < 604800 * 2) frequency = 'weekly';
    else frequency = 'irregular';

    // Check if DCA is still active (last transaction within 2x average interval)
    const timeSinceLastTx = Date.now() - new Date(transactions[transactions.length - 1].timestamp).getTime();
    const isActive = timeSinceLastTx < (averageInterval * 2 * 1000);

    return {
        walletAddress,
        tokenMint,
        transactions,
        totalAmount,
        totalValue,
        averageAmount,
        averageInterval,
        frequency,
        type,
        firstTransaction: transactions[0].timestamp,
        lastTransaction: transactions[transactions.length - 1].timestamp,
        isActive,
    };
};

export const getOreMetrics = async (): Promise<OreMetrics | null> => {
    try {
        if (ORE_TOKEN_MINT === 'PASTE_ORE_MINT_ADDRESS_HERE') {
            return null;
        }

        // Fetch price and market data from Jupiter
        const jupiterData = await fetchWithRetry(
            `https://price.jup.ag/v4/price?ids=${ORE_TOKEN_MINT}`,
            { method: 'GET' }
        );

        const price = jupiterData?.data?.[ORE_TOKEN_MINT]?.price || 0;
        const marketCap = jupiterData?.data?.[ORE_TOKEN_MINT]?.marketCap || 0;

        // Note: For full metrics (holders, volume, etc.), you may need additional API calls
        // to services like Helius, Birdeye, or DexScreener

        return {
            price,
            marketCap,
            volume24h: 0, // TODO: Fetch from DEX API
            holders: 0, // TODO: Fetch from Helius
            transactions24h: 0,
            uniqueTraders24h: 0,
            topHolders: [],
        };
    } catch (error) {
        console.error('Error fetching ORE metrics:', error);
        return null;
    }
};

export const filterOreTransactions = (
    transactions: OreTransaction[],
    filters: {
        minAmount?: number;
        maxAmount?: number;
        type?: 'buy' | 'sell' | 'all';
        whaleOnly?: boolean;
        timeRange?: '1h' | '24h' | '7d' | '30d' | 'all';
    }
): OreTransaction[] => {
    let filtered = [...transactions];

    // Filter by amount
    if (filters.minAmount !== undefined) {
        filtered = filtered.filter(tx => tx.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
        filtered = filtered.filter(tx => tx.amount <= filters.maxAmount!);
    }

    // Filter by type
    if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(tx => tx.type === filters.type);
    }

    // Filter whale only
    if (filters.whaleOnly) {
        filtered = filtered.filter(tx => tx.isWhale);
    }

    // Filter by time range
    if (filters.timeRange && filters.timeRange !== 'all') {
        const now = Date.now();
        const timeRanges = {
            '1h': 3600000,
            '24h': 86400000,
            '7d': 604800000,
            '30d': 2592000000,
        };
        const cutoff = now - timeRanges[filters.timeRange];
        filtered = filtered.filter(tx => new Date(tx.timestamp).getTime() >= cutoff);
    }

    return filtered;
};
