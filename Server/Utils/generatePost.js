//require("dotenv").config();
const { GoogleGenAI, Type } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function getRandomCategory() {
    let categories = [
        "web development",
        "AI/ML",
        "Frontend Frameworks",
        "backend and databases",
        "productivity and tools",
        "security and best practices",
        "tech News and trends"
    ];
    let randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
}

const systemInstruction =
    'You are an expert tech writer for a technology blog; create a blog post about a trending news event or development in the given category, returning only JSON in this format: {"title":"","description":"","category":"","content":"","tags":[],"imageUrl":""}; the title must be irresistible and concise for a headline, description should be tweet-friendly with urgency or FOMO, content must be engaging SEO-optimized semantic HTML (h1, h2, p, ul, li only—no style/head/body and don’t repeat the title), tags must be relevant SEO keywords, imageUrl must be link to a 600x400 Unsplash landscape representing the topic, and every sentence in the content should hook the reader. 🚀';

async function generatePost() {
    let contents = `write me a blog bost for ${getRandomCategory()} category`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction
        }
    });

    let cleanText = response.text.replace(/```json|```|\*/g, "");
    let formatJson = JSON.parse(cleanText);
    return formatJson;
}

module.exports = generatePost;
