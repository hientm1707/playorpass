import { Activity, CalendarClock, Check, Clipboard, CloudRain, CloudSun, ExternalLink, Gauge, Heart, Languages, LocateFixed, MapPin, Search, Settings2, Star, Sun, ThermometerSun, Trash2, Trophy, WifiOff, Wind, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchForecast, searchLocations } from './api';
import { defaultPreferences, sports } from './config';
import { reasonLabel, sportLabel, t, verdictLabel, weatherLabelFor, type Language } from './i18n';
import { buildWindows, scoreForecast, weatherLabel } from './scoring';
import {
  getCachedForecast,
  getDefaultLocationId,
  getInitialSport,
  getLanguage,
  getPreferences,
  getSavedLocations,
  saveCachedForecast,
  saveDefaultLocationId,
  saveLanguage,
  saveLocations,
  savePreferences,
  saveSport
} from './storage';
import type { GeocodingResult, HourlyForecast, Preferences, SavedLocation, ScoredHour, Sport, TimeWindow, Verdict } from './types';

type ForecastCache = {
  locationId: string;
  date: string;
  fetchedAt: string;
  hours: HourlyForecast[];
};

const card = 'rounded-lg border border-slate-200/70 bg-white shadow-soft';
const label = 'text-xs font-black uppercase tracking-wide text-emerald-700';
const courtAccent = 'relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-lime-400 before:via-emerald-500 before:to-sky-400';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatPlace(location: Pick<SavedLocation, 'name' | 'country' | 'admin1'>) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

function formatHour(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatDate(language: Language, value = new Date()) {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(value);
}

function toDateInputValue(value = new Date()) {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function dateInputToDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function isToday(value: string) {
  return value === toDateInputValue();
}

function verdictClass(verdict: Verdict) {
  if (verdict === 'Play') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (verdict === 'Maybe') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-rose-100 text-rose-800 border-rose-200';
}

function verdictGradient(verdict: Verdict) {
  if (verdict === 'Play') return 'from-emerald-500 via-lime-400 to-sky-400';
  if (verdict === 'Maybe') return 'from-amber-400 via-lime-300 to-sky-300';
  return 'from-rose-500 via-amber-300 to-slate-300';
}

function scoreColor(score: number) {
  if (score >= 75) return '#10b981';
  if (score >= 55) return '#f59e0b';
  return '#e11d48';
}

function ScoreDial({ score, label: dialLabel }: { score: number; label: string }) {
  const clamped = Math.max(0, Math.min(score, 100));
  return (
    <div
      className="grid h-24 w-24 shrink-0 place-items-center rounded-full p-2 shadow-[0_18px_38px_rgba(15,23,42,0.18)]"
      style={{ background: `conic-gradient(${scoreColor(clamped)} ${clamped * 3.6}deg, rgba(226,232,240,0.95) 0deg)` }}
      aria-label={`${dialLabel}: ${clamped}/100`}
    >
      <div className="grid h-full w-full place-items-center rounded-full bg-white text-center">
        <span className="text-2xl font-black text-slate-950">{clamped}</span>
        <span className="-mt-3 text-[10px] font-black uppercase tracking-wide text-slate-500">/100</span>
      </div>
    </div>
  );
}

function MetricChip({ icon: Icon, label: chipLabel, value, tone = 'emerald' }: { icon: typeof CloudSun; label: string; value: string; tone?: 'emerald' | 'sky' | 'amber' | 'rose' }) {
  const toneClass = {
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-800',
    sky: 'border-sky-100 bg-sky-50 text-sky-800',
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
    rose: 'border-rose-100 bg-rose-50 text-rose-800'
  }[tone];

  return (
    <div className={cx('flex items-center gap-2 rounded-lg border px-3 py-2', toneClass)}>
      <Icon size={16} />
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-wide opacity-75">{chipLabel}</span>
        <span className="block truncate text-sm font-black">{value}</span>
      </span>
    </div>
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost' }) {
  const { className, variant = 'soft', ...rest } = props;
  return (
    <button
      className={cx(
        'focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-emerald-600 text-white hover:bg-emerald-700',
        variant === 'soft' && 'border border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:bg-emerald-50',
        variant === 'ghost' && 'text-slate-600 hover:bg-lime-50',
        className
      )}
      {...rest}
    />
  );
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  const nextLanguage = language === 'en' ? 'vi' : 'en';

  return (
    <button
      className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
      onClick={() => onChange(nextLanguage)}
      aria-label={t(language, 'language.label')}
      title={`${t(language, 'language.label')}: ${language === 'en' ? t(language, 'language.english') : t(language, 'language.vietnamese')}`}
    >
      <Languages size={16} className="text-emerald-600" />
      {language.toUpperCase()}
    </button>
  );
}

function DateBadge({ language, selectedDate, onChange }: { language: Language; selectedDate: string; onChange: (date: string) => void }) {
  const today = toDateInputValue();
  const maxDate = toDateInputValue(addDays(new Date(), 15));

  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-2 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <CalendarClock size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700">{isToday(selectedDate) ? t(language, 'date.label') : t(language, 'date.selected')}</p>
          <p className="text-base font-black text-slate-950">{formatDate(language, dateInputToDate(selectedDate))}</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
        <label className="sr-only" htmlFor="play-date">{t(language, 'date.pick')}</label>
        <input
          id="play-date"
          className="focus-ring min-h-10 rounded-lg border border-slate-200 bg-lime-50 px-3 text-sm font-black text-slate-950 accent-emerald-600"
          type="date"
          min={today}
          max={maxDate}
          value={selectedDate}
          onInput={(event) => onChange(event.currentTarget.value)}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button className="px-3" onClick={() => onChange(today)} disabled={selectedDate === today}>
          {t(language, 'date.today')}
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ title, body, icon: Icon }: { title: string; body: string; icon: typeof CloudSun }) {
  return (
    <div className={`${card} flex items-start gap-3 p-4`}>
      <div className="rounded-lg bg-lime-100 p-2 text-emerald-700">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{body}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton({ language }: { language: Language }) {
  return (
    <section className={`${card} overflow-hidden p-5`}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-emerald-100" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-700">{t(language, 'loading')}</p>
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="h-20 animate-pulse rounded-lg bg-lime-100/70" />
        <div className="h-20 animate-pulse rounded-lg bg-sky-100/70" />
        <div className="h-20 animate-pulse rounded-lg bg-amber-100/70" />
      </div>
    </section>
  );
}

function DecisionStrip({ language }: { language: Language }) {
  const items: Array<{ verdict: Verdict; icon: typeof CloudSun; note: string }> = [
    { verdict: 'Play', icon: Trophy, note: language === 'vi' ? 'Thời tiết thuận lợi' : 'Strong outdoor window' },
    { verdict: 'Maybe', icon: Gauge, note: language === 'vi' ? 'Cần cân nhắc' : 'Watch a few factors' },
    { verdict: 'Pass', icon: CloudRain, note: language === 'vi' ? 'Nên đổi kế hoạch' : 'Better to skip it' }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {items.map(({ verdict, icon: Icon, note }) => (
        <div key={verdict} className={`${card} overflow-hidden`}>
          <div className={cx('h-1 bg-gradient-to-r', verdictGradient(verdict))} />
          <div className="flex items-center gap-3 p-3">
            <div className={cx('rounded-lg border p-2', verdictClass(verdict))}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-slate-950">{verdictLabel(language, verdict)}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{note}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function QuickStart({ language }: { language: Language }) {
  const steps = [
    ['1', t(language, 'quick.step1.title'), t(language, 'quick.step1.body')],
    ['2', t(language, 'quick.step2.title'), t(language, 'quick.step2.body')],
    ['3', t(language, 'quick.step3.title'), t(language, 'quick.step3.body')]
  ];

  return (
    <section className={`${card} ${courtAccent} grid gap-3 p-4 md:grid-cols-[1.1fr_1.4fr] md:items-center`}>
      <div>
        <p className={label}>{t(language, 'quick.kicker')}</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">{t(language, 'quick.title')}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t(language, 'quick.body')}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {steps.map(([number, title, body]) => (
          <div key={number} className="rounded-lg border border-emerald-100 bg-lime-50/70 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-lime-300">{number}</div>
            <p className="font-black text-slate-950">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LocationSearch({ language, onSave }: { language: Language; onSave: (location: SavedLocation) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setStatus('loading');
    try {
      setResults(await searchLocations(query.trim()));
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={label}>{t(language, 'location.kicker')}</p>
          <h2 className="text-lg font-black text-slate-950">{t(language, 'location.title')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t(language, 'location.body')}</p>
        </div>
        <MapPin className="text-emerald-600" size={22} />
      </div>
      <form className="mt-4 flex gap-2" onSubmit={handleSearch}>
        <input
          className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          placeholder={t(language, 'location.placeholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button type="submit" variant="primary" aria-label={t(language, 'location.search')} disabled={status === 'loading'}>
          <Search size={16} />
        </Button>
      </form>
      {status === 'error' && <p className="mt-3 text-sm text-rose-600">{t(language, 'location.error')}</p>}
      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t(language, 'location.tapResult')}</p>
          {results.map((result) => (
            <button
              key={result.id}
              className="focus-ring flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-emerald-50"
              onClick={() =>
                onSave({
                  id: String(result.id),
                  name: result.name,
                  admin1: result.admin1,
                  country: result.country,
                  latitude: result.latitude,
                  longitude: result.longitude,
                  timezone: result.timezone
                })
              }
            >
              <span>
                <span className="block text-sm font-semibold text-slate-900">{formatPlace(result)}</span>
                <span className="text-xs text-slate-500">{result.latitude.toFixed(2)}, {result.longitude.toFixed(2)}</span>
              </span>
              <Check size={16} className="text-emerald-600" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VerdictPanel({ language, sport, location, bestWindow, hours, copied, onCopy, stale }: {
  language: Language;
  sport: Sport;
  location?: SavedLocation;
  bestWindow?: TimeWindow;
  hours: ScoredHour[];
  copied: boolean;
  stale: boolean;
  onCopy: () => void;
}) {
  if (!location) {
    return <EmptyState icon={LocateFixed} title={t(language, 'empty.noLocation.title')} body={t(language, 'empty.noLocation.body')} />;
  }

  if (!bestWindow) {
    return <EmptyState icon={CloudSun} title={t(language, 'empty.noWindow.title')} body={t(language, 'empty.noWindow.body')} />;
  }

  const average = Math.round(hours.reduce((sum, hour) => sum + hour.score, 0) / Math.max(hours.length, 1));
  const verdict = bestWindow.verdict;
  const bestHour = hours.find((hour) => hour.time === bestWindow.start) ?? hours[0];

  return (
    <section className={`${card} ${courtAccent} overflow-hidden`}>
      <div className={cx('border-b border-emerald-100 bg-gradient-to-br p-5 pt-6', verdictGradient(verdict))}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className={label}>{t(language, 'verdict.kicker')}</p>
            <h2 className="mt-2 text-5xl font-black uppercase text-slate-950 drop-shadow-sm sm:text-6xl">{verdictLabel(language, verdict)}</h2>
            <p className="mt-2 max-w-2xl text-sm font-bold text-slate-700">{sportLabel(language, sport)} {t(language, 'verdict.at')} {formatPlace(location)} / {formatDate(language, new Date(bestWindow.start))}</p>
          </div>
          <ScoreDial score={bestWindow.score} label={t(language, 'share.score')} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-100 bg-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{t(language, 'verdict.bestWindow')}</p>
            <p className="mt-1 text-lg font-black text-slate-950">{formatHour(bestWindow.start, language)} - {formatHour(bestWindow.end, language)}</p>
          </div>
          <div className="rounded-lg border border-sky-100 bg-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">{t(language, 'verdict.weatherDrag')}</p>
            <p className="mt-1 text-lg font-black text-slate-950">{100 - average}%</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        {stale && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <WifiOff size={16} /> {t(language, 'verdict.offline')}
          </div>
        )}
        {bestHour && (
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <MetricChip icon={CloudSun} label={language === 'vi' ? 'Trời' : 'Sky'} value={weatherLabelFor(language, weatherLabel(bestHour.weatherCode))} tone="sky" />
            <MetricChip icon={ThermometerSun} label={language === 'vi' ? 'Cảm giác' : 'Feels'} value={`${Math.round(bestHour.apparentTemperature)}C`} tone="amber" />
            <MetricChip icon={CloudRain} label={t(language, 'hourly.rain')} value={`${Math.round(bestHour.rainProbability)}%`} tone={bestHour.rainProbability > 35 ? 'rose' : 'emerald'} />
            <MetricChip icon={Wind} label={t(language, 'hourly.wind')} value={`${Math.round(bestHour.windSpeed)} km/h`} tone={bestHour.windSpeed > 22 ? 'amber' : 'emerald'} />
            <MetricChip icon={Sun} label="UV" value={String(Math.round(bestHour.uvIndex))} tone={bestHour.uvIndex > 7 ? 'rose' : 'emerald'} />
          </div>
        )}
        <div className="space-y-2">
          <p className={label}>{t(language, 'verdict.why')}</p>
          {bestWindow.reasons.map((reason) => (
            <p key={reason} className="rounded-lg bg-lime-50 px-3 py-2 text-sm font-medium text-slate-700">{reasonLabel(language, reason)}</p>
          ))}
        </div>
        <Button className="mt-4 w-full" variant="primary" onClick={onCopy}>
          <Clipboard size={16} />
          {copied ? t(language, 'verdict.copied') : t(language, 'verdict.share')}
        </Button>
      </div>
    </section>
  );
}

function WindowsList({ language, windows }: { language: Language; windows: TimeWindow[] }) {
  return (
    <div className={`${card} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className={label}>{t(language, 'windows.kicker')}</p>
          <h2 className="text-lg font-black text-slate-950">{t(language, 'windows.title')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t(language, 'windows.body')}</p>
        </div>
        <CalendarClock className="text-emerald-600" size={22} />
      </div>
      <div className="space-y-2">
        {windows.slice(0, 3).map((window) => (
          <div key={`${window.start}-${window.end}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 hover:border-emerald-200 hover:bg-lime-50/50">
            <div>
              <p className="font-semibold text-slate-950">{formatHour(window.start, language)} - {formatHour(window.end, language)}</p>
              <p className="text-sm text-slate-500">{window.reasons.map((reason) => reasonLabel(language, reason)).join(' / ')}</p>
            </div>
            <span className={cx('rounded-lg border px-2 py-1 text-xs font-bold', verdictClass(window.verdict))}>{verdictLabel(language, window.verdict)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HourlyDetails({ language, hours }: { language: Language; hours: ScoredHour[] }) {
  return (
    <section className={`${card} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className={label}>{t(language, 'hourly.kicker')}</p>
          <h2 className="text-lg font-black text-slate-950">{t(language, 'hourly.title')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t(language, 'hourly.body')}</p>
        </div>
        <Activity className="text-emerald-600" size={22} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {hours.map((hour) => (
          <div key={hour.time} className="rounded-lg border border-slate-200 bg-white p-3 hover:border-sky-200">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-950">{formatHour(hour.time, language)}</p>
              <span className={cx('rounded-lg border px-2 py-1 text-xs font-bold', verdictClass(hour.verdict))}>{verdictLabel(language, hour.verdict)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{weatherLabelFor(language, weatherLabel(hour.weatherCode))} / {hour.score}/100</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <span>{Math.round(hour.apparentTemperature)}C {t(language, 'hourly.feels')}</span>
              <span>{Math.round(hour.rainProbability)}% {t(language, 'hourly.rain')}</span>
              <span>{Math.round(hour.windSpeed)} km/h {t(language, 'hourly.wind')}</span>
              <span>UV {Math.round(hour.uvIndex)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreferencesPanel({ language, preferences, onChange }: { language: Language; preferences: Preferences; onChange: (preferences: Preferences) => void }) {
  function setValue(key: keyof Preferences, value: number) {
    const next = { ...preferences, [key]: value };
    onChange(next);
    savePreferences(next);
  }

  const criteria = [
    {
      key: 'preferredStartHour' as const,
      label: t(language, 'prefs.start'),
      value: preferences.preferredStartHour,
      min: 5,
      max: 20,
      step: 1,
      display: `${preferences.preferredStartHour}:00`
    },
    {
      key: 'preferredEndHour' as const,
      label: t(language, 'prefs.end'),
      value: preferences.preferredEndHour,
      min: 8,
      max: 23,
      step: 1,
      display: `${preferences.preferredEndHour}:00`
    },
    {
      key: 'windSensitivity' as const,
      label: t(language, 'prefs.wind'),
      value: preferences.windSensitivity,
      min: 0.6,
      max: 1.6,
      step: 0.1,
      display: `${preferences.windSensitivity.toFixed(1)}x km/h`
    },
    {
      key: 'heatTolerance' as const,
      label: t(language, 'prefs.heat'),
      value: preferences.heatTolerance,
      min: 0.6,
      max: 1.6,
      step: 0.1,
      display: `${preferences.heatTolerance.toFixed(1)}x C`
    },
    {
      key: 'uvTolerance' as const,
      label: t(language, 'prefs.sun'),
      value: preferences.uvTolerance,
      min: 0.6,
      max: 1.6,
      step: 0.1,
      display: `${preferences.uvTolerance.toFixed(1)}x UV`
    }
  ];

  return (
    <section className={`${card} ${courtAccent} p-4 pt-5`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={label}>{t(language, 'prefs.kicker')}</p>
          <h2 className="text-lg font-black text-slate-950">{t(language, 'prefs.title')}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">{t(language, 'prefs.body')}</p>
        </div>
        <div className="rounded-lg bg-slate-950 p-2 text-lime-300">
          <Settings2 size={18} />
        </div>
      </div>
      <div className="space-y-3">
        {criteria.map((item) => (
          <label key={item.key} className="block rounded-lg border border-emerald-100 bg-lime-50/60 p-3">
            <span className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-black text-slate-900">{item.label}</span>
              <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-emerald-700 shadow-sm">{item.display}</span>
            </span>
            <input
              className="h-2 w-full cursor-pointer accent-emerald-600"
              type="range"
              min={item.min}
              max={item.max}
              step={item.step}
              value={item.value}
              onChange={(event) => setValue(item.key, Number(event.target.value))}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function SavedLocations({ language, locations, selectedId, onSelect, onDefault, onRemove }: {
  language: Language;
  locations: SavedLocation[];
  selectedId?: string;
  onSelect: (location: SavedLocation) => void;
  onDefault: (location: SavedLocation) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className={`${card} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className={label}>{t(language, 'saved.kicker')}</p>
          <h2 className="text-lg font-black text-slate-950">{t(language, 'saved.title')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t(language, 'saved.body')}</p>
        </div>
        <Star className="text-emerald-600" size={22} />
      </div>
      {locations.length === 0 ? (
        <p className="text-sm text-slate-600">{t(language, 'saved.empty')}</p>
      ) : (
        <div className="space-y-2">
          {locations.map((location) => (
            <div key={location.id} className={cx('rounded-lg border p-3', selectedId === location.id ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white')}>
              <button className="focus-ring w-full text-left" onClick={() => onSelect(location)}>
                <span className="block font-semibold text-slate-950">{formatPlace(location)}</span>
                <span className="text-xs text-slate-500">{location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}</span>
              </button>
              <div className="mt-3 flex gap-2">
                <Button className="flex-1" onClick={() => onDefault(location)}>
                  <Star size={15} /> {t(language, 'saved.goto')}
                </Button>
                <Button aria-label="Remove saved location" onClick={() => onRemove(location.id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Footer({ language }: { language: Language }) {
  const [showDonation, setShowDonation] = useState(false);

  return (
    <footer className="mt-4 border-t border-slate-200/80 py-6">
      <div className="flex flex-col gap-4 rounded-lg bg-white/70 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            className="h-14 w-14 rounded-full border-2 border-lime-300 bg-lime-50 object-cover shadow-sm"
            src="/chibi-hien.png"
            alt="Chibi illustration of Hien Tran"
          />
          <div>
            <p className="font-black text-slate-950">Play or Pass</p>
            <p>
              {language === 'vi' ? 'Xây dựng bởi ' : 'Built by '}
              <a
                className="focus-ring rounded-md px-1 font-black text-emerald-700 underline decoration-lime-300 decoration-2 underline-offset-4 hover:bg-lime-50"
                href="https://www.facebook.com/cse.minhhientran"
                target="_blank"
                rel="noreferrer"
              >
                Hien Tran
              </a>
              {language === 'vi' ? '. Dữ liệu thời tiết từ Open-Meteo.' : '. Weather by Open-Meteo.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-lime-50" href="https://moveslikehayden.lovable.app/about" target="_blank" rel="noreferrer">
            {t(language, 'footer.blog')} <ExternalLink size={15} />
          </a>
          <Button className="border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={() => setShowDonation(true)}>
            <Heart size={15} />
            {t(language, 'footer.donate')}
          </Button>
        </div>
      </div>
      {showDonation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-modal-title"
          onClick={() => setShowDonation(false)}
        >
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className={label}>{t(language, 'donation.kicker')}</p>
                <h2 id="donation-modal-title" className="text-xl font-black text-slate-950">{t(language, 'donation.title')}</h2>
              </div>
              <Button aria-label={t(language, 'donation.close')} onClick={() => setShowDonation(false)}>
                <X size={16} />
              </Button>
            </div>
            <img
              className="w-full rounded-lg border border-rose-100 bg-rose-50 object-contain"
              src="/donation-qr.png"
              alt={t(language, 'donation.alt')}
            />
            <p className="mt-3 text-sm text-slate-600">{t(language, 'donation.body')}</p>
          </div>
        </div>
      )}
    </footer>
  );
}

export function App() {
  const [language, setLanguage] = useState<Language>(getLanguage);
  const [sport, setSport] = useState<Sport>(getInitialSport);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue);
  const [preferences, setPreferences] = useState<Preferences>(getPreferences);
  const [locations, setLocations] = useState<SavedLocation[]>(getSavedLocations);
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | undefined>(() => {
    const saved = getSavedLocations();
    const defaultId = getDefaultLocationId();
    return saved.find((location) => location.id === defaultId) ?? saved[0];
  });
  const [forecast, setForecast] = useState<HourlyForecast[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [usingCache, setUsingCache] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    saveSport(sport);
  }, [sport]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    if (!selectedLocation) return;
    let ignore = false;
    setStatus('loading');
    setUsingCache(false);

    fetchForecast(selectedLocation, selectedDate)
      .then((hours) => {
        if (ignore) return;
        setForecast(hours);
        setStatus('idle');
        saveCachedForecast<ForecastCache>({ locationId: selectedLocation.id, date: selectedDate, fetchedAt: new Date().toISOString(), hours });
      })
      .catch(() => {
        if (ignore) return;
        const cached = getCachedForecast<ForecastCache>();
        if (cached && cached.locationId === selectedLocation.id && cached.date === selectedDate) {
          setForecast(cached.hours);
          setUsingCache(true);
        }
        setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [selectedLocation, selectedDate]);

  const scoredHours = useMemo(() => scoreForecast(forecast, sport, preferences), [forecast, preferences, sport]);
  const windows = useMemo(() => buildWindows(scoredHours), [scoredHours]);
  const bestWindow = windows[0];

  function saveLocation(location: SavedLocation) {
    const next = [location, ...locations.filter((item) => item.id !== location.id)].slice(0, 8);
    setLocations(next);
    saveLocations(next);
    setSelectedLocation(location);
    if (!getDefaultLocationId()) saveDefaultLocationId(location.id);
  }

  function removeLocation(id: string) {
    const next = locations.filter((location) => location.id !== id);
    setLocations(next);
    saveLocations(next);
    if (selectedLocation?.id === id) setSelectedLocation(next[0]);
    if (getDefaultLocationId() === id) saveDefaultLocationId(next[0]?.id ?? null);
  }

  async function copyResult() {
    if (!selectedLocation || !bestWindow) return;
    const message = `${t(language, 'share.prefix')}: ${verdictLabel(language, bestWindow.verdict)} ${t(language, 'share.for')} ${sportLabel(language, sport)} ${t(language, 'share.in')} ${formatPlace(selectedLocation)} (${formatDate(language, dateInputToDate(selectedDate))}). ${t(language, 'share.bestWindow')}: ${formatHour(bestWindow.start, language)} - ${formatHour(bestWindow.end, language)}. ${t(language, 'share.score')}: ${bestWindow.score}/100.`;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-lg border border-emerald-200 bg-white/90 shadow-soft">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-lime-300 to-sky-400" />
        <div className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-black uppercase tracking-wide text-lime-300">
                <Activity size={16} />
                {t(language, 'app.kicker')}
              </span>
              <LanguageToggle language={language} onChange={setLanguage} />
            </div>
            <div className="flex items-center gap-3">
              <img className="h-16 w-16 rounded-lg border border-emerald-100 bg-emerald-50 object-cover shadow-sm" src="/app-icon.png" alt="" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-4xl font-black uppercase text-slate-950 sm:text-5xl">{t(language, 'app.title')}</h1>
                <p className="mt-1 text-xs font-black uppercase tracking-wide text-emerald-700">{language === 'vi' ? 'Tín hiệu sân chơi theo thời tiết' : 'Weather-powered court signal'}</p>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              {t(language, 'app.subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <DateBadge language={language} selectedDate={selectedDate} onChange={setSelectedDate} />
            <div className="rounded-lg border border-slate-200 bg-slate-950 p-2 shadow-sm">
              <p className="mb-2 px-1 text-xs font-black uppercase tracking-wide text-lime-300">{t(language, 'app.stepSport')}</p>
              <div className="grid grid-cols-3 gap-2">
                {sports.map((item) => (
                  <button
                    key={item}
                    className={cx(
                      'focus-ring rounded-lg px-3 py-2 text-sm font-black transition',
                      sport === item
                        ? 'bg-lime-300 text-slate-950 shadow-sm'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    )}
                    onClick={() => setSport(item)}
                  >
                    {sportLabel(language, item)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </header>
      <DecisionStrip language={language} />
      <QuickStart language={language} />

      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <LocationSearch language={language} onSave={saveLocation} />
          <SavedLocations
            language={language}
            locations={locations}
            selectedId={selectedLocation?.id}
            onSelect={setSelectedLocation}
            onDefault={(location) => saveDefaultLocationId(location.id)}
            onRemove={removeLocation}
          />
          <PreferencesPanel language={language} preferences={preferences} onChange={(next) => setPreferences({ ...defaultPreferences, ...next })} />
        </aside>

        <div className="space-y-5">
          {status === 'loading' && (
            <LoadingSkeleton language={language} />
          )}
          {status === 'error' && !usingCache && (
            <EmptyState icon={WifiOff} title={t(language, 'empty.api.title')} body={t(language, 'empty.api.body')} />
          )}
          <VerdictPanel language={language} sport={sport} location={selectedLocation} bestWindow={bestWindow} hours={scoredHours} copied={copied} onCopy={copyResult} stale={usingCache} />
          {windows.length > 0 && <WindowsList language={language} windows={windows} />}
          {scoredHours.length > 0 && <HourlyDetails language={language} hours={scoredHours} />}
        </div>
      </div>
      <Footer language={language} />
    </main>
  );
}
