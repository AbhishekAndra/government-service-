// Shared Tailwind CDN config — include on every page, AFTER the Tailwind
// CDN <script> tag and AFTER design-system.css. Keeps Tailwind's utility
// classes (bg-gov-blue, text-gov-gold, rounded-lg, ...) reading the exact
// same values as the CSS custom properties in design-system.css, so no
// page can drift from the palette by redefining its own config.
//
// Usage on every page's <head>:
//   <link rel="stylesheet" href="design-system.css">
//   <script src="https://cdn.tailwindcss.com"></script>
//   <script src="tailwind-config.js"></script>

tailwind.config = {
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#003B7A',
          'blue-dark': '#002A59',
          'blue-light': '#E8F0FA',
          navy: '#001F3F',
          'navy-soft': '#0A2C52',
          gold: '#D4AF37',
          'gold-dark': '#B8952C',
          'gold-light': '#FBF3DD',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '12px',
        lg: '16px',
        xl: '18px',
      },
      boxShadow: {
        'gov-sm': '0 1px 3px rgba(0, 31, 63, 0.07)',
        'gov-md': '0 6px 16px rgba(0, 31, 63, 0.09)',
        'gov-lg': '0 14px 34px rgba(0, 31, 63, 0.14)',
        gold: '0 6px 18px rgba(212, 175, 55, 0.30)',
      },
    },
  },
};
