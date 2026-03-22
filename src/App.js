import React, { useState, useEffect, useRef } from "react";

/**
 * VOICE EXPENSE TRACKER - PWA READY
 * Zero-dependency version (using Inline SVGs for icons)
 */

// Custom Inline SVG Icons to replace lucide-react dependencies
const Icons = {
  Mic: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  ),
  MicOff: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Trash2: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  ),
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  Share: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  ),
};

const CATEGORIES = {
  food: [
    "food",
    "lunch",
    "dinner",
    "breakfast",
    "restaurant",
    "cafe",
    "grocery",
    "starbucks",
    "mcdonalds",
    "pizza",
    "burger",
  ],
  transport: [
    "uber",
    "taxi",
    "fuel",
    "gas",
    "train",
    "bus",
    "flight",
    "parking",
    "ola",
    "lift",
    "metro",
  ],
  bills: [
    "rent",
    "electricity",
    "water",
    "internet",
    "subscription",
    "netflix",
    "spotify",
    "phone",
    "recharge",
  ],
  shopping: [
    "amazon",
    "clothes",
    "shoes",
    "electronics",
    "mall",
    "zara",
    "h&m",
  ],
  health: ["gym", "medicine", "doctor", "pharmacy", "hospital"],
  other: [],
};

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Load local data safely
    try {
      const saved = localStorage.getItem("voice_expenses");
      if (saved) setExpenses(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load expenses from localStorage", e);
    }

    // Initialize Web Speech API with safety check
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          if (event.results && event.results[0]) {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            processVoiceInput(text);
          }
        };

        recognitionRef.current.onend = () => setIsRecording(false);
        recognitionRef.current.onerror = (event) => {
          console.error("Speech Recognition Error:", event.error);
          setFeedback(`Error: ${event.error}`);
          setIsRecording(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("voice_expenses", JSON.stringify(expenses));
  }, [expenses]);

  const processVoiceInput = (text) => {
    if (!text) return;
    const amountMatch = text.match(/\d+/);

    if (!amountMatch) {
      setFeedback("Missing amount! Try 'Uber 400'");
      return;
    }

    const amount = parseFloat(amountMatch[0]);
    const description = text.replace(amountMatch[0], "").trim();

    let category = "other";
    for (const [cat, keywords] of Object.entries(CATEGORIES)) {
      if (keywords.some((k) => description.toLowerCase().includes(k))) {
        category = cat;
        break;
      }
    }

    const newExpense = {
      id: Date.now(),
      description: description || "New Expense",
      amount,
      category,
      date: currentDate.toISOString().split("T")[0],
      timestamp: new Date().getTime(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setFeedback(`Saved to ${category}!`);
    setTimeout(() => setFeedback(""), 3000);
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setFeedback("Mic not supported on this browser.");
      return;
    }
    setTranscript("");
    setFeedback("Listening...");
    setIsRecording(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Start recording failed", e);
      setIsRecording(false);
    }
  };

  const deleteExpense = (id) => {
    if (window.confirm("Delete this entry?")) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const changeDate = (days) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    if (navigator.share) {
      navigator
        .share({
          title: "My Expenses JSON",
          text: dataStr,
        })
        .catch(console.error);
    } else {
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute(
        "download",
        `expenses_${new Date().toISOString().split("T")[0]}.json`
      );
      linkElement.click();
    }
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const filteredExpenses = expenses.filter(
    (e) => e.date === currentDate.toISOString().split("T")[0]
  );
  const totalDay = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans overflow-hidden select-none">
      {/* TOP SECTION: Recording (Black) */}
      <div className="flex-[0.8] bg-neutral-900 flex flex-col items-center justify-center p-6 text-white relative">
        <div className="absolute top-10 left-6 right-6 flex justify-between items-center opacity-70">
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 text-xs border border-white/20 rounded-full px-4 py-2 hover:bg-white/10 active:bg-white/20"
          >
            <Icons.Share /> Sync/Share
          </button>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-teal-400">
            Voice Wallet
          </div>
        </div>

        <div className="text-center mb-6 px-4">
          <p className="text-neutral-500 text-[10px] mb-2 uppercase tracking-widest font-bold">
            Say "Target 50" or "Taxi 20"
          </p>
          <h2 className="text-lg font-medium h-12 flex items-center justify-center leading-tight">
            {isRecording ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                Listening...
              </span>
            ) : (
              transcript || "Ready to record"
            )}
          </h2>
        </div>

        <button
          onClick={
            isRecording ? () => recognitionRef.current.stop() : startRecording
          }
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
            isRecording
              ? "bg-red-500 scale-110"
              : "bg-white text-black active:scale-90"
          }`}
        >
          {isRecording ? <Icons.MicOff /> : <Icons.Mic />}
        </button>

        {feedback && (
          <div className="absolute bottom-10 bg-teal-500 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg animate-fade-in">
            {feedback}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Expenses (White) */}
      <div className="flex-1 bg-white rounded-t-[40px] -mt-10 p-8 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.2)] overflow-hidden border-t border-gray-100">
        {/* Date Selector */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => changeDate(-1)}
            className="p-3 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <Icons.ChevronLeft />
          </button>
          <div className="text-center">
            <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">
              {formattedDate}
            </h3>
            <div className="inline-block px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-full mt-2 uppercase tracking-widest">
              Total: ${totalDay.toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-3 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <Icons.ChevronRight />
          </button>
        </div>

        {/* Expense List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-20 custom-scrollbar">
          {filteredExpenses.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-200 opacity-50">
              <Icons.Plus />
              <p className="text-xs uppercase font-bold tracking-tighter mt-2">
                Zero Transactions
              </p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-[24px] border border-gray-100/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                      expense.category === "food"
                        ? "bg-orange-50 text-orange-500"
                        : expense.category === "transport"
                        ? "bg-blue-50 text-blue-500"
                        : expense.category === "bills"
                        ? "bg-purple-50 text-purple-500"
                        : expense.category === "shopping"
                        ? "bg-pink-50 text-pink-500"
                        : expense.category === "health"
                        ? "bg-emerald-50 text-emerald-500"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {expense.category === "food"
                      ? "🥗"
                      : expense.category === "transport"
                      ? "🚕"
                      : expense.category === "bills"
                      ? "💳"
                      : expense.category === "shopping"
                      ? "🛍️"
                      : expense.category === "health"
                      ? "💊"
                      : "💰"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 capitalize text-sm">
                      {expense.description}
                    </h4>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {expense.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-base text-gray-900 tracking-tighter">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-2 text-gray-200 hover:text-red-400 transition-colors"
                  >
                    <Icons.Trash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
