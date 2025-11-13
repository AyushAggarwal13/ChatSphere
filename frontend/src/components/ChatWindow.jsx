import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import MessageInput from './MessageInput';
import { socket } from '../services/socket';

export default function ChatWindow({ selectedChat, setSelectedChat, refreshChats }) {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(false);
  const me = JSON.parse(localStorage.getItem('user') || '{}');
  const messagesEndRef = useRef();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;
    (async () => {
      try {
        const res = await api.get(`/messages/${selectedChat._id}`);
        setMessages(res.data);
        socket.emit('join chat', selectedChat._id);
      } catch (err) { console.error(err); }
    })();
  }, [selectedChat]);

  useEffect(() => {
    const handler = (message) => {
      const chatId = message.chat?._id || message.chat;
      if (selectedChat && chatId === selectedChat._id) {
        setMessages(prev => [...prev, message]);
        // play notification only if message is from others
        if (message.sender._id !== (me.id || me._id)) {
          try { audioRef.current?.play(); } catch(e) {}
        }
      } else {
        refreshChats && (async ()=> {
          const res = await api.get('/chats');
          refreshChats(res.data);
        })();
      }
    };
    const typingHandler = (chatId) => { if (selectedChat && chatId === selectedChat._id) setTypingUser(true); };
    const stopTypingHandler = (chatId) => { if (selectedChat && chatId === selectedChat._id) setTypingUser(false); };

    socket.on('message received', handler);
    socket.on('typing', typingHandler);
    socket.on('stop typing', stopTypingHandler);

    return () => {
      socket.off('message received', handler);
      socket.off('typing', typingHandler);
      socket.off('stop typing', stopTypingHandler);
    };
  }, [selectedChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUser]);

  if (!selectedChat) return <div className="h-full flex items-center justify-center text-gray-400">Select a chat to start messaging</div>;

  return (
    <div className="h-full flex flex-col">
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <div className="font-semibold">{selectedChat.isGroupChat ? selectedChat.chatName : (selectedChat.users?.find(u => u._id !== (me.id||me._id))?.name || 'Chat')}</div>
          <div className="text-xs text-gray-500">{selectedChat.isGroupChat ? `${selectedChat.users?.length || 0} members` : 'Active'}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.map(m => (
          <div key={m._id} className={`mb-4 flex ${m.sender._id === (me.id || me._id) ? 'justify-end' : 'justify-start'}`}>
            <div>
              <div className={`inline-block p-3 rounded ${m.sender._id === (me.id || me._id) ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow'}`}>
                {m.attachments?.length > 0 && m.attachments.map((a, i)=> (
                  <div key={i} className="mb-2">
                    {a.mimetype?.startsWith('image') ? <img src={a.url} alt="att" className="w-48 h-auto rounded" /> : <a href={a.url} target="_blank" rel="noreferrer" className="text-sm underline">Download file</a>}
                  </div>
                ))}
                <div>{m.content}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}

        {typingUser && <div className="text-sm text-gray-500">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput selectedChat={selectedChat} setMessages={setMessages} />
    </div>
  );
}
