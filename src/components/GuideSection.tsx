"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: {
    overview: string;
    signs: string[];
    examples: string[];
    protection: string[];
  };
  severity: "high" | "medium" | "low";
}

const guides: GuideItem[] = [
  {
    id: "email-phishing",
    title: "Email-фишинг",
    description: "Мошеннические письма, имитирующие доверенные источники",
    severity: "high",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    content: {
      overview: "Email-фишинг — наиболее распространённый тип атаки, при которой злоумышленники отправляют поддельные письма от имени банков, магазинов или коллег, чтобы выманить конфиденциальные данные.",
      signs: [
        "Срочность: «Ваш аккаунт будет заблокирован через 24 часа»",
        "Подозрительный адрес отправителя (support@amaz0n-security.com)",
        "Грамматические и орфографические ошибки",
        "Ссылки, ведущие на поддельные сайты",
        "Запрос конфиденциальной информации",
        "Вложения с необычными расширениями (.exe, .scr)"
      ],
      examples: [
        "«Подтвердите вашу личность, иначе аккаунт будет удалён»",
        "«Вы выиграли iPhone 15! Нажмите для получения»",
        "«Срочно: подозрительная активность на вашем счёте»",
        "«Ваша посылка задержана, подтвердите адрес»"
      ],
      protection: [
        "Всегда проверяйте адрес отправителя",
        "Не переходите по ссылкам в подозрительных письмах",
        "Заходите на сайты напрямую через браузер",
        "Включите двухфакторную аутентификацию",
        "Используйте антифишинговые фильтры"
      ]
    }
  },
  {
    id: "smishing",
    title: "SMS-фишинг (Смишинг)",
    description: "Мошеннические SMS с вредоносными ссылками",
    severity: "high",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    content: {
      overview: "Смишинг использует SMS-сообщения для обмана жертв. Мошенники маскируются под банки, курьерские службы или государственные организации.",
      signs: [
        "Сообщение от неизвестного номера",
        "Короткие ссылки (bit.ly, tinyurl)",
        "Требование срочных действий",
        "Запрос персональных данных через ссылку",
        "Уведомления о несуществующих посылках или платежах"
      ],
      examples: [
        "«Ваша карта заблокирована. Разблокируйте: bit.ly/xxxxx»",
        "«Посылка ожидает получения. Подтвердите: link.to/xxxxx»",
        "«Вам одобрен кредит на 500 000₽. Получить: xxxxx»"
      ],
      protection: [
        "Не переходите по ссылкам из незнакомых SMS",
        "Свяжитесь с организацией напрямую по официальному номеру",
        "Установите приложение для блокировки спама",
        "Не отвечайте на подозрительные сообщения"
      ]
    }
  },
  {
    id: "vishing",
    title: "Телефонный фишинг (Вишинг)",
    description: "Телефонные звонки от мошенников",
    severity: "high",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    content: {
      overview: "Вишинг — это голосовой фишинг, при котором мошенники звонят жертвам, представляясь сотрудниками банков, полиции или техподдержки.",
      signs: [
        "Звонок от «службы безопасности банка»",
        "Запрос кодов из SMS или CVV карты",
        "Давление и создание паники",
        "Угрозы блокировки счёта или ареста",
        "Предложение «безопасного счёта» для перевода денег"
      ],
      examples: [
        "«Здравствуйте, служба безопасности Сбербанка. На ваш счёт совершена подозрительная операция»",
        "«Это техподдержка Microsoft. Ваш компьютер заражён вирусом»",
        "«МВД. На вас оформлен кредит. Срочно подтвердите личность»"
      ],
      protection: [
        "Никогда не сообщайте коды из SMS и данные карт",
        "Банки никогда не просят CVV и PIN-код",
        "Положите трубку и перезвоните в банк сами",
        "Не устанавливайте программы по просьбе звонящих",
        "Запишите номер и сообщите о мошенничестве"
      ]
    }
  },
  {
    id: "spear-phishing",
    title: "Целевой фишинг",
    description: "Персонализированные атаки на конкретных людей",
    severity: "medium",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    content: {
      overview: "Целевой фишинг направлен на конкретного человека или организацию. Мошенники собирают информацию о жертве из соцсетей и других источников.",
      signs: [
        "Письмо содержит ваше имя и персональные данные",
        "Упоминаются ваши коллеги или проекты",
        "Высокое качество оформления письма",
        "Ссылка на актуальные события в компании"
      ],
      examples: [
        "Письмо от «директора» с просьбой срочно оплатить счёт",
        "Приглашение на «корпоративный тренинг» со ссылкой",
        "«Обновите пароль в корпоративной системе»"
      ],
      protection: [
        "Ограничьте публичную информацию в соцсетях",
        "Проверяйте необычные запросы по другим каналам",
        "Используйте корпоративные политики безопасности",
        "Обучайте сотрудников распознавать атаки"
      ]
    }
  },
  {
    id: "clone-sites",
    title: "Поддельные сайты",
    description: "Сайты-клоны, имитирующие легитимные ресурсы",
    severity: "high",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    content: {
      overview: "Мошенники создают точные копии популярных сайтов (банков, магазинов, соцсетей) для кражи учётных данных и платёжной информации.",
      signs: [
        "Подозрительный URL (amaz0n.com, g00gle.com)",
        "Отсутствие HTTPS или недействительный сертификат",
        "Ошибки в дизайне и тексте",
        "Нерабочие ссылки в меню",
        "Только форма входа без других функций"
      ],
      examples: [
        "paypa1.com вместо paypal.com",
        "sbeerbank.ru вместо sberbank.ru",
        "gooogle.com вместо google.com"
      ],
      protection: [
        "Проверяйте URL перед вводом данных",
        "Используйте закладки для важных сайтов",
        "Обращайте внимание на значок замка в браузере",
        "Используйте менеджер паролей (он не заполнит форму на поддельном сайте)"
      ]
    }
  },
  {
    id: "social-engineering",
    title: "Социальная инженерия",
    description: "Психологические манипуляции для получения информации",
    severity: "medium",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    content: {
      overview: "Социальная инженерия — это манипуляция людьми для получения конфиденциальной информации без использования технических средств.",
      signs: [
        "Создание ложного чувства срочности",
        "Апелляция к авторитету или страху",
        "Притворство «своим» или знакомым знакомых",
        "Использование публичной информации о вас",
        "Просьба о «небольшой услуге»"
      ],
      examples: [
        "«Я из IT-отдела, мне нужен ваш пароль для обновления»",
        "«Это курьер, назовите код из SMS для доставки»",
        "«Я друг вашего сына, он попал в беду»"
      ],
      protection: [
        "Никогда не сообщайте пароли и коды",
        "Проверяйте личность звонящего",
        "Не торопитесь принимать решения под давлением",
        "Обсудите подозрительные ситуации с близкими"
      ]
    }
  }
];

const quickTips = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Используйте 2FA",
    description: "Двухфакторная аутентификация защитит даже при утечке пароля"
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: "Проверяйте URL",
    description: "Внимательно смотрите на адрес сайта перед вводом данных"
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Обновляйте ПО",
    description: "Актуальные обновления закрывают уязвимости безопасности"
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    title: "Не торопитесь",
    description: "Мошенники создают срочность — возьмите паузу и подумайте"
  }
];


function SosStep({ step, c }: { step: any; c: any }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`overflow-hidden bg-zinc-900/50 border-zinc-800 transition-all duration-200 ${open ? "border-zinc-600" : "hover:border-zinc-700 cursor-pointer"}`}>
      <button className="w-full text-left p-4 flex items-center gap-4" onClick={() => setOpen(!open)}>
        <div className={`text-xl font-black font-mono shrink-0 w-8 leading-none ${c.num}`}>{step.num}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-medium text-zinc-100">{step.title}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${c.badge}`}>{step.urgency}</span>
          </div>
          <p className="text-xs text-zinc-500 line-clamp-1">{step.desc}</p>
        </div>
        <svg className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9"/></svg>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-2">
          <p className="text-sm text-zinc-400 leading-relaxed mb-3">{step.desc}</p>
          {step.actions.map((action: string, j: number) => (
            <div key={j} className="flex items-start gap-3 text-sm text-zinc-300">
              <div className={`w-5 h-5 rounded-full ${c.dot} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5`}>{j + 1}</div>
              {action}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function GuideSection() {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/10 text-red-400 border-red-500/30";
      case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Tips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickTips.map((tip, index) => (
          <Card key={index} className="p-4 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                {tip.icon}
              </div>
              <h4 className="font-medium text-zinc-100 text-sm">{tip.title}</h4>
              <p className="text-xs text-zinc-500">{tip.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Guides Grid */}
      <div>
        <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Справочник по типам фишинга
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <Card
              key={guide.id}
              className={`p-4 bg-zinc-900/50 border-zinc-800 cursor-pointer card-hover ${
                selectedGuide?.id === guide.id ? "border-red-500/50 bg-zinc-900" : ""
              }`}
              onClick={() => setSelectedGuide(selectedGuide?.id === guide.id ? null : guide)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-zinc-100 truncate">{guide.title}</h4>
                    <Badge className={`text-[10px] ${getSeverityColor(guide.severity)}`}>
                      {guide.severity === "high" ? "Высокий" : guide.severity === "medium" ? "Средний" : "Низкий"}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2">{guide.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SOS Section */}
      <div>
        <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          🆘 Меня взломали — что делать?
        </h3>
        <Card className="p-4 mb-4 bg-red-500/5 border-red-500/30">
          <p className="text-sm text-zinc-400 leading-relaxed">Не паникуйте — действуйте по порядку. Нажмите на шаг, чтобы развернуть детали.</p>
        </Card>
        <div className="space-y-2">
          {([
            { num: "01", urgency: "НЕМЕДЛЕННО", color: "red", title: "Отключитесь от интернета", desc: "Выключите Wi-Fi и мобильный интернет на всех устройствах. Это остановит утечку данных и прервёт доступ злоумышленника.", actions: ["Выключите Wi-Fi на телефоне и компьютере", "Отключите кабель интернета от роутера", "Переведите телефон в авиарежим"] },
            { num: "02", urgency: "В ПЕРВУЮ ОЧЕРЕДЬ", color: "orange", title: "Смените пароли с другого устройства", desc: "Используйте чистое устройство. Начните с почты — она является ключом ко всем остальным аккаунтам.", actions: ["Сначала — основной email", "Затем — интернет-банк и финансовые сервисы", "Потом — соцсети, мессенджеры, Госуслуги", "Пароль: минимум 16 символов, буквы + цифры + спецсимволы"] },
            { num: "03", urgency: "КРИТИЧНО", color: "amber", title: "Включите двухфакторную аутентификацию", desc: "2FA делает взлом практически невозможным даже при известном пароле.", actions: ["Используйте приложение-аутентификатор (Google Authenticator, Яндекс.Ключ)", "Не полагайтесь только на SMS — SIM можно клонировать", "Сохраните резервные коды в надёжном офлайн-месте"] },
            { num: "04", urgency: "СРОЧНО", color: "yellow", title: "Проверьте финансы и заблокируйте карты", desc: "Если злоумышленник мог получить доступ к банковским данным — действуйте немедленно.", actions: ["Позвоните на горячую линию банка и сообщите о взломе", "Временно заблокируйте все банковские карты", "Проверьте выписку за последние 24–72 часа", "При подозрительных транзакциях — заявите на чарджбэк"] },
            { num: "05", urgency: "ВАЖНО", color: "blue", title: "Предупредите контакты", desc: "Мошенники часто рассылают ссылки и просят деньги от вашего имени через взломанный аккаунт.", actions: ["Сообщите в соцсетях, что аккаунт был взломан", "Предупредите коллег и близких не переходить по ссылкам от вас", "Если взломана рабочая почта — немедленно сообщите в IT-отдел"] },
            { num: "06", urgency: "ОБЯЗАТЕЛЬНО", color: "purple", title: "Проверьте устройства на вирусы", desc: "Взлом мог произойти через вредоносное ПО, которое до сих пор активно на вашем устройстве.", actions: ["Запустите полную проверку антивирусом (Kaspersky, Dr.Web, Windows Defender)", "Проверьте список приложений — удалите незнакомые", "Обновите ОС и все приложения", "В крайнем случае — сброс до заводских настроек"] },
            { num: "07", urgency: "ПРИ УЩЕРБЕ", color: "zinc", title: "Подайте заявление в полицию", desc: "Если был причинён финансовый ущерб или похищены личные данные — зафиксируйте официально.", actions: ["Обратитесь в отдел «К» МВД — они занимаются киберпреступлениями", "Сохраните доказательства: скриншоты, переписку, уведомления", "Направьте жалобу в Роскомнадзор при утечке персданных", "Телефон доверия МВД: 8-800-222-74-47 (бесплатно)"] },
          ] as any[]).map((step: any, i: number) => {
            const colorMap: Record<string, { badge: string; num: string; dot: string }> = {
              red:    { badge: "bg-red-500/10 text-red-400 border-red-500/30",        num: "text-red-500",    dot: "bg-red-500" },
              orange: { badge: "bg-orange-500/10 text-orange-400 border-orange-500/30", num: "text-orange-500", dot: "bg-orange-500" },
              amber:  { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",   num: "text-amber-500",  dot: "bg-amber-500" },
              yellow: { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", num: "text-yellow-500", dot: "bg-yellow-500" },
              blue:   { badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",      num: "text-blue-500",   dot: "bg-blue-500" },
              purple: { badge: "bg-purple-500/10 text-purple-400 border-purple-500/30", num: "text-purple-500", dot: "bg-purple-500" },
              zinc:   { badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",      num: "text-zinc-400",   dot: "bg-zinc-500" },
            };
            return <SosStep key={i} step={step} c={colorMap[step.color]} />;
          })}
        </div>
      </div>

      {/* Selected Guide Detail */}
      {selectedGuide && (
        <Card className="p-6 bg-zinc-900/50 border-zinc-800 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
                {selectedGuide.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-100">{selectedGuide.title}</h3>
                <p className="text-sm text-zinc-500">{selectedGuide.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedGuide(null)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-zinc-800/50 border border-zinc-700 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-700 text-sm">Обзор</TabsTrigger>
              <TabsTrigger value="signs" className="data-[state=active]:bg-zinc-700 text-sm">Признаки</TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-zinc-700 text-sm">Примеры</TabsTrigger>
              <TabsTrigger value="protection" className="data-[state=active]:bg-zinc-700 text-sm">Защита</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <p className="text-zinc-300 leading-relaxed">{selectedGuide.content.overview}</p>
            </TabsContent>

            <TabsContent value="signs" className="mt-4">
              <ul className="space-y-2">
                {selectedGuide.content.signs.map((sign, index) => (
                  <li key={index} className="flex items-start gap-2 text-zinc-300">
                    <svg className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="examples" className="mt-4">
              <div className="space-y-3">
                {selectedGuide.content.examples.map((example, index) => (
                  <div key={index} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                    <p className="text-zinc-300 font-mono text-sm">{example}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="protection" className="mt-4">
              <ul className="space-y-2">
                {selectedGuide.content.protection.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-zinc-300">
                    <svg className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9,12 11,14 15,10"/>
                    </svg>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}