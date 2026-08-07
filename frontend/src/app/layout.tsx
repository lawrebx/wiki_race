import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wiki Race - Multiplayer Wikipedia Racing Game',
  description: 'Race from one Wikipedia article to another in real-time multiplayer competition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
