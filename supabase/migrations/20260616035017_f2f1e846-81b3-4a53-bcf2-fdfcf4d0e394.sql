ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS species TEXT NOT NULL DEFAULT 'cat';
CREATE INDEX IF NOT EXISTS cats_species_idx ON public.cats(species);