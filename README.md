# 💸 AI Spend Analyzer

**Turn raw bank statements into actionable financial insights — with a side of AI-powered roasting.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://www.mongodb.com/)

A full-stack MERN application that ingests your monthly bank statement (CSV), visualizes your spending with interactive charts, and then uses **Google Gemini** to either **roast your financial decisions** or **give you a solid budget plan**.

---

## 🎯 Why this project exists

Most personal finance apps are boring. this project is teaching you where your money really goes. 

- File upload + CSV parsing
- Data cleaning & categorization
- Dynamic dashboard with charts
- External AI API orchestration
- Clean, maintainable architecture

---

## 🧑‍💻 User journey

1. **Upload** – Drag & drop your bank CSV file.
2. **See** – Instantly view a breakdown of your spending by category (pie chart, bar graph).
3. **Roast or Advice** – Click one of two buttons:
   - 🔥 **Roast Me** – Gemini tears your spending habits apart with savage humor.
   - 📊 **Better Advice** – Gemini gives a structured, multi-step plan to save 10% more next month.

---

## 🛠️ Tech stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React (Vite), Tailwind CSS, Recharts, Axios |
| Backend     | Node.js, Express                    |
| Database    | MongoDB (Mongoose)                  |
| AI          | Google Gemini API                   |
| File Upload | Multer + csv-parser                 |
| Auth        | (optional) JWT + bcrypt             |

---

## 📁 Project structure
