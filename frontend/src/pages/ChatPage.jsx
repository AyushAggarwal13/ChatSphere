import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { socket } from '../services/socket';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

export default function ChatPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [dark, setDark] = useState(localStorage.getItem('dark') === 'true');

  useEffect(() => {
    if (!user || (!user.id && !user._id)) {
      navigate('/login');
      return;
    }
    socket.connect();
    const userId = user.id || user._id;
    socket.emit('setup', userId);
    socket.on('connected', () => console.log('Socket connected'));

    (async () => {
      try {
        const res = await api.get('/chats');
        setChats(res.data);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    socket.disconnect();
    navigate('/login');
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('dark', next ? 'true' : 'false');
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <div className="h-screen flex">
      <div className="w-80 border-r flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">{(user.name||'U').charAt(0)}</div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="text-sm">{dark ? '☀️' : '🌙'}</button>
            <button className="text-sm text-red-500" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <Sidebar chats={chats} setChats={setChats} onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>

      <div className="flex-1">
        <ChatWindow selectedChat={selectedChat} setSelectedChat={setSelectedChat} refreshChats={(newChats)=>setChats(newChats)} />
      </div>
    </div>
  );
}
