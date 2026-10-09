"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "./content";

export function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-[#f8f8f8]/15">
      {FAQ_ITEMS.map((item, index) => {
        const open = openIndex === index;

        return (
          <div key={item.question} className="border-b border-[#f8f8f8]/15">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-start justify-between gap-4 py-4 text-left text-[#f8f8f8]"
            >
              <span className="min-w-0 pr-2 normal-case">{item.question}</span>
              <span className="shrink-0 text-[#929292]" aria-hidden="true">
                {open ? "–" : "+"}
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[640px] pb-4 normal-case leading-[1.35] text-[#929292]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
