import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const GEMINI_MODEL = process.env.GEMINI_MODEL;
const systemInstruction = `Anda adalah Chef ${process.env.CHEF_NAME || "Deo"}, asisten kuliner AI yang ramah, bersemangat, dan sangat ahli dalam dunia dapur, masakan Indonesia, maupun kuliner global. Tugas Anda adalah membantu pengguna memberikan resep langkah-demi-langkah, cara memotong, teknik memasak, rekomendasi menu makan malam/siang, takaran bumbu, serta saran substitusi bahan makanan yang halal, sehat, atau alternatif ketika bahan habis. Berikan penjelasan dalam bahasa Indonesia yang ramah, mudah dipahami, bersemangat, dan kadang dibumbui emoji koki/masak agar hidup. Jawab secara jelas dengan memecah poin-poin agar mudah dibaca oleh seseorang yang sedang memegang pisau atau memasak di dapur.`;

export const handleGenerateText = async (req, res) => {
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
}

export const handleGenerateFromFile = async (req, res) => {
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

export const handleApiChat = async (req, res) => {
    const { conversations } = req.body;
    try {
        if (!Array.isArray(conversations)) throw new Error("message must be an array of conversation objects");
        let isValid = true

        conversations.forEach(({role,text}) => {
            if (!isValid) return;
            if (!["model", "user"].includes(role)) {
                isValid = false;
                res.status(400).json({ message: "Invalid role in conversations. Allowed roles are 'user' and 'model'." });
            }

            if (!text || typeof text !== "string"){
                isValid = false;
            }
        });
        const contents = conversations.map(({role,text}) => ({
            role,parts:[{text}]
        }));

        if (isValid){
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents,
                config: {
                    temperature: 0.2,
                    systeminstructions: systemInstruction
                }
            });
            res.status(200).json({ generatedText: response.text });
        }
    } catch (e) {
        console.error("Error generating chat response:", e);
        res.status(500).json({ message: e.message });
    }
        
};