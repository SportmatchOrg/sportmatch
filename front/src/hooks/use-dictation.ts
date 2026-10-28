'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

type RecognitionResults = ArrayLike<ArrayLike<{ transcript: string }>>;

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: RecognitionResults }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognitionConstructor = new () => Recognition;

type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

const LANGUAGE = 'es-AR';

function recognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as SpeechWindow;

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function subscribe(): () => void {
  return () => undefined;
}

function transcriptOf(results: RecognitionResults): string {
  return Array.from(results, (result) => result[0].transcript).join('');
}

export function useDictation(onText: (text: string) => void) {
  const supported = useSyncExternalStore(
    subscribe,
    () => recognitionConstructor() !== null,
    () => false
  );
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);

  useEffect(() => () => recognition.current?.abort(), []);

  const start = useCallback(() => {
    const Constructor = recognitionConstructor();

    if (!Constructor) return;

    const session = new Constructor();
    session.lang = LANGUAGE;
    session.continuous = true;
    session.interimResults = true;
    session.onresult = (event) => onText(transcriptOf(event.results));
    session.onend = () => setListening(false);

    recognition.current = session;
    onText('');
    setListening(true);
    session.start();
  }, [onText]);

  const stop = useCallback(() => recognition.current?.stop(), []);

  return { supported, listening, start, stop };
}
