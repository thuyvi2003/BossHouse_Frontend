// ChatAIWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, RefreshCw, UploadCloud } from "lucide-react";

// === Dữ liệu offline song ngữ & responses ===
const storeData = {
    pets: [
        { name: "Fluffy", species: { vn: "Mèo", en: "Cat" }, breed: "Persian", gender: { vn: "Cái", en: "Female" }, age: 3, owner: "Alice" },
        { name: "Buddy", species: { vn: "Chó", en: "Dog" }, breed: "Beagle", gender: { vn: "Đực", en: "Male" }, age: 5, owner: "Bob" },
        { name: "Chirpy", species: { vn: "Chim", en: "Bird" }, breed: "Vẹt", gender: { vn: "Cái", en: "Female" }, age: 2, owner: "Carol" },
        { name: "Spike", species: { vn: "Chó", en: "Dog" }, breed: "Bulldog", gender: { vn: "Đực", en: "Male" }, age: 4, owner: "Dave" },
        { name: "Shadow", species: { vn: "Mèo", en: "Cat" }, breed: "Siamese", gender: { vn: "Cái", en: "Female" }, age: 1, owner: "Eve" },
    ],
    services: [
        { name: { vn: "Chăm sóc & Tắm", en: "Grooming" }, description: { vn: "Dịch vụ spa đầy đủ bao gồm tắm, cắt lông, cắt móng và chải lông.", en: "Full spa experience including bath, haircut, nail clipping, and brushing." }, price: 900000, duration_minutes: 45 },
        { name: { vn: "Trông giữ thú cưng", en: "Boarding" }, description: { vn: "Chỗ ở an toàn, thoải mái với chế độ ăn và vận động đầy đủ.", en: "Safe and comfortable stay with meals and exercise." }, price: 2500000, duration_minutes: 1440 },
        { name: { vn: "Khám sức khỏe", en: "Health Check" }, description: { vn: "Khám sức khỏe định kỳ bao gồm cân nặng và các chỉ số sinh tồn.", en: "Routine health checks including weight and vital signs." }, price: 1200000, duration_minutes: 30 },
        { name: { vn: "Tiêm phòng", en: "Vaccination" }, description: { vn: "Tiêm vaccine do bác sĩ thú y có chứng chỉ thực hiện.", en: "Vaccines administered by licensed vets." }, price: 1500000, duration_minutes: 20 },
        { name: { vn: "Tư vấn nhận nuôi", en: "Adoption Consultation" }, description: { vn: "Hướng dẫn quy trình nhận nuôi thú cưng.", en: "Guidance through pet adoption process." }, price: 500000, duration_minutes: 60 },
    ],
    veterinarians: [
        { name: "Alice", specialty: { vn: "Bác sĩ phẫu thuật", en: "Surgery" }, years_experience: 10 },
        { name: "Bob", specialty: { vn: "Bác sĩ da liễu", en: "Dermatology" }, years_experience: 7 },
        { name: "Carol", specialty: { vn: "Bác sĩ nha khoa", en: "Dentistry" }, years_experience: 5 },
        { name: "Dave", specialty: { vn: "Bác sĩ tim mạch", en: "Cardiology" }, years_experience: 8 },
        { name: "Eve", specialty: { vn: "Bác sĩ chăm sóc tổng quát", en: "General Care" }, years_experience: 4 },
    ],
    responses: {
        greeting: { vi: "Xin chào! Tôi là trợ lý ảo BossHouse. Tôi có thể giúp gì cho bạn?", en: "Hello! I am BossHouse virtual assistant. I can help you with pets, services, veterinarians, or booking." },
        introduction: { vi: "🏠 BossHouse là trung tâm chăm sóc thú cưng toàn diện tại TP. Cần Thơ, cung cấp dịch vụ chăm sóc & tắm, trông giữ thú cưng, khám sức khỏe, tiêm phòng và tư vấn nhận nuôi. Chúng tôi cam kết mang lại dịch vụ tốt nhất cho thú cưng của bạn.", en: "🏠 BossHouse is a full-service pet care center in Can Tho City, offering grooming, boarding, health check, vaccination, and adoption consultation. We are committed to providing the best care for your beloved pets." },
        location: { vi: "📍 BossHouse nằm tại Số 600 Đường Nguyễn Văn Cừ (nối dài), P. An Bình, TP. Cần Thơ. Chúng tôi rất mong được đón tiếp bạn!", en: "📍 BossHouse located at 600 Nguyen Van Cu Street (extension), An Binh Ward, Can Tho City. We look forward to welcoming you!" },
        openHours: { vi: "🕗 Giờ mở cửa: 8:00 - 17:00 tất cả các ngày trong tuần.", en: "🕗 Open hours: 8 AM - 5 PM, every day of the week." },
        general: { vi: "Nếu bạn cần bất kỳ thông tin nào về BossHouse hoặc dịch vụ của chúng tôi, hãy hỏi, tôi luôn sẵn sàng hỗ trợ!", en: "If you need any information about BossHouse or our services, just ask, I am always ready to help!" },
    },
};

const detectLang = (text) => {
    // Nếu có ký tự tiếng Việt → vi
    if (/[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i.test(text)) {
        return "vi";
    }
    return "en"; // mặc định
};

const generateOfflineReply = (question) => {
    const qLower = question.toLowerCase().trim();
    const lang = detectLang(qLower);
    const langKey = lang === "vi" ? "vn" : "en";

    // --- Specific service ---
    const service = storeData.services.find(s => qLower.includes(s.name[langKey].toLowerCase()));
    if (service) {
        return `💼 ${service.name[langKey]}: ${service.description[langKey]} (Giá: ${service.price} VND, Thời gian: ${service.duration_minutes} phút)`;
    }

    // --- All services ---
    if (/(các dịch vụ|dịch vụ|services|service)/.test(qLower)) {
        return storeData.services
            .map(s => `💼 ${s.name[langKey]}: ${s.description[langKey]} (Giá: ${s.price} VND, Thời gian: ${s.duration_minutes} phút)`)
            .join("\n");
    }

    // --- Specific veterinarian ---
    const vet = storeData.veterinarians.find(v => qLower.includes(v.name.toLowerCase()));
    if (vet) {
        return `👨‍⚕️ ${vet.name} - ${vet.specialty[langKey]}, ${vet.years_experience} năm kinh nghiệm`;
    }

    // --- All veterinarians ---
    if (/(các bác sĩ|bác sĩ|veterinarians|vet|vets)/.test(qLower)) {
        return storeData.veterinarians
            .map(v => `👨‍⚕️ ${v.name} - ${v.specialty[langKey]}, ${v.years_experience} năm kinh nghiệm`)
            .join("\n");
    }

    // --- Pets ---
    if (/(các thú cưng|thú cưng|pets|pet)/.test(qLower)) {
        return storeData.pets
            .map(p => `🐾 ${p.name} (${p.species[langKey]}, ${p.breed}, ${p.gender[langKey]}, ${p.age} tuổi) - Owner: ${p.owner}`)
            .join("\n");
    }

    // --- Greeting ---
    if (/\b(hi|hello|xin chào|chào)\b/.test(qLower)) return storeData.responses.greeting[lang];

    // --- Introduction ---
    if (/(giới thiệu|about|về cửa hàng|introduction)/.test(qLower)) return storeData.responses.introduction[lang];

    // --- Location ---
    if (/(cửa hàng|shop|bosshouse).*(ở đâu|where)|(ở đâu|where).*(cửa hàng|shop|bosshouse)|địa chỉ|address|vị trí cửa hàng/.test(qLower))
        return storeData.responses.location[lang];

    // --- Open hours ---
    if (/\b(giờ mở cửa|thời gian hoạt động|open|closing)\b/.test(qLower)) return storeData.responses.openHours[lang];

    // --- General info ---
    if (/(thông tin|info|general|tư vấn)/.test(qLower)) return storeData.responses.general[lang];

    // --- Fallback ---
    return lang === "vi"
        ? "Xin lỗi, tôi không thể trả lời câu hỏi này ngoài các chủ đề về BossHouse. Hãy hỏi lại về những chủ đề này nhé!"
        : "Sorry, I cannot answer questions outside topics about BossHouse. Please ask again about these topics!";
};

// --- Component ---
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

    const handleSend = () => {
        if (!input.trim() && images.length === 0) return;

        const userMessage = {
            sender: "user",
            text: input || (images.length ? images.map(f => `[Image] ${f.name}`).join(", ") : "")
        };
        setMessages(prev => [...prev, userMessage]);

        const reply = generateOfflineReply(input);
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
                            {/* {images.length === 0 && (
                                <label className="flex items-center justify-center w-10 h-10 bg-[#CEAF95] border border-[#6B1700] rounded-full hover:bg-[#d1c4a1] cursor-pointer mt-1">
                                    <UploadCloud className="w-5 h-5 text-[#6B1700]" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )} */}
                            <button onClick={handleSend} className="px-4 py-2 bg-[#6B1700] text-white rounded-xl hover:bg-[#8C2200]">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
