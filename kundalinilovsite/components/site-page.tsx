import Image from "next/image";
import {
  NOW_ITEMS,
  PRINCIPLES,
  STEPS,
  TRUST_ITEMS,
  WHATSAPP_URL,
} from "./content";
import { FaqList } from "./faq-list";
import { MobileChrome } from "./mobile-chrome";
import { Rail } from "./rail";

function indexLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function SitePage() {
  return (
    <div className="overflow-x-clip bg-[#080808] text-[14px] leading-[14px] tracking-[-1px] text-[#f8f8f8] uppercase">
      <MobileChrome />
      <Rail />

      <main>
        <section className="grid min-h-screen lg:grid-cols-2" aria-label="Дмитрий Снегирев">
          <div className="hidden lg:block" />
          <div className="relative min-h-[70vh] lg:min-h-screen">
            <Image
              src="/portrait.webp"
              alt="Дмитрий Снегирев"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </section>

        <section id="vozmozhno" className="scroll-mt-6 px-[15px] pt-[120px] lg:px-0 lg:pt-[200px]">
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-x-5 lg:pr-[15px]">
              <h2 className="shrink-0">Возможно, сейчас вы</h2>
              <div>
                <ol className="flex flex-col gap-[5px]">
                  {NOW_ITEMS.map((item, index) => (
                    <li key={item} className="grid grid-cols-[24px_1fr] gap-2 text-[#929292]">
                      <span className="text-[10px] leading-[10px]">{indexLabel(index)}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-16 max-w-[360px]">
                  Если вы узнали себя хотя бы в одном пункте — это уже достаточная причина обратиться за поддержкой
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="chto" className="scroll-mt-6 px-[15px] pt-[120px] lg:px-0 lg:pt-[200px]">
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="max-w-[420px] lg:pr-[15px]">
              <h2>Что изменится</h2>
              <p className="mt-24 max-w-[360px]">
                Терапия не меняет жизнь за один день. Но постепенно меняет то, как вы её проживаете
              </p>
              <p className="mt-6 max-w-[395px] text-[#929292]">
                Со временем вы сможете спокойнее реагировать на сложные ситуации, лучше понимать себя и свои чувства, перестать жить в постоянном внутреннем напряжении
              </p>
            </div>
          </div>
        </section>

        <section id="pochemu" className="relative mt-[120px] min-h-[720px] scroll-mt-6 lg:mt-[200px] lg:min-h-[1190px]">
          <Image
            src="/why.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-left"
          />
          <div className="relative flex min-h-[720px] items-end bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent px-[15px] py-10 lg:absolute lg:inset-y-0 lg:right-0 lg:min-h-0 lg:w-[26%] lg:items-center lg:bg-none lg:px-0 lg:py-0">
            <div className="max-w-[348px]">
              <h2>Почему именно я</h2>
              <p className="mt-6 max-w-[340px]">
                В терапии важно не только образование. Важно, сможете ли вы доверять человеку напротив
              </p>
              <div className="mt-16 flex flex-col gap-6">
                {PRINCIPLES.map((item) => (
                  <div key={item.title}>
                    <p>{item.title}</p>
                    <p className="mt-[5px] text-[#929292]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="kak" className="scroll-mt-6 px-[15px] pt-[120px] lg:px-0 lg:pt-[200px]">
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="lg:pr-[15px]">
              <h2>Как проходит работа</h2>
              <ol className="mt-24 flex flex-col gap-4">
                {STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-1 lg:grid-cols-[20px_minmax(0,220px)_1fr] lg:items-start lg:gap-x-4 lg:gap-y-0"
                  >
                    <span className="row-start-1 text-[10px] leading-[10px] text-[#929292]">
                      {indexLabel(index)}
                    </span>
                    <span className="col-start-2 row-start-1">{step.title}</span>
                    <span className="col-span-2 row-start-2 text-[#929292] lg:col-span-1 lg:col-start-3 lg:row-start-1">
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="formaty" className="scroll-mt-6 px-[15px] pt-[120px] lg:px-0 lg:pt-[200px]">
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="max-w-[360px]">
              <h2>Форматы и стоимость</h2>
              <p className="mt-6 text-[#929292]">
                Первая встреча — это возможность познакомиться. Не нужно заранее понимать, сколько продлится терапия или формулировать идеальный запрос
              </p>
              <div className="mt-16 max-w-[340px]">
                <div className="flex items-start justify-between gap-6">
                  <span className="text-[#00ff95]">Онлайн</span>
                  <span>50 минут</span>
                </div>
                <div className="mt-[5px] flex items-start justify-between gap-6">
                  <span>Индивидуальная терапия</span>
                  <span className="shrink-0">6.000 ₽</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="doverie" className="scroll-mt-6 px-[15px] pt-[120px] lg:px-0 lg:pt-[200px]">
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:pr-[15px]">
              <h2>Доверие</h2>
              <div>
                <div className="relative h-[400px] overflow-hidden rounded-[5px]">
                  <Image
                    src="/trust.webp"
                    alt="Дмитрий Снегирев"
                    fill
                    sizes="350px"
                    className="object-cover"
                  />
                </div>
                <ol className="mt-6 flex flex-col gap-[5px]">
                  {TRUST_ITEMS.map((item, index) => (
                    <li key={item} className="grid grid-cols-[24px_1fr] gap-2 text-[#929292]">
                      <span className="text-[10px] leading-[10px]">{indexLabel(index)}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="otvety" className="scroll-mt-6 px-[15px] pt-[120px] lg:px-0 lg:pt-[200px]">
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="lg:pr-[15px]">
              <h2>Ответы на вопросы</h2>
              <div className="mt-16">
                <FaqList />
              </div>
            </div>
          </div>
        </section>

        <section id="zapis" className="scroll-mt-6 px-[15px] pt-[120px] lg:px-0 lg:pt-[200px]">
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:block" />
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:pr-[15px]">
              <h2>Запись</h2>
              <div>
                <p className="max-w-[350px] text-[#929292]">
                  Не обязательно справляться со всем самостоятельно. Иногда достаточно одной встречи, чтобы почувствовать, что выход есть. Если сейчас вам непросто, напишите несколько слов о своей ситуации. Не нужно подбирать правильные формулировки. Мы разберёмся вместе
                </p>
                <a
                  href={WHATSAPP_URL}
                  className="mt-16 flex h-[53px] w-full max-w-[350px] items-center justify-center rounded-[5px] bg-[#f8f8f8] text-[#080808]"
                >
                  Записаться на первую встречу
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-[120px] grid lg:mt-[200px] lg:min-h-screen lg:grid-cols-2">
          <div className="hidden lg:block" />
          <div className="relative min-h-[70vh] lg:min-h-screen">
            <Image
              src="/footer.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#080808]/80 to-transparent" />
            <div className="absolute right-[15px] bottom-8 left-[15px] max-w-[325px] lg:left-auto lg:ml-auto">
              <p className="text-[#929292]">услуги предоставляет</p>
              <p className="mt-[5px]">ИП Мельниченко Д.Г.</p>
              <p className="mt-5 text-[#929292]">Сайт разработала</p>
              <a href="https://t.me/mishatabi" className="mt-[5px] inline-block hover:text-[#929292]">
                Миша Таби
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
