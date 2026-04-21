"use client";

import { useState } from "react";
import { URLChecker } from "@/components/URLChecker";
import { PhoneChecker } from "@/components/PhoneChecker";
import { GuideSection } from "@/components/GuideSection";
import { QuizSection } from "@/components/QuizSection";
import { Card } from "@/components/ui/card";

type Section = "phone" | "checker" | "guides" | "quiz";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("phone");
  const [darkMode, setDarkMode] = useState(true);

  const stats = [
    { value: "3.4B", label: "Фишинговых писем в день" },
    { value: "83%",  label: "Атак через email" },
    { value: "$17K", label: "Средний ущерб от атаки" },
    { value: "36%",  label: "Жертв кликают по ссылке" },
  ];

  const navItems: { id: Section; label: string }[] = [
    { id: "phone",   label: "Проверка телефона" },
    { id: "checker", label: "Проверка URL" },
    { id: "guides",  label: "Справочник" },
    { id: "quiz",    label: "Викторина" },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-background cyber-grid noise-overlay transition-colors duration-300">
        {/* Gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-red-950/0 dark:from-red-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Header */}
        <header className="relative border-b border-zinc-200 dark:border-zinc-800/50 backdrop-blur-sm bg-white/80 dark:bg-zinc-950/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 blur-lg bg-red-500/30 rounded-full" />
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-lg">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M12 8v4"/><path d="M12 16h.01"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    AntiPhish<span className="text-red-500">Tum</span>
                  </h1>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Защита от фишинга</p>
                </div>
              </div>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Theme toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title={darkMode ? "Светлая тема" : "Тёмная тема"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-6">
                <svg className="w-4 h-4 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Ежедневно происходит более 3 миллиардов фишинговых атак</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 leading-tight">
                Защитите себя от{" "}
                <span className="gradient-text">фишинга</span>
              </h2>

              <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                Проверяйте подозрительные ссылки и номера телефонов перед переходом и изучайте методы защиты от мошенничества
              </p>

              {/* Mobile nav */}
              <div className="flex md:hidden justify-center gap-2 mb-8 flex-wrap">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      activeSection === item.id
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30"
                        : "text-zinc-500 bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative py-8 border-y border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main content */}
        <main className="relative py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeSection === "phone" ? (
              <div className="space-y-8">
                <PhoneChecker />
                <Card className="p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Признаки мошеннических звонков
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { n: "1", title: "Требование срочности", desc: "«Ваш счёт заблокирован» — классический приём давления для отключения критического мышления" },
                      { n: "2", title: "Запрос данных карты",  desc: "Банки никогда не запрашивают CVV, PIN и полные номера карт по телефону" },
                      { n: "3", title: "Незнакомый код страны", desc: "Звонки с +234 (Нигерия), +92 (Пакистан) — чаще всего международное мошенничество" },
                    ].map((tip) => (
                      <div key={tip.n} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                        <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 font-bold mb-3">{tip.n}</div>
                        <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">{tip.title}</h4>
                        <p className="text-sm text-zinc-500">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : activeSection === "checker" ? (
              <div className="space-y-8">
                <URLChecker />
                <Card className="p-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Как работает проверка?
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { n: "1", title: "Анализ URL",       desc: "Проверяем структуру URL по большой антивирусной базе" },
                      { n: "2", title: "Проверка домена",  desc: "Ищем признаки имитации известных сайтов и доступность сайта" },
                      { n: "3", title: "Оценка риска",     desc: "Выдаём рейтинг безопасности от 0 до 100" },
                    ].map((s) => (
                      <div key={s.n} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                        <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 font-bold mb-3">{s.n}</div>
                        <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">{s.title}</h4>
                        <p className="text-sm text-zinc-500">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : activeSection === "guides" ? (
              <GuideSection />
            ) : (
              <QuizSection />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-zinc-200 dark:border-zinc-800/50 py-8 bg-white/50 dark:bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10">
                  <svg className="w-4 h-4 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">AntiPhishTum — защита от фишинговых атак</span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">Данные носят информационный характер</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
