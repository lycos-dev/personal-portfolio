import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Lycos Blanza — Software Engineer", description: "Lycos Blanza — Software Engineer and Computer Science student at De La Salle Lipa. Explore full-stack, mobile, and embedded projects, review source code, and get in touch.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
