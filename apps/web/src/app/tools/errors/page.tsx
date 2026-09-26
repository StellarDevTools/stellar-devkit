'use client';

/**
 * Error Explainer Page
 *
 * Explain Soroban errors with diagnostics
 */

import { useState } from 'react';
import { explainError, type ErrorExplanation } from '@stellar-devkit/diagnostics/error-registry';

export default function ErrorExplainerPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [explanation, setExplanation] = useState<ErrorExplanation | null>(null);

  const handleExplain = () => {
    if (!errorMessage.trim()) {
      return;
    }

    const result = explainError(errorMessage);
    setExplanation(result);
  };

  const handleClear = () => {
    setErrorMessage('');
    setExplanation(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && errorMessage.trim()) {
      handleExplain();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Soroban Error Explainer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get detailed explanations and solutions for Soroban contract errors
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label
              htmlFor="errorMessage"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Error Message
            </label>
            <textarea
              id="errorMessage"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your Soroban error message here...&#10;Example: Error(Storage, MissingValue)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-vertical"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tip: Press Ctrl+Enter to explain
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExplain}
              disabled={!errorMessage.trim()}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Explain Error
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Section */}
        {explanation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {!explanation.recognized ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Unknown Error Pattern
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      {explanation.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {explanation.diagnostic!.title}
                      </h2>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-mono rounded">
                        {explanation.diagnostic!.code}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {explanation.diagnostic!.explanation}
                    </p>
                  </div>
                </div>

                {/* Possible Causes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Possible Causes
                  </h3>
                  <ul className="space-y-2">
                    {explanation.diagnostic!.causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                        <span className="text-gray-700 dark:text-gray-300">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Recommended Solutions
                  </h3>
                  <ul className="space-y-2">
                    {explanation.diagnostic!.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documentation Link */}
                {explanation.diagnostic!.docsUrl && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={explanation.diagnostic!.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Official Documentation
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Common Errors Section */}
        {!explanation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Common Errors
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setErrorMessage('Error(Storage, MissingValue)');
                  setTimeout(() => handleExplain(), 100);
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  Error(Storage, MissingValue)
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Storage entry not found
                </div>
              </button>
              <button
                onClick={() => {
                  setErrorMessage('Budget exceeded');
                  setTimeout(() => handleExplain(), 100);
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  Budget exceeded
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Resource budget exceeded
                </div>
              </button>
              <button
                onClick={() => {
                  setErrorMessage('Error(WasmVm, InvalidAction)');
                  setTimeout(() => handleExplain(), 100);
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  Error(WasmVm, InvalidAction)
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  WASM VM error
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
