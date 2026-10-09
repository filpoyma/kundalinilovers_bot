import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Дмитрий Снегирев — психолог, индивидуальная терапия онлайн",
  description: "Индивидуальная терапия онлайн. Первая встреча — 50 минут, 6.000 ₽.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${sourceCodePro.variable} h-full scroll-smooth antialiased`}>
      <body className="flex min-h-full flex-col bg-[#080808] font-[family-name:var(--font-source-code)] text-[#f8f8f8]">
        {children}
      </body>
    </html>
  );
}
