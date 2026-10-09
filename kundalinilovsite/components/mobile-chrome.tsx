"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS, SOCIAL_LINKS, WHATSAPP_URL } from "./content";

function BurgerIcon() {
  return (
    <span className="flex w-[18px] flex-col gap-[5px]" aria-hidden="true">
      <span className="h-px w-full bg-[#f8f8f8]" />
      <span className="h-px w-full bg-[#f8f8f8]" />
      <span className="h-px w-full bg-[#f8f8f8]" />
    </span>
  );
}

export function MobileChrome() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-[15px] pt-[15px]">
        <div>
          <p>Дмитрий Снегирев</p>
          <p className="mt-[5px] text-[#929292]">Психолог</p>
        </div>
        <button
          type="button"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((current) => !current)}
          className="pointer-events-auto flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-[5px] bg-[#1d1d1d] text-[#00ff95]"
        >
          {open ? <span className="text-[28px] leading-none">×</span> : <BurgerIcon />}
        </button>
      </header>

      <button
        type="button"
        aria-label="Закрыть меню"
        tabIndex={open ? 0 : -1}
        onClick={closeMenu}
        className={`fixed inset-0 z-30 bg-transparent ${open ? "" : "pointer-events-none"}`}
      />

      <div
        id="mobile-menu"
        className={`fixed top-[83px] right-[15px] z-40 w-[min(250px,68vw)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "pointer-events-none translate-x-[calc(100%+15px)]"
        }`}
      >
        <nav className="flex flex-col gap-[5px] rounded-[5px] bg-[#1d1d1d] px-4 py-4" aria-label="Разделы">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu} className="text-[#929292] hover:text-[#f8f8f8]">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-[10px] flex flex-col gap-[5px] rounded-[5px] bg-[#1d1d1d] px-4 py-3">
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="flex gap-[10px] hover:text-[#f8f8f8]">
              <span className="w-[28px] text-[10px] leading-[14px]">{link.label}</span>
              <span className="text-[#929292]">{link.value}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-[5px] bottom-[5px] z-40 flex flex-col gap-[5px] min-[480px]:flex-row">
        <div className="pointer-events-auto flex h-[34px] items-center justify-between rounded-[5px] bg-[#1d1d1d] px-[10px] min-[480px]:h-[53px] min-[480px]:w-1/2 min-[480px]:flex-col min-[480px]:items-start min-[480px]:justify-center">
          <p className="whitespace-nowrap">Места на консультации</p>
          <p className="text-[#00ff95] min-[480px]:mt-[5px]">Есть</p>
        </div>
        <a
          href={WHATSAPP_URL}
          className="pointer-events-auto flex h-[53px] items-center justify-center rounded-[5px] bg-[#f8f8f8] px-3 text-center whitespace-nowrap text-[#080808] min-[480px]:w-1/2"
        >
          Записаться на первую встречу
        </a>
      </div>
    </div>
  );
}
