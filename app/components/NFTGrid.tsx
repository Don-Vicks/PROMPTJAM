'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface NFTGridProps {
  walletAddress: string;
}

interface NFT {
  name: string;
  image: string;
  collection: string;
}

export default function NFTGrid({ walletAddress }: NFTGridProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    
    const fetchNFTs = async () => {
      setLoading(true);
      // Implement NFT fetching logic here
      setLoading(false);
    };

    fetchNFTs();
  }, [walletAddress]);

  if (!walletAddress) return null;

  return (
    <div className="bg-gray-800/30 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">NFT Collection</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map((nft, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-3 hover:transform hover:scale-105 transition-transform">
              <div className="relative aspect-square mb-2">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <h3 className="text-sm font-medium truncate">{nft.name}</h3>
              <p className="text-xs text-gray-400 truncate">{nft.collection}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 