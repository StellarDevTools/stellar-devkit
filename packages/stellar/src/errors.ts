/**
 * Soroban Error Registry
 */

export interface ErrorDiagnostic {
  code: string;
  pattern: RegExp;
  title: string;
  explanation: string;
  causes: string[];
  recommendations: string[];
  docsUrl?: string;
}

export const ERROR_REGISTRY: ErrorDiagnostic[] = [
  ...(
    [
      [
        'STORAGE_LIMIT',
        /Error\(Storage,\s*ExceededLimit\)/i,
        'Storage access limit exceeded',
        'The invocation exceeded ledger access limits.',
        'Reduce the ledger footprint and simulate again.',
      ],
      [
        'STORAGE_ARCHIVED',
        /archived|restore.*footprint|restorePreamble/i,
        'Ledger entry requires restoration',
        'Persistent entries needed by the invocation may be archived.',
        'Inspect the simulation restore preamble. Restore through your separate wallet workflow, then simulate again.',
      ],
      [
        'BUDGET_RESOURCE_LIMIT',
        /Error\(Budget,\s*ExceededLimit\)|txSorobanResourceLimitExceeded|tx_soroban_resource_limit_exceeded/i,
        'Soroban resource limit exceeded',
        'Execution requires more resources than the allowed budget.',
        'Inspect simulation instructions and IO, reduce work, and split large batches.',
      ],
      [
        'AUTH_INVALID_ACTION',
        /Error\(Auth,\s*InvalidAction\)/i,
        'Authorization rejected',
        'The supplied authorization does not permit the requested invocation.',
        'Check require_auth addresses, invocation arguments and authorization trees. DevKit cannot sign them.',
      ],
      [
        'CONTEXT_INVALID_ACTION',
        /Error\(Context,\s*InvalidAction\)/i,
        'Invalid host context',
        'An action is not permitted in the current invocation context.',
        'Inspect diagnostic events and the invocation stack; check for forbidden re-entry.',
      ],
      [
        'VALUE_TYPE_MISMATCH',
        /Error\(Value,\s*UnexpectedType\)/i,
        'Unexpected value type',
        'A value does not match the type expected by the host or contract.',
        'Compare argument ScVal types with the deployed contract specification.',
      ],
      [
        'CONTRACT_ERROR',
        /Error\(Contract,\s*#?\d+\)/i,
        'Contract-defined error',
        'The contract returned its own numeric error code; the meaning is contract-specific.',
        'Look up this number in the deployed contract error enum or specification.',
      ],
      [
        'TX_BAD_AUTH',
        /\btxBadAuth\b|\btx_bad_auth\b/i,
        'Transaction authorization failed',
        'Transaction signatures do not satisfy source account thresholds.',
        'Verify network passphrase, source account signers and thresholds in your signing tool.',
      ],
      [
        'TX_BAD_SEQUENCE',
        /\btxBadSeq\b|\btx_bad_seq\b/i,
        'Invalid transaction sequence',
        'The transaction sequence is not valid for the source account.',
        'Reload the source account sequence and rebuild in your transaction builder.',
      ],
      [
        'TX_INSUFFICIENT_FEE',
        /\btxInsufficientFee\b|\btx_insufficient_fee\b/i,
        'Insufficient transaction fee',
        'The fee does not meet network requirements.',
        'Review the current base fee and simulation minimum resource fee before rebuilding.',
      ],
      [
        'TX_FAILED',
        /\btxFailed\b|\btx_failed\b/i,
        'One or more operations failed',
        'The transaction failed during operation processing.',
        'Inspect operation result codes and diagnostic events for the underlying failure.',
      ],
      [
        'RPC_INVALID_PARAMS',
        /(?:^|\s)-32602\b|invalid params/i,
        'Invalid RPC parameters',
        'The endpoint rejected the request parameters.',
        'Check XDR, ledger range, cursor and filters against the RPC method schema.',
      ],
      [
        'RPC_RATE_LIMIT',
        /\b429\b|rate limit/i,
        'RPC rate limit reached',
        'The endpoint is throttling requests.',
        'Reduce request frequency and respect provider retry guidance.',
      ],
      [
        'RPC_TIMEOUT',
        /\btimeout\b|timed out/i,
        'RPC request timed out',
        'The endpoint did not respond within the allowed time.',
        'Check endpoint availability and retry with bounded backoff.',
      ],
    ] as const
  ).map(([code, pattern, title, explanation, recommendation]) => ({
    code,
    pattern,
    title,
    explanation,
    causes: [explanation],
    recommendations: [recommendation],
  })),
  {
    code: 'STORAGE_MISSING_VALUE',
    pattern: /Error\(Storage,\s*MissingValue\)/i,
    title: 'Storage Entry Not Found',
    explanation:
      'The contract attempted to read a storage entry that does not exist.',
    causes: [
      'Reading a key that was never written',
      'Key was deleted',
      'Incorrect storage key',
    ],
    recommendations: [
      'Check if the key exists before reading',
      'Initialize storage values in the contract constructor',
      'Verify the storage key is correct',
    ],
    docsUrl:
      'https://developers.stellar.org/docs/smart-contracts/getting-started/errors',
  },
  {
    code: 'BUDGET_EXCEEDED',
    pattern: /Budget\s+exceeded/i,
    title: 'Resource Budget Exceeded',
    explanation: 'The transaction exceeded the available CPU or memory budget.',
    causes: [
      'Contract logic is too complex',
      'Too many iterations in loops',
      'Large data structures',
    ],
    recommendations: [
      'Optimize contract logic',
      'Reduce loop iterations',
      'Break operations into smaller transactions',
    ],
  },
  {
    code: 'WASM_VM_ERROR',
    pattern: /WasmVm|wasm.*error/i,
    title: 'WASM VM Error',
    explanation: 'An error occurred in the WebAssembly virtual machine.',
    causes: [
      'Invalid WASM bytecode',
      'Stack overflow',
      'Out of bounds memory access',
    ],
    recommendations: [
      'Rebuild the contract',
      'Check for infinite recursion',
      'Verify array access bounds',
    ],
  },
  {
    code: 'AUTH_FAILED',
    pattern: /Auth.*failed|authorization.*error/i,
    title: 'Authorization Failed',
    explanation: 'The transaction authorization check failed.',
    causes: [
      'Missing signature',
      'Wrong signer',
      'Insufficient signature weight',
    ],
    recommendations: [
      'Verify all required signatures are present',
      'Check signer public keys',
      'Ensure signature weights meet threshold',
    ],
  },
  {
    code: 'INVALID_ACTION',
    pattern: /Invalid\s+action/i,
    title: 'Invalid Action',
    explanation: 'The contract function call or operation is invalid.',
    causes: [
      'Function does not exist',
      'Wrong number of arguments',
      'Invalid argument types',
    ],
    recommendations: [
      'Check function name spelling',
      'Verify function signature',
      'Validate argument types',
    ],
  },
];

export function findMatchingDiagnostics(
  errorMessage: string
): ErrorDiagnostic[] {
  return ERROR_REGISTRY.filter((diag) => diag.pattern.test(errorMessage));
}

export interface ErrorExplanation {
  recognized: boolean;
  message: string;
  code: string;
  context: string;
  diagnostic?: ErrorDiagnostic;
}

export function explainError(errorMessage: string): ErrorExplanation {
  const context = safeErrorContext(errorMessage);
  const diagnostics = findMatchingDiagnostics(context);
  const firstDiagnostic = diagnostics[0];

  if (!firstDiagnostic) {
    return {
      recognized: false,
      code: 'UNKNOWN_ERROR',
      context,
      message:
        'No diagnostic information found for this error. The error may be a new or uncommon error not yet in the registry, a custom error from your contract, or a malformed error message.',
    };
  }

  return {
    recognized: true,
    code: firstDiagnostic.code,
    context,
    message: firstDiagnostic.explanation,
    diagnostic: firstDiagnostic,
  };
}

export function safeErrorContext(message: string): string {
  return message
    .slice(0, 4096)
    .replace(/\bS[A-Z2-7]{55}\b/g, '[REDACTED_SECRET]')
    .replace(/https?:\/\/[^\s]+/gi, '[REDACTED_URL]')
    .replace(
      /\b(token|password|secret|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
      '$1=[REDACTED]'
    );
}
