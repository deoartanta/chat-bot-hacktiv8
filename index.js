import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
// import fs from "fs/promises";


const ai = new GoogleGenAI({});
const app = express();
const upload = multer();

const GEMINI_MODEL = "gemini-3.5-flash";

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.post("/generate-text", async (req, res) => {
    const {prompt}  = req.body;
    // const base64Image = req.file
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });
        res.status(200).json({ generatedText: response.text });
    } catch (e) {
        console.error("Error generating text:", e);
        res.status(500).json({ message: e.message });
    }
});

const handleGenerateFromFile = async (req, res) => {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
        return res.status(400).json({ message: "No file uploaded. Please upload a file." });
    }
    const { prompt } = req.body;
    const base64Data = file.buffer.toString("base64");
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { type: "input_text", text: prompt || "" },
                { inlineData: { data: base64Data, mimeType: file.mimetype } },
            ],
        });
        res.status(200).json({ generatedText: response.text });
    } catch (e) {
        console.error("Error generating content from file:", e);
        res.status(500).json({ message: e.message });
    }
};
app.post("/generate-from-file", upload.any(), handleGenerateFromFile);