"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getTokenTransfers, TokenTransfer } from '@/lib/solana';

const TRANSACTION_LIMIT = 20; // Increased limit
const UPDATE_INTERVAL = 10000; // 10 seconds

const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
        return `${(marketCap / 1000000).toFixed(1)}M`;
    }
    if (marketCap >= 1000) {
        return `${(marketCap / 1000).toFixed(1)}K`;
    }
    return marketCap.toFixed(1);
};

const renderTokenLinks = (transfer: TokenTransfer) => {
    if (transfer.isPumpToken && transfer.pumpTokenLinks) {
        return (
            <span className="space-x-2">
                <a
                    href={transfer.pumpTokenLinks.pumpFun}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    [pump.fun]
                </a>
                <a
                    href={transfer.pumpTokenLinks.dexscreener}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    [dexscreener]
                </a>
            </span>
        );
    } else {
        return (
            <a
                href={`https://dexscreener.com/solana/${transfer.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
            >
                [dexscreener]
            </a>
        );
    }
};

export default function TransactionList() {
    const [transfers, setTransfers] = useState<TokenTransfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSignature, setLastSignature] = useState<string | null>(null);

    const loadTransfers = async () => {
        try {
            const data = await getTokenTransfers(TRANSACTION_LIMIT);
            
            if (data.length > 0) {
                const newestSignature = data[0].signature;
                if (newestSignature !== lastSignature) {
                    setTransfers(prevTransfers => {
                        // Combine new transactions with existing ones
                        const allTransfers = [...data, ...prevTransfers];
                        // Remove duplicates based on signature
                        const uniqueTransfers = Array.from(
                            new Map(allTransfers.map(item => [item.signature, item])).values()
                        );
                        // Keep the latest TRANSACTION_LIMIT transactions
                        return uniqueTransfers.slice(0, TRANSACTION_LIMIT);
                    });
                    setLastSignature(newestSignature);
                }
            }
            setError(null);
        } catch (error) {
            console.error('Error loading transfers:', error);
            setError('Failed to load transfers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransfers();
        const intervalId = setInterval(loadTransfers, UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Token Transfers</CardTitle>
                {loading && <div className="text-sm text-gray-500">Updating...</div>}
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="text-red-500">{error}</div>
                ) : transfers.length === 0 ? (
                    <div>No transfers found</div>
                ) : (
                    <div className="space-y-4">
                        {transfers.map((transfer) => (
                            <div key={transfer.signature} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="text-sm">
                                    <a
                                        href={`https://solscan.io/account/${transfer.buyer}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        {formatAddress(transfer.buyer)}
                                    </a>
                                    {' transferred '}
                                    <span className="font-medium">
                                        {transfer.amount.toLocaleString()}
                                    </span>
                                    {' '}
                                    <span className="font-medium">
                                        {transfer.tokenName} ({transfer.tokenSymbol})
                                        {transfer.marketCap > 0 && ` at market cap $${formatMarketCap(transfer.marketCap)}`}
                                    </span>
                                    {' '}
                                    {renderTokenLinks(transfer)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(transfer.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}