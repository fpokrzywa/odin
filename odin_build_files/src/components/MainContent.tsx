import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, ChevronDown, Mic, Send, Search, BarChart3, Image, Paperclip, Copy, Edit3, Bot, X } from 'lucide-react';
import { chatService, type ChatMessage, type ChatThread } from '../services/chatService';
import { getCompanyBotName } from '../utils/companyConfig';

interface MainContentProps {
  selectedAssistant: string;
  selectedAssistantId: string;
  selectedPrompt: string;
  onPromptUsed: () => void;
  onOpenPromptCatalog: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  selectedAssistant, 
  selectedAssistantId,
  selectedPrompt, 
  onPromptUsed,
  onOpenPromptCatalog
}) => {
  const [inputValue, setInputValue] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssistantId, setShowAssistantId] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [showAssistantDropdown, setShowAssistantDropdown] = useState(false);
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);
  const [filteredAssistants, setFilteredAssistants] = useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<{assistant: string, message: string} | null>(null);
  const [pinnedAssistant, setPinnedAssistant] = useState<string | null>(null);

  // Available assistants list
  const availableAssistants = [
    getCompanyBotName(),
    'IT Support', 
    'HR Support',
    'Advance Policies Assistant',
    'Redact Assistant',
    'ADEPT Assistant',
    'RFP Assistant',
    'Resume Assistant'
  ];

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Initialize or switch chat thread when assistant changes
  useEffect(() => {
    const existingThread = chatService.getCurrentThread();
    
    // If there's an existing thread for this assistant, use it
    if (existingThread && existingThread.assistantId === selectedAssistantId) {
      setCurrentThread(existingThread);
    } else {
      // Create new thread for this assistant
      const threadId = chatService.createThread(selectedAssistantId, selectedAssistant);
      const newThread = chatService.getThread(threadId);
      setCurrentThread(newThread);
    }
  }, [selectedAssistant, selectedAssistantId]);

  // Update current thread state periodically to catch changes
  useEffect(() => {
    const interval = setInterval(() => {
      const thread = chatService.getCurrentThread();
      if (thread && (!currentThread || thread.id !== currentThread.id || thread.messages.length !== currentThread.messages.length)) {
        setCurrentThread(thread);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentThread]);

  // Register/unregister streaming callback when thread changes
  useEffect(() => {
    if (currentThread) {
      // Check if this thread is currently streaming
      if (chatService.isThreadStreaming(currentThread.id)) {
        setIsStreaming(true);
        // Register callback to receive streaming updates
        chatService.registerStreamingCallback(currentThread.id, (chunk) => {
          setStreamingMessage(chunk);
        });
      }

      // Cleanup function to unregister callback
      return () => {
        if (currentThread) {
          chatService.unregisterStreamingCallback(currentThread.id);
        }
      };
    }
  }, [currentThread?.id]);

  // Auto-scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages, streamingMessage]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update input when a prompt is selected
  useEffect(() => {
    if (selectedPrompt) {
      setInputValue(selectedPrompt);
    }
  }, [selectedPrompt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    setInputValue(value);
    
    // Check for @ symbol
    const atIndex = value.lastIndexOf('@', cursorPosition - 1);
    if (atIndex !== -1 && (atIndex === 0 || value[atIndex - 1] === ' ')) {
      const searchTerm = value.substring(atIndex + 1, cursorPosition).toLowerCase();
      const filtered = availableAssistants.filter(assistant => 
        assistant !== selectedAssistant && assistant.toLowerCase().includes(searchTerm)
      );
      
      setFilteredAssistants(filtered);
      setAtSymbolPosition(atIndex);
      setShowAssistantDropdown(true);
    } else {
      setShowAssistantDropdown(false);
      setAtSymbolPosition(-1);
    }
    
    // Clear the selected prompt when user starts typing
    if (selectedPrompt && e.target.value !== selectedPrompt) {
      onPromptUsed();
    }
  };

  const handleAssistantSelect = (assistant: string) => {
    if (atSymbolPosition !== -1) {
      const beforeAt = inputValue.substring(0, atSymbolPosition);
      const afterCursor = inputValue.substring(inputRef.current?.selectionStart || inputValue.length);
      
      // Extract the message part (everything after the assistant mention)
      const messageAfterAssistant = afterCursor.trim();
      
      if (messageAfterAssistant) {
        // If there's a message after the assistant mention, send it immediately
        setPendingAssistantMessage({ assistant, message: messageAfterAssistant });
        setInputValue('');
        setPinnedAssistant(null);
      } else {
        // Pin the assistant and clear the @ mention from input
        setPinnedAssistant(assistant);
        const newValue = beforeAt + afterCursor;
        setInputValue(newValue.trim());
        
        // Focus back to input and set cursor position
        setTimeout(() => {
          if (inputRef.current) {
            const newCursorPosition = beforeAt.length;
            inputRef.current.focus();
            inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        }, 0);
      }
      
      setShowAssistantDropdown(false);
      setAtSymbolPosition(-1);
    }
  };

  // Handle pending assistant messages
  useEffect(() => {
    if (pendingAssistantMessage) {
      sendMessageToAssistant(pendingAssistantMessage.assistant, pendingAssistantMessage.message);
      setPendingAssistantMessage(null);
    }
  }, [pendingAssistantMessage]);

  const sendMessageToAssistant = async (assistantName: string, message: string) => {
    // Find the assistant ID based on the name
    const assistantId = assistantName.toLowerCase().replace(/\s+/g, '_');
    
    // Create or switch to a thread for this assistant
    let targetThread = chatService.getAllThreads().find(thread => 
      thread.assistantName === assistantName
    );
    
    if (!targetThread) {
      const threadId = chatService.createThread(assistantId, assistantName);
      targetThread = chatService.getThread(threadId);
    }
    
    if (targetThread) {
      chatService.setCurrentThread(targetThread.id);
      setCurrentThread(targetThread);
      
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');
      setError(null);
      
      // Auto-scroll immediately after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      try {
        await chatService.sendMessageWithStreaming(message, (chunk) => {
          setStreamingMessage(chunk);
        }, targetThread.id);
        const updatedThread = chatService.getCurrentThread();
        setCurrentThread(updatedThread);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessage('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showAssistantDropdown) {
      if (e.key === 'Escape') {
        setShowAssistantDropdown(false);
        setAtSymbolPosition(-1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        // Could add keyboard navigation here if needed
      }
    }
    
    if (e.key === 'Enter' && !showAssistantDropdown) {
      // Check if there's a pinned assistant
      if (pinnedAssistant && inputValue.trim()) {
        setPendingAssistantMessage({ assistant: pinnedAssistant, message: inputValue.trim() });
        setInputValue('');
        setPinnedAssistant(null);
        return;
      }
      
      // Check if the message contains an @ mention (fallback)
      if (!pinnedAssistant) {
        const atMentionMatch = inputValue.match(/@(\w+(?:\s+\w+)*)\s+(.+)/);
        if (atMentionMatch) {
          const mentionedAssistant = atMentionMatch[1];
          const messageText = atMentionMatch[2];
          
          // Check if the mentioned assistant exists
          if (availableAssistants.includes(mentionedAssistant)) {
            setPendingAssistantMessage({ assistant: mentionedAssistant, message: messageText });
            setInputValue('');
            return;
          }
        }
      }
      handleSend();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAssistantDropdown(false);
        setAtSymbolPosition(-1);
      }
    };

    if (showAssistantDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAssistantDropdown]);
  const handleSend = async () => {
    if (inputValue.trim() && !pinnedAssistant) {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');
      setError(null);
      
      // Auto-scroll immediately after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      try {
        await chatService.sendMessageWithStreaming(inputValue.trim(), (chunk) => {
          setStreamingMessage(chunk);
        });
        const updatedThread = chatService.getCurrentThread();
        setCurrentThread(updatedThread);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessage('');
      }
      
      setInputValue('');
      if (selectedPrompt) {
        onPromptUsed();
      }
    }
  };

  const handleClearChat = () => {
    if (currentThread) {
      chatService.deleteThread(currentThread.id);
      const threadId = chatService.createThread(selectedAssistantId, selectedAssistant);
      const newThread = chatService.getThread(threadId);
      setCurrentThread(newThread);
    }
  };

  const handleStopStreaming = () => {
    chatService.stopStreaming();
    setIsStreaming(false);
    setStreamingMessage('');
    setIsLoading(false);
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEditMessage = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSendEdit = async () => {
    if (!currentThread || !editingMessageId || !editingText.trim()) return;

    // Find the index of the message being edited
    const messageIndex = currentThread.messages.findIndex(msg => msg.id === editingMessageId);
    if (messageIndex === -1) return;

    // Update the message content
    const updatedMessages = [...currentThread.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editingText.trim()
    };

    // Remove all messages after the edited message
    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
    
    // Update the thread with only the messages up to the edited one
    const updatedThread = {
      ...currentThread,
      messages: messagesToKeep,
      updatedAt: new Date()
    };

    // Update the thread in the service
    chatService.updateThread(updatedThread);
    setCurrentThread(updatedThread);

    // Clear editing state
    setEditingMessageId(null);
    setEditingText('');

    // Send the edited message to get a new response
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);
    
    // Auto-scroll immediately after sending edited message
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    try {
      await chatService.sendMessageWithStreaming(editingText.trim(), (chunk) => {
        setStreamingMessage(chunk);
      });
      const refreshedThread = chatService.getCurrentThread();
      setCurrentThread(refreshedThread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAssistantDropdown) {
      handleSend();
    }
  };

  const actionButtons = [
    { icon: '✏️', label: 'Create a plan', shortLabel: 'Plan' },
    { icon: '💡', label: 'Brainstorm ideas', shortLabel: 'Ideas' },
    { icon: '📄', label: 'Summarize file', shortLabel: 'Summary' },
    { icon: '🔄', label: 'Compare files', shortLabel: 'Compare' },
    { icon: '💻', label: 'Code', shortLabel: 'Code' },
    { icon: '📊', label: 'Analyze', shortLabel: 'Analyze' },
    { icon: '🎓', label: 'Learn', shortLabel: 'Learn' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedAssistant}</span>
            <div className="relative group">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-help" />
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Assistant ID: {selectedAssistantId || selectedAssistant}
                {/* Arrow pointing up */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-800"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {userProfile?.isAdmin && (
              <select className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 max-w-20 sm:max-w-none sm:px-3 sm:text-sm">
                <option>GPT-4o</option>
                <option>GPT-4</option>
                <option>Claude-3.5</option>
                <option>Gemini Pro</option>
              </select>
            )}
            <button 
              onClick={onOpenPromptCatalog}
              className="px-2 py-1 sm:px-4 sm:py-1 bg-orange-600 text-white rounded text-xs sm:text-sm hover:bg-orange-700 transition-colors"
            >
              Prompts
            </button>
            <button 
              onClick={handleClearChat}
              className="px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 text-gray-600 rounded text-xs sm:text-sm hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
        {currentThread && currentThread.messages.length > 0 ? (
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4">
            {currentThread.messages.map((message) => (
              <div
                key={message.id}
               className={`flex ${
                 message.role === 'user' 
                   ? editingMessageId === message.id 
                     ? 'justify-start' 
                     : 'justify-end' 
                   : 'justify-start'
               }`}
              >
               <div className={`group ${
                 message.role === 'user' && editingMessageId === message.id
                   ? 'w-full'
                   : 'max-w-[80%] sm:max-w-[70%]'
               }`}>
                  {/* Message Content */}
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-white text-gray-900 border border-orange-500 rounded-xl'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    {editingMessageId === message.id ? (
                      /* Edit Mode */
                    <div className="relative flex flex-col gap-3 w-full">
                      <div className="bg-white rounded-3xl px-3 py-3">
                        <div className="m-2 max-h-[25dvh] overflow-auto">
                          <div className="grid">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="col-start-1 col-end-2 row-start-1 row-end-2 w-full resize-none overflow-hidden p-0 m-0 border-0 bg-transparent focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-gray-900 placeholder-gray-500"
                              autoFocus
                              placeholder="Edit your message..."
                            />
                            <span className="invisible col-start-1 col-end-2 row-start-1 row-end-2 p-0 break-all whitespace-pre-wrap">
                              {editingText} 
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendEdit}
                            disabled={!editingText.trim()}
                            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                    ) : (
                        <>
                        {message.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-500">Thinking...</span>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        </>
                    )}
                  </div>
                
                  {/* Hover Actions for User Messages - Under entire message bubble */}
                {message.role === 'user' && editingMessageId !== message.id && (
                  <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                      <button
                        onClick={() => handleCopyMessage(message.content)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        title="Copy message"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditMessage(message)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        title="Edit message"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
            
            {/* Loading/Thinking Message */}
            {isLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800">
                  <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Welcome Screen - Only show when no messages */
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-4xl w-full mx-auto">
              <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center">
                Please ask {selectedAssistant} your questions
              </h2>
              
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 text-center px-2">
                Ask a question or add files to the conversation using the paperclip icon.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Input Section - Always at bottom */}
        <div className="flex-shrink-0">
          <div className="relative">
            {/* Assistant Dropdown */}
            {showAssistantDropdown && filteredAssistants.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">Select an assistant:</div>
                  {filteredAssistants.map((assistant) => (
                    <button
                      key={assistant}
                      onClick={() => handleAssistantSelect(assistant)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-6 h-6 bg-pink-100 rounded flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-pink-600" />
                      </div>
                      <span className="text-sm text-gray-700">{assistant}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white rounded-lg p-2 sm:p-3 border border-gray-200 shadow-sm">
              {/* Pinned Assistant Indicator */}
              {pinnedAssistant && (
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
                  <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-2.5 h-2.5 text-orange-600" />
                  </div>
                  <span className="text-orange-700 font-medium">{pinnedAssistant}</span>
                  <button
                    onClick={() => setPinnedAssistant(null)}
                    className="text-orange-400 hover:text-orange-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder={pinnedAssistant ? `Message ${pinnedAssistant}...` : "Ask a question..."}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base min-w-0 disabled:opacity-50"
              />
              <button 
                className="p-1 sm:p-2 text-gray-400 hover:text-orange-600 transition-colors flex-shrink-0"
                disabled={isLoading}
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={isStreaming ? handleStopStreaming : handleSend}
                disabled={isLoading && !isStreaming || (!inputValue.trim() && !isStreaming) || (pinnedAssistant && !inputValue.trim())}
                className={`p-2 sm:p-3 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg ${
                  isStreaming 
                    ? 'text-gray-400 hover:text-gray-600' 
                    : 'text-gray-400 hover:text-orange-600'
                }`}
              >
                {isStreaming ? (
                  <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            
            {/* Web Search Buttons - Mobile Responsive */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3 justify-start">
              <button className="flex items-center space-x-1 px-2 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                <Search className="w-3 h-3 text-gray-400" />
                <span className="hidden sm:inline">Web Search</span>
                <span className="sm:hidden">Web</span>
              </button>
              <button className="flex items-center space-x-1 px-2 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                <BarChart3 className="w-3 h-3 text-gray-400" />
                <span>Research</span>
              </button>
              <button className="flex items-center space-x-1 px-2 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                <Image className="w-3 h-3 text-gray-400" />
                <span className="hidden sm:inline">Generate Image</span>
                <span className="sm:hidden">Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;