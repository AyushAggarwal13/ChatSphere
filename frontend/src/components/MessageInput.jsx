import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

export default function MessageInput({ selectedChat, setMessages }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState(null);
  const typingRef = useRef(false);
  const lastTypingTimeRef = useRef(null);
  const me = JSON.parse(localStorage.getItem('user') || '{}');

  const sendMessage = async () => {
    if (!text.trim() && !file) return;
    try {
      let attachments = [];
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await api.post('/messages/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (uploadRes?.data?.url) attachments.push({ url: uploadRes.data.url, mimetype: uploadRes.data.mimetype });
      }

      const res = await api.post('/messages', { content: text, chatId: selectedChat._id, attachments });
      setMessages(prev => [...prev, res.data]);
      socket.emit('new message', res.data);
      setText('');
      setFile(null);
      setShowEmoji(false);
      socket.emit('stop typing', selectedChat._id);
      typingRef.current = false;
    } catch (err) { console.error(err); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket.connected) return;
    if (!typingRef.current) {
      typingRef.current = true;
      socket.emit('typing', selectedChat._id);
    }
    lastTypingTimeRef.current = new Date().getTime();
    setTimeout(() => {
      const diff = new Date().getTime() - lastTypingTimeRef.current;
      if (diff >= 3000 && typingRef.current) {
        socket.emit('stop typing', selectedChat._id);
        typingRef.current = false;
      }
    }, 3000);
  };

  useEffect(() => { setText(''); setFile(null); setShowEmoji(false); }, [selectedChat]);

  return (
    <div className="p-3 border-t bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <label className="p-2 bg-gray-100 rounded cursor-pointer">
          📎
          <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </label>

        <div className="flex-1 relative">
          <input value={text} onChange={handleTyping} className="w-full p-2 border rounded pr-28" placeholder="Type a message..." />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button onClick={() => setShowEmoji(v => !v)} className="p-1">😊</button>
            <button onClick={sendMessage} className="bg-green-600 text-white px-3 py-1 rounded">Send</button>
          </div>

          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-50">
              <Picker onSelect={emoji => setText(t => t + emoji.native)} />
            </div>
          )}
        </div>
      </div>
      {file && <div className="mt-2 text-sm text-gray-600">Selected: {file.name}</div>}
    </div>
  );
}
