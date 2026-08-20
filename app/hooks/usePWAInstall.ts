import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  // Default to true so the button ALWAYS shows up. If they are on a browser that doesn't support the prompt, we will fallback to instructions.
  const [isInstallable, setIsInstallable] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      // Show the install prompt natively
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        // Installed
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: If no prompt event was caught (e.g., iOS Safari or already installed or desktop browser blocking it)
      if (isIOS) {
        alert('כדי להתקין את האפליקציה באייפון: לחץ על כפתור השיתוף בתחתית המסך, ואז בחר "הוסף למסך הבית" (Add to Home Screen).');
      } else {
        alert('כדי להתקין את האפליקציה: חפש את סמל ההתקנה (Install) בשורת הכתובת של הדפדפן שלך, או פתח את תפריט הדפדפן ובחר "התקן אפליקציה".');
      }
    }
  };

  return { isInstallable, installPWA };
}
