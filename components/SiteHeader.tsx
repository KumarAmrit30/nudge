import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          Nudge
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>
          <Link href="/products" className="hover:text-zinc-900">
            Products
          </Link>
          <Link href="/buy" className="hover:text-zinc-900">
            Assistant
          </Link>
          <Link href="/merchant" className="hover:text-zinc-900">
            Merchant
          </Link>
        </nav>
      </div>
    </header>
  );
}
