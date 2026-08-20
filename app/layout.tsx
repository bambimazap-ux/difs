import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "פלטפורמת פיקוח ובקרה שלדור - מנהלת הר פיתוח",
  description: "פלטפורמה מתקדמת לניהול משימות צוות",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "משימות שלדור",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#1a73e8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
