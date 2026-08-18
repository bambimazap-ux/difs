import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ניהול משימות שלדור',
    short_name: 'משימות',
    description: 'פלטפורמת פיקוח ובקרה שלדור',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9fa',
    theme_color: '#1a73e8',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
