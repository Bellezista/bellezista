"use client";

import { useCvs } from "@/hooks/useCvs";
import { CvGrid } from "@/components/talento/CvGrid";
import type { TalentoFiltros, CvResumen } from "@/types/talento";

interface TalentoCatalogoClientProps {
  filtros: TalentoFiltros;
  initialData: CvResumen[];
}

export function TalentoCatalogoClient({
  filtros,
  initialData,
}: TalentoCatalogoClientProps) {
  const { data } = useCvs(filtros, initialData);
  return <CvGrid cvs={data ?? []} />;
}
