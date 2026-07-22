import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

// Manual 01 "Identidad - Logotipo" (p.2): the "i" in "Bellezista" is always
// gold, the rest of the wordmark is soft black -- changing that color is
// literally the first "uso incorrecto" example in the manual.
export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("font-sans font-bold text-foreground", className)}>
      Bellez<span className="text-gold">i</span>sta
    </span>
  );
}
