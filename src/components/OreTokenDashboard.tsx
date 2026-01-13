"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    getOreTransactions,
    detectOreDCAPatterns,
    getOreMetrics,
    filterOreTransactions,
    OreTransaction,
    OreDCAPattern,
    OreMetrics,
    ORE_TOKEN_MINT
} from '@/lib/oreMonitor';

const UPDATE_INTERVAL = 15000; // 15 seconds

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(2)}B`;
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
};

const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
        'hourly': '⏱️ Hourly',
        'daily': '📅 Daily',
        'weekly': '📆 Weekly',
        'irregular': '📊 Irregular'
    };
    return labels[frequency] || frequency;
};

export default function OreTokenDashboard() {
    const [transactions, setTransactions] = useState<OreTransaction[]>([]);
    const [dcaPatterns, setDcaPatterns] = useState<OreDCAPattern[]>([]);
    const [metrics, setMetrics] = useState<OreMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
    const [filterWhale, setFilterWhale] = useState(false);
    const [filterMinAmount, setFilterMinAmount] = useState<number>(0);
    const [filterTimeRange, setFilterTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | 'all'>('24h');

    // Active tab
    const [activeTab, setActiveTab] = useState<'transactions' | 'dca' | 'whales'>('transactions');

    const loadData = async () => {
        try {
            const [txData, metricsData] = await Promise.all([
                getOreTransactions(100),
                getOreMetrics()
            ]);

            setTransactions(txData);
            setMetrics(metricsData);

            // Detect DCA patterns
            if (txData.length > 0) {
                const patterns = detectOreDCAPatterns(txData);
                setDcaPatterns(patterns);
            }

            setError(null);
        } catch (error) {
            console.error('Error loading ORE data:', error);
            setError('Failed to load ORE token data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const intervalId = setInterval(loadData, UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    }, []);

    const filteredTransactions = filterOreTransactions(transactions, {
        minAmount: filterMinAmount,
        type: filterType,
        whaleOnly: filterWhale,
        timeRange: filterTimeRange,
    });

    const whaleTransactions = filteredTransactions.filter(tx => tx.isWhale);

    const stats = {
        totalBuys: filteredTransactions.filter(tx => tx.type === 'buy').length,
        totalSells: filteredTransactions.filter(tx => tx.type === 'sell').length,
        totalVolume: filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        whaleCount: whaleTransactions.length,
        activeDCA: dcaPatterns.filter(p => p.isActive).length,
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl">Loading $ORE dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-500">
                <CardContent className="pt-6">
                    <div className="text-red-500 text-center">
                        <div className="text-2xl mb-2">⚠️</div>
                        <div>{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Metrics Overview */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${formatNumber(metrics.price, 4)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Market Cap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatMarketCap(metrics.marketCap)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.totalVolume)}</div>
                            <div className="text-xs text-gray-500">ORE</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Whale Txs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.whaleCount}</div>
                            <div className="text-xs text-gray-500">&gt;1000 ORE</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active DCA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeDCA}</div>
                            <div className="text-xs text-gray-500">strategies</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Stats Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                            <span className="text-gray-600">Buys:</span>
                            <span className="ml-2 font-semibold text-green-600">{stats.totalBuys}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Sells:</span>
                            <span className="ml-2 font-semibold text-red-600">{stats.totalSells}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Ratio:</span>
                            <span className="ml-2 font-semibold">
                                {stats.totalSells > 0 ? (stats.totalBuys / stats.totalSells).toFixed(2) : '∞'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'transactions'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Transactions ({filteredTransactions.length})
                </button>
                <button
                    onClick={() => setActiveTab('dca')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'dca'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    DCA Patterns ({dcaPatterns.length})
                </button>
                <button
                    onClick={() => setActiveTab('whales')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'whales'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    🐋 Whales ({whaleTransactions.length})
                </button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="all">All</option>
                                <option value="buy">Buy Only</option>
                                <option value="sell">Sell Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Time Range</label>
                            <select
                                value={filterTimeRange}
                                onChange={(e) => setFilterTimeRange(e.target.value as any)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="1h">Last Hour</option>
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Min Amount (ORE)</label>
                            <input
                                type="number"
                                value={filterMinAmount}
                                onChange={(e) => setFilterMinAmount(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterWhale}
                                    onChange={(e) => setFilterWhale(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">Whales Only</span>
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content based on active tab */}
            {activeTab === 'transactions' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No transactions found</div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTransactions.slice(0, 50).map((tx) => (
                                    <div
                                        key={tx.signature}
                                        className={`p-3 rounded-lg border ${
                                            tx.isWhale ? 'border-yellow-400 bg-yellow-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            tx.type === 'buy'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {tx.type.toUpperCase()}
                                                    </span>
                                                    {tx.isWhale && <span className="text-xl">🐋</span>}
                                                    <a
                                                        href={`https://solscan.io/account/${tx.walletAddress}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline font-mono text-sm"
                                                    >
                                                        {formatAddress(tx.walletAddress)}
                                                    </a>
                                                </div>
                                                <div className="mt-1 text-sm">
                                                    <span className="font-semibold">{formatNumber(tx.amount)} ORE</span>
                                                    {tx.pricePerToken && (
                                                        <span className="text-gray-600 ml-2">
                                                            @ ${formatNumber(tx.pricePerToken, 4)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </div>
                                                <a
                                                    href={`https://solscan.io/tx/${tx.signature}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-500 hover:underline"
                                                >
                                                    View TX
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'dca' && (
                <Card>
                    <CardHeader>
                        <CardTitle>DCA Patterns Detected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dcaPatterns.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No DCA patterns detected yet. Need at least 3 regular transactions from the same wallet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dcaPatterns.map((pattern, idx) => (
                                    <div
                                        key={`${pattern.walletAddress}-${pattern.type}`}
                                        className={`p-4 rounded-lg border ${
                                            pattern.isActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            pattern.type === 'buy'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {pattern.type.toUpperCase()} DCA
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                        {getFrequencyLabel(pattern.frequency)}
                                                    </span>
                                                    {pattern.isActive && (
                                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                                            🟢 Active
                                                        </span>
                                                    )}
                                                </div>
                                                <a
                                                    href={`https://solscan.io/account/${pattern.walletAddress}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline font-mono text-sm"
                                                >
                                                    {formatAddress(pattern.walletAddress)}
                                                </a>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">
                                                    {formatNumber(pattern.totalAmount)} ORE
                                                </div>
                                                <div className="text-xs text-gray-500">Total Amount</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-600">Transactions</div>
                                                <div className="font-semibold">{pattern.transactions.length}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-600">Avg Amount</div>
                                                <div className="font-semibold">{formatNumber(pattern.averageAmount)} ORE</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-600">Avg Interval</div>
                                                <div className="font-semibold">
                                                    {pattern.averageInterval < 3600
                                                        ? `${Math.round(pattern.averageInterval / 60)}m`
                                                        : pattern.averageInterval < 86400
                                                        ? `${Math.round(pattern.averageInterval / 3600)}h`
                                                        : `${Math.round(pattern.averageInterval / 86400)}d`}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-600">Duration</div>
                                                <div className="font-semibold">
                                                    {Math.round(
                                                        (new Date(pattern.lastTransaction).getTime() -
                                                            new Date(pattern.firstTransaction).getTime()) /
                                                            86400000
                                                    )}d
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                            First: {new Date(pattern.firstTransaction).toLocaleString()} | Last:{' '}
                                            {new Date(pattern.lastTransaction).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'whales' && (
                <Card>
                    <CardHeader>
                        <CardTitle>🐋 Whale Transactions (&gt;1000 ORE)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {whaleTransactions.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No whale transactions found</div>
                        ) : (
                            <div className="space-y-3">
                                {whaleTransactions.map((tx) => (
                                    <div
                                        key={tx.signature}
                                        className="p-4 rounded-lg border-2 border-yellow-400 bg-yellow-50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">🐋</span>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            tx.type === 'buy'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {tx.type.toUpperCase()}
                                                    </span>
                                                    <a
                                                        href={`https://solscan.io/account/${tx.walletAddress}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline font-mono text-sm"
                                                    >
                                                        {formatAddress(tx.walletAddress)}
                                                    </a>
                                                </div>
                                                <div className="text-lg font-bold">
                                                    {formatNumber(tx.amount)} ORE
                                                </div>
                                                {tx.totalValue && (
                                                    <div className="text-sm text-gray-600">
                                                        ≈ ${formatNumber(tx.totalValue)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </div>
                                                <a
                                                    href={`https://solscan.io/tx/${tx.signature}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-500 hover:underline"
                                                >
                                                    View Transaction
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
