"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";

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
      try {
        const connection = new Connection(
          "https://api.mainnet-beta.solana.com"
        );
        const publicKey = new PublicKey(walletAddress);

        // Fetch all token accounts for the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
          }
        );

        // Filter for NFTs (tokens with amount 1)
        const nftAccounts = tokenAccounts.value.filter((account) => {
          const amount = account.account.data.parsed.info.tokenAmount;
          return amount.amount === "1" && amount.decimals === 0;
        });

        // Fetch metadata for each NFT
        const nftData = await Promise.all(
          nftAccounts.map(async (nft) => {
            const mintAddress = nft.account.data.parsed.info.mint;
            try {
              // Using Metaplex API to get NFT metadata
              const response = await axios.get(
                `https://api.metaplex.solana.com/nfts/${mintAddress}/metadata`
              );

              const metadata = response.data;
              return {
                name: metadata.name || "Unnamed NFT",
                image: metadata.image || "/placeholder.png",
                collection: metadata.collection?.name || "Unknown Collection",
              };
            } catch (error) {
              console.error(
                `Error fetching metadata for ${mintAddress}:`,
                error
              );
              return null;
            }
          })
        );

        setNfts(nftData.filter(Boolean));
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  if (!walletAddress) return null;

  return (
    <div className="bg-gray-800/30 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">
        NFT Collection ({nfts.length})
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map((nft, index) => (
            <div
              key={index}
              className="bg-gray-700/50 rounded-lg p-3 hover:transform hover:scale-105 transition-transform"
            >
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
