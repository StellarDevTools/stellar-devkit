export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">Stellar DevKit</h1>
          <p className="text-2xl text-muted-foreground">
            Build. Inspect. Debug. Ship.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Developer toolbox for building, inspecting, testing, debugging, and
            understanding Stellar and Soroban applications.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href="/tools"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Open DevKit
          </a>
          <a
            href="https://github.com/StellarDevTools/stellar-devkit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            View on GitHub
          </a>
        </div>

        <div className="pt-12">
          <p className="text-sm text-muted-foreground">
            Phase 2 Complete - v0.1.0
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            8 CLI tools • 6 web pages • MCP server • GitHub Action
          </p>
        </div>
      </div>
    </main>
  );
}
