'use client';

import { useEffect, useState } from 'react';
import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

interface TokenActivityProps {
  walletAddress: string;
}

interface Transaction {
  token: string;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: Date;
  signature: string;
}

export default function TokenActivity({ walletAddress }: TokenActivityProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const publicKey = new PublicKey(walletAddress);
        
        // Fetch recent transactions
        const signatures = await connection.getSignaturesForAddress(
          publicKey,
          { limit: 20 }
        );

        const parsedTxns = await Promise.all(
          signatures.map(async (sig) => {
            try {
              const tx = await connection.getParsedTransaction(sig.signature, {
                maxSupportedTransactionVersion: 0,
              });
              
              if (!tx?.meta || !tx.blockTime) return null;

              // Process token transfers
              const tokenTransfers = tx.meta.postTokenBalances?.map((post, index) => {
                const pre = tx.meta?.preTokenBalances?.[index];
                if (!pre || !post) return null;

                const amount = Math.abs(
                  (Number(post.uiTokenAmount.uiAmount) || 0) -
                  (Number(pre.uiTokenAmount.uiAmount) || 0)
                );

                const type = post.uiTokenAmount.uiAmount > pre.uiTokenAmount.uiAmount
                  ? 'buy'
                  : 'sell';

                return {
                  token: post.mint.substring(0, 4) + '...',
                  amount,
                  type,
                  timestamp: new Date(tx.blockTime * 1000),
                  signature: sig.signature
                };
              }).filter(Boolean);

              return tokenTransfers;
            } catch (error) {
              console.error(`Error processing transaction ${sig.signature}:`, error);
              return null;
            }
          })
        );

        const allTransactions = parsedTxns
          .flat()
          .filter(Boolean)
          .sort((a, b) => b!.timestamp.getTime() - a!.timestamp.getTime());

        setTransactions(allTransactions as Transaction[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
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
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400">No recent token activity found</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.signature} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
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
            ))
          )}
        </div>
      )}
    </div>
  );
} 