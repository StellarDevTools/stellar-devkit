'use client';

import { useState } from 'react';
import { queryEvents } from '@stellar-devkit/core';
import type { EventViewerOptions } from '@stellar-devkit/core';

export default function EventsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const [startLedger, setStartLedger] = useState('');
  const [contractId, setContractId] = useState('');
  const [limit, setLimit] = useState('10');
  const [network, setNetwork] = useState<'testnet' | 'futurenet'>('testnet');
  const [rpcUrl, setRpcUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const options: EventViewerOptions = {
        network,
        startLedger: startLedger ? parseInt(startLedger, 10) : undefined,
        limit: parseInt(limit, 10) || 10,
        customRpcUrl: rpcUrl || undefined,
        contractIds: contractId ? [contractId] : undefined,
      };

      const viewResult = await queryEvents(options);
      setResult(viewResult);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Event Viewer</h1>
          <p className="text-lg text-muted-foreground mt-2">
            View and filter Soroban contract events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Network</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="testnet">Testnet</option>
                <option value="futurenet">Futurenet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Limit</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="10"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Ledger (optional)</label>
              <input
                type="number"
                value={startLedger}
                onChange={(e) => setStartLedger(e.target.value)}
                placeholder="e.g., 123456"
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Contract ID (optional)</label>
              <input
                type="text"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="CABC..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background font-mono text-sm"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Custom RPC URL (optional)</label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background font-mono text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'View Events'}
          </button>
        </form>

        {error && (
          <div className="border border-red-500 bg-red-500/10 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Results</h2>
              <span className="text-sm text-muted-foreground">
                {result.events?.length || 0} events found
              </span>
            </div>

            {result.success && result.events && result.events.length > 0 ? (
              <div className="space-y-4">
                {result.events.map((event: any, index: number) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Event #{index + 1}</p>
                        {event.type && (
                          <p className="text-sm text-muted-foreground">
                            Type: <span className="font-mono">{event.type}</span>
                          </p>
                        )}
                      </div>
                      {event.ledger && (
                        <span className="text-xs px-2 py-1 bg-secondary rounded">
                          Ledger {event.ledger}
                        </span>
                      )}
                    </div>

                    {event.contractId && (
                      <p className="text-sm text-muted-foreground">
                        Contract: <span className="font-mono text-xs">{event.contractId}</span>
                      </p>
                    )}

                    {event.topics && event.topics.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Topics:</p>
                        <div className="space-y-1">
                          {event.topics.map((topic: any, i: number) => (
                            <pre
                              key={i}
                              className="text-xs bg-secondary p-2 rounded overflow-x-auto"
                            >
                              {JSON.stringify(topic, null, 2)}
                            </pre>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.value && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Value:</p>
                        <pre className="text-xs bg-secondary p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.value, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}

                {result.cursor && (
                  <p className="text-sm text-muted-foreground">
                    Cursor: <span className="font-mono">{result.cursor}</span>
                  </p>
                )}
              </div>
            ) : result.success ? (
              <div className="border border-border rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No events found</p>
              </div>
            ) : (
              <div className="border border-red-500 bg-red-500/10 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{result.error || 'Unknown error'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
