/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight-indigo': '#0B3558',
        'action-blue': '#006BFF',
        'lavender-glow': '#e55cff',
        'royal-amethyst': '#8247f5',
        'sunset-gold': '#ffa600',
        'skybound-blue': '#0099ff',
        'ocean-glimmer': '#BB32D5',
        'glacier-blue': '#004EBA',
        'snow-white': '#ffffff',
        'cloud-mist': '#F8F9FB',
        'pale-gray': '#E7EDF6',
        'slate-blue': '#476788',
        'steel-gray': '#A6BBD1',
        'platinum-tint': '#D4E0ED',
        'outline-gray': '#E6E6E6',
        'text-black': '#0A0A0A',
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        gilroy: ['Gilroy', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'sm-1': 'rgba(71, 103, 136, 0.04) 0px 4px 5px 0px, rgba(71, 103, 136, 0.03) 0px 4px 10px 0px, rgba(71, 103, 136, 0.05) 0px 10px 20px 0px',
        'sm-2': 'rgba(71, 103, 136, 0.04) 0px 4px 5px 0px, rgba(71, 103, 136, 0.03) 0px 8px 15px 0px, rgba(71, 103, 136, 0.08) 0px 30px 50px 0px',
        'sm-3': 'rgba(71, 103, 136, 0.04) 0px 4px 5px 0px, rgba(71, 103, 136, 0.03) 0px 8px 15px 0px, rgba(71, 103, 136, 0.06) 0px 15px 30px 0px',
      }
    },
  },
  plugins: [],
}
