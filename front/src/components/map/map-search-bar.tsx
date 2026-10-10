'use client';

import { Autocomplete } from '@base-ui/react/autocomplete';
import { useMap } from '@vis.gl/react-google-maps';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { PlaceSuggestions } from '@/components/map/place-suggestions';
import { IconButton } from '@/components/ui/icon-button';
import {
  useGeocoding,
  type PlaceSuggestion,
  type SearchOrigin,
} from '@/hooks/use-geocoding';
import { cn } from '@/lib/utils';

const FIELD =
  'flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-glass-solid pr-2 pl-4 shadow-bevel backdrop-blur-card transition focus-within:ring-2 focus-within:ring-brand';

const INPUT =
  'min-w-0 flex-1 bg-transparent text-callout text-white outline-none placeholder:text-ink-32';

const CLEAR =
  'flex size-7 shrink-0 items-center justify-center rounded-full text-ink-46 transition outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-brand';

const PLACE_ZOOM = 15;

const SEARCH_ERROR = 'No pudimos buscar esa dirección. Probá de nuevo.';

const CLOSING_REASONS = ['escape-key', 'outside-press', 'focus-out'];

type MapSearchBarProps = {
  onOpenFilters: () => void;
  origin: SearchOrigin | null;
  className?: string;
};

export function MapSearchBar({ onOpenFilters, origin, className }: MapSearchBarProps) {
  const map = useMap();
  const { searchPlaces, getPlace } = useGeocoding(origin);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const revision = useRef(0);

  function close() {
    revision.current += 1;
    setSuggestions([]);
    setOpen(false);
  }

  async function search(query: string) {
    const current = ++revision.current;

    setValue(query);
    setFailed(false);

    try {
      const found = await searchPlaces(query);
      // A newer keystroke already asked for other suggestions.
      if (current !== revision.current) return;

      setSuggestions(found);
      setOpen(found.length > 0);
    } catch {
      if (current !== revision.current) return;

      close();
      setFailed(true);
    }
  }

  async function select(suggestion: PlaceSuggestion) {
    close();
    setValue(suggestion.title);

    try {
      const place = await getPlace(suggestion);

      map?.panTo({ lat: place.latitude, lng: place.longitude });
      map?.setZoom(PLACE_ZOOM);
    } catch {
      setFailed(true);
    }
  }

  function clear() {
    close();
    setValue('');
    setFailed(false);
    void searchPlaces('');
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div ref={anchor} className="flex items-center gap-2">
        <Autocomplete.Root
          mode="none"
          autoHighlight
          items={suggestions}
          itemToStringValue={(suggestion: PlaceSuggestion) => suggestion.title}
          value={value}
          onValueChange={(next, details) => {
            if (details.reason !== 'item-press') void search(next);
          }}
          open={open}
          onOpenChange={(next, details) => {
            if (!next && CLOSING_REASONS.includes(details.reason)) close();
          }}
        >
          <div className={FIELD}>
            <Search className="size-5 shrink-0 text-ink-46" aria-hidden="true" />
            <Autocomplete.Input
              aria-label="Buscá en esta zona"
              placeholder="Buscá en esta zona"
              className={INPUT}
            />
            {value && (
              <button type="button" aria-label="Borrar búsqueda" onClick={clear} className={CLEAR}>
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {open && <PlaceSuggestions anchor={anchor} onSelect={(suggestion) => void select(suggestion)} />}
        </Autocomplete.Root>

        <IconButton label="Filtros" onClick={onOpenFilters}>
          <SlidersHorizontal className="size-5" aria-hidden="true" />
        </IconButton>
      </div>

      {failed && (
        <p role="alert" className="pl-4 text-caption text-danger">
          {SEARCH_ERROR}
        </p>
      )}
    </div>
  );
}
