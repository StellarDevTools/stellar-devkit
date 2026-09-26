'use client';

/**
 * Contract Inspector Page
 *
 * Inspect Soroban contracts
 */

import { useState } from 'react';
import { inspectContract, type ContractInspectResult, type NetworkType } from '@stellar-devkit/core';

export default function ContractInspectorPage() {
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [contractId, setContractId] = useState('');
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<ContractInspectResult | null>(null);

  const handleInspect = async () => {
    if (!contractId.trim()) {
      return;
    }

    setIsInspecting(true);
    setResult(null);

    try {
      const inspectResult = await inspectContract(contractId.trim(), {
        network,
        customRpcUrl: customRpcUrl.trim() || undefined,
      });
      setResult(inspectResult);
    } catch (error) {
      setResult({
        success: false,
        network,
        contractId: contractId.trim(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsInspecting(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setContractId('');
    setCustomRpcUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInspecting && contractId.trim()) {
      handleInspect();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Contract Inspector
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Inspect deployed Soroban contracts including WASM information
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label
              htmlFor="contractId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Contract ID
            </label>
            <input
              id="contractId"
              type="text"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="C..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              disabled={isInspecting}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="network"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Network
            </label>
            <select
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value as NetworkType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isInspecting}
            >
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
              <option value="futurenet">Futurenet</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="customRpc"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Custom RPC URL (optional)
            </label>
            <input
              id="customRpc"
              type="text"
              value={customRpcUrl}
              onChange={(e) => setCustomRpcUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://soroban-testnet.stellar.org"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              disabled={isInspecting}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleInspect}
              disabled={isInspecting || !contractId.trim()}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isInspecting ? 'Inspecting...' : 'Inspect Contract'}
            </button>
            <button
              onClick={handleClear}
              disabled={isInspecting}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {!result.success ? (
              <div className="text-center py-8">
                <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                  Error
                </div>
                <p className="text-gray-700 dark:text-gray-300">{result.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Contract Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Contract Information
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-gray-400">Contract ID:</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all text-right ml-4">
                        {result.details!.contractId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        Deployed
                      </span>
                    </div>
                  </div>
                </div>

                {/* WASM Info */}
                {result.details!.wasmInfo && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      WASM Information
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Size:</span>
                        <span className="font-mono text-gray-900 dark:text-gray-100">
                          {result.details!.wasmInfo.size.toLocaleString()} bytes
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-gray-400">Hash:</span>
                        <span className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all text-right ml-4">
                          {result.details!.wasmInfo.hash}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
