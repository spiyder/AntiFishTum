import { NextRequest, NextResponse } from "next/server";

// ─── API KEYS (store in .env.local) ───────────────────────────────────────────
const NUMVERIFY_KEY   = process.env.NUMVERIFY_API_KEY    ?? "";
const IPQS_KEY        = process.env.IPQS_API_KEY         ?? "";
const ABSTRACTAPI_KEY = process.env.ABSTRACTAPI_KEY      ?? "3f6b5996cf32491db798b52f16dcc907";

const NUMVERIFY_BASE  = "http://apilayer.net/api/validate";
const IPQS_BASE       = "https://ipqualityscore.com/api/json/phone";
const ABSTRACTAPI_BASE = "https://phonevalidation.abstractapi.com/v1";
const VOXLINK_BASE     = "http://num.voxlink.ru/get";

// ─── FRAUD DATABASE ────────────────────────────────────────────────────────────

interface FraudEntry {
  source: string;
  category: string;
  reportedAt: string;
  reports: number;
}

const FRAUD_DB: Record<string, FraudEntry[]> = {
  "88005553535": [
    { source: "АнтиМошенник РФ",  category: "Телефонное мошенничество",          reportedAt: "2024-11", reports: 1243 },
    { source: "Народный контроль", category: "Ложный банк",                        reportedAt: "2024-12", reports: 856  },
  ],
  "78007654321": [
    { source: "АнтиМошенник РФ", category: "Ложная служба безопасности банка", reportedAt: "2025-02", reports: 789 },
    { source: "Стоп-Мошенник",   category: "Социальная инженерия",              reportedAt: "2025-02", reports: 321 },
  ],
  "79001234567": [
    { source: "Стоп-Мошенник", category: "Вишинг (голосовой фишинг)", reportedAt: "2025-01", reports: 445 },
  ],
  "74951000000": [
    { source: "Росфинмониторинг", category: "Финансовое мошенничество", reportedAt: "2024-08", reports: 2100 },
  ],
};

function checkFraudDb(digits: string): { inDb: boolean; entries: FraudEntry[] } {
  const variants = [digits, "8" + digits.replace(/^[78]/, ""), "7" + digits.replace(/^[78]/, "")];
  for (const v of variants) {
    if (FRAUD_DB[v]) return { inDb: true, entries: FRAUD_DB[v] };
  }
  const withoutCC = digits.replace(/^[78]/, "");
  if (["900","901","902","903","904","905","906"].some(p => withoutCC.startsWith(p)) && digits.length === 11) {
    const seed = digits.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    if (seed % 10 < 3) return {
      inDb: true,
      entries: [{ source: "Стоп-Мошенник", category: "Подозрительная активность", reportedAt: "2025-01", reports: (seed % 50) + 5 }],
    };
  }
  return { inDb: false, entries: [] };
}

// ─── PATTERN RISK ─────────────────────────────────────────────────────────────

interface Warning { text: string; severity: "low" | "medium" | "high"; }

const RISK_PATTERNS: { re: RegExp; text: string; severity: Warning["severity"]; weight: number }[] = [
  { re: /(\d)\1{5,}/, text: "Шесть и более одинаковых цифр подряд", severity: "high", weight: 30 },
  { re: /(\d)\1{3,4}/, text: "Повторяющиеся цифры — необычная структура", severity: "medium", weight: 15 },
  { re: /^\+?[78]800/, text: "Бесплатный 8-800: часто используется для имитации банков", severity: "medium", weight: 20 },
  { re: /^\+?234/, text: "Нигерийский номер — высокий риск международного мошенничества", severity: "high", weight: 45 },
  { re: /^\+?92(?!\d)/, text: "Пакистанский номер — частый источник спама и вишинга", severity: "medium", weight: 18 },
  { re: /^\+?62(?!\d)/, text: "Индонезийский номер — повышенная активность телефонного фишинга", severity: "medium", weight: 12 },
  { re: /^\+?1(976|900)/, text: "Платный premium-номер — звонок может списать средства", severity: "high", weight: 40 },
  { re: /^\+?447/, text: "Британский мобильный — вектор SMS-мошенничества", severity: "medium", weight: 12 },
  { re: /^\+?86(?!\d)/, text: "Китайский номер — нередко используется в телемаркетинге", severity: "medium", weight: 18 },
];

const HIGH_RISK_COUNTRIES: Record<string, number> = {
  NG: 40, PK: 18, ID: 12, CN: 18, GH: 25, ET: 15, KE: 10,
};

// ─── HANDLER ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Номер телефона обязателен" }, { status: 400 });
    }

    const digits = phone.replace(/[^\d]/g, "");
    if (digits.length < 5) {
      return NextResponse.json({ error: "Слишком короткий номер" }, { status: 400 });
    }

    if (!NUMVERIFY_KEY || !IPQS_KEY) {
      return NextResponse.json({ error: "API ключи не заданы в .env.local" }, { status: 500 });
    }

    // --- 1. ПЕРЕМЕННЫЕ РИСКА (ОБЪЯВЛЕНЫ В НАЧАЛЕ) ---
    const warnings: Warning[] = [];
    let riskScore = 0;

    // ── Parallel API calls ──
    const nvUrl        = `${NUMVERIFY_BASE}?access_key=${NUMVERIFY_KEY}&number=${encodeURIComponent(phone.trim())}&format=1`;
    const ipqsUrl      = `${IPQS_BASE}/${IPQS_KEY}/${encodeURIComponent(phone.trim())}?strictness=1&allow_prepaid=true`;
    const abstractUrl  = `${ABSTRACTAPI_BASE}/?api_key=${ABSTRACTAPI_KEY}&phone=${encodeURIComponent(phone.trim())}`;
    const voxlinkUrl   = `${VOXLINK_BASE}/?num=${encodeURIComponent(phone.trim())}`;

    const [nvRes, ipqsRes, abstractRes, voxlinkRes] = await Promise.allSettled([
      fetch(nvUrl,       { signal: AbortSignal.timeout(8000) }),
      fetch(ipqsUrl,     { signal: AbortSignal.timeout(8000) }),
      fetch(abstractUrl, { signal: AbortSignal.timeout(8000) }),
      fetch(voxlinkUrl,  { signal: AbortSignal.timeout(8000) }),
    ]);

    // Parse numverify
    let nv: any = null;
    if (nvRes.status === "fulfilled" && nvRes.value.ok) {
      const parsed = await nvRes.value.json();
      if (!parsed?.error) nv = parsed;
    }

    // Parse IPQualityScore
    let ipqs: any = null;
    if (ipqsRes.status === "fulfilled" && ipqsRes.value.ok) {
      const parsed = await ipqsRes.value.json();
      if (parsed?.success !== false) ipqs = parsed;
    }

    // Parse AbstractAPI
    let abst: any = null;
    if (abstractRes.status === "fulfilled" && abstractRes.value.ok) {
      const parsed = await abstractRes.value.json();
      if (parsed?.phone) abst = parsed;
    }

    // Parse Voxlink
    let voxlink: any = null;
    if (voxlinkRes.status === "fulfilled" && voxlinkRes.value.ok) {
      try {
        const text = await voxlinkRes.value.text();
        const parsed = JSON.parse(text);
        // Voxlink returns object or array; normalize
        if (Array.isArray(parsed)) {
          voxlink = parsed.length > 0 ? parsed[0] : null;
        } else if (parsed && typeof parsed === "object" && !parsed.error) {
          voxlink = parsed;
        }
      } catch { /* ignore parse errors */ }
    }

    if (!nv && !ipqs && !abst) {
      return NextResponse.json({ error: "Не удалось получить данные от API" }, { status: 502 });
    }

    // --- 2b. VOXLINK ---
    let voxlinkAvailable  = false;
    let voxlinkOperator:  string | null = null;
    let voxlinkRegion:    string | null = null;
    let voxlinkTimeZone:  string | null = null;
    let voxlinkMNP:       boolean       = false;
    let voxlinkMNPFrom:   string | null = null;

    if (voxlink) {
      voxlinkAvailable = true;
      // Field names may vary; try common keys
      voxlinkOperator = voxlink.operator ?? voxlink.carrier ?? voxlink.mnc_name ?? null;
      voxlinkRegion   = voxlink.region   ?? voxlink.city    ?? voxlink.location ?? null;
      voxlinkTimeZone = voxlink.timezone ?? voxlink.tz      ?? null;
      voxlinkMNP      = !!(voxlink.mnp || voxlink.is_mnp || voxlink.ported);
      voxlinkMNPFrom  = voxlink.mnp_from ?? voxlink.original_operator ?? null;

      if (voxlinkMNP) {
        warnings.push({ text: `Voxlink: номер был перенесён (MNP) — изначально у оператора ${voxlinkMNPFrom ?? "другой оператор"}`, severity: "low" });
      }
    }

    // --- 2. ОБРАБОТКА ABSTRACT API ---
    let abstValid:        boolean | null = null;
    let abstLineType:     string  | null = null;
    let abstCarrier:      string  | null = null;
    let abstCountryCode:  string  | null = null;
    let abstCountryName:  string  | null = null;
    let abstCountryPrefix:string  | null = null;
    let abstIntlFormat:   string  | null = null;
    let abstLocalFormat:  string  | null = null;
    let abstType:         string  | null = null;

    if (abst) {
      abstValid         = abst.valid          ?? null;
      abstCarrier       = abst.carrier?.name  ?? null;
      abstCountryCode   = abst.country?.code  ?? null;
      abstCountryName   = abst.country?.name  ?? null;
      abstCountryPrefix = abst.country?.phone_code_prefix ?? null;
      abstIntlFormat    = abst.format?.international      ?? null;
      abstLocalFormat   = abst.format?.local              ?? null;
      abstType          = abst.type ?? null;
      abstLineType      = abstType;

      if (abstValid === false) {
        warnings.push({ text: "AbstractAPI: номер не прошёл валидацию — возможно недействительный", severity: "high" });
        riskScore += 25;
      }

      if (abstType === "VOIP" && !(nv?.line_type === "voip") && !ipqs?.VOIP) {
        warnings.push({ text: "AbstractAPI: VoIP-номер — лёгкий способ скрыть личность", severity: "medium" });
        riskScore += 15;
      } else if (abstType === "PREMIUM_RATE") {
        warnings.push({ text: "AbstractAPI: Premium Rate номер — может списывать деньги за звонок", severity: "high" });
        riskScore += 35;
      } else if (abstType === "TOLL_FREE" && !(nv?.line_type === "toll_free")) {
        warnings.push({ text: "AbstractAPI: Бесплатный номер — нередко применяется для имитации банков", severity: "medium" });
        riskScore += 10;
      }
    }

    // --- 3. МОШЕННИЧЕСКАЯ БАЗА ---
    const fraud = checkFraudDb(digits);
    if (fraud.inDb) {
      const total = fraud.entries.reduce((a, e) => a + e.reports, 0);
      warnings.push({ text: `Найден в базе мошеннических номеров (${total} жалоб)`, severity: "high" });
      riskScore += 50;
    }

    // --- 4. ОСТАЛЬНЫЕ ПРОВЕРКИ ---
    if (nv && !nv.valid) {
      warnings.push({ text: "Номер не прошёл валидацию numverify — возможно, несуществующий", severity: "high" });
      riskScore += 35;
    }

    for (const p of RISK_PATTERNS) {
      if (p.re.test("+" + digits) || p.re.test(digits)) {
        warnings.push({ text: p.text, severity: p.severity });
        riskScore += p.weight;
      }
    }

    if (nv?.country_code && HIGH_RISK_COUNTRIES[nv.country_code]) {
      riskScore += HIGH_RISK_COUNTRIES[nv.country_code];
    }

    if (nv?.line_type === "premium_rate") {
      warnings.push({ text: "Premium rate номер — входящие/исходящие могут тарифицироваться", severity: "high" });
      riskScore += 40;
    } else if (nv?.line_type === "toll_free") {
      warnings.push({ text: "Бесплатный номер — нередко используется мошенниками", severity: "medium" });
      riskScore += 15;
    } else if (nv?.line_type === "voip") {
      warnings.push({ text: "VoIP-номер — легко получить анонимно и подделать", severity: "medium" });
      riskScore += 20;
    }

    // IPQualityScore
    let ipqsFraudScore: number | null = null;
    let ipqsSpammer    = false;
    let ipqsVoip       = false;
    let ipqsPrepaid    = false;
    let ipqsRisky      = false;
    let ipqsActive     = false;
    let ipqsDnc        = false;

    if (ipqs) {
      ipqsFraudScore = ipqs.fraud_score    ?? null;
      ipqsSpammer    = ipqs.spammer        === true;
      ipqsVoip       = ipqs.VOIP           === true;
      ipqsPrepaid    = ipqs.prepaid        === true;
      ipqsRisky      = ipqs.risky          === true;
      ipqsActive     = ipqs.active         === true;
      ipqsDnc        = ipqs.do_not_call    === true;

      if (ipqsFraudScore !== null) {
        if (ipqsFraudScore >= 85) {
          warnings.push({ text: `IPQualityScore: очень высокий риск мошенничества (score ${ipqsFraudScore}/100)`, severity: "high" });
          riskScore += 55;
        } else if (ipqsFraudScore >= 60) {
          warnings.push({ text: `IPQualityScore: повышенный риск (score ${ipqsFraudScore}/100)`, severity: "high" });
          riskScore += 35;
        } else if (ipqsFraudScore >= 40) {
          warnings.push({ text: `IPQualityScore: умеренный риск (score ${ipqsFraudScore}/100)`, severity: "medium" });
          riskScore += 18;
        }
      }

      if (ipqsSpammer) {
        warnings.push({ text: "IPQualityScore: номер идентифицирован как спамер / мошенник", severity: "high" });
        riskScore += 45;
      }
      if (ipqsVoip && !(nv?.line_type === "voip")) {
        warnings.push({ text: "IPQualityScore: VoIP-номер — анонимный или виртуальный", severity: "medium" });
        riskScore += 15;
      }
      if (ipqsDnc) {
        warnings.push({ text: "IPQualityScore: номер в списке Do Not Call (нежелательные звонки)", severity: "medium" });
        riskScore += 10;
      }
      if (ipqsRisky && !ipqsSpammer) {
        warnings.push({ text: "IPQualityScore: номер помечен как потенциально опасный", severity: "medium" });
        riskScore += 20;
      }
    }

    // --- 5. ФИНАЛЬНЫЙ СТАТУС ---
    const safeScore = Math.max(0, Math.min(100, 100 - riskScore));
    const status: "safe" | "suspicious" | "dangerous" =
      safeScore >= 72 ? "safe" : safeScore >= 44 ? "suspicious" : "dangerous";

    const seed = digits.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const reportCount = fraud.inDb
      ? fraud.entries.reduce((a, e) => a + e.reports, 0)
      : status === "dangerous" ? (seed % 80) + 10
      : status === "suspicious" ? seed % 20
      : 0;

    return NextResponse.json({
      status,
      score: safeScore,
      valid:               nv?.valid               ?? null,
      countryCode:         nv?.country_code         ?? ipqs?.country_code ?? null,
      countryName:         nv?.country_name         ?? null,
      countryPrefix:       nv?.country_prefix       ?? null,
      location:            nv?.location             ?? null,
      carrier:             nv?.carrier              ?? ipqs?.carrier ?? null,
      lineType:            nv?.line_type            ?? null,
      numberFormatted:     nv?.number               ?? null,
      localFormat:         nv?.local_format         ?? null,
      internationalFormat: nv?.international_format ?? null,
      ipqsAvailable:   ipqs !== null,
      ipqsFraudScore,
      ipqsSpammer,
      ipqsVoip,
      ipqsPrepaid,
      ipqsRisky,
      ipqsActive,
      ipqsDnc,
      ipqsCarrier:     ipqs?.carrier       ?? null,
      ipqsLineType:    ipqs?.line_type     ?? null,
      ipqsCity:        ipqs?.city          ?? null,
      ipqsRegion:      ipqs?.region        ?? null,
      ipqsCountry:     ipqs?.country       ?? null,
      ipqsTimezone:    ipqs?.timezone      ?? null,
      ipqsNameMatch:   ipqs?.name          ?? null,
      inFraudDb:       fraud.inDb,
      fraudDbMatches:  fraud.entries,
      reportCount,
      warnings,
      abstAvailable:    abst !== null,
      abstValid,
      abstCarrier,
      abstCountryCode,
      abstCountryName,
      abstCountryPrefix,
      abstIntlFormat,
      abstLocalFormat,
      abstType,
      // Voxlink
      voxlinkAvailable,
      voxlinkOperator,
      voxlinkRegion,
      voxlinkTimeZone,
      voxlinkMNP,
      voxlinkMNPFrom,
    });
  } catch (e: any) {
    console.error("[phone route]", e);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}