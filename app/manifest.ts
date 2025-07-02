export default function manifest() {
  return {
    name: 'LIA HAIR - POS System',
    short_name: 'LIA HAIR',
    description: 'Professional Hair Salon Point of Sale System - Appointments, Sales, Customer Management',
    start_url: '/',
    display: 'standalone',
    background_color: '#2a2a2e',
    theme_color: '#2a2a2e',
    orientation: 'portrait',
    scope: '/',
    lang: 'de-CH',
    categories: ['business', 'productivity', 'finance'],
    screenshots: [
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: 'POS Kasse',
        short_name: 'POS',
        description: 'Direkt zur Kasse',
        url: '/org/[slug]/pos',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'Termine',
        short_name: 'Termine',
        description: 'Terminverwaltung',
        url: '/org/[slug]/appointments',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'Kunden',
        short_name: 'Kunden',
        description: 'Kundenverwaltung',
        url: '/org/[slug]/customers',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
      }
    ],
    prefer_related_applications: false
  }
}