import type { Metadata } from "next";
import StoreProvider from "@/lib/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notionesque - Task Management",
  description: "A Notion-style task management application",
};

const themeInitScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <StoreProvider>
          <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0b0b0d] dark:text-zinc-100">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
