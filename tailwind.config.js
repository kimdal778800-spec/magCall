/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0057B8",
          accent: "#FF6B00",
          orange: "#FF6B00",
        },
      },
       keyframes: {
           infiniteScrollRight: {
          "0%": { transform: "translateX(-50%)" },       // 시작: 꽉 찬 상태
          "100%": { transform: "translateX(0%)" },    // 오른쪽으로 50% 이동
        },
       },
       animation: {
           infiniteScrollRight: "infiniteScrollRight  90s linear infinite", // 천천히 반복
       },
    },
  },
  plugins: [],
}
