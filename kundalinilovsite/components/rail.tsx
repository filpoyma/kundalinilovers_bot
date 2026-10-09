import { NAV_LINKS, SOCIAL_LINKS, WHATSAPP_URL } from "./content";

export function Rail() {
  return (
    <aside className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden h-screen w-1/2 lg:block">
      <div className="flex h-full flex-col px-[5px] pt-[5px] pb-[5px]">
        <div className="grid grid-cols-3 items-start gap-[5px]">
          <div className="pointer-events-auto min-w-0">
            <div className="rounded-[5px] bg-[#1d1d1d] px-[10px] py-[10px]">
              <p>Места на консультации</p>
              <p className="mt-[5px] text-[#00ff95]">Есть</p>
            </div>
            <a
              href={WHATSAPP_URL}
              className="mt-[5px] flex h-[53px] w-full items-center justify-center rounded-[5px] bg-[#f8f8f8] px-2 text-center leading-[1.15] text-[#080808]"
            >
              Записаться на первую встречу
            </a>
          </div>
          <nav
            className="pointer-events-auto flex flex-col gap-[5px] rounded-[5px] bg-[#1d1d1d] px-[10px] py-[10px]"
            aria-label="Разделы"
          >
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-[#929292] hover:text-[#f8f8f8]">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pointer-events-auto flex flex-col gap-[5px] rounded-[5px] bg-[#1d1d1d] px-[10px] py-[10px]">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="flex gap-[10px] hover:text-[#f8f8f8]">
                <span className="w-[35px] shrink-0 text-[10px] leading-[14px]">{link.label}</span>
                <span className="text-[#929292]">{link.value}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 items-end gap-x-5">
          <video
            className="pointer-events-auto aspect-[232/412] w-full max-w-[232px] rounded-[5px] bg-black object-cover"
            src="/intro.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="col-start-3">
            <p>Дмитрий Снегирев</p>
            <p className="mt-[5px] text-[#929292]">Психолог</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
