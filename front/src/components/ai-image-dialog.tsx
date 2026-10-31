'use client';

import { LoaderCircle, Sparkles } from 'lucide-react';
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
import {
  generateImage,
  imageErrorMessage,
  imageFileFromDataUrl,
  type ImageTarget,
} from '@/lib/ai';

const PROMPT_MAX = 500;
const SAVE_ERROR = 'No pudimos guardar la foto. Probá de nuevo.';
const PROMPT_ID = 'ai-image-prompt';

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
          <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-md bg-sunken">
            {image && (
              <Image
                src={image}
                alt="Vista previa de la imagen generada"
                fill
                sizes="384px"
                unoptimized
                className="object-cover"
              />
            )}
            {generating && (
              <span className="absolute inset-0 flex items-center justify-center bg-base/70">
                <LoaderCircle className="size-7 animate-spin text-white" aria-hidden="true" />
              </span>
            )}
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
