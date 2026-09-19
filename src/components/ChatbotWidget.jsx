import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MessageCircle, Send, X } from 'lucide-react';


const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/chat`;

const quickReplies = [
  'What products are available?',
  'What is the price of the Blue Floral Cotton Kurti?',
  'Which sizes are available?',
  'How can I place an order?',
];

const welcomeMessage = {
  from: 'bot',
  text: 'Hi! I am the ManuStore AI assistant. Ask me about products, prices, stock, sizes, delivery, or orders.',
  status: 'welcome',
};


export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const openNewChat = () => {
    setMessages([welcomeMessage]);
    setInput('');
    setIsTyping(false);
    setOpen(true);
  };

  const toggleChat = () => {
    if (open) {
      setOpen(false);
      return;
    }
    openNewChat();
  };

  const sendMessage = async (messageText = input) => {
    const prompt = messageText.trim();
    if (!prompt || isTyping) return;

    setMessages((previous) => [
      ...previous,
      { from: 'user', text: prompt },
    ]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.detail || 'The chatbot request failed.');
      }

      const data = await response.json();
      setMessages((previous) => [
        ...previous,
        {
          from: 'bot',
          text: data.answer,
          status: data.status,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          from: 'bot',
          text: 'I could not connect to the ManuStore assistant. Please make sure the backend is running and try again.',
          status: 'error',
        },
      ]);
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-4 flex h-[520px] min-h-0 w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-[#eadbc7] bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-[#5b1f2d] px-5 py-4 text-white">
            <div>
              <h2 className="font-bold">ManuStore AI</h2>
              <p className="text-xs text-white/75">RAG shopping assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </header>

          <div
            className="min-h-0 flex-1 space-y-3 overflow-y-scroll bg-[#fffaf5] p-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#5b1f2d #f7ebd7',
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.from === 'user'
                      ? 'rounded-br-md bg-[#5b1f2d] text-white'
                      : 'rounded-bl-md border border-[#eadbc7] bg-white text-[#463535]'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-[#eadbc7] bg-white px-4 py-3 text-sm text-[#6b5757]">
                  <LoaderCircle size={16} className="animate-spin" />
                  Searching ManuStore...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#eadbc7] bg-white p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  disabled={isTyping}
                  onClick={() => sendMessage(reply)}
                  className="shrink-0 rounded-full border border-[#d8c3b5] bg-[#fffdfb] px-3 py-1.5 text-xs font-medium text-[#5b1f2d] disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about ManuStore..."
                disabled={isTyping}
                className="min-w-0 flex-1 rounded-full border border-[#d8c3b5] bg-[#fffdfb] px-4 py-2.5 text-sm outline-none focus:border-[#5b1f2d]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5b1f2d] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={toggleChat}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5b1f2d] text-white shadow-xl transition hover:scale-105"
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
      </button>
    </div>
  );
}
