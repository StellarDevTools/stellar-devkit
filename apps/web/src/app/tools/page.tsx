export default function ToolsPage() {
  const tools = [
    {
      title: 'Project Doctor',
      description: 'Diagnose your Stellar/Soroban project',
      href: '/tools/doctor',
      status: 'Phase 1',
    },
    {
      title: 'Account Inspector',
      description: 'Inspect Stellar accounts',
      href: '/tools/account',
      status: 'Phase 1',
    },
    {
      title: 'Contract Inspector',
      description: 'Inspect Soroban contracts',
      href: '/tools/contract',
      status: 'Phase 2',
    },
    {
      title: 'Transaction Inspector',
      description: 'Inspect transaction details',
      href: '/tools/transaction',
      status: 'Phase 2',
    },
    {
      title: 'XDR Decoder',
      description: 'Decode Stellar XDR',
      href: '/tools/xdr',
      status: 'Phase 1',
    },
    {
      title: 'Event Viewer',
      description: 'Inspect contract events',
      href: '/tools/events',
      status: 'Phase 2',
    },
    {
      title: 'Network Status',
      description: 'Check RPC/network health',
      href: '/tools/network',
      status: 'Phase 1',
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
          {tools.map((tool) => (
            <div
              key={tool.href}
              className="border border-border rounded-lg p-6 hover:border-primary transition-colors"
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
          ))}
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Phase 0 - Tools coming in Phase 1
          </p>
        </div>
      </div>
    </main>
  );
}
