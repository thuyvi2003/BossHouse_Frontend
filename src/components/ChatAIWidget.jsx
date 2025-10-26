// ChatAIWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";

// === Dữ liệu offline từ safe-seed.js ===
const storeData = {
    users: [
        { email: "alice@test.com", name: "Alice" },
        { email: "bob@test.com", name: "Bob" },
        { email: "carol@test.com", name: "Carol" },
        { email: "dave@test.com", name: "Dave" },
        { email: "eve@test.com", name: "Eve" },
    ],
    pets: [
        { name: "Fluffy", species: "Cat", breed: "Persian", gender: "female", age: 3, owner: "Alice" },
        { name: "Buddy", species: "Dog", breed: "Beagle", gender: "male", age: 5, owner: "Bob" },
        { name: "Chirpy", species: "Bird", breed: "Parrot", gender: "female", age: 2, owner: "Carol" },
        { name: "Spike", species: "Dog", breed: "Bulldog", gender: "male", age: 4, owner: "Dave" },
        { name: "Shadow", species: "Cat", breed: "Siamese", gender: "female", age: 1, owner: "Eve" },
    ],
    services: [
        { name: "Grooming", description: "Full spa experience including bath, haircut, nail clipping, and brushing.", price: 40, duration_minutes: 45 },
        { name: "Boarding", description: "Safe and comfortable stay with meals and exercise.", price: 100, duration_minutes: 1440 },
        { name: "Health Check", description: "Routine health checks including weight and vital signs.", price: 50, duration_minutes: 30 },
        { name: "Vaccination", description: "Vaccines administered by licensed vets.", price: 60, duration_minutes: 20 },
        { name: "Adoption Consultation", description: "Guidance through pet adoption process.", price: 20, duration_minutes: 60 },
    ],
    veterinarians: [
        { name: "Alice", specialty: "Surgery", years_experience: 10 },
        { name: "Bob", specialty: "Dermatology", years_experience: 7 },
        { name: "Carol", specialty: "Dentistry", years_experience: 5 },
        { name: "Dave", specialty: "Cardiology", years_experience: 8 },
        { name: "Eve", specialty: "General Care", years_experience: 4 },
    ],
    bookings: [
        { pet: "Fluffy", user: "Alice", service: "Health Check", vet: "Alice", note: "First checkup" },
        { pet: "Buddy", user: "Bob", service: "Grooming", vet: "Bob", note: "Grooming appointment" },
        { pet: "Chirpy", user: "Carol", service: "Vaccination", vet: "Carol", note: "Vaccination day" },
        { pet: "Spike", user: "Dave", service: "Boarding", vet: "Dave", note: "Boarding for holiday" },
        { pet: "Shadow", user: "Eve", service: "Adoption Consultation", vet: "Eve", note: "Adoption consultation" },
    ],
};

export default function ChatAIWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatBoxRef = useRef(null);

    // === API Gemini ===
    const API_KEY = "AIzaSyCEWn840fjxZfsv43cdnAl_gPTNj9eOw0I"; // Thay bằng API key thật
    const API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        API_KEY;

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const isVietnamese = (text) => {
        const vietnameseRegex = /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểế]/;
        return vietnameseRegex.test(text);
    };

    // === Offline AI response ===
    const generateOfflineReply = (question) => {
        const lang = isVietnamese(question) ? "Vietnamese" : "English";
        const qLower = question.toLowerCase();

        // === Introduction / About BossHouse ===
        const introKeywords = ["bosshouse", "giới thiệu", "về bosshouse"];
        if (introKeywords.some(kw => qLower.includes(kw))) {
            return lang === "Vietnamese"
                ? "BossHouse là cửa hàng thú cưng chuyên cung cấp sản phẩm, dịch vụ chăm sóc, khám bệnh và tư vấn nhận nuôi thú cưng."
                : "BossHouse is a pet store offering products, grooming, health check, and adoption consultation services.";
        }

        // === Services ===
        // 1. Cụ thể
        const matchedServices = storeData.services.filter(s => qLower.includes(s.name.toLowerCase()));
        if (matchedServices.length > 0) {
            return matchedServices
                .map(s =>
                    `${lang === "Vietnamese" ? "Dịch vụ" : "Service"}: ${s.name}, ${s.description}, ${lang === "Vietnamese" ? "Giá" : "Price"}: $${s.price}, ${s.duration_minutes} phút`
                )
                .join("<br>");
        }
        // 2. Chung
        const serviceKeywords = ["dịch vụ", "service"];
        if (serviceKeywords.some(kw => qLower.includes(kw))) {
            return lang === "Vietnamese"
                ? "BossHouse cung cấp nhiều dịch vụ cho thú cưng, bao gồm Grooming, Boarding, Health Check, Vaccination và Adoption Consultation."
                : "BossHouse offers a variety of pet services, including Grooming, Boarding, Health Check, Vaccination, and Adoption Consultation.";
        }

        // === Pets ===
        const petKeywords = ["thú cưng", "pet"];
        const matchedPets = storeData.pets.filter(p =>
            qLower.includes(p.name.toLowerCase()) || petKeywords.some(kw => qLower.includes(kw))
        );
        if (matchedPets.length > 0) {
            const listKeywords = ["danh sách thú cưng", "các thú cưng hiện có", "list pets"];
            if (listKeywords.some(kw => qLower.includes(kw))) {
                const listPets = storeData.pets
                    .map(p => `${p.name} (${p.species}, ${p.breed}, ${p.gender}, ${p.age} tuổi, chủ: ${p.owner})`)
                    .join("<br>");
                return lang === "Vietnamese" ? `Các thú cưng hiện có:<br>${listPets}` : `Current pets:<br>${listPets}`;
            }

            return matchedPets
                .map(p =>
                    `${lang === "Vietnamese" ? "Thông tin về thú cưng" : "Pet info"}: ${p.name}, ${p.species}, ${p.breed}, ${p.gender}, ${p.age} tuổi, chủ sở hữu: ${p.owner}`
                )
                .join("<br>");
        }

        // === Veterinarians ===
        // 1. Danh sách
        const vetListRegex = /(bác sĩ|bác sĩ thú y|veterinarian).*(hiện có|có trong cửa hàng|list|danh sách)/i;
        if (vetListRegex.test(question)) {
            const listVets = storeData.veterinarians
                .map(v => `${v.name} (${v.specialty}, ${v.years_experience} năm kinh nghiệm)`)
                .join("<br>");
            return lang === "Vietnamese"
                ? `Các bác sĩ thú y hiện có:<br>${listVets}`
                : `Current veterinarians:<br>${listVets}`;
        }
        // 2. Cụ thể
        const matchedVets = storeData.veterinarians.filter(v => qLower.includes(v.name.toLowerCase()));
        if (matchedVets.length > 0) {
            return matchedVets
                .map(v => `${lang === "Vietnamese" ? "Bác sĩ thú y" : "Veterinarian"}: ${v.name}, ${v.specialty}, ${v.years_experience} năm kinh nghiệm`)
                .join("<br>");
        }

        // === Bookings ===
        const bookingKeywords = ["booking", "đặt lịch", "appointment"];
        const matchedBookings = storeData.bookings.filter(b =>
            qLower.includes(b.pet.toLowerCase()) ||
            qLower.includes(b.user.toLowerCase()) ||
            qLower.includes(b.service.toLowerCase()) ||
            bookingKeywords.some(kw => qLower.includes(kw))
        );
        if (matchedBookings.length > 0) {
            return matchedBookings
                .map(b =>
                    `${lang === "Vietnamese" ? "Booking" : "Booking"}: Pet ${b.pet}, User ${b.user}, Service ${b.service}, Vet ${b.vet}, Note: ${b.note}`
                )
                .join("<br>");
        }

        // === Greetings ===
        const greetings = ["hello", "hi", "xin chào", "chào"];
        if (greetings.some(g => qLower.includes(g))) {
            return lang === "Vietnamese"
                ? "Xin chào! Tôi là trợ lý ảo của BossHouse. Tôi có thể giúp gì cho bạn?"
                : "Hi! I'm BossHouse's virtual assistant. How can I help you?";
        }

        // === Fallback ===
        return null;
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        const offlineReply = generateOfflineReply(input);
        if (offlineReply) {
            setMessages((prev) => [...prev, { role: "bot", text: offlineReply }]);
            setLoading(false);
            return;
        }

        try {
            const prompt = `You are BossHouse virtual assistant. Answer in the same language as user input. User asked: "${input}"`;
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });
            const data = await response.json();
            const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I cannot answer this question.";
            setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { role: "bot", text: "An error occurred. Please try again!" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMarkdown = (text) =>
        text?.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/\n/g, "<br>") || "";

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-[#6B1700] text-[#FFF1D2] p-4 rounded-full shadow-lg hover:bg-[#CEAF95] hover:text-[#6B1700] transition"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 w-[350px] bg-[#FFF1D2] border border-[#CEAF95] rounded-xl shadow-md flex flex-col p-3 min-h-[250px] max-h-[600px]"
                    style={{ fontFamily: "Open Sans, sans-serif", color: "#6B1700" }}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg">Chat with AI</h3>
                        <button onClick={() => setIsOpen(false)} className="text-[#6B1700] hover:text-[#CEAF95]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div
                        ref={chatBoxRef}
                        className="flex-1 overflow-y-auto p-2 bg-white rounded-lg border border-[#CEAF95] min-h-[100px] max-h-[400px] flex flex-col"
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`my-2 px-3 py-2 rounded-xl break-words ${msg.role === "user"
                                    ? "bg-[#6B1700] text-[#FFF1D2] self-end" // bỏ text-right
                                    : "bg-[#CEAF95] text-[#6B1700] self-start"
                                    }`}
                                style={{
                                    maxWidth: msg.role === "user" ? "60%" : "80%",
                                    wordWrap: "break-word",
                                    whiteSpace: "pre-wrap",
                                    textAlign: msg.role === "user" ? "left" : "left" // chữ luôn wrap về bên trái
                                }}
                                dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
                            />
                        ))}
                        {loading && (
                            <div className="bg-[#CEAF95] text-[#6B1700] px-3 py-2 rounded-xl w-fit my-2">...</div>
                        )}
                    </div>
                    <div className="flex mt-3">
                        <textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);

                                // co dãn chiều cao
                                e.target.style.height = "auto";
                                e.target.style.height = e.target.scrollHeight + "px";
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 border border-[#CEAF95] rounded-xl px-3 py-2 focus:outline-none resize-none overflow-hidden text-sm"
                            rows={1}
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-2 bg-[#6B1700] text-[#FFF1D2] px-4 py-2 rounded-xl hover:bg-[#CEAF95] hover:text-[#6B1700]"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
