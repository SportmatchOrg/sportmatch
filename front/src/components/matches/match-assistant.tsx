'use client';

import { CircleAlert, Mic, Sparkles, Square, X } from 'lucide-react';
import { useState } from 'react';

import {
  WIZARD_ACTIONS,
  WIZARD_FOOTER,
  WIZARD_FRAME,
  WIZARD_PANEL,
} from '@/components/matches/wizard-shell';
import { IconButton } from '@/components/ui/icon-button';
import { PillButton } from '@/components/ui/pill-button';
import { useDictation } from '@/hooks/use-dictation';
import { fetchMatchDraft, matchDraftErrorMessage, type MatchDraft } from '@/lib/ai';
import { cn } from '@/lib/utils';

const EXAMPLES = [
  'Fútbol 5 el sábado a las 19 en River Courts, nivel intermedio',
  'Pádel mañana a las 8 de la noche en Club Víbora',
  'Básquet el jueves a las 21, somos 6, tranqui',
];

const TEXT_MIN = 3;
const TEXT_MAX = 500;
const ERROR_ID = 'match-assistant-error';

const ROUND_BUTTON =
  'relative flex size-14 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40';

const ROUND_IDLE = 'bg-glass-strong shadow-bevel-lit hover:bg-glass-solid';

const TEXTAREA =
  'min-h-36 w-full resize-none rounded-md bg-glass px-4 py-4 text-body font-medium text-white outline-none transition placeholder:text-ink-46';

const TEXTAREA_IDLE = 'shadow-bevel focus:shadow-[inset_0_0_0_1.5px_var(--color-brand)]';

const TEXTAREA_LISTENING = 'shadow-[inset_0_0_0_1.5px_var(--color-brand)]';

const TEXTAREA_ERROR = 'shadow-[inset_0_0_0_1.5px_var(--color-danger)]';

const EXAMPLE =
  'rounded-sm bg-glass px-4 py-3 text-left text-callout text-ink-80 shadow-bevel transition hover:bg-glass-strong';

const ERROR_BOX = 'flex items-start gap-2 rounded-sm bg-danger-tint px-4 py-3 text-callout text-white';

const NOTICE = 'flex items-center gap-2 rounded-md px-4 py-3 text-callout font-semibold';

export function AssistantNotice({ complete }: { complete: boolean }) {
  const Icon = complete ? Sparkles : CircleAlert;

  return (
    <p
      role="status"
      className={cn(NOTICE, complete ? 'bg-brand-tint text-brand' : 'bg-warning-tint text-warning')}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      {complete ? 'Revisá antes de publicar' : 'Completá lo que falta'}
    </p>
  );
}

export function AssistantButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Armar el partido con el asistente"
      title="Armar con el asistente"
      onClick={onClick}
      className={cn(ROUND_BUTTON, ROUND_IDLE, 'text-brand')}
    >
      <Sparkles className="size-6" aria-hidden="true" />
    </button>
  );
}

type MicButtonProps = {
  listening: boolean;
  disabled: boolean;
  onClick: () => void;
};

function textareaRing(listening: boolean, error: string | null): string {
  if (listening) return TEXTAREA_LISTENING;

  return error ? TEXTAREA_ERROR : TEXTAREA_IDLE;
}

function MicButton({ listening, disabled, onClick }: MicButtonProps) {
  return (
    <button
      type="button"
      aria-label={listening ? 'Terminar dictado' : 'Dictar el partido'}
      disabled={disabled}
      onClick={onClick}
      className={cn(ROUND_BUTTON, listening ? 'bg-brand text-brand-ink' : cn(ROUND_IDLE, 'text-white'))}
    >
      {listening && (
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" aria-hidden="true" />
      )}
      {listening ? (
        <Square className="relative size-5" aria-hidden="true" />
      ) : (
        <Mic className="size-[22px]" aria-hidden="true" />
      )}
    </button>
  );
}

type MatchAssistantProps = {
  onClose: () => void;
  onDraft: (draft: MatchDraft) => Promise<void>;
};

export function MatchAssistant({ onClose, onDraft }: MatchAssistantProps) {
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dictation = useDictation(setText);
  const busy = thinking || dictation.listening;
  const canComplete = !busy && text.trim().length >= TEXT_MIN;

  function changeText(value: string) {
    setText(value);
    setError(null);
  }

  function toggleDictation() {
    if (dictation.listening) {
      dictation.stop();
      return;
    }

    setError(null);
    dictation.start();
  }

  async function complete() {
    if (!canComplete) return;

    setThinking(true);
    setError(null);

    try {
      await onDraft(await fetchMatchDraft(text.trim()));
    } catch (caught) {
      setError(matchDraftErrorMessage(caught));
      setThinking(false);
    }
  }

  return (
    <div className={WIZARD_FRAME}>
      <div className={WIZARD_PANEL}>
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 px-5 pt-6 lg:justify-end lg:px-10 lg:pt-8">
            <IconButton label="Volver al paso a paso" onClick={onClose}>
              <X className="size-5" aria-hidden="true" />
            </IconButton>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-40 lg:px-10 lg:pb-8">
            <div className="flex flex-col gap-6 lg:max-w-2xl">
              <div className="flex flex-col gap-3">
                <span className="flex items-center gap-1.5 text-overline text-brand uppercase">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Asistente
                </span>

                <h1 className="text-display text-[36px] text-white lg:text-[34px]">
                  Contanos el partido
                </h1>

                <p className="text-body text-ink-64">
                  {dictation.listening
                    ? 'Escuchando… tocá el micrófono para terminar.'
                    : 'En una frase: deporte, día, hora, lugar y cuántos faltan.'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <textarea
                  aria-label="Describí el partido"
                  rows={4}
                  maxLength={TEXT_MAX}
                  value={text}
                  disabled={busy}
                  autoFocus
                  placeholder="Ej. pádel mañana a las 8 de la noche en Club Víbora"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? ERROR_ID : undefined}
                  onChange={(event) => changeText(event.target.value)}
                  className={cn(TEXTAREA, textareaRing(dictation.listening, error))}
                />

                {error && (
                  <p id={ERROR_ID} role="alert" className={ERROR_BOX}>
                    <CircleAlert className="size-[18px] shrink-0 text-danger" aria-hidden="true" />
                    {error}
                  </p>
                )}
              </div>

              {!busy && (
                <div className="flex flex-col gap-3">
                  <span className="text-overline text-ink-46 uppercase">Ejemplos</span>

                  {EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => changeText(example)}
                      className={EXAMPLE}
                    >
                      “{example}”
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={WIZARD_FOOTER}>
            <div className={WIZARD_ACTIONS}>
              {dictation.supported && (
                <MicButton
                  listening={dictation.listening}
                  disabled={thinking}
                  onClick={toggleDictation}
                />
              )}

              <PillButton
                disabled={!canComplete}
                onClick={() => void complete()}
                className="flex-1 lg:flex-none lg:px-8"
              >
                {!thinking && <Sparkles className="size-[18px]" aria-hidden="true" />}
                {thinking ? 'Interpretando…' : 'Completar'}
              </PillButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
