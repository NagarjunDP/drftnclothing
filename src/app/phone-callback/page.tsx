'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PhoneCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    if (accessToken) {
      if (window.opener) {
        // Send access token back to the main checkout window
        window.opener.postMessage(
          { type: 'PHONE_EMAIL_VERIFIED', accessToken },
          window.location.origin
        );
      }
      // Close the popup window
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center space-y-4">
      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
        Verifying phone number...
      </p>
    </div>
  );
}

export default function PhoneCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Loading callback...</p>
      </div>
    }>
      <PhoneCallbackContent />
    </Suspense>
  );
}
