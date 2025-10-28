// services/chatAIService.js
const API_KEY = "AIzaSyDv6sL4HSQ6uvlPHq8bfoESihK2g0kzJYo"; // khóa từ JSP bạn dán
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const chatAIService = {
  async sendMessage(message) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    if (!res.ok) throw new Error("Failed to get AI response");
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi chưa hiểu câu hỏi của bạn.";
    return reply;
  },
};

export default chatAIService;
