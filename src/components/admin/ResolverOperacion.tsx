"use client";

import { useState, useTransition } from "react";
import { resolverOperacionAdmin } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

// Admin controls to resolve a held/disputed operation: release to seller or
// refund the buyer.
export function ResolverOperacion({ operacionId }: { operacionId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function resolver(accion: "liberar" | "reembolsar") {
    setError(null);
    startTransition(async () => {
      const res = await resolverOperacionAdmin(operacionId, accion);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => resolver("liberar")}
          className="bg-gold font-semibold text-foreground hover:bg-gold/90"
        >
          Liberar al vendedor
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => resolver("reembolsar")}
        >
          Reembolsar al comprador
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
