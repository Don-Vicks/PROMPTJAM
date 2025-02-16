'use client';

import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import NFTGrid from './components/NFTGrid';
import TokenActivity from './components/TokenActivity';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate Solana address
      new PublicKey(walletAddress);
      // Continue with fetching data...
    } catch (err) {
      setError('Invalid Solana wallet address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Solana NFT Explorer
        </h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter Solana wallet address..."
              className="w-full px-6 py-4 bg-gray-800/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 mt-2 text-center">{error}</p>
          )}
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <NFTGrid walletAddress={walletAddress} />
          <TokenActivity walletAddress={walletAddress} />
        </div>
      </div>
    </main>
  );
}
