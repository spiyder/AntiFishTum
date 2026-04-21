"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FlaggedEngine {
  name: string;
  category: string;
  result: string | null;
}

interface Reachability {
  reachable: boolean;
  httpStatus: number | null;
  redirectedTo: string | null;
  error: string | null;
}

interface CheckResult {
  status: "safe" | "suspicious" | "dangerous";
  score: number;
  url: string;
  stats: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    total: number;
  };
  flaggedEngines: FlaggedEngine[];
  analysisId: string;
  reachability: Reachability;
}

const LOADING_STEPS = [
  "Отправляем URL в VirusTotal...",
  "Запускаем 70+ антивирусных движков...",
  "Анализируем репутацию домена...",
  "Проверяем базы угроз...",
  "Получаем результаты...",
];

export function URLChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setLoadingStep(0);

    // Cycle through loading steps for UX while polling happens server-side
    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 3000);

    try {
      let normalized = url.trim();
      if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
        normalized = "https://" + normalized;
      }

      const res = await fetch("/api/virustotal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Ошибка при проверке URL");
        return;
      }

      setResult({ ...data, url: normalized });
    } catch {
      setError("Не удалось связаться с сервером. Проверьте соединение.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "safe":
        return {
          color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          textColor: "text-emerald-400",
          barColor: "bg-emerald-500",
          icon: (
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9,12 11,14 15,10"/>
            </svg>
          ),
          title: "Сайт безопасен",
          description: "VirusTotal не обнаружил угроз",
        };
      case "suspicious":
        return {
          color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          textColor: "text-amber-400",
          barColor: "bg-amber-500",
          icon: (
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ),
          title: "Требует осторожности",
          description: "Отдельные движки сообщают о подозрительной активности",
        };
      default:
        return {
          color: "bg-red-500/10 border-red-500/30 text-red-400",
          textColor: "text-red-400",
          barColor: "bg-red-500",
          icon: (
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          ),
          title: "Опасный сайт",
          description: "Несколько антивирусных движков признали URL вредоносным",
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/10">
              <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Проверка URL</h3>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Powered by VirusTotal — 70+ антивирусных движков
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Введите URL для проверки..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 h-12 pl-4 pr-4 text-base font-mono focus:border-red-500/50 focus:ring-red-500/20"
              />
            </div>
            <Button
              onClick={handleCheck}
              disabled={isLoading || !url.trim()}
              className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Анализ...
                </span>
              ) : "Проверить"}
            </Button>
          </div>
          <p className="text-sm text-zinc-500">Пример: suspicious-paypa1.com или google.com</p>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card className="p-8 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-red-500/20"/>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 animate-spin"/>
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-red-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-zinc-300 font-medium">{LOADING_STEPS[loadingStep]}</p>
              <p className="text-xs text-zinc-600">Обычно занимает 10–20 секунд</p>
            </div>
            {/* Step indicators */}
            <div className="flex gap-2">
              {LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                    i <= loadingStep ? "bg-red-500" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="p-5 bg-red-500/10 border-red-500/30 animate-in fade-in-0 duration-300">
          <div className="flex items-center gap-3 text-red-400">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Result */}
      {result && !isLoading && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Card className={`p-6 border ${getStatusConfig(result.status).color}`}>
            <div className="flex items-start gap-5">
              <div className={`flex-shrink-0 ${getStatusConfig(result.status).textColor}`}>
                {getStatusConfig(result.status).icon}
              </div>
              <div className="flex-1 space-y-5 min-w-0">
                {/* Title */}
                <div>
                  <h3 className={`text-2xl font-bold ${getStatusConfig(result.status).textColor}`}>
                    {getStatusConfig(result.status).title}
                  </h3>
                  <p className="text-zinc-400 mt-1 text-sm">{getStatusConfig(result.status).description}</p>
                </div>

                {/* Score bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Рейтинг безопасности</span>
                    <span className={`font-mono font-bold ${getStatusConfig(result.status).textColor}`}>
                      {result.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getStatusConfig(result.status).barColor}`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Проверенный URL</p>
                  <p className="text-sm font-mono text-zinc-300 break-all">{result.url}</p>
                </div>

                {/* Reachability */}
                <div className={`p-4 rounded-lg border ${
                  result.reachability.reachable
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-zinc-800/50 border-zinc-700"
                }`}>
                  <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Доступность сайта</p>
                  <div className="flex flex-wrap gap-3">
                    {/* Online / Offline badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      result.reachability.reachable
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        result.reachability.reachable ? "bg-emerald-400" : "bg-zinc-500"
                      }`} />
                      {result.reachability.reachable ? "Сайт доступен" : "Сайт недоступен"}
                    </div>

                    {/* HTTP status */}
                    {result.reachability.httpStatus !== null && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                        result.reachability.httpStatus < 400
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-red-500/10 border-red-500/20 text-red-300"
                      }`}>
                        HTTP {result.reachability.httpStatus}
                      </div>
                    )}

                    {/* Error reason */}
                    {!result.reachability.reachable && result.reachability.error && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border bg-zinc-800 border-zinc-700 text-zinc-400">
                        <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {result.reachability.error}
                      </div>
                    )}
                  </div>

                  {/* Redirect notice */}
                  {result.reachability.redirectedTo && (
                    <div className="mt-3 pt-3 border-t border-zinc-700/50">
                      <p className="text-xs text-zinc-500 mb-1">Редирект на:</p>
                      <p className="text-xs font-mono text-amber-400 break-all">{result.reachability.redirectedTo}</p>
                    </div>
                  )}
                </div>

                {/* VirusTotal engine stats */}
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-3">Результаты движков ({result.stats.total} всего):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Вредоносных", value: result.stats.malicious, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                      { label: "Подозрительных", value: result.stats.suspicious, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                      { label: "Безвредных", value: result.stats.harmless, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                      { label: "Не определили", value: result.stats.undetected, color: "text-zinc-400", bg: "bg-zinc-800/50 border-zinc-700" },
                    ].map((s) => (
                      <div key={s.label} className={`p-3 rounded-lg border text-center ${s.bg}`}>
                        <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flagged engines list */}
                {result.flaggedEngines.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-zinc-300 mb-2">Движки, обнаружившие угрозу:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.flaggedEngines.map((eng) => (
                        <div
                          key={eng.name}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${
                            eng.category === "malicious"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          }`}
                        >
                          <span className="font-medium">{eng.name}</span>
                          {eng.result && (
                            <span className="text-zinc-500 max-w-[80px] truncate">· {eng.result}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VT link */}
                <div className="pt-2 border-t border-zinc-800">
                  <a
                    href={`https://www.virustotal.com/gui/url/${result.analysisId.replace("u-", "").split("-")[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Открыть полный отчёт на VirusTotal
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
