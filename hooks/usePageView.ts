import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const usePageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams.size > 0 
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      // Send pageview event to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: url,
          page_title: document.title,
        });
      }
    }
  }, [pathname, searchParams]);
}; 