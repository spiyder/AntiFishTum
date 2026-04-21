import { NextRequest, NextResponse } from "next/server";

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY ?? "ac712a6f1471984f6d7c0937b400df94894fc24814b4967b13b9c27381c6c6ec";
const VT_BASE = "https://www.virustotal.com/api/v3";

async function checkSiteReachability(url: string): Promise<{
  reachable: boolean;
  httpStatus: number | null;
  redirectedTo: string | null;
  error: string | null;
}> {
  try {
    let res: Response | null = null;
    try {
      res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SafetyChecker/1.0)" },
      });
    } catch {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SafetyChecker/1.0)" },
      });
    }

    const finalUrl = res.url && res.url !== url ? res.url : null;

    return {
      reachable: true,
      httpStatus: res.status,
      redirectedTo: finalUrl,
      error: null,
    };
  } catch (e: any) {
    const msg: string = e?.message ?? "";
    let error = "Сайт недоступен";
    if (msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")) {
      error = "Домен не существует (DNS не найден)";
    } else if (msg.includes("ECONNREFUSED")) {
      error = "Соединение отклонено сервером";
    } else if (msg.includes("TimeoutError") || msg.includes("timeout")) {
      error = "Сайт не отвечает (таймаут)";
    } else if (msg.includes("CERT") || msg.includes("certificate")) {
      error = "Ошибка SSL-сертификата";
    }

    return { reachable: false, httpStatus: null, redirectedTo: null, error };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL обязателен" }, { status: 400 });
    }

    // Reachability check and VT submission run in parallel to save time
    const [reachability, submitRes] = await Promise.all([
      checkSiteReachability(url),
      fetch(`${VT_BASE}/urls`, {
        method: "POST",
        headers: {
          "x-apikey": VT_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url }),
      }),
    ]);

    if (!submitRes.ok) {
      const err = await submitRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? "Ошибка VirusTotal при отправке URL" },
        { status: submitRes.status }
      );
    }

    const submitData = await submitRes.json();
    const analysisId: string = submitData?.data?.id;
    if (!analysisId) {
      return NextResponse.json({ error: "Не удалось получить ID анализа" }, { status: 500 });
    }

    // Poll analysis result (up to 8 attempts, 2s apart)
    let analysisData: any = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));

      const analysisRes = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
        headers: { "x-apikey": VT_API_KEY },
      });

      if (!analysisRes.ok) continue;

      const data = await analysisRes.json();
      const vtStatus: string = data?.data?.attributes?.status;

      if (vtStatus === "completed") {
        analysisData = data;
        break;
      }
    }

    if (!analysisData) {
      return NextResponse.json(
        { error: "Анализ занял слишком много времени. Попробуйте ещё раз." },
        { status: 504 }
      );
    }

    const stats: Record<string, number> = analysisData.data.attributes.stats ?? {};
    const results: Record<string, { category: string; result: string | null; engine_name: string }> =
      analysisData.data.attributes.results ?? {};

    const malicious = stats.malicious ?? 0;
    const suspicious = stats.suspicious ?? 0;
    const harmless = stats.harmless ?? 0;
    const undetected = stats.undetected ?? 0;
    const total = malicious + suspicious + harmless + undetected;

    const flaggedEngines = Object.values(results)
      .filter((r) => r.category === "malicious" || r.category === "suspicious")
      .map((r) => ({ name: r.engine_name, category: r.category, result: r.result }))
      .slice(0, 10);

    const score = Math.max(0, Math.round(100 - (malicious * 5 + suspicious * 2)));
    const safeScore = Math.min(100, score);

    let status: "safe" | "suspicious" | "dangerous";
    if (malicious >= 3 || safeScore < 50) status = "dangerous";
    else if (malicious >= 1 || suspicious >= 2 || safeScore < 80) status = "suspicious";
    else status = "safe";

    return NextResponse.json({
      status,
      score: safeScore,
      stats: { malicious, suspicious, harmless, undetected, total },
      flaggedEngines,
      analysisId,
      reachability,
    });
  } catch (e: any) {
    console.error("[virustotal route]", e);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
