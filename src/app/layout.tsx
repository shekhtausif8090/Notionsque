import type { Metadata } from "next";
import StoreProvider from "../lib/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notionesque - Task Management",
  description: "A Notion-style task management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div className="min-h-screen bg-gray-100">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
