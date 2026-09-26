'use client';

/**
 * XDR Decoder Page
 *
 * Decode Stellar XDR to human-readable format
 */

import { useState } from 'react';
import { decodeXDR, type DecodeResult, type TransactionDetails } from '@stellar-devkit/core';

type Network = 'testnet' | 'mainnet' | 'futurenet';

function isTransactionDetails(details: unknown): details is TransactionDetails {
  return (
    typeof details === 'object' &&
    details !== null &&
    'sourceAccount' in details &&
    'operations' in details
  );
}

export default function XDRDecoderPage() {
  const [xdrInput, setXdrInput] = useState('');
  const [network, setNetwork] = useState<Network>('testnet');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleDecode = () => {
    if (!xdrInput.trim()) {
      setResult({
        success: false,
        error: 'Please enter XDR to decode',
      });
      return;
    }

    setIsDecoding(true);

    try {
      const decodeResult = decodeXDR(xdrInput.trim(), { network });
      setResult(decodeResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDecoding(false);
    }
  };

  const handleClear = () => {
    setXdrInput('');
    setResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            XDR Decoder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Decode Stellar XDR to human-readable format
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
              onChange={(e) => setNetwork(e.target.value as Network)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
              <option value="futurenet">Futurenet</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="xdr-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              XDR (Base64)
            </label>
            <textarea
              id="xdr-input"
              value={xdrInput}
              onChange={(e) => setXdrInput(e.target.value)}
              placeholder="Paste your XDR string here..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDecode}
              disabled={isDecoding || !xdrInput.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              {isDecoding ? 'Decoding...' : 'Decode'}
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
            {result.success && result.data ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Decoded Result
                  </h2>
                  <button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(result.data, null, 2))
                    }
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md transition-colors"
                  >
                    Copy JSON
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Type */}
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Type:
                    </span>
                    <span className="ml-2 text-green-600 dark:text-green-400 font-mono">
                      {result.data.type}
                    </span>
                  </div>

                  {/* Transaction Details */}
                  {result.data.details &&
                    isTransactionDetails(result.data.details) && (
                      <TransactionDetailsView details={result.data.details} />
                    )}
                </div>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400">
                <div className="font-semibold mb-2">Error</div>
                <div className="font-mono text-sm">{result.error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionDetailsView({ details }: { details: TransactionDetails }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Transaction Details
      </h3>

      <div className="space-y-2">
        <DetailRow
          label="Source Account"
          value={details.sourceAccount}
          mono
        />
        <DetailRow
          label="Fee"
          value={`${details.fee} stroops`}
        />
        <DetailRow
          label="Sequence"
          value={details.sequenceNumber}
        />

        {details.memo && (
          <DetailRow
            label="Memo"
            value={`${details.memo.type}${
              details.memo.value
                ? `: ${details.memo.value}`
                : ''
            }`}
          />
        )}

        {details.networkPassphrase && (
          <DetailRow
            label="Network"
            value={details.networkPassphrase}
          />
        )}
      </div>

      {/* Operations */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Operations ({details.operations.length})
        </h4>

        <div className="space-y-4">
          {details.operations.map((op, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                {index + 1}. {op.type}
              </div>

              {op.sourceAccount && (
                <DetailRow
                  label="Source"
                  value={op.sourceAccount}
                  mono
                  small
                />
              )}

              {Object.entries(op.details).map(
                ([key, value]) => {
                  if (value !== undefined && value !== null) {
                    return (
                      <DetailRow
                        key={key}
                        label={key}
                        value={String(value)}
                        small
                      />
                    );
                  }
                  return null;
                }
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Signatures */}
      {details.signatures &&
        details.signatures.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Signatures ({details.signatures.length})
            </h4>
            <div className="space-y-2">
              {details.signatures.map(
                (sig, index) => (
                  <div
                    key={index}
                    className="font-mono text-sm text-gray-600 dark:text-gray-400"
                  >
                    {index + 1}. {sig.substring(0, 64)}...
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  small = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className={small ? 'text-sm' : ''}>
      <span className="text-gray-500 dark:text-gray-400 font-medium">
        {label}:
      </span>
      <span
        className={`ml-2 text-gray-900 dark:text-gray-100 ${mono ? 'font-mono text-sm' : ''} break-all`}
      >
        {value}
      </span>
    </div>
  );
}
