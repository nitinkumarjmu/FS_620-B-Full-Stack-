import { useState, useEffect, useRef } from 'react';

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Simulated WebSocket using polling (since Socket.io isn't available)
  useEffect(() => {
    if (joined) {
      // Simulate connection
      const ws = {
        connected: true,
        emit: (event, data) => {
          if (event === 'sendMessage') {
            const newMsg = {
              user: username,
              text: data,
              time: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, newMsg]);
          }
        }
      };
      setSocket(ws);
      
      // Add join message
      setMessages(prev => [...prev, {
        user: 'System',
        text: `${username} joined the chat`,
        time: new Date().toLocaleTimeString()
      }]);
    }
  }, [joined, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setJoined(true);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit('sendMessage', input);
      setInput('');
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">Real-Time Chat</h1>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[600px] flex flex-col">
        <div className="bg-blue-500 text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold text-center">Real-Time Chat</h1>
          <p className="text-center text-sm mt-1">{username}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`${msg.user === 'System' ? 'text-center' : ''}`}>
              {msg.user === 'System' ? (
                <p className="text-gray-500 text-sm italic">{msg.text}</p>
              ) : (
                <div className={`${msg.user === username ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.user === username 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-300'
                  }`}>
                    <p className="font-semibold text-sm">{msg.user}</p>
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-75 mt-1">{msg.time}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded transition"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
