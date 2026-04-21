"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Warning {
  text: string;
  severity: "low" | "medium" | "high";
}

interface FraudEntry {
  source: string;
  category: string;
  reportedAt: string;
  reports: number;
}

interface ApiResult {
  status: "safe" | "suspicious" | "dangerous";
  score: number;
  // numverify
  valid: boolean | null;
  countryCode: string | null;
  countryName: string | null;
  countryPrefix: string | null;
  location: string | null;
  carrier: string | null;
  lineType: string | null;
  numberFormatted: string | null;
  localFormat: string | null;
  internationalFormat: string | null;
  // IPQS
  ipqsAvailable: boolean;
  ipqsFraudScore: number | null;
  ipqsSpammer: boolean;
  ipqsVoip: boolean;
  ipqsPrepaid: boolean;
  ipqsRisky: boolean;
  ipqsActive: boolean;
  ipqsDnc: boolean;
  ipqsCarrier: string | null;
  ipqsLineType: string | null;
  ipqsCity: string | null;
  ipqsRegion: string | null;
  ipqsCountry: string | null;
  ipqsTimezone: string | null;
  ipqsNameMatch: string | null;
  // Fraud DB
  inFraudDb: boolean;
  fraudDbMatches: FraudEntry[];
  reportCount: number;
  // Analysis
  warnings: Warning[];
  // AbstractAPI
  abstAvailable: boolean;
  abstValid: boolean | null;
  abstCarrier: string | null;
  abstCountryCode: string | null;
  abstCountryName: string | null;
  abstCountryPrefix: string | null;
  abstIntlFormat: string | null;
  abstLocalFormat: string | null;
  abstType: string | null;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const LINE_TYPE_LABELS: Record<string, string> = {
  mobile:       "Мобильный",
  landline:     "Стационарный",
  voip:         "VoIP / Виртуальный",
  toll_free:    "Бесплатный (8-800)",
  premium_rate: "Платный (premium rate)",
  satellite:    "Спутниковый",
  special:      "Специальный",
  unknown:      "Неизвестно",
};

const COUNTRY_FLAGS: Record<string, string> = {
  RU:"🇷🇺", KZ:"🇰🇿", US:"🇺🇸", CA:"🇨🇦", GB:"🇬🇧", DE:"🇩🇪", FR:"🇫🇷",
  CN:"🇨🇳", IN:"🇮🇳", NG:"🇳🇬", PK:"🇵🇰", ID:"🇮🇩", UA:"🇺🇦", BY:"🇧🇾",
  TR:"🇹🇷", UZ:"🇺🇿", KG:"🇰🇬", AZ:"🇦🇿", GE:"🇬🇪", AM:"🇦🇲", LT:"🇱🇹",
  LV:"🇱🇻", EE:"🇪🇪", GH:"🇬🇭", KE:"🇰🇪", ET:"🇪🇹",
};

function getFlag(code: string | null) {
  if (!code) return "🌐";
  return COUNTRY_FLAGS[code.toUpperCase()] ?? "🌐";
}

function ipqsScoreColor(score: number | null) {
  if (score === null) return "text-zinc-400";
  if (score >= 85) return "text-red-600 dark:text-red-400";
  if (score >= 60) return "text-orange-600 dark:text-orange-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function ipqsScoreBar(score: number | null) {
  if (score === null) return "bg-zinc-300 dark:bg-zinc-600";
  if (score >= 85) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function statusCfg(status: string) {
  const safe = {
    border: "border-emerald-400/40 dark:border-emerald-500/30",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    title: "Номер выглядит безопасно", label: "БЕЗОПАСЕН",
    icon: (<svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.39 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 5.55 5.55l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="9,11 12,14 22,4"/></svg>),
  };
  const susp = {
    border: "border-amber-400/40 dark:border-amber-500/30",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
    badge: "bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400",
    title: "Подозрительный номер", label: "ПОДОЗРИТЕЛЬНО",
    icon: (<svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
  };
  const dang = {
    border: "border-red-400/40 dark:border-red-500/30",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    bar: "bg-red-500",
    badge: "bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400",
    title: "Опасный номер", label: "ОПАСНО",
    icon: (<svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.39 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 5.55 5.55l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>),
  };
  return status === "safe" ? safe : status === "suspicious" ? susp : dang;
}

const SEVERITY_CLASS: Record<Warning["severity"], string> = {
  high:   "text-red-600 dark:text-red-400",
  medium: "text-amber-600 dark:text-amber-400",
  low:    "text-zinc-500 dark:text-zinc-400",
};

const STEPS = [
  "Запрос к numverify...",
  "Запрос к IPQualityScore...",
  "Запрос к AbstractAPI...",
  "Проверяем базу мошеннических номеров...",
  "Анализируем сигналы риска...",
  "Формируем полный отчёт...",
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function PhoneChecker() {
  const [phone, setPhone]   = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState(0);
  const [error, setError]   = useState<string | null>(null);

  const handleCheck = async () => {
    const trimmed = phone.trim();
    if (!trimmed || trimmed.replace(/[\s\-\(\)\+]/g, "").length < 5) {
      setError("Введите корректный номер телефона");
      return;
    }
    setLoading(true); setResult(null); setError(null); setStep(0);
    const iv = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 420);
    try {
      const res  = await fetch("/api/phone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: trimmed }) });
      const data = await res.json();
      clearInterval(iv);
      if (!res.ok || data.error) setError(data.error ?? "Ошибка сервера");
      else setResult(data as ApiResult);
    } catch {
      clearInterval(iv);
      setError("Не удалось подключиться к серверу");
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? statusCfg(result.status) : null;

  // Prefer IPQS geo if available and richer
  const displayCity     = result?.ipqsCity    ?? result?.location ?? null;
  const displayRegion   = result?.ipqsRegion  ?? null;
  const displayCarrier  = result?.ipqsCarrier ?? result?.carrier  ?? null;
  const displayLineType = result?.ipqsLineType ?? result?.lineType ?? null;
  const displayTimezone = result?.ipqsTimezone ?? null;
  const displayCountry  = result?.countryName ?? result?.ipqsCountry ?? null;
  const displayCC       = result?.countryCode ?? result?.ipqsCountry ?? null;

  const detailsText = result
    ? result.status === "safe"      ? "Номер прошёл проверку обоих API и не содержит явных признаков мошенничества."
    : result.status === "suspicious"? "Обнаружены признаки, характерные для спам-звонков. Рекомендуем осторожность."
    :                                  "Высокий риск мошенничества — номер соответствует паттернам мошенников или найден в базах жалоб."
    : "";

  const recommendations = result
    ? result.status === "dangerous"
      ? ["Не перезванивайте на этот номер", "Заблокируйте номер в настройках телефона", "Сообщите о нём на мошенники.рф или в Роскомнадзор"]
    : result.status === "suspicious"
      ? ["Будьте осторожны — не сообщайте личные данные", "Проверьте номер через GetContact или Truecaller", "При SMS со ссылками — не переходите по ним"]
    :   ["Явных признаков мошенничества не обнаружено", "Никогда не сообщайте CVV, PIN и одноразовые коды по телефону"]
    : [];

  const InfoCard = ({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) => (
    <Card className="p-3.5 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-sm">
      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight ${mono ? "font-mono" : ""}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
    </Card>
  );

  const BoolBadge = ({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) => (
    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
      value
        ? "bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400"
        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400"
    }`}>
      {value ? trueLabel : falseLabel}
    </span>
  );

  return (
    <div className="space-y-5">
      {/* Input */}
      <Card className="p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
            <svg className="w-5 h-5 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.39 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 5.55 5.55l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Проверка телефонного номера</h3>
            <p className="text-xs text-zinc-500 mt-0.5">numverify · IPQualityScore · AbstractAPI · База мошенников · Анализ паттернов</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Input
            type="tel" placeholder="+7 (900) 123-45-67" value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCheck()}
            className="bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-12 text-base font-mono focus:border-red-400 dark:focus:border-red-500/50"
          />
          <Button onClick={handleCheck} disabled={loading || !phone.trim()} className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 shrink-0">
            {loading
              ? <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Проверка...</span>
              : "Проверить"}
          </Button>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-3">Форматы: +7 900 123-45-67 · 8(800)555-35-35 · +49 30 12345678</p>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="p-5 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-4 h-4 text-red-500 animate-spin shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{STEPS[step]}</p>
          </div>
          <div className="flex gap-1.5">{STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-red-500" : "bg-zinc-200 dark:bg-zinc-700"}`}/>)}</div>
        </Card>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="p-4 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Result */}
      {result && !loading && cfg && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">

          {/* Status */}
          <Card className={`p-6 border ${cfg.border} ${cfg.bg}`}>
            <div className="flex items-start gap-5">
              <div className={`shrink-0 ${cfg.text}`}>{cfg.icon}</div>
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-xl font-bold ${cfg.text}`}>{cfg.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${cfg.badge}`}>{cfg.label}</span>
                  {result.valid === false && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400">НЕВАЛИДНЫЙ</span>
                  )}
                  {result.inFraudDb && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400">⚠ В БАЗЕ МОШЕННИКОВ</span>
                  )}
                  {result.ipqsSpammer && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400">🚫 СПАМЕР (IPQS)</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">Уровень безопасности</span>
                    <span className={`font-mono font-bold ${cfg.text}`}>{result.score}/100</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${cfg.bar}`} style={{ width: `${result.score}%` }}/>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{detailsText}</p>
              </div>
            </div>
          </Card>

          {/* Geo info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard label="Страна" value={`${getFlag(displayCC)} ${displayCountry ?? "Неизвестно"}`} sub={result.countryPrefix ? `+${result.countryPrefix}` : undefined}/>
            <InfoCard label="Город" value={displayCity ?? "Не определён"} sub={displayRegion ?? undefined}/>
            <InfoCard label="Оператор" value={displayCarrier ?? "Неизвестен"} sub={displayLineType ? LINE_TYPE_LABELS[displayLineType] ?? displayLineType : undefined}/>
            <InfoCard label="Часовой пояс" value={displayTimezone ?? "Неизвестен"}/>
          </div>

          {/* Formats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoCard label="Международный формат" value={result.internationalFormat ?? "—"} mono/>
            <InfoCard label="Локальный формат"      value={result.localFormat ?? "—"} mono/>
            <InfoCard label="Жалоб в базах"          value={result.reportCount > 0 ? `${result.reportCount}+` : "0"}/>
          </div>

          {/* IPQS block */}
          {result.ipqsAvailable && (
            <Card className="p-5 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-500"/>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">IPQualityScore — детальный анализ</h4>
              </div>

              {/* Fraud score gauge */}
              {result.ipqsFraudScore !== null && (
                <div className="mb-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Fraud Score (риск мошенничества)</span>
                    <span className={`text-2xl font-black font-mono ${ipqsScoreColor(result.ipqsFraudScore)}`}>
                      {result.ipqsFraudScore}<span className="text-sm font-normal text-zinc-400">/100</span>
                    </span>
                  </div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${ipqsScoreBar(result.ipqsFraudScore)}`} style={{ width: `${result.ipqsFraudScore}%` }}/>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                    {result.ipqsFraudScore >= 85 ? "Очень высокий риск — вероятно мошеннический номер"
                      : result.ipqsFraudScore >= 60 ? "Высокий риск — подозрительная активность"
                      : result.ipqsFraudScore >= 40 ? "Умеренный риск — стоит проявить осторожность"
                      : "Низкий риск по данным IPQS"}
                  </p>
                </div>
              )}

              {/* Flags grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "Спамер",         value: result.ipqsSpammer,  t: "Да — спамер",    f: "Нет" },
                  { label: "Мошенник/риск",  value: result.ipqsRisky,    t: "Да — рискованный", f: "Нет" },
                  { label: "VoIP номер",     value: result.ipqsVoip,     t: "Да — VoIP",      f: "Нет" },
                  { label: "Предоплаченный", value: result.ipqsPrepaid,  t: "Да — prepaid",   f: "Нет" },
                  { label: "Активный",       value: result.ipqsActive,   t: "Активен",        f: "Не определён" },
                  { label: "Do Not Call",    value: result.ipqsDnc,      t: "В списке DNC",   f: "Нет" },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{item.label}</span>
                    <BoolBadge value={item.value} trueLabel={item.t} falseLabel={item.f}/>
                  </div>
                ))}
              </div>

              {/* IPQS geo if different from numverify */}
              {(result.ipqsCity || result.ipqsRegion) && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-400 mb-1">Геолокация по IPQS</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    {[result.ipqsCity, result.ipqsRegion, result.ipqsCountry].filter(Boolean).join(", ")}
                    {result.ipqsTimezone && <span className="text-zinc-400 ml-2">({result.ipqsTimezone})</span>}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* AbstractAPI block */}
          {result.abstAvailable && (
            <Card className="p-5 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">AbstractAPI — независимая валидация</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Валидность</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border w-fit ${
                    result.abstValid
                      ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : result.abstValid === false
                        ? "bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400"
                        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400"
                  }`}>
                    {result.abstValid === true ? "Валидный" : result.abstValid === false ? "Невалидный" : "Неизвестно"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Тип линии</span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {result.abstType ? (LINE_TYPE_LABELS[result.abstType.toLowerCase()] ?? result.abstType) : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Оператор</span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{result.abstCarrier ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Страна</span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {result.abstCountryCode ? `${getFlag(result.abstCountryCode)} ${result.abstCountryName ?? result.abstCountryCode}` : "—"}
                  </span>
                </div>
              </div>
              {(result.abstIntlFormat || result.abstLocalFormat) && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-2 gap-3">
                  {result.abstIntlFormat && (
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Международный формат</p>
                      <p className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">{result.abstIntlFormat}</p>
                    </div>
                  )}
                  {result.abstLocalFormat && (
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Локальный формат</p>
                      <p className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">{result.abstLocalFormat}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Caller info banner */}
          {(displayCity || displayCarrier) && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20">
              <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <div>
                  <p className="text-xs text-blue-500 uppercase tracking-wider font-medium mb-0.5">Вероятный источник звонка</p>
                  <p className="text-sm font-semibold">{[displayCarrier, displayCity, displayRegion, displayCountry].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Fraud DB */}
          {result.inFraudDb && result.fraudDbMatches.length > 0 && (
            <Card className="p-5 bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20">
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Найден в базах мошеннических номеров
              </h4>
              <div className="space-y-2">
                {result.fraudDbMatches.map((e, i) => (
                  <div key={i} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <div className="text-sm">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{e.source}</span>
                      <span className="text-zinc-500 ml-2">· {e.category}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{e.reportedAt}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-500/20 text-red-700 dark:text-red-400 font-bold">{e.reports} жалоб</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <Card className="p-5 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Обнаруженные признаки</h4>
              <div className="space-y-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className={`flex items-start gap-2 text-sm ${SEVERITY_CLASS[w.severity]}`}>
                    <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {w.severity === "high"
                        ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
                      }
                    </svg>
                    {w.text}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="p-5 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Рекомендации</h4>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <svg className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  {r}
                </div>
              ))}
            </div>
          </Card>

          <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center px-4">
            Данные: numverify.com · ipqualityscore.com · abstractapi.com · внутренняя база паттернов
          </p>
        </div>
      )}
    </div>
  );
}
