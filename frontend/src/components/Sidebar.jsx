import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ChatListItem from './ChatListItem';

export default function Sidebar({ chats, setChats, onSelectChat, selectedChat }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users').catch(()=>null);
        if (res?.data) setUsers(res.data);
      } catch (e) {}
    })();
  }, []);

  const refresh = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b">
        <input value={search} onChange={e=>setSearch(e.target.value)} className="w-full p-2 border rounded" placeholder="Search or start new chat" />
      </div>

      <div className="flex-1 overflow-auto">
        {chats?.length === 0 && <div className="p-4 text-gray-500">No chats yet</div>}
        {chats?.map(chat => (
          <ChatListItem key={chat._id} chat={chat} onClick={() => onSelectChat(chat)} active={selectedChat?._id === chat._id} />
        ))}
      </div>

      <div className="p-3 border-t">
        <button onClick={refresh} className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded">Refresh</button>
      </div>
    </div>
  );
}
