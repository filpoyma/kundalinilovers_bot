import Link from "next/link";
import type { ReactNode } from "react";

export function indexLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] px-[15px] py-10 text-[14px] leading-[14px] tracking-[-1px] uppercase text-[#f8f8f8] lg:px-8">
      <header className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-[#929292]/40 pb-6">
        <div>
          <p className="text-[#929292]">kundalini admin</p>
          <h1 className="mt-2 text-[#f8f8f8]">{title}</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/kundaliniadmin" className="text-[#929292] hover:text-[#f8f8f8]">
            меню
          </Link>
          <form action="/kundaliniadmin/api/logout" method="post">
            <button type="submit" className="text-[#929292] hover:text-[#f8f8f8]">
              выход
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <section className="mb-8 rounded-[5px] border border-[#929292]/40 p-5">{children}</section>
  );
}

export function AdminButton({
  children,
  type = "submit",
}: {
  children: ReactNode;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      className="mt-4 flex h-[53px] w-full max-w-[350px] items-center justify-center rounded-[5px] bg-[#f8f8f8] text-[#080808] hover:opacity-90"
    >
      {children}
    </button>
  );
}

export function AdminField({
  label,
  name,
  value,
  placeholder,
  type = "text",
  required,
  rows,
}: {
  label: string;
  name: string;
  value?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  rows?: number;
}) {
  const className =
    "mt-2 w-full rounded-[5px] border border-[#929292]/60 bg-[#111] px-3 py-2 normal-case text-[#f8f8f8] outline-none focus:border-[#00ff95]";

  return (
    <label className="block mb-4">
      <span className="text-[#929292]">{label}</span>
      {rows ? (
        <textarea
          name={name}
          rows={rows}
          required={required}
          defaultValue={value}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={value}
          placeholder={placeholder}
          className={className}
        />
      )}
    </label>
  );
}

export function AdminMenuLink({
  href,
  index,
  label,
}: {
  href: string;
  index: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-[#929292]/20 py-4 hover:text-[#00ff95]"
    >
      <span className="text-[10px] text-[#929292]">{indexLabel(index)}</span>
      <span>{label}</span>
    </Link>
  );
}

export function AdminError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mb-4 text-[#ff6b6b] normal-case">{message}</p>;
}
