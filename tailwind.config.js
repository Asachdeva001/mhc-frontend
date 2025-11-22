/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Digital Sanctuary Color Palette
        sanctuary: {
          sage: '#84A98C',
          'sage-light': '#a5c4ad',
          'sage-dark': '#6b8a73',
          misty: '#CAD2C5',
          sand: '#FDFCF5',
          slate: '#2F3E46',
        },
      },
      fontFamily: {
        nunito: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        quicksand: ['var(--font-quicksand)', 'Quicksand', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neumorphic': '8px 8px 16px rgba(202, 210, 197, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.9)',
        'neumorphic-inset': 'inset 4px 4px 8px rgba(202, 210, 197, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
        'glass': '0 8px 32px 0 rgba(132, 169, 140, 0.1)',
        'sanctuary': '0 10px 25px -5px rgba(132, 169, 140, 0.15), 0 8px 10px -6px rgba(132, 169, 140, 0.1)',
        'sanctuary-hover': '0 20px 40px -5px rgba(132, 169, 140, 0.2), 0 12px 15px -6px rgba(132, 169, 140, 0.15)',
      },
      transitionDuration: {
        '300': '300ms',
      },
      lineHeight: {
        'relaxed': '1.75',
        'loose': '2',
      },
    },
  },
  plugins: [],
};
