import { BuyerChat } from "@/components/BuyerChat";

export default function BuyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Assistant
      </h1>
      <p className="mt-2 text-zinc-600">
        Ask in natural language. Matches come from the merchant catalog. The
        assistant does not add items to a cart.
      </p>
      <div className="mt-8">
        <BuyerChat />
      </div>
    </div>
  );
}
