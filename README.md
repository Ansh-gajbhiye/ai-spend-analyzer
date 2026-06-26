# AI Spend Analyzer 

**Live Demo:** [View Application](https://ai-spend-analyzer-95mu9j05j-ansh-s-projects-54e1ec7d.vercel.app/)

AI Spend Analyzer is a full-stack financial dashboard designed to ingest raw bank statements, aggregate financial data, and utilize artificial intelligence to act as a personal financial auditor. It automatically visualizes income/expense flows and flags suspicious or unusual transactions using the Gemini LLM.

![AI Spend Analyzer Dashboard](./dashboard-preview.png)


##  Features
* **Automated Data Parsing:** Upload raw CSV bank statements and automatically convert them into structured MongoDB schemas.
* **Dynamic Dashboard:** Real-time data visualization including Revenue Flow (Bar Charts) and Expense Splits (Donut Charts).
* **AI Financial Auditor:** Integrates with Google's Gemini AI to analyze transaction history, flag unusual spending patterns, and generate targeted, context-aware questions about specific purchases.
* **Secure Authentication:** JWT-based user authentication with encrypted passwords via bcrypt.

##  Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Recharts
* **Backend:** Node.js, Express.js, Multer (File Handling)
* **Database:** MongoDB, Mongoose
* **AI Integration:** Google Generative AI (Gemini 3.5 Flash)
* **Deployment:** Vercel (Client) & Render (Server)

##  Local Installation

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/your-username/ai-spend-analyzer.git
\`\`\`

**2. Setup the Backend**
\`\`\`bash
cd server
npm install
\`\`\`
Create a `.env` file in the `server` directory and add:
\`\`\`env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
\`\`\`
Start the server:
\`\`\`bash
npm start
\`\`\`

**3. Setup the Frontend**
\`\`\`bash
cd ../client
npm install
\`\`\`
Create a `.env` file in the `client` directory and add:
\`\`\`env
VITE_API_URL=http://localhost:3000
\`\`\`
Start the development server:
\`\`\`bash
npm run dev
\`\`\`
