'use client';

import { Autocomplete } from '@base-ui/react/autocomplete';
import type { RefObject } from 'react';

import type { PlaceSuggestion } from '@/hooks/use-geocoding';

const SUGGESTIONS =
  'w-(--anchor-width) overflow-hidden rounded-sm border border-glass-strong bg-panel shadow-bevel';

const SUGGESTION_OPTION =
  'flex w-full flex-col gap-1 px-4 py-3 text-left text-white outline-none data-highlighted:bg-glass-solid';

type PlaceSuggestionsProps = {
  onSelect: (suggestion: PlaceSuggestion) => void;
  // Element the list lines up with; defaults to the input.
  anchor?: RefObject<HTMLElement | null>;
};

export function PlaceSuggestions({ onSelect, anchor }: PlaceSuggestionsProps) {
  return (
    <Autocomplete.Portal>
      <Autocomplete.Positioner sideOffset={8} anchor={anchor} className="z-[70]">
        <Autocomplete.Popup className={SUGGESTIONS}>
          <Autocomplete.List>
            {(suggestion: PlaceSuggestion) => (
              <Autocomplete.Item
                key={suggestion.id}
                value={suggestion}
                onClick={() => onSelect(suggestion)}
                className={SUGGESTION_OPTION}
              >
                <span className="text-callout font-semibold">{suggestion.title}</span>
                <span className="text-caption text-ink-46">{suggestion.subtitle}</span>
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
          <p className="px-4 py-2 text-right text-caption text-ink-46">Google Maps</p>
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  );
}
