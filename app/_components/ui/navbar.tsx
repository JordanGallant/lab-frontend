'use client';

import { useState, useEffect, JSX } from 'react';

interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (event: string) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function NavBar(): JSX.Element {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const isMetaMaskInstalled = (): boolean =>
    typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // Build RPC URL dynamically from the lab host
  const getRpcUrl = () => {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8545`;
  };

  // Connect button: add network + request accounts
  const connectWallet = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to use this feature');
      return;
    }

    setIsConnecting(true);
    try {
      // Add Hardhat network
      await window.ethereum!.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x7a69', // 31337 decimal (Hardhat default)
            chainName: 'Gochain Testnet',
            nativeCurrency: { name: 'Go', symbol: 'Go', decimals: 18 },
            rpcUrls: [getRpcUrl()],
          },
        ],
      });

      // Then request accounts
      const accounts: string[] = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask');
    }
    setIsConnecting(false);
  };

  const formatAddress = (address: string): string =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  useEffect(() => {
    if (isMetaMaskInstalled() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]): void => {
        setAccount(accounts.length > 0 ? accounts[0] : '');
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());

      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setAccount(accounts[0]);
        })
        .catch((err) =>
          console.error('Error checking existing connection:', err),
        );

      return () => {
        window.ethereum?.removeAllListeners('accountsChanged');
        window.ethereum?.removeAllListeners('chainChanged');
      };
    }
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-xl font-bold text-gray-900">Your DApp</div>
          </div>
          <div className="flex items-center">
            {!account ? (
              <div>
                {!isMetaMaskInstalled() ? (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                  >
                    Install MetaMask
                  </a>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center shadow-lg hover:shadow-xl"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-mono">{formatAddress(account)}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
