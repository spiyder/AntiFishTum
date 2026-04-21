"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuizQuestion {
  id: number;
  task: string;
  description: string;
  urls: string[];
  correctIndex: number;
  explanation: string;
  tipTitle: string;
  tip: string;
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    task: "Найдите настоящий сайт PayPal",
    description: "Вам пришло письмо о подозрительной активности на аккаунте. Какая ссылка ведёт на настоящий PayPal?",
    urls: [
      "https://paypal.com/signin",
      "https://paypa1.com/signin",
      "https://paypal-secure.com/signin",
      "https://secure-paypal.net/login",
    ],
    correctIndex: 0,
    explanation: "Только paypal.com — официальный домен. paypa1.com использует цифру «1» вместо буквы «l» (тайпосквоттинг), paypal-secure.com и secure-paypal.net — поддельные домены с добавлением слова «secure» для видимости надёжности.",
    tipTitle: "Тайпосквоттинг",
    tip: "Мошенники заменяют похожие символы: l→1, o→0, rn→m. Всегда читайте домен по буквам.",
  },
  {
    id: 2,
    task: "Найдите безопасную ссылку для входа в Google",
    description: "Вы хотите войти в Gmail. Какой адрес настоящий?",
    urls: [
      "https://accounts.google.com.login-verify.net/",
      "https://g00gle.com/accounts",
      "https://accounts.google.com/signin",
      "http://google-accounts.com/login",
    ],
    correctIndex: 2,
    explanation: "accounts.google.com — официальный поддомен Google. В первом варианте google.com стоит до точки, а настоящий домен — login-verify.net. g00gle.com использует нули вместо букв «o». google-accounts.com — чужой домен, плюс нет HTTPS.",
    tipTitle: "Поддомены-ловушки",
    tip: "Главный домен — это то, что стоит перед последней точкой и зоной (.com, .net). accounts.google.com.evil.net — настоящий домен здесь evil.net, а не google.com.",
  },
  {
    id: 3,
    task: "Найдите фишинговую ссылку",
    description: "Одна из этих ссылок — фишинг. Определите её.",
    urls: [
      "https://microsoft.com/en-us/security",
      "https://github.com/login",
      "https://amazon.com/orders",
      "https://arnazon.com/your-order/confirm",
    ],
    correctIndex: 3,
    explanation: "arnazon.com — поддельный домен: буква «m» заменена на «rn» (выглядят похоже в некоторых шрифтах). Это классическая гомографическая атака. Остальные три — настоящие домены известных сервисов.",
    tipTitle: "Гомографические атаки",
    tip: "Символы «rn» могут выглядеть как «m», «cl» как «d», «vv» как «w». Проверяйте особенно внимательно, если ссылка пришла по почте или в мессенджере.",
  },
  {
    id: 4,
    task: "Найдите настоящий сайт банка",
    description: "Вам прислали SMS с просьбой подтвердить транзакцию. Какая ссылка настоящая?",
    urls: [
      "http://sberbank.ru.verification-id.com/confirm",
      "https://online.sberbank.ru/CSAFront/index.do",
      "https://sberbank-online.net/login",
      "https://sberbank.secure-verify.ru/confirm",
    ],
    correctIndex: 1,
    explanation: "online.sberbank.ru — официальный поддомен Сбербанка. В первом варианте sberbank.ru стоит как поддомен чужого домена verification-id.com. sberbank-online.net — полностью другой домен. sberbank.secure-verify.ru — домен secure-verify.ru, не Сбербанк.",
    tipTitle: "SMS-фишинг",
    tip: "Банки не рассылают ссылки в SMS с просьбой 'подтвердить транзакцию'. Заходите в интернет-банк только через официальное приложение или вбивая адрес вручную.",
  },
  {
    id: 5,
    task: "Найдите безопасную ссылку",
    description: "Коллега прислал ссылку на 'важный документ'. Какая из них вызывает меньше всего подозрений?",
    urls: [
      "http://185.220.101.45/document/invoice.exe",
      "https://bit.ly/3xK9mPq",
      "https://docs.google.com/document/d/1BxiMVs0",
      "https://drive-google.com/shared/document",
    ],
    correctIndex: 2,
    explanation: "docs.google.com — официальный сервис Google Docs. IP-адрес вместо домена + .exe сразу говорит об опасности. Сокращённые ссылки (bit.ly) скрывают реальный адрес — никогда не знаешь куда попадёшь. drive-google.com — чужой домен, маскирующийся под Google Drive.",
    tipTitle: "Опасные форматы",
    tip: "IP-адреса в URL (http://185.220...) и исполняемые файлы (.exe, .scr, .bat) в ссылках — почти всегда вредоносный контент. Сокращённые ссылки требуют проверки через сервис типа unshorten.it.",
  },
  {
    id: 6,
    task: "Найдите фишинговую ссылку",
    description: "Вы получили уведомление от Apple о блокировке Apple ID. Какой адрес поддельный?",
    urls: [
      "https://appleid.apple.com/account/manage",
      "https://apple-id-verify.com/account",
      "https://support.apple.com/ru-ru",
      "https://www.apple.com/ru/",
    ],
    correctIndex: 1,
    explanation: "apple-id-verify.com — посторонний домен, имитирующий сервис Apple. Все остальные — официальные домены Apple: appleid.apple.com, support.apple.com и apple.com являются поддоменами и основным доменом Apple.",
    tipTitle: "Имитация бренда",
    tip: "Крупные компании используют только свой основной домен (apple.com, google.com, microsoft.com). Любое слово после дефиса или другой домен — уже не они.",
  },
  {
    id: 7,
    task: "Найдите безопасную ссылку для оплаты",
    description: "Вы покупаете товар и вас перенаправляют на оплату. Какая ссылка выглядит легитимно?",
    urls: [
      "https://secure-payment-processing.xyz/checkout",
      "https://pay.amazon.com/checkout",
      "http://amazon.com.pay-now.ru/order",
      "https://amaz0n-pay.com/checkout",
    ],
    correctIndex: 1,
    explanation: "pay.amazon.com — официальный платёжный поддомен Amazon. Домен .xyz подозрителен и незнаком. amazon.com.pay-now.ru — домен pay-now.ru, не Amazon, плюс нет HTTPS. amaz0n-pay.com — тайпосквоттинг с нулём вместо «o».",
    tipTitle: "Платёжные страницы",
    tip: "Перед вводом данных карты убедитесь: есть HTTPS (замочек), домен принадлежит известному платёжному сервису (pay.amazon.com, checkout.stripe.com, paypal.com).",
  },
  {
    id: 8,
    task: "Найдите настоящий сайт Steam",
    description: "Друг прислал ссылку на 'крутую сделку' в Steam. Какой адрес официальный?",
    urls: [
      "https://steamcommunity.com/tradeoffer/new",
      "https://steam-community.net/trade/new",
      "https://stearn.com/trade",
      "https://steamcornmunity.com/trade",
    ],
    correctIndex: 0,
    explanation: "steamcommunity.com — официальный домен сообщества Steam. steam-community.net — другой домен с дефисом. stearn.com — замена «m» на «rn». steamcornmunity.com — замена «m» на «rn» в середине слова. Торговые ссылки Steam — популярная приманка для кражи аккаунтов.",
    tipTitle: "Игровой фишинг",
    tip: "Steam-фишинг крайне распространён. Официальные домены Steam: steampowered.com и steamcommunity.com. Никаких дефисов, никаких других зон (.net, .org).",
  },
];

const TOTAL_QUESTIONS = questions.length;

type AnswerState = "idle" | "correct" | "wrong";

export function QuizSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  const current = questions[currentIndex];

  const handleSelect = useCallback((index: number) => {
    if (answerState !== "idle") return;
    setSelectedAnswer(index);
    if (index === current.correctIndex) {
      setAnswerState("correct");
      setScore((s) => s + 1);
    } else {
      setAnswerState("wrong");
      setWrongAnswers((prev) => [...prev, current.id]);
    }
  }, [answerState, current]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswerState("idle");
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerState("idle");
    setScore(0);
    setFinished(false);
    setWrongAnswers([]);
  }, []);

  const getScoreConfig = () => {
    const pct = score / TOTAL_QUESTIONS;
    if (pct >= 0.875) return { label: "Эксперт по безопасности!", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: "🏆" };
    if (pct >= 0.625) return { label: "Хороший результат!", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", icon: "⭐" };
    return { label: "Нужно потренироваться", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10", icon: "📚" };
  };

  const getUrlButtonClass = (index: number) => {
    const base = "w-full text-left px-4 py-3 rounded-lg border font-mono text-sm transition-all duration-200 break-all";
    if (answerState === "idle") {
      return `${base} border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 cursor-pointer`;
    }
    if (index === current.correctIndex) {
      return `${base} border-emerald-500/50 bg-emerald-500/10 text-emerald-300 cursor-default`;
    }
    if (index === selectedAnswer && answerState === "wrong") {
      return `${base} border-red-500/50 bg-red-500/10 text-red-300 cursor-default`;
    }
    return `${base} border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-default`;
  };

  if (finished) {
    const cfg = getScoreConfig();
    return (
      <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <Card className={`p-8 border ${cfg.border} ${cfg.bg} text-center`}>
          <div className="text-5xl mb-4">{cfg.icon}</div>
          <h2 className={`text-3xl font-bold ${cfg.color} mb-2`}>{cfg.label}</h2>
          <p className="text-zinc-400 mb-6">Вы правильно ответили на {score} из {TOTAL_QUESTIONS} вопросов</p>

          {/* Score bar */}
          <div className="max-w-xs mx-auto mb-8">
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  score / TOTAL_QUESTIONS >= 0.875 ? "bg-emerald-500" :
                  score / TOTAL_QUESTIONS >= 0.625 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${(score / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>0</span>
              <span className={`font-bold ${cfg.color}`}>{score}/{TOTAL_QUESTIONS}</span>
              <span>{TOTAL_QUESTIONS}</span>
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="text-left mb-6 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <p className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Ошибки в вопросах: {wrongAnswers.join(", ")}
              </p>
              <p className="text-xs text-zinc-500">Повторите викторину, чтобы закрепить знания</p>
            </div>
          )}

          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Пройти ещё раз
          </button>
        </Card>

        {/* Summary tips */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Ключевые правила
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Главный домен — справа от последней точки перед /",
              "Цифры вместо букв: 0→o, 1→l, rn→m — признак подделки",
              "HTTPS обязателен, но не гарантирует безопасность",
              "Сокращённые ссылки (bit.ly) скрывают реальный адрес",
              "Поддомены не меняют настоящий домен (evil.com/google.com → evil.com)",
              "Банки и сервисы не просят данные по SMS-ссылкам",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9,12 11,14 15,10"/>
                </svg>
                <span className="text-zinc-400">{rule}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <Card className="p-5 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Найди фишинг</h3>
              <p className="text-xs text-zinc-500">Определи безопасную или вредоносную ссылку</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-zinc-300">
              {currentIndex + 1} <span className="text-zinc-600">/</span> {TOTAL_QUESTIONS}
            </div>
            <div className="text-xs text-emerald-400">✓ {score} правильно</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mt-2 justify-center">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentIndex ? "w-4 bg-red-500/70" :
                i === currentIndex ? "w-4 bg-red-400" :
                "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </Card>

      {/* Question card */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <div className="mb-6">
          <Badge className="mb-3 bg-red-500/10 text-red-400 border-red-500/30 text-xs">
            Вопрос {currentIndex + 1}
          </Badge>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">{current.task}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{current.description}</p>
        </div>

        {/* URL options */}
        <div className="space-y-3 mb-6">
          {current.urls.map((url, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={getUrlButtonClass(index)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
                  answerState === "idle" ? "border-zinc-600 text-zinc-500" :
                  index === current.correctIndex ? "border-emerald-500 text-emerald-400 bg-emerald-500/20" :
                  index === selectedAnswer && answerState === "wrong" ? "border-red-500 text-red-400 bg-red-500/20" :
                  "border-zinc-700 text-zinc-600"
                }`}>
                  {answerState !== "idle" && index === current.correctIndex ? (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : answerState !== "idle" && index === selectedAnswer && answerState === "wrong" ? (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>
                <span className="leading-relaxed">{url}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback block */}
        {answerState !== "idle" && (
          <div className={`animate-in fade-in-0 slide-in-from-bottom-2 duration-300 rounded-lg border p-4 mb-5 ${
            answerState === "correct"
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 mt-0.5 ${answerState === "correct" ? "text-emerald-400" : "text-red-400"}`}>
                {answerState === "correct" ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9,12 11,14 15,10"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm mb-1 ${answerState === "correct" ? "text-emerald-400" : "text-red-400"}`}>
                  {answerState === "correct" ? "Правильно!" : "Неверно"}
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed mb-3">{current.explanation}</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-700">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <div>
                    <span className="text-xs font-semibold text-amber-400">{current.tipTitle}: </span>
                    <span className="text-xs text-zinc-400">{current.tip}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {answerState !== "idle" && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {currentIndex + 1 >= TOTAL_QUESTIONS ? (
              <>
                Посмотреть результаты
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </>
            ) : (
              <>
                Следующий вопрос
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        )}
      </Card>
    </div>
  );
}
