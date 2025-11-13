import React from 'react';

export default function ChatListItem({ chat, onClick, active }) {
  const me = JSON.parse(localStorage.getItem('user') || '{}');
  const other = chat.isGroupChat ? null : (chat.users?.find(u => u._id !== (me.id || me._id)) || {});
  const title = chat.isGroupChat ? chat.chatName : (other?.name || 'User');

  return (
    <div onClick={onClick} className={`p-3 cursor-pointer flex items-center gap-3 ${active ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
      <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center text-gray-700">{title.charAt(0)}</div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-300">Tap to open</div>
      </div>
    </div>
  );
}
