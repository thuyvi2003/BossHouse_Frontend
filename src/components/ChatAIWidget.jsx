import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, RefreshCw, UploadCloud } from "lucide-react";
import { sendChatQuestion } from "../services/chatbotService";

export default function ChatAIWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [images, setImages] = useState([]);
    const chatBoxRef = useRef(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setImages(prev => [...prev, ...files]);
    };

    const handleRemoveImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

    const handleSend = async () => {
        if (!input.trim() && images.length === 0) return;

        const userMessage = {
            sender: "user",
            text: input || (images.length ? images.map(f => `[Image] ${f.name}`).join(", ") : "")
        };
        setMessages(prev => [...prev, userMessage]);

        // --- Gọi backend chatbot ---
        let reply = "";
        if (input.trim()) {
            reply = await sendChatQuestion(input, "vi"); // mặc định vi
        } else if (images.length) {
            reply = `Bạn vừa gửi ${images.length} hình ảnh. Hiện chatbot chưa xử lý ảnh trực tiếp.`;
        }

        setMessages(prev => [...prev, { sender: "bot", text: reply }]);
        setInput("");
        setImages([]);
    };

    useEffect(() => {
        if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, [messages]);

    const handleReset = () => {
        setMessages([]);
        setInput("");
        setImages([]);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {!open && (
                <button onClick={() => setOpen(true)} className="p-4 bg-[#6B1700] text-white rounded-full shadow-lg hover:bg-[#8C2200] transition">
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {open && (
                <div className="w-96 h-[500px] bg-[#FFF1D2] border border-[#CEAF95] rounded-2xl shadow-xl flex flex-col p-3">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-[#6B1700]">BossHouse Assistant</h3>
                        <div className="flex gap-2">
                            <button onClick={handleReset} className="p-1 bg-[#CEAF95] rounded-full hover:bg-[#d1c4a1]" title="Reset">
                                <RefreshCw className="w-5 h-5 text-[#6B1700]" />
                            </button>
                            <button onClick={() => setOpen(false)} className="p-1 bg-[#6B1700] text-white rounded-full hover:bg-[#8C2200]" title="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat box */}
                    <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-3 bg-white rounded-lg border border-[#CEAF95] flex flex-col gap-2">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`px-3 py-2 rounded-xl break-words max-w-[80%] ${msg.sender === "user" ? "bg-[#FEE9CC] self-end text-right" : "bg-[#E5D3B3] self-start text-left"}`} style={{ whiteSpace: "pre-wrap" }}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input & Image Upload */}
                    <div className="mt-3 flex flex-col gap-2">
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative w-20 h-20 border border-[#CEAF95] rounded-lg overflow-hidden">
                                        <img src={URL.createObjectURL(img)} alt={img.name} className="w-full h-full object-cover" />
                                        <button onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">×</button>
                                    </div>
                                ))}
                                <label className="flex items-center justify-center w-20 h-20 border border-dashed border-[#CEAF95] rounded-lg cursor-pointer hover:bg-[#f0e5d9]">
                                    <span className="text-2xl text-[#6B1700]">+</span>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                </label>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 p-2 rounded-xl border border-[#CEAF95] focus:outline-none bg-white"
                            />
                            <button onClick={handleSend} className="px-4 py-2 bg-[#6B1700] text-white rounded-xl hover:bg-[#8C2200]">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
