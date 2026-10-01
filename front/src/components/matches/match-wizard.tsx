'use client';

import { Autocomplete } from '@base-ui/react/autocomplete';
import { MapPin as MapPinIcon } from 'lucide-react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { BaseMap } from '@/components/map/base-map';
import { MapPin } from '@/components/map/map-pin';
import { CapacityStepper } from '@/components/matches/capacity-stepper';
import { SportPicker } from '@/components/matches/sport-picker';
import { SchedulePicker } from '@/components/matches/schedule-picker';
import { LevelPicker } from '@/components/matches/level-picker';
import { MatchSummary } from '@/components/matches/match-summary';
import { TextField } from '@/components/matches/text-field';
import { TextareaField } from '@/components/matches/textarea-field';
import { WizardShell } from '@/components/matches/wizard-shell';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  MIN_PLACE_SEARCH_LENGTH,
  useGeocoding,
  type PlaceSuggestion,
} from '@/hooks/use-geocoding';
import { useSports } from '@/hooks/use-sports';
import { LAST_STEP, firstStepWithError, stepErrors } from '@/lib/match-wizard';
import {
  validateMatchForm,
  type MatchForm,
  type MatchFormErrors,
} from '@/lib/match-form';
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  LOCATION_MAX,
  type Sport,
  type Level,
} from '@/types/match';

type WizardToast = { message: string; tone: ToastTone };
type PlaceSearch = {
  status: 'idle' | 'loading' | 'ready' | 'empty' | 'error' | 'selecting';
  suggestions: PlaceSuggestion[];
  open: boolean;
};

const PLACE_SEARCH_ERROR = 'No pudimos buscar direcciones. Probá de nuevo.';
const CLOSING_REASONS = ['escape-key', 'outside-press', 'focus-out'];
const SUGGESTIONS =
  'w-(--anchor-width) overflow-hidden rounded-sm border border-glass-strong bg-panel shadow-bevel';
const SUGGESTION_OPTION =
  'flex w-full flex-col gap-1 px-4 py-3 text-left text-white outline-none data-highlighted:bg-glass-solid';

type MatchWizardProps = {
  mode: 'create' | 'edit';
  initialForm: MatchForm;
  submit: (form: MatchForm) => Promise<unknown>;
  toastMessage: (form: MatchForm, sport?: Sport) => string;
  errorMessage: (error: unknown) => string;
  doneHref: string;
};

export function MatchWizard({
  mode,
  initialForm,
  submit,
  toastMessage,
  errorMessage,
  doneHref,
}: MatchWizardProps) {
  const router = useRouter();
  const { sports, loading: deportesLoading, error: deportesError } = useSports();
  const { user } = useCurrentUser();
  const { ready: placesReady, searchPlaces, getPlace } = useGeocoding();
  const [form, setForm] = useState<MatchForm>(initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<MatchFormErrors>({});
  const [toast, setToast] = useState<WizardToast | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placeSearch, setPlaceSearch] = useState<PlaceSearch>({
    status: 'idle',
    suggestions: [],
    open: false,
  });
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRevision = useRef(0);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (
      step !== 1 ||
      !placeSearch.open ||
      placeSearch.status !== 'loading' ||
      !placesReady ||
      form.latitude !== null ||
      form.longitude !== null
    ) return;

    const query = form.location.trim();
    let current = true;
    searchPlaces(query)
      .then((found) => {
        if (!current) return;
        setPlaceSearch((state) => ({
          ...state,
          status: found.length > 0 ? 'ready' : 'empty',
          suggestions: found,
        }));
      })
      .catch(() => {
        if (!current) return;
        setPlaceSearch((state) => ({ ...state, status: 'error' }));
      });

    return () => {
      current = false;
    };
  }, [step, placeSearch.open, placeSearch.status, placesReady, form.location, form.latitude, form.longitude, searchPlaces]);

  const sport = sports.find((candidate) => candidate.id === form.sportId);
  const showingSuggestions = placeSearch.open && placeSearch.status === 'ready';

  function setField<K extends keyof MatchForm>(key: K, value: MatchForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function changeLocation(value: string) {
    inputRevision.current += 1;
    if (placeSearch.status === 'selecting') void searchPlaces('');
    setForm((current) => ({
      ...current,
      location: value,
      latitude: null,
      longitude: null,
    }));
    setErrors((current) => ({ ...current, location: undefined, latitude: undefined }));
    const status = value.trim().length >= MIN_PLACE_SEARCH_LENGTH ? 'loading' : 'idle';
    setPlaceSearch({ status, suggestions: [], open: true });
    if (status === 'idle') void searchPlaces(value);
  }

  function closeSuggestions() {
    setPlaceSearch({ status: 'idle', suggestions: [], open: false });
    void searchPlaces('');
  }

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    const revision = inputRevision.current;
    setPlaceSearch((state) => ({ ...state, status: 'selecting', open: false }));

    try {
      const place = await getPlace(suggestion);
      if (revision !== inputRevision.current) return;

      setForm((current) => ({
        ...current,
        location: place.label.slice(0, LOCATION_MAX),
        latitude: place.latitude,
        longitude: place.longitude,
      }));
      setErrors((current) => ({ ...current, location: undefined, latitude: undefined }));
      closeSuggestions();
    } catch {
      if (revision === inputRevision.current) {
        setPlaceSearch({ status: 'error', suggestions: [], open: false });
      }
    }
  }

  async function save() {
    const found = validateMatchForm(form);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStep(firstStepWithError(found));
      return;
    }

    setSubmitting(true);

    try {
      await submit(form);
      setToast({ message: toastMessage(form, sport), tone: 'success' });
      redirectTimer.current = setTimeout(() => router.replace(doneHref), TOAST_DURATION);
    } catch (caught) {
      setToast({ message: errorMessage(caught), tone: 'danger' });
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (submitting) return;

    const found = stepErrors(validateMatchForm(form), step);
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    if (step === LAST_STEP) {
      void save();
      return;
    }

    setStep(step + 1);
  }

  function handleBack() {
    if (submitting) return;

    setErrors({});
    setStep(step - 1);
  }

  function handleExit() {
    if (!submitting) router.back();
  }

  return (
    <>
      <WizardShell
        mode={mode}
        step={step}
        submitting={submitting}
        onBack={handleBack}
        onExit={handleExit}
        onContinue={handleContinue}
      >
        {step === 0 && (
          <SportPicker
            sports={sports}
            loading={deportesLoading}
            loadError={deportesError}
            value={form.sportId}
            onChange={(sportId) => setField('sportId', sportId)}
            error={errors.sportId}
          />
        )}

        {step === 1 && (
          <div className="flex h-full flex-col gap-4">
            <Autocomplete.Root
              mode="none"
              autoHighlight
              items={placeSearch.suggestions}
              itemToStringValue={(suggestion: PlaceSuggestion) => suggestion.title}
              value={form.location}
              onValueChange={(value, details) => {
                if (details.reason !== 'item-press') changeLocation(value);
              }}
              open={showingSuggestions}
              onOpenChange={(open, details) => {
                if (!open && CLOSING_REASONS.includes(details.reason)) closeSuggestions();
              }}
            >
              <div className="relative">
                <MapPinIcon
                  className="pointer-events-none absolute top-3.5 left-4 size-[18px] text-ink-46"
                  aria-hidden="true"
                />
                <Autocomplete.Input
                  id="ubicacion"
                  placeholder="Buscá una cancha o dirección"
                  maxLength={LOCATION_MAX}
                  onFocus={() => {
                    if (form.latitude !== null && form.longitude !== null) return;
                    setPlaceSearch({
                      status: form.location.trim().length >= MIN_PLACE_SEARCH_LENGTH ? 'loading' : 'idle',
                      suggestions: [],
                      open: true,
                    });
                  }}
                  render={
                    <TextField
                      id="ubicacion"
                      label="Lugar"
                      hideLabel
                      error={placeSearch.status === 'error' ? PLACE_SEARCH_ERROR : errors.latitude ?? errors.location}
                      className="pl-11"
                    />
                  }
                />
              </div>

              {showingSuggestions && (
                <Autocomplete.Portal>
                  <Autocomplete.Positioner sideOffset={8} className="z-[70]">
                    <Autocomplete.Popup className={SUGGESTIONS}>
                      <Autocomplete.List>
                        {(suggestion: PlaceSuggestion) => (
                          <Autocomplete.Item
                            key={suggestion.id}
                            value={suggestion}
                            onClick={() => void selectSuggestion(suggestion)}
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
              )}
            </Autocomplete.Root>

            {(placeSearch.status === 'loading' || placeSearch.status === 'selecting') && (
              <p className="text-caption text-ink-46">Buscando lugares…</p>
            )}
            {placeSearch.open && placeSearch.status === 'empty' && (
              <p className="text-caption text-ink-46">No encontramos lugares. Probá con otra búsqueda.</p>
            )}

            {form.latitude !== null && form.longitude !== null && (
              <div className="min-h-48 flex-1 overflow-hidden rounded-md" aria-label="Ubicación del partido en el mapa">
                <BaseMap
                  key={form.location}
                  defaultCenter={{ lat: form.latitude, lng: form.longitude }}
                  defaultZoom={16}
                  className="size-full"
                >
                  <AdvancedMarker
                    position={{ lat: form.latitude, lng: form.longitude }}
                    clickable
                    draggable
                    title="Arrastrá el pin para ajustar el lugar"
                    onDragEnd={(event) => {
                      const position = event.latLng;
                      if (!position) return;
                      setForm((current) => ({
                        ...current,
                        latitude: position.lat(),
                        longitude: position.lng(),
                      }));
                    }}
                  >
                    <MapPin />
                  </AdvancedMarker>
                </BaseMap>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <SchedulePicker
            value={form.date}
            onChange={(date) => setField('date', date)}
            error={errors.date}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <CapacityStepper
              value={form.capacity}
              onChange={(capacity) => setField('capacity', capacity)}
              error={errors.capacity}
            />

            <LevelPicker
              value={form.level}
              onChange={(level: Level) => setField('level', level)}
              error={errors.level}
            />

            <TextField
              id="titulo"
              label="Título"
              maxLength={TITLE_MAX}
              placeholder="Ej. Picado de los jueves"
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              error={errors.title}
            />

            <TextareaField
              id="descripcion"
              label="Descripción"
              hint="opcional"
              maxLength={DESCRIPTION_MAX}
              placeholder="Contá cómo se juega, qué llevar, si se arman equipos…"
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              error={errors.description}
            />
          </div>
        )}

        {step === LAST_STEP && <MatchSummary form={form} sport={sport} organizer={user} />}
      </WizardShell>

      {toast && (
        <div className="fixed inset-x-0 top-16 z-[70] flex justify-center px-4">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </>
  );
}
