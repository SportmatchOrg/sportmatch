'use client';

import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { TextareaField } from '@/components/matches/textarea-field';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PillButton } from '@/components/ui/pill-button';
import { ShinyText } from '@/components/ui/shiny-text';
import {
  generateImage,
  imageErrorMessage,
  imageFileFromDataUrl,
  type ImageTarget,
} from '@/lib/ai';

const PROMPT_MAX = 500;
const SAVE_ERROR = 'No pudimos guardar la foto. Probá de nuevo.';
const PROMPT_ID = 'ai-image-prompt';

const SWEEP =
  'absolute inset-0 animate-ai-shimmer bg-[linear-gradient(110deg,transparent_35%,var(--color-brand-tint)_50%,transparent_65%)] bg-[length:200%_100%] motion-reduce:animate-none';

function GeneratingOverlay() {
  return (
    <div
      role="status"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-base/60 backdrop-blur-sm"
    >
      <span className={SWEEP} aria-hidden="true" />
      <Sparkles
        className="relative size-8 animate-ai-twinkle text-brand motion-reduce:animate-none"
        aria-hidden="true"
      />
      <ShinyText className="relative text-callout font-semibold">Pintando tu imagen…</ShinyText>
    </div>
  );
}

type AiImageDialogProps = {
  target: ImageTarget;
  matchId?: string;
  disabled?: boolean;
  onUse: (file: File) => Promise<boolean>;
};

export function AiImageDialog({ target, matchId, disabled = false, onUse }: AiImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [using, setUsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = generating || using;
  const canGenerate = !busy && prompt.trim().length > 0;

  function handleOpenChange(next: boolean) {
    if (busy) return;

    setOpen(next);

    if (!next) {
      setPrompt('');
      setImage(null);
      setError(null);
    }
  }

  async function generate() {
    if (!canGenerate) return;

    setGenerating(true);
    setError(null);

    try {
      setImage(await generateImage({ prompt: prompt.trim(), target, matchId }));
      setRevision((current) => current + 1);
    } catch (caught) {
      setError(imageErrorMessage(caught));
    } finally {
      setGenerating(false);
    }
  }

  async function use() {
    if (!image || busy) return;

    setUsing(true);
    setError(null);

    try {
      const saved = await onUse(await imageFileFromDataUrl(image));

      if (saved) {
        setUsing(false);
        handleOpenChange(false);
        return;
      }

      setError(SAVE_ERROR);
    } catch {
      setError(SAVE_ERROR);
    }

    setUsing(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogTrigger render={<PillButton variant="glass" size="md" disabled={disabled} />}>
        <Sparkles className="size-4" aria-hidden="true" />
        Generar con IA
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogTitle>Generar con IA</DialogTitle>
          <DialogDescription>
            Contanos cómo la querés. Cada intento cuenta para tu límite diario.
          </DialogDescription>
        </div>

        <TextareaField
          id={PROMPT_ID}
          label="Descripción"
          rows={3}
          maxLength={PROMPT_MAX}
          value={prompt}
          disabled={busy}
          placeholder="Ej. una cancha de pádel al atardecer"
          error={error ?? undefined}
          onChange={(event) => {
            setPrompt(event.target.value);
            setError(null);
          }}
        />

        {(image || generating) && (
          <div className="relative h-48 overflow-hidden rounded-md bg-sunken shadow-bevel">
            {image && (
              <Image
                key={revision}
                src={image}
                alt="Vista previa de la imagen generada"
                fill
                sizes="384px"
                unoptimized
                className="animate-ai-reveal object-cover motion-reduce:animate-none"
              />
            )}
            {generating && <GeneratingOverlay />}
          </div>
        )}

        <div className="flex gap-3">
          {image ? (
            <>
              <PillButton
                variant="glass"
                size="md"
                disabled={!canGenerate}
                onClick={() => void generate()}
                className="flex-1"
              >
                {generating ? 'Generando…' : 'Otra'}
              </PillButton>

              <PillButton
                size="md"
                disabled={busy}
                onClick={() => void use()}
                className="flex-1"
              >
                {using ? 'Guardando…' : 'Usar esta'}
              </PillButton>
            </>
          ) : (
            <>
              <DialogClose
                render={<PillButton variant="glass" size="md" disabled={busy} className="flex-1" />}
              >
                Cancelar
              </DialogClose>

              <PillButton
                size="md"
                disabled={!canGenerate}
                onClick={() => void generate()}
                className="flex-1"
              >
                {generating ? 'Generando…' : 'Generar'}
              </PillButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
