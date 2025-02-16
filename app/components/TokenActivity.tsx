'use client';

import { useEffect, useState } from 'react';

interface TokenActivityProps {
  walletAddress: string;
}

interface Transaction {
  token: string;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: Date;
}

export default function TokenActivity({ walletAddress }: TokenActivityProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    
    const fetchTransactions = async () => {
      setLoading(true);
      // Implement transaction fetching logic here
      setLoading(false);
    };

    fetchTransactions();
  }, [walletAddress]);

  if (!walletAddress) return null;

  return (
    <div className="bg-gray-800/30 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Recent Token Activity</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{tx.token}</h3>
                <p className="text-sm text-gray-400">
                  {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.amount.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {tx.timestamp.toLocaleDateString()}
                </p>
                <p className={`text-sm ${tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'buy' ? '+' : '-'}{tx.amount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 