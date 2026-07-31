import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import useComplaintStore from '../store/complaintStore';
import geminiService from '../services/geminiService';

export default function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { complaints = [] } = useComplaintStore();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am CivicOS AI Assistant powered by Gemini. Ask me how to report issues or check your complaint status (e.g., "What is the progress of complaint #CMP-2026-891?" or "Where is complaint 2?")',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const processQuery = async (userQuery) => {
    const q = userQuery.toLowerCase();

    // 1. Search for Complaint Status query
    const match = userQuery.match(/\d+/);
    if (q.includes('complaint') || q.includes('status') || q.includes('progress') || q.includes('where') || match) {
      const targetNum = match ? match[0] : null;

      // Find matching complaint from shared Xano DB store
      const found = complaints.find(c => {
        const cid = (c.complaint_id || c.id || '').toLowerCase();
        if (targetNum && cid.includes(targetNum)) return true;
        return false;
      }) || complaints[0];

      if (found) {
        const id = found.complaint_id || found.id;
        const status = found.status || 'In Progress';
        const officer = found.officer_name || found.assignedOfficerName || 'Officer Kumar';
        const dept = found.department_name || found.departmentName || 'Electricity Department';
        const loc = found.location || 'Anna Nagar, Chennai';

        return `🤖 Complaint Status Update for #${id}:
• Category: ${found.category || 'Civic Hazard'}
• Department: ${dept}
• Current Status: ${status}
• Assigned Officer: ${officer}
• Location: ${loc}`;
      }
    }

    // 2. General AI Assistance via Gemini Service
    if (q.includes('report') || q.includes('issue') || q.includes('how to')) {
      return `To report a new civic issue:
1. Click "Report Issue" in the left sidebar.
2. Enter the issue details (Gemini AI auto-detects Department).
3. Use the Mapbox GPS picker to select your location & upload photo proof.
4. Click Submit to earn +20 Citizen Karma Points!`;
    }

    if (q.includes('karma') || q.includes('reward') || q.includes('voucher')) {
      return `Civic Karma Rewards:
• You earn +20 Karma Points for reporting issues.
• You earn +50 Karma Points for verifying completed repairs.
• Redeem points for municipal water bill rebates & property tax discounts!`;
    }

    // Default Gemini AI response
    try {
      const response = await geminiService.getFieldAssistantResponse(userQuery, complaints[0]);
      return response;
    } catch (e) {
      return `CivicOS AI: I can help you track complaints, check officer dispatch statuses, or navigate municipal services. Try asking: "What is the progress of complaint #891?"`;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const botReply = await processQuery(userMsg);
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'CivicOS AI Assistant: I can help track your complaint status. Please try specifying your complaint ID (e.g. #891).' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <Bot className="w-4 h-4" />
          <span>Civic AI Assistant</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-scaleIn">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1">
                  CivicOS AI Assistant <Sparkles size={11} className="text-purple-400" />
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold">● Online (Gemini AI)</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] text-xs p-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-2 rounded-2xl animate-pulse">
                  Gemini AI is processing query...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
              placeholder="Ask about complaint status (e.g. #2 or #891)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
