export const isPumpToken = (address: string): boolean => {
    return address.toLowerCase().endsWith('pump');
};

export interface PumpTokenInfo {
    address: string;
    links: {
        pumpFun: string;
        dexscreener: string;
    }
}

export const getPumpTokenLinks = (tokenAddress: string): PumpTokenInfo | null => {
    if (!isPumpToken(tokenAddress)) return null;

    return {
        address: tokenAddress,
        links: {
            pumpFun: `https://pump.fun/coin/${tokenAddress}`,
            dexscreener: `https://dexscreener.com/solana/${tokenAddress}`
        }
    };
};