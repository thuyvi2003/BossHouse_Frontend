import API_BASE_URL from "@/config/api";
import axios from "axios";

// Gửi câu hỏi đến chatbot backend
export const sendChatQuestion = async (question, lang = "vi") => {
    try {
        const res = await axios.post(`${API_BASE_URL}/chatbot/query`, { question, lang });
        return res.data.reply;
    } catch (err) {
        console.error("Chat service error:", err.response?.data || err.message);
        return "Đã có lỗi xảy ra khi gửi câu hỏi.";
    }
};
