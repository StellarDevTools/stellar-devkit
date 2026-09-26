'use client';

/**
 * Account Inspector Page
 *
 * Inspect Stellar account details
 */

import { useState } from 'react';
import { inspectAccount, type AccountInspectResult, type NetworkType } from '@stellar-devkit/core';

export default function AccountInspectorPage() {
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [publicKey, setPublicKey] = useState('');
  const [customHorizonUrl, setCustomHorizonUrl] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<AccountInspectResult | null>(null);

  const handleInspect = async () => {
    if (!publicKey.trim()) {
      return;
    }

    setIsInspecting(true);
    setResult(null);

    try {
      const inspectResult = await inspectAccount(publicKey.trim(), {
        network,
        customHorizonUrl: customHorizonUrl.trim() || undefined,
      });
      setResult(inspectResult);
    } catch (error) {
      setResult({
        success: false,
        network,
        accountId: publicKey.trim(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsInspecting(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setPublicKey('');
    setCustomHorizonUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInspecting && publicKey.trim()) {
      handleInspect();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Account Inspector
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Inspect Stellar account details including balances, signers, and thresholds
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label
              htmlFor="publicKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Public Key
            </label>
            <input
              id="publicKey"
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="G..."
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
              htmlFor="customHorizon"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Custom Horizon URL (optional)
            </label>
            <input
              id="customHorizon"
              type="text"
              value={customHorizonUrl}
              onChange={(e) => setCustomHorizonUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://horizon-testnet.stellar.org"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              disabled={isInspecting}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleInspect}
              disabled={isInspecting || !publicKey.trim()}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isInspecting ? 'Inspecting...' : 'Inspect Account'}
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
                {/* Account Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Account Information
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Account ID:</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                        {result.details!.accountId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sequence:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">
                        {result.details!.sequence}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subentry Count:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">
                        {result.details!.subentryCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Modified:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">
                        Ledger {result.details!.lastModifiedLedger}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balances */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Balances
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-3">
                    {result.details!.balances.map((balance, idx) => (
                      <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {balance.asset}
                          </span>
                          <span className="font-mono text-gray-900 dark:text-gray-100">
                            {balance.balance}
                          </span>
                        </div>
                        {balance.issuer && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            Issuer: {balance.issuer}
                          </div>
                        )}
                        {balance.limit && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Limit: {balance.limit}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signers */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Signers
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-3">
                    {result.details!.signers.map((signer, idx) => (
                      <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all flex-1 mr-4">
                            {signer.key}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Weight: {signer.weight}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Type: {signer.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thresholds */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Thresholds
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Low</div>
                        <div className="font-mono text-lg text-gray-900 dark:text-gray-100">
                          {result.details!.thresholds.low}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Medium</div>
                        <div className="font-mono text-lg text-gray-900 dark:text-gray-100">
                          {result.details!.thresholds.medium}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">High</div>
                        <div className="font-mono text-lg text-gray-900 dark:text-gray-100">
                          {result.details!.thresholds.high}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Flags
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Auth Required:</span>
                      <span className={result.details!.flags.authRequired ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}>
                        {result.details!.flags.authRequired ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Auth Revocable:</span>
                      <span className={result.details!.flags.authRevocable ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}>
                        {result.details!.flags.authRevocable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Auth Immutable:</span>
                      <span className={result.details!.flags.authImmutable ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}>
                        {result.details!.flags.authImmutable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Clawback Enabled:</span>
                      <span className={result.details!.flags.authClawbackEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}>
                        {result.details!.flags.authClawbackEnabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sponsorship */}
                {(result.details!.sponsor || result.details!.numSponsoring > 0 || result.details!.numSponsored > 0) && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Sponsorship
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-2">
                      {result.details!.sponsor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sponsored By:</span>
                          <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                            {result.details!.sponsor}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Num Sponsoring:</span>
                        <span className="font-mono text-gray-900 dark:text-gray-100">
                          {result.details!.numSponsoring}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Num Sponsored:</span>
                        <span className="font-mono text-gray-900 dark:text-gray-100">
                          {result.details!.numSponsored}
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
