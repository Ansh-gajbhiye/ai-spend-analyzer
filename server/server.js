import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import jwt from "jsonwebtoken";
import authMiddleware from "./middleware/auth.js";


dotenv.config();

const app = express();
const port = 3000;


app.use(express.json()); 
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log(" MongoDB Connected!"))
.catch((err)=> console.error(" MongoDB Connection Error:", err))

// --- register route  ---
app.post("/api/register",async (req, res)=>{
try {
    const {email, password} =req.body;
    //Check if user exists
    const existingUser = await User.findOne({email : email});
    if(existingUser){
        return res.status(400).json({error: "email already in use"})
    }
    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save the new user
    const newUser = new User({ 
      email: email, 
      password: hashedPassword 
    });
    await newUser.save();

  // Send a simple success message (NO token here)
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// --- login route  ---
app.post("/api/login", async (req, res)=>{
    try {
        const {email, password} =req.body;
        // Check the Guest List
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({error:"User not found"})};
        // Verify the Password 
        const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password." });
    } 
    // Print the VIP Wristband
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );
    //Send a res.json() back to the user
    res.json({ 
      message: "Logged in successfully!", 
      token: token, 
      userId: user._id 
    });
    
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login." });
        
    }
})
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

//authMiddleware
app.post('/api/upload', authMiddleware, upload.single('statement'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Delete the temporary file
            fs.unlinkSync(req.file.path);
            
            try {
   
            const formattedTransactions = results.map((row) => {
                return {
                    userId: req.user.id,
                    date: row.Date || row.date, 
                    description: row.Description || row.description || row.Narration, 
                    amount: Number(row.Amount || row.amount) 
                };
            });

           
            await Transaction.insertMany(formattedTransactions);

           
            res.json({ 
                message: 'Success! Transactions securely saved to your account.', 
                count: formattedTransactions.length 
            });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to save transactions to database." });
            }
        });
});

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