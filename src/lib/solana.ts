import { Connection, PublicKey } from '@solana/web3.js';
import { isPumpToken, getPumpTokenLinks } from './pumpTokens';

const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export interface TokenTransfer {
    signature: string;
    timestamp: string;
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    amount: number;
    marketCap: number;
    buyer: string;
    isPumpToken: boolean;
    pumpTokenLinks?: {
        pumpFun: string;
        dexscreener: string;
    }
}

// Cache for token metadata
const tokenMetadataCache = new Map<string, { name: string; symbol: string; marketCap: number }>();

const EXCLUDED_TOKENS = new Set([
    'So11111111111111111111111111111111111111112', // Wrapped SOL
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // Lido
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // Marinade
    'JitoSoLz14r4Hi6iQKiHJGPNgbzJqpsFvukvFvopzm', // Jito
    'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', // Blazestake
    '7Q2afV64in6N6SeZsNECvaCrRpRQinsuX7qpevqRhKxw', // Jpool
]);

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

const getTokenMetadata = async (tokenAddress: string) => {
    // Check cache first
    if (tokenMetadataCache.has(tokenAddress)) {
        return tokenMetadataCache.get(tokenAddress)!;
    }

    try {
        // Extract API key from RPC URL
        const apiKey = HELIUS_RPC_URL?.split('?api-key=')[1];
        if (!apiKey) {
            throw new Error('Invalid Helius API key');
        }

        const url = 'https://mainnet.helius-rpc.com/?api-key=' + apiKey;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'token-metadata',
                method: 'getAsset',
                params: { id: tokenAddress }
            }),
        };

        const assetData = await fetchWithRetry(url, options);

        let name, symbol;
        if (assetData?.result?.content?.metadata) {
            name = assetData.result.content.metadata.name;
            symbol = assetData.result.content.metadata.symbol;
        } else {
            name = 'Unknown Token';
            symbol = 'UNKNOWN';
        }

        // Get market cap from Jupiter
        let marketCap = 0;
        try {
            const jupiterData = await fetchWithRetry(
                `https://price.jup.ag/v4/price?ids=${tokenAddress}`,
                { method: 'GET' }
            );
            marketCap = jupiterData?.data?.[tokenAddress]?.marketCap || 0;
        } catch (error) {
            console.warn('Error fetching market cap:', error);
        }

        const metadata = { name, symbol, marketCap };
        tokenMetadataCache.set(tokenAddress, metadata);
        return metadata;

    } catch (error) {
        console.warn('Error fetching token metadata:', error);
        return {
            name: 'Unknown Token',
            symbol: 'UNKNOWN',
            marketCap: 0
        };
    }
};

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

export const getTokenTransfers = async (limit: number = 5): Promise<TokenTransfer[]> => {
    try {
        const programId = new PublicKey(TOKEN_PROGRAM_ID);
        await sleep(1000);

        const signatures = await connection.getSignaturesForAddress(
            programId,
            { limit: limit * 2 }
        );

        const transfers: TokenTransfer[] = [];

        for (const sig of signatures) {
            try {
                if (transfers.length >= limit) break;
                await sleep(1000);

                const tx = await connection.getParsedTransaction(sig.signature, {
                    maxSupportedTransactionVersion: 0
                });

                if (!tx?.meta?.postTokenBalances?.length || !tx.blockTime) continue;

                const tokenBalance = tx.meta.postTokenBalances[0];
                if (!tokenBalance?.mint || !tokenBalance.uiTokenAmount) continue;

                const tokenAddress = tokenBalance.mint;
                if (EXCLUDED_TOKENS.has(tokenAddress)) continue;

                const isPump = isPumpToken(tokenAddress);
                const pumpInfo = isPump ? getPumpTokenLinks(tokenAddress) : null;

                // Add delay before metadata fetch to avoid rate limits
                await sleep(500);
                const tokenInfo = await getTokenMetadata(tokenAddress);

                transfers.push({
                    signature: sig.signature,
                    timestamp: new Date(tx.blockTime * 1000).toISOString(),
                    tokenAddress: tokenAddress,
                    tokenName: tokenInfo.name,
                    tokenSymbol: tokenInfo.symbol,
                    amount: tokenBalance.uiTokenAmount.uiAmount || 0,
                    marketCap: tokenInfo.marketCap,
                    buyer: tx.transaction.message.accountKeys[0].pubkey.toString(),
                    isPumpToken: isPump,
                    pumpTokenLinks: pumpInfo?.links
                });

            } catch (error) {
                console.warn('Error processing transfer:', error);
                continue;
            }
        }

        return transfers;
    } catch (error) {
        console.error('Error fetching transfers:', error);
        return [];
    }
};