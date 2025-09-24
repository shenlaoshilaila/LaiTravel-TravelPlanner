/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Next.js app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // (可选) 传统 pages 目录
    "./components/**/*.{js,ts,jsx,tsx}", // 所有组件文件
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a", // 自定义主色（可根据需要修改）
        secondary: "#9333ea",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
    },
  },
  plugins: [],
};
