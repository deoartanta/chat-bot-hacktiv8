import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import {handleGenerateText, handleGenerateFromFile, handleApiChat} from "./handler/chatbot-handler.js";
import {handleDataRecipes} from "./handler/data-handler.js";

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.post("/generate-text", handleGenerateText);
app.post("/api/chat", handleApiChat);
app.post("/api/generate-from-file", upload.any(), handleGenerateFromFile);
app.get("/api/recipes", handleDataRecipes);
app.get("/api/config", (req, res) => {
    res.json({ chefName: process.env.CHEF_NAME || "Deo" });
});