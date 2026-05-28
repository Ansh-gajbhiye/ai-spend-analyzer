import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs"; // Built-in Node tool to open files
import csvParser from "csv-parser"; // The CSV reader you installed

const app = express();
const port = 3000;

app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('statement'), (req, res) => {
    // 1. Check if a file actually arrived
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    const results = [];
    const filePath = req.file.path; // Where Multer saved the file

    // 2. Open the file and read it row by row
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
            // Push each row of the CSV into our results array
            results.push(data);
        })
        .on('end', () => {
            // 3. Delete the file from the uploads folder to keep your laptop clean
            fs.unlinkSync(filePath);

            // 4. Send the FULL array back to React
            res.json({
                message: 'file uploaded u mf',
                data: results 
            });
        })
        .on('error', (error) => {
            console.error("Error reading CSV:", error);
            res.status(500).json({ error: "Failed to read the file" });
        });
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});