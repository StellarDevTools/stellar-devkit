import Link from 'next/link';

export default function ToolsPage() {
  const tools = [
    {
      title: 'XDR Decoder',
      description: 'Decode Stellar XDR to human-readable format',
      href: '/tools/xdr',
      status: 'Available',
      available: true,
    },
    {
      title: 'Network Health',
      description: 'Check Stellar RPC endpoint health and connectivity',
      href: '/tools/network',
      status: 'Available',
      available: true,
    },
    {
      title: 'Account Inspector',
      description: 'Inspect Stellar account details including balances and signers',
      href: '/tools/account',
      status: 'Available',
      available: true,
    },
    {
      title: 'Error Explainer',
      description: 'Explain Soroban errors with diagnostics and solutions',
      href: '/tools/errors',
      status: 'Available',
      available: true,
    },
    {
      title: 'Contract Inspector',
      description: 'Inspect deployed Soroban contracts',
      href: '/tools/contract',
      status: 'Available',
      available: true,
    },
    {
      title: 'Project Doctor',
      description: 'Diagnose your Stellar/Soroban project (CLI only)',
      href: '/tools/doctor',
      status: 'CLI Only',
      available: false,
    },
    {
      title: 'Transaction Inspector',
      description: 'Inspect transaction status, operations, and events',
      href: '/tools/transaction',
      status: 'Available',
      available: true,
    },
    {
      title: 'Event Viewer',
      description: 'Inspect contract events',
      href: '/tools/events',
      status: 'Phase 2',
      available: false,
    },
  ];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Developer Tools</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Diagnostic and inspection tools for Stellar and Soroban
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) =>
            tool.available ? (
              <Link
                key={tool.href}
                href={tool.href}
                className="border border-border rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all block"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{tool.title}</h2>
                    <span className="text-xs text-green-600 dark:text-green-400 px-2 py-1 rounded-full border border-green-600 dark:border-green-400">
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ) : (
              <div
                key={tool.href}
                className="border border-border rounded-lg p-6 opacity-60 cursor-not-allowed"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{tool.title}</h2>
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full border border-border">
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Phase 1 - More tools coming soon!
          </p>
        </div>
      </div>
    </main>
  );
}
