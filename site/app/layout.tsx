import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
title: 'Cosmic Encounters · The Eon Years',
description: 'A personal, single-player adaptation of Eon-era Cosmic Encounter. Alien powers, alliances, and a galaxy to share.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
return <html lang="en" className="dark"><body>{children}</body></html>;
}
