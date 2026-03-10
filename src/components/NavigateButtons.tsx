'use client';

import { usePathname, useRouter } from 'next/navigation';

function GoToButton({
  children,
  route,
}: {
  children?: React.ReactNode;
  route: string;
}) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.push(route)}>
      {children || 'Click it!'}
    </button>
  );
}

export default function NavigationButtons() {
  const pathname = usePathname();

  return (
    <div>
      {pathname !== '/' && <GoToButton route="/">Go to Home</GoToButton>}
      {pathname !== '/parseTimeline' && (
        <GoToButton route="/parseTimeline">Go to parser</GoToButton>
      )}
      {pathname !== '/tacticEditor' && (
        <GoToButton route="/tacticEditor">Go to timeline editor</GoToButton>
      )}
      {pathname !== '/admin' && (
        <GoToButton route="/admin">Go to admin</GoToButton>
      )}
    </div>
  );
}
