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
  {
    code: 'STORAGE_MISSING_VALUE',
    pattern: /Error\(Storage, MissingValue\)/i,
    title: 'Storage Entry Not Found',
    explanation: 'The contract attempted to read a storage entry that does not exist.',
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
    docsUrl: 'https://developers.stellar.org/docs/smart-contracts/getting-started/errors',
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

export function findMatchingDiagnostics(errorMessage: string): ErrorDiagnostic[] {
  return ERROR_REGISTRY.filter(diag => diag.pattern.test(errorMessage));
}
