'use client';

/**
 * Transaction Inspector Page
 */

import { useState } from 'react';
import { inspectTransaction, type TransactionInspectResult, type NetworkType } from '@stellar-devkit/core';
import { explainError } from '@stellar-devkit/diagnostics/error-registry';

export default function TransactionInspectorPage() {
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [txHash, setTxHash] = useState('');
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<TransactionInspectResult | null>(null);

  const handleInspect = async () => {
    if (!txHash.trim()) return;

    setIsInspecting(true);
    setResult(null);

    try {
      const inspectResult = await inspectTransaction(txHash.trim(), {
        network,
        customRpcUrl: customRpcUrl.trim() || undefined,
      });
      setResult(inspectResult);
    } catch (error) {
      setResult({
        success: false,
        network,
        hash: txHash.trim(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsInspecting(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setTxHash('');
    setCustomRpcUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInspecting && txHash.trim()) {
      handleInspect();
    }
  };

  const errorExplanation = result?.details?.error ? explainError(result.details.error) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Transaction Inspector
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Inspect transaction details including status, operations, and events
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="txHash" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Hash
            </label>
            <input
              id="txHash"
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="64-character hex string"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              disabled={isInspecting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="network" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <label htmlFor="customRpc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              disabled={isInspecting || !txHash.trim()}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isInspecting ? 'Inspecting...' : 'Inspect Transaction'}
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

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {!result.success ? (
              <div className="text-center py-8">
                <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">Error</div>
                <p className="text-gray-700 dark:text-gray-300">{result.error}</p>
              </div>
            ) : result.details ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Status</h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                    <span className={`inline-block px-3 py-1 rounded font-semibold ${
                      result.details.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      result.details.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {result.details.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Details</h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-2">
                    {result.details.ledger && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Ledger:</span>
                        <span className="font-mono text-gray-900 dark:text-gray-100">{result.details.ledger}</span>
                      </div>
                    )}
                    {result.details.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{result.details.createdAt}</span>
                      </div>
                    )}
                    {result.details.sourceAccount && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-gray-400">Source:</span>
                        <span className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all text-right ml-4">{result.details.sourceAccount}</span>
                      </div>
                    )}
                    {result.details.fee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                        <span className="font-mono text-gray-900 dark:text-gray-100">{result.details.fee} stroops</span>
                      </div>
                    )}
                  </div>
                </div>

                {result.details.operations && result.details.operations.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Operations ({result.details.operationCount})
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-2">
                      {result.details.operations.map((op, idx) => (
                        <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{idx + 1}.</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{op.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.details.events && result.details.events.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Contract Events ({result.details.events.length})
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-3">
                      {result.details.events.map((event, idx) => (
                        <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{event.type}</div>
                          {event.contractId && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                              {event.contractId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.details.error && result.details.status === 'FAILED' && (
                  <div>
                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">Error</h2>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded p-4">
                      <p className="text-red-800 dark:text-red-200 font-mono text-sm">{result.details.error}</p>
                    </div>

                    {errorExplanation?.recognized && errorExplanation.diagnostic && (
                      <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded p-4">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          💡 Error Explanation
                        </h3>
                        <p className="text-yellow-900 dark:text-yellow-100 text-sm mb-3">
                          {errorExplanation.diagnostic.explanation}
                        </p>
                        {errorExplanation.diagnostic.recommendations.length > 0 && (
                          <>
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm mb-2">
                              Recommendations:
                            </h4>
                            <ul className="list-disc list-inside text-yellow-900 dark:text-yellow-100 text-sm space-y-1">
                              {errorExplanation.diagnostic.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
