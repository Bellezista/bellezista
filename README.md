# Bellezista — Etapa 1 (Maquinaria)

Marketplace de compraventa de maquinaria de estética. Ver `CLAUDE.md` para el contexto completo del proyecto (alcance, modelo de datos, dirección visual) y `bid.txt` / el Brief adjunto para el historial de la negociación.

Stack: Next.js 16 (App Router) + Supabase (Postgres + Auth + Storage) + Prisma 7 + Tailwind v4 + shadcn/ui + React Query.

## Requisitos

- Node.js **22+** (el proyecto usa `@supabase/supabase-js`, que requiere Node 22; ver `.nvmrc`). Si usás `nvm`, simplemente `nvm use` en la carpeta del proyecto.
- Un proyecto de Supabase real (no se usa el stack local de Supabase CLI vía Docker en este flujo — ver más abajo por qué).

## Por qué no `supabase start` (Docker) para desarrollo local

Este proyecto se desarrolló sin Docker disponible. En vez de eso, se usa un proyecto Supabase real (de dev, no necesariamente el del cliente todavía) directamente:

- `supabase link` y `supabase db push` NO requieren Docker — hablan directo con el proyecto hosteado por red. Docker sólo hace falta para `supabase start` (el stack local emulado) y para comandos puntuales de diffing/dump (`db pull`, `db diff`, `db dump`), que este flujo no usa.
- Esto significa: creá un proyecto Supabase (gratis) para desarrollo, o usá el del cliente una vez esté provisionado, y seguí los pasos de abajo contra ese proyecto real.

## Arranque

1. Copiá `.env.example` a `.env.local` y completá los valores desde el dashboard de Supabase (botón **Connect** del proyecto para las connection strings, **Settings → API Keys** para las keys). Ver los comentarios en `.env.example` para la diferencia entre `DATABASE_URL` (pooler de transacción, runtime) y `DIRECT_URL` (pooler de sesión, CLI/migraciones).
2. Instalá dependencias: `npm install`
3. Aplicá el esquema de Prisma (crea las tablas): `npx prisma migrate deploy` (o `npx prisma migrate dev` mientras iterás el esquema)
4. Aplicá las migraciones SQL de Supabase (RLS, trigger de auth, buckets de Storage) — **en este orden, después del paso 3**, porque referencian tablas que Prisma ya debe haber creado:
   ```bash
   npx supabase login
   npx supabase link --project-ref <tu-project-ref>
   npx supabase db push
   ```
5. (Opcional) Sembrá datos de demo: `npx prisma db seed` — ver la nota en `prisma/seed.ts`, estos anuncios no tienen un usuario de Supabase Auth real detrás, son sólo para tener algo que ver en el catálogo.
6. `npm run dev`

### Nota importante sobre las dos fuentes de migraciones

Prisma (`prisma/schema/*.prisma` → `prisma migrate ...`) y Supabase CLI (`supabase/migrations/*.sql` → `supabase db push`) son **dos historiales de migración independientes** sobre la misma base de datos física (`_prisma_migrations` vs `supabase_migrations.schema_migrations`). Ningún comando único corre ambos — el orden del paso 3→4 de arriba hay que respetarlo siempre que se agreguen migraciones nuevas de cualquiera de los dos lados. No modifiques la base de datos remota a mano desde el SQL Editor del dashboard salvo para exploración puntual — eso rompe el historial de `supabase db push` (ver comentario en la documentación de Supabase sobre "bypassing migration history").

## Estructura

- `prisma/schema/*.prisma` — modelo de datos (ver `CLAUDE.md` sección "Data model" para el mapeo exacto a los campos del Brief del cliente).
- `supabase/migrations/*.sql` — todo lo que Prisma no puede expresar: el schema `private` (aísla `Contacto`), las políticas RLS, el trigger `auth.users → public.usuario`, y las políticas de Storage.
- `src/lib/anuncio/subtype-adapters.ts` — el patrón de componente reutilizable (tarjeta/ficha/formulario) por tipo de anuncio; agregar Traspasos en Fase 2 es un adapter nuevo acá, no una reescritura.
- `src/lib/actions/` — Server Actions, agrupadas por dominio. `contacto.ts` es el ÚNICO archivo autorizado a consultar el modelo `Contacto`.
- `src/proxy.ts` — sucesor de `middleware.ts` en Next.js 16 (mismo propósito: refresco de sesión + protección de rutas).

## Seguridad del contacto (requisito no negociable)

El teléfono/email del propietario nunca se exponen, bajo ninguna circunstancia. Ver la sección de seguridad del plan de implementación y los comentarios en `supabase/migrations/0002_rls_contacto.sql` y `src/lib/actions/contacto.ts` para el detalle de las capas de protección (schema `private` fuera del alcance de la Data API de Supabase, RLS como defensa adicional, y disciplina de código: ningún Server Action fuera de `contacto.ts` puede referenciar `Contacto`).

## Alcance de Etapa 1

Sólo el módulo Maquinaria (ver `CLAUDE.md`). El modelo `Operacion` es un placeholder de esquema únicamente — ninguna pantalla ni Server Action debe referenciarlo todavía; es una decisión de alcance abierta del cliente, no un olvido.
