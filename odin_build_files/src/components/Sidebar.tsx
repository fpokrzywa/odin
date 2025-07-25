import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MoreHorizontal, MessageSquare, Menu, Edit3, Pin, Trash2, PanelLeftClose } from 'lucide-react';
import { chatService, type ChatThread } from '../services/chatService';

interface Chat {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  isPinned?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onThreadSelect?: (threadId: string, assistantName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onThreadSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [pinnedCollapsed, setPinnedCollapsed] = useState(false);
  const [recentCollapsed, setRecentCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [editingChat, setEditingChat] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);

  // Auto-expand sections when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      setPinnedCollapsed(false);
      setRecentCollapsed(false);
    }
  }, [searchQuery]);

  // Load chat threads from chatService
  useEffect(() => {
    const loadThreads = () => {
      const threads = chatService.getAllThreads();
      setChatThreads(threads);
    };

    loadThreads();
    
    // Set up interval to refresh threads periodically
    const interval = setInterval(loadThreads, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert chat threads to chat format for display
  const threadChats = chatThreads
    .filter(thread => thread.messages.length > 0) // Only show threads with messages
    .map(thread => ({
    id: parseInt(thread.id.replace(/\D/g, '')) || Date.now(),
    title: thread.customTitle || (thread.messages.length > 0 
      ? thread.messages[0].content.substring(0, 50) + (thread.messages[0].content.length > 50 ? '...' : '')
      : `Chat with ${thread.assistantName}`),
    icon: MessageSquare,
    isPinned: thread.isPinned || false,
    threadId: thread.id,
    assistantName: thread.assistantName,
    isThreadChat: true
  }));

  // Combine regular pinned chats with pinned thread chats
  const pinnedThreadChats = threadChats.filter(chat => chat.isPinned);
  const pinnedRegularChats = chats.filter(chat => chat.isPinned);
  const pinnedChats = [...pinnedRegularChats, ...pinnedThreadChats];

  const filteredPinnedChats = useMemo(() => {
    if (!searchQuery.trim()) return pinnedChats;
    return pinnedChats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, pinnedChats]);

  const filteredRecentChats = useMemo(() => {
    // Show non-pinned thread chats in recent section
    const allRecentChats = threadChats.filter(chat => !chat.isPinned);
    if (!searchQuery.trim()) return allRecentChats;
    return allRecentChats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.assistantName && chat.assistantName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, threadChats]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingChat && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChat]);

  const handleMenuClick = (chatId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenu(activeMenu === chatId ? null : chatId);
  };

  const handleRename = (chatId: number) => {
    const chat = [...chats, ...threadChats].find(c => c.id === chatId);
    if (chat) {
      setEditTitle(chat.title);
      setEditingChat(chatId);
      setActiveMenu(null);
    }
  };

  const handleSaveRename = (chatId: number) => {
    if (editTitle.trim()) {
      // Check if it's a thread chat
      const threadChat = threadChats.find(c => c.id === chatId);
      if (threadChat && 'threadId' in threadChat) {
        // Update thread title in chat service
        chatService.renameThread(threadChat.threadId, editTitle.trim());
        // Refresh threads
        setChatThreads(chatService.getAllThreads());
      } else {
        // Update regular chat
        setChats(chats.map(chat => 
          chat.id === chatId ? { ...chat, title: editTitle.trim() } : chat
        ));
      }
    }
    setEditingChat(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingChat(null);
    setEditTitle('');
  };

  const handleKeyPress = (event: React.KeyboardEvent, chatId: number) => {
    if (event.key === 'Enter') {
      handleSaveRename(chatId);
    } else if (event.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handlePin = (chatId: number) => {
    // Check if it's a thread chat
    const threadChat = threadChats.find(c => c.id === chatId);
    if (threadChat && 'threadId' in threadChat) {
      // Update thread pin status in chat service
      chatService.pinThread(threadChat.threadId, !threadChat.isPinned);
      // Refresh threads
      setChatThreads(chatService.getAllThreads());
    } else {
      // Update regular chat
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      ));
    }
    setActiveMenu(null);
  };

  const handleChatClick = (chat: any) => {
    if (chat.threadId) {
      // Switch to the selected thread
      chatService.setCurrentThread(chat.threadId);
      // Notify parent component to update the selected assistant and refresh UI
      if (onThreadSelect) {
        onThreadSelect(chat.threadId, chat.assistantName);
      }
    }
  };

  const handleDelete = (chatId: number) => {
    const threadChat = threadChats.find(c => c.id === chatId);
    if (threadChat && 'threadId' in threadChat) {
      // Delete chat thread
      chatService.deleteThread(threadChat.threadId);
      setChatThreads(chatService.getAllThreads());
    } else {
      // Delete regular chat
      setChats(chats.filter(chat => chat.id !== chatId));
    }
    setActiveMenu(null);
  };

  const renderChatItem = (chat: any) => (
    <div 
      key={chat.id}
      onClick={() => handleChatClick(chat)}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer relative"
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
          chat.threadId ? 'bg-blue-100' : 'bg-orange-100'
        }`}>
          <chat.icon className={`w-3 h-3 ${chat.threadId ? 'text-blue-600' : 'text-orange-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
        {editingChat === chat.id ? (
          <input
            ref={editInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => handleSaveRename(chat.id)}
            onKeyDown={(e) => handleKeyPress(e, chat.id)}
            className="flex-1 text-sm text-gray-700 bg-white border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        ) : (
          <div>
            <span className="text-sm text-gray-700 truncate block">{chat.title}</span>
            {chat.assistantName && (
              <span className="text-xs text-gray-500">{chat.assistantName}</span>
            )}
          </div>
        )}
        </div>
      </div>
      
      <div className="relative">
        <button 
          onClick={(e) => handleMenuClick(chat.id, e)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all flex-shrink-0 hover:bg-gray-100 rounded"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        
        {activeMenu === chat.id && (
          <div 
            ref={menuRef}
            className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
          >
            <button
              onClick={() => handleRename(chat.id)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit3 className="w-3 h-3" />
              <span>Rename</span>
            </button>
            <button
              onClick={() => handlePin(chat.id)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Pin className="w-3 h-3" />
              <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>
            <button
              onClick={() => handleDelete(chat.id)}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 h-full flex flex-col items-center py-4">
        <button 
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          title="Open Chat History"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Chat History</span>
          </h2>
          <button 
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-50"
            title="Close Chat History"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Pinned Section */}
          <div className="mb-6">
            <button 
              onClick={() => setPinnedCollapsed(!pinnedCollapsed)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center space-x-1">
                <span className={`transform transition-transform ${pinnedCollapsed ? '-rotate-90' : ''}`}>
                  ▼
                </span>
                <span>Pinned</span>
              </span>
              {filteredPinnedChats.length > 0 && (
                <span className="text-xs text-gray-400">({filteredPinnedChats.length})</span>
              )}
            </button>
            {!pinnedCollapsed && (
              <div className="space-y-2">
                {filteredPinnedChats.length > 0 ? (
                  filteredPinnedChats.map(renderChatItem)
                ) : (
                  <p className="text-xs text-gray-500 italic pl-2">
                    {searchQuery ? 'No pinned chats found' : 'No pinned chats'}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Recent Section */}
          <div>
            <button 
              onClick={() => setRecentCollapsed(!recentCollapsed)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-3 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center space-x-1">
                <span className={`transform transition-transform ${recentCollapsed ? '-rotate-90' : ''}`}>
                  ▼
                </span>
                <span>Recent</span>
              </span>
              {filteredRecentChats.length > 0 && (
                <span className="text-xs text-gray-400">({filteredRecentChats.length})</span>
              )}
            </button>
            
            {!recentCollapsed && (
              <div className="space-y-2">
                {filteredRecentChats.length > 0 ? (
                  filteredRecentChats.map(renderChatItem)
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent chats found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your search terms
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;