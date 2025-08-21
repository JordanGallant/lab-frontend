'use client';

import { useState, useEffect, JSX } from 'react';

// Type definitions for MetaMask ethereum object
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (accounts: string[]) => void) => void;
  removeAllListeners: (event: string) => void;
  isMetaMask?: boolean;
}

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function NavBar(): JSX.Element {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = (): boolean => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectWallet = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to use this feature');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts: string[] = await window.ethereum!.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await getBalance(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask');
    }
    setIsConnecting(false);
  };

  // Get balance
  const getBalance = async (address: string): Promise<void> => {
    try {
      const balance: string = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const balanceInEth: string = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      setBalance(balanceInEth);
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = (): void => {
    setAccount('');
    setBalance('');
    setShowDropdown(false);
  };

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]): void => {
        if (accounts.length === 0) {
          setAccount('');
          setBalance('');
        } else {
          setAccount(accounts[0]);
          getBalance(accounts[0]);
        }
      };

      const handleChainChanged = (): void => {
        if (account) {
          getBalance(account);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            getBalance(accounts[0]);
          }
        })
        .catch((error) => {
          console.error('Error checking existing connection:', error);
        });

      return () => {
        if (window.ethereum) {
          window.ethereum.removeAllListeners('accountsChanged');
          window.ethereum.removeAllListeners('chainChanged');
        }
      };
    }
  }, [account]);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="text-xl font-bold text-gray-900">
              Your DApp
            </div>
          </div>

          {/* Navigation Links (you can add more here) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Portfolio
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                About
              </a>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            {!account ? (
              <div>
                {!isMetaMaskInstalled() ? (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    Install MetaMask
                  </a>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Connect Wallet
                      </>
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
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Wallet Connected</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">
                            Address
                          </label>
                          <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded break-all">
                            {account}
                          </div>
                        </div>
                        
                        {balance && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">
                              Balance
                            </label>
                            <div className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded">
                              {balance} ETH
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={disconnectWallet}
                        className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded transition duration-200"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}