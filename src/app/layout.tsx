import NavigationButtons from '@/components/NavigateButtons';
import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Uhe~',
    template: '%s | Uhe~',
  },
  description: 'Blue Archive tools',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <NavigationButtons />
        {children}
      </body>
    </html>
  );
}
