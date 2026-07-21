"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEnviarMensaje } from "@/hooks/useEnviarMensaje";

interface MensajeComposerProps {
  conversacionId: string;
}

// The message thread's one primary action -- this is the only spot in this
// component where a solid (variant="default") button belongs.
export function MensajeComposer({ conversacionId }: MensajeComposerProps) {
  const [texto, setTexto] = useState("");
  const mutation = useEnviarMensaje(conversacionId);

  const estaVacio = texto.trim().length === 0;
  const errorValidacion = mutation.data?.error;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (estaVacio || mutation.isPending) return;

    const resultado = await mutation.mutateAsync({ texto: texto.trim() });
    if (!resultado?.error) {
      setTexto("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <Textarea
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          rows={2}
          placeholder="Escribí un mensaje..."
          className="flex-1"
        />
        <Button
          type="submit"
          variant="default"
          disabled={estaVacio || mutation.isPending}
        >
          <Send />
          Enviar
        </Button>
      </div>
      {errorValidacion && (
        <p className="text-xs text-destructive">{errorValidacion}</p>
      )}
    </form>
  );
}
