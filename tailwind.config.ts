import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semáforo
        semaforo: {
          verde: '#16a34a',
          'verde-bg': '#dcfce7',
          amarillo: '#ca8a04',
          'amarillo-bg': '#fef9c3',
          rojo: '#dc2626',
          'rojo-bg': '#fee2e2',
        },
        // Brand
        brand: {
          primary: '#1e40af',
          secondary: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
