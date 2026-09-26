'use client';

/**
 * Network/RPC Health Page
 *
 * Check Stellar RPC endpoint health and connectivity
 */

import { useState } from 'react';
import { checkRPCHealth, type RPCHealthResult, type NetworkType } from '@stellar-devkit/core';

export default function NetworkHealthPage() {
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<RPCHealthResult | null>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    setResult(null);

    try {
      const healthResult = await checkRPCHealth({
        network,
        customEndpoint: customEndpoint.trim() || undefined,
        timeout: 10000,
      });
      setResult(healthResult);
    } catch (error) {
      setResult({
        success: false,
        endpoint: customEndpoint || 'N/A',
        network,
        status: 'unreachable',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setCustomEndpoint('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Network Health
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Check Stellar RPC endpoint health and connectivity
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
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
            >
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
              <option value="futurenet">Futurenet</option>
            </select>
          </div>

          {network === 'mainnet' && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Mainnet requires a custom RPC endpoint URL
              </p>
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="custom-endpoint"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Custom Endpoint (Optional)
            </label>
            <input
              id="custom-endpoint"
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://your-custom-rpc-endpoint.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leave empty to use default endpoint for selected network
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              {isChecking ? 'Checking...' : 'Check Health'}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Health Check Result
            </h2>

            <div className="space-y-4">
              {/* Network & Endpoint */}
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Network:
                </span>
                <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono">
                  {result.network}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Endpoint:
                </span>
                <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono text-sm break-all">
                  {result.endpoint}
                </span>
              </div>

              {/* Status */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status:
                  </span>
                  <StatusBadge status={result.status} />
                </div>
              </div>

              {/* Latency */}
              {result.latencyMs !== undefined && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Latency:
                  </span>
                  <span
                    className={`ml-2 font-mono ${
                      result.latencyMs < 500
                        ? 'text-green-600 dark:text-green-400'
                        : result.latencyMs < 2000
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {result.latencyMs}ms
                  </span>
                </div>
              )}

              {/* Ledger Info */}
              {result.ledgerInfo && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Ledger Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Latest Ledger:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono">
                        {result.ledgerInfo.sequence}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Protocol Version:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono">
                        {result.ledgerInfo.protocolVersion}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {result.error && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      Error
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300 font-mono">
                      {result.error}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {result.success ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="font-medium">RPC endpoint is operational</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="font-medium">RPC endpoint is not reachable</span>
                    </div>
                    {result.network === 'mainnet' && !customEndpoint && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                        Mainnet requires a custom RPC endpoint URL
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'healthy' | 'degraded' | 'unreachable' }) {
  const colors = {
    healthy: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    degraded: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    unreachable: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  };

  const icons = {
    healthy: '✓',
    degraded: '⚠',
    unreachable: '✗',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${colors[status]}`}
    >
      {icons[status]} {status.toUpperCase()}
    </span>
  );
}
