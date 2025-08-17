import localFont from 'next/font/local'

// ✅ GDPR-COMPLIANT: Local Inter Variable Font
// Performance optimized with preload, size-adjust, and display: swap
export const inter = localFont({
  src: [
    {
      path: '../../../public/fonts/InterVariable.woff2',
      weight: '400 700', // Variable weight range
      style: 'normal',
    },
    {
      path: '../../../public/fonts/InterVariable-Italic.woff2',
      weight: '400 700',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'swap', // ✅ Prevents layout shift
  preload: true, // ✅ Critical font preloading
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  declarations: [
    {
      prop: 'font-feature-settings',
      value: '"cv01", "cv03", "cv04", "cv11"', // ✅ Inter OpenType features
    },
  ],
})

// ✅ Export CSS variable for Tailwind integration
export const fontVariables = inter.variable
