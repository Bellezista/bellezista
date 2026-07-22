import { StepDatosComunes } from "@/components/publicar/StepDatosComunes";
import { StepDatosMaquinaria } from "@/components/publicar/StepDatosMaquinaria";

// Combines StepDatosComunes + StepDatosMaquinaria into a single wizard step.
// Manual Visual de Pantallas' publish wizard is 3 steps (datos -> fotos ->
// revisión), but that document mocks the Traspasos module specifically --
// its "paso 1" bundles fields (superficie, cabinas, alquiler) that don't
// exist on Maquinaria at all, so its field grouping doesn't transfer.
// What does transfer is the 3-step SHAPE: this file just stacks Maquinaria's
// own two data-entry steps into one, keeping each as its own component
// rather than merging their internals.
export function StepDatos() {
  return (
    <div className="space-y-10">
      <StepDatosComunes />
      <StepDatosMaquinaria />
    </div>
  );
}
