import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "./models/User";
import Transaction from "./models/Transaction";


dotenv.config();

const app = express();
const port = 3000;


app.use(express.json()); 
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log(" MongoDB Connected!"))
.catch((err)=> console.error(" MongoDB Connection Error:", err))

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('statement'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            fs.unlinkSync(req.file.path);
            res.json({ message: 'Success', data: results });
        });
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { transactions } = req.body; 

        if (!transactions || transactions.length === 0) {
            return res.status(400).json({ error: "No data provided to analyze." });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

        const prompt = `
            You are a ruthless, highly observant financial auditor. 
            Review the following JSON list of bank transactions. 
            Identify the 3 most suspicious, unusually large, or questionable transactions that require the user to provide context.
            
            Return your response STRICTLY as a JSON array of objects. 
            Do NOT include markdown formatting, backticks, or any conversational text. 
            Only return the raw JSON array using this exact structure:
            [
              {
                "date": "transaction date",
                "description": "transaction description",
                "amount": "amount",
                "question": "A direct, slightly judgmental question asking why they spent this money."
              }
            ]

            Here is the transaction data:
            ${JSON.stringify(transactions)}
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        const cleanJSON = JSON.parse(aiResponse);

        res.json({ analysis: cleanJSON });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "The AI failed to analyze the data." });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});