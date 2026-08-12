import { getMiCv } from "@/lib/actions/talento";
import { PageHeader } from "@/components/layout/PageHeader";
import { MiCvForm } from "@/components/talento/MiCvForm";
import type { CvFormInput } from "@/lib/validation/cvSchema";

export default async function MiCvPage() {
  const cv = await getMiCv();

  const defaultValues: Partial<CvFormInput> | undefined = cv
    ? {
        puesto: cv.puesto,
        provincia: cv.provincia,
        aniosExperiencia: cv.aniosExperiencia,
        jornada: cv.jornada,
        disponibilidad: cv.disponibilidad,
        expectativaSalarial: cv.expectativaSalarial ?? undefined,
        titulacion: cv.titulacion ?? undefined,
        cursos: cv.cursos ?? undefined,
        presentacion: cv.presentacion ?? undefined,
        foto: cv.foto ?? undefined,
        tecnicas: cv.tecnicas.map((t) => ({ key: t.tecnica, anios: t.anios })),
      }
    : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Talento"
        title={cv ? "Editar mi CV" : "Publicar mi CV"}
        subtitle="Rellena tu perfil profesional para que los negocios del sector te encuentren."
      />
      <MiCvForm defaultValues={defaultValues} />
    </div>
  );
}
