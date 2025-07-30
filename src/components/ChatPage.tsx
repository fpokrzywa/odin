import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Mic, Send, Search, BarChart3, Image, Paperclip, Copy, Edit3, Bot, X, Upload, File, Trash2 } from 'lucide-react';
import { chatService, type ChatMessage, type ChatThread } from '../services/chatService';
import PromptCatalog from './PromptCatalog';
import { getCompanyBotName } from '../utils/companyConfig';

interface ChatPageProps {
  selectedAssistant: { name: string; id: string } | null;
  selectedPrompt: string;
  onPromptUsed: () => void;
  onOpenPromptCatalog?: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  selectedAssistant,
  selectedPrompt,
  onPromptUsed,
  onOpenPromptCatalog
}) => {
  const [inputValue, setInputValue] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [showPromptCatalog, setShowPromptCatalog] = useState(false);
  const [mentionedAssistant, setMentionedAssistant] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');

  // Available assistants list
  const [availableAssistants, setAvailableAssistants] = useState<string[]>([]);
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([]);

  // Load OpenAI assistants to get dynamic list
  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const { openaiService } = await import('../services/openaiService');
        const result = await openaiService.listAssistants();
        console.log('Loaded OpenAI assistants for @ mentions:', result.assistants);
        if (result.assistants.length > 0) {
          const convertedAssistants = result.assistants.map(assistant => 
            openaiService.convertToInternalFormat(assistant)
          );
          setOpenaiAssistants(convertedAssistants);
          // Only use OpenAI assistant names for @ mentions
          const assistantNames = convertedAssistants.map(assistant => assistant.name);
          setAvailableAssistants(assistantNames);
          console.log('Set available assistants for @ mentions:', assistantNames);
        } else {
          console.log('No OpenAI assistants found');
          setAvailableAssistants([]);
        }
      } catch (error) {
        console.error('Error loading assistants for @ mentions:', error);
        // Clear assistants if loading fails
        setAvailableAssistants([]);
      }
    };

    loadAssistants();
  }, []);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Initialize or switch chat thread when assistant changes
  useEffect(() => {
    if (selectedAssistant) {
      const existingThread = chatService.getCurrentThread();
      
      // If there's an existing thread for this assistant, use it
      if (existingThread && existingThread.assistantId === selectedAssistant.id) {
        setCurrentThread(existingThread);
      } else {
        // Create new thread for this assistant
        const threadId = chatService.createThread(selectedAssistant.id, selectedAssistant.name);
        const newThread = chatService.getThread(threadId);
        setCurrentThread(newThread);
      }
    }
  }, [selectedAssistant]);

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
     console.log('🔍 ChatPage: @ detected, searchTerm:', searchTerm, 'availableAssistants:', availableAssistants);
      const filtered = availableAssistants.filter(assistant => 
        assistant !== selectedAssistant?.name && // Exclude current assistant
        assistant.toLowerCase().includes(searchTerm)
      );
      
     console.log('🎯 ChatPage: Filtered assistants:', filtered);
      setFilteredAssistants(filtered);
      setAtSymbolPosition(atIndex);
      setShowAssistantDropdown(true);
    } else {
      setShowAssistantDropdown(false);
      setAtSymbolPosition(-1);
    }
    
    // Clear the selected prompt when user starts typing
    if (selectedPrompt && e.target.value !== selectedPrompt && onPromptUsed) {
      onPromptUsed();
    }
  };

  const handleAssistantSelect = (assistant: string) => {
    console.log('🎯 ChatPage: Assistant selected:', assistant);
    console.log('🎯 ChatPage: Current atSymbolPosition:', atSymbolPosition);
    console.log('🎯 ChatPage: Current inputValue:', inputValue);
    
    if (atSymbolPosition !== -1) {
     // Find where the @ mention should end (next space or end of string)
     let mentionEnd = atSymbolPosition + 1;
     while (mentionEnd < inputValue.length && inputValue[mentionEnd] !== ' ') {
       mentionEnd++;
     }
     
      const beforeAt = inputValue.substring(0, atSymbolPosition);
      const afterMention = inputValue.substring(mentionEnd);
      
      console.log('🎯 ChatPage: beforeAt:', beforeAt);
      console.log('🎯 ChatPage: afterMention:', afterMention);
      
      // Create the new input value with @assistant
      const newValue = beforeAt + `@${assistant} ` + afterMention;
      console.log('🎯 ChatPage: Setting new input value:', newValue);
      setInputValue(newValue);
      
      // Set the mentioned assistant
      setMentionedAssistant(assistant);
      
      setShowAssistantDropdown(false);
      setAtSymbolPosition(-1);
      
      // Focus back to input and set cursor position
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPosition = beforeAt.length + assistant.length + 2; // +2 for @ and space
          console.log('🎯 ChatPage: Setting cursor position:', newCursorPosition);
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      console.warn('⚠️ ChatPage: atSymbolPosition is -1, cannot select assistant');
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
    console.log('🚀 ChatPage: Sending message to assistant:', assistantName, 'Message:', message);
    
    // Find the OpenAI assistant by name
    const openaiAssistant = openaiAssistants.find(assistant => assistant.name === assistantName);
   const assistantId = openaiAssistant ? openaiAssistant.id : `fallback_${assistantName.toLowerCase().replace(/\s+/g, '_')}`;
    
    console.log('🔍 ChatPage: Found assistant:', { assistantName, assistantId, openaiAssistant });
    
    // Create or switch to a thread for this assistant
    let targetThread = chatService.getAllThreads().find(thread => 
     thread.assistantId === assistantId || thread.assistantName === assistantName
    );
    
    if (!targetThread) {
      console.log('🆕 ChatPage: Creating new thread for assistant:', assistantName);
      const threadId = chatService.createThread(assistantId, assistantName);
      targetThread = chatService.getThread(threadId);
    } else {
      console.log('🔄 ChatPage: Using existing thread for assistant:', assistantName);
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
        console.log('📤 ChatPage: Sending message via streaming to thread:', targetThread.id);
        await chatService.sendMessageWithStreaming(message, (chunk) => {
          setStreamingMessage(chunk);
        }, targetThread.id, uploadedFiles.length > 0 ? uploadedFiles : undefined);
        const updatedThread = chatService.getCurrentThread();
        setCurrentThread(updatedThread);
        
        // Clear uploaded files after sending
        setUploadedFiles([]);
        console.log('✅ ChatPage: Message sent successfully');
      } catch (err) {
        console.error('❌ ChatPage: Error sending message:', err);
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
      } else if (e.key === 'Enter') {
        e.preventDefault();
        return; // Don't process Enter when dropdown is open
      }
      return; // Don't process other keys when dropdown is open
    }
    
    if (e.key === 'Enter' && !showAssistantDropdown) {
      e.preventDefault(); // Prevent form submission
      
      // Check if the message contains an @ mention
     const atMentionMatch = inputValue.match(/@([A-Za-z0-9\s]+?)\s+(.+)/);
      if (atMentionMatch) {
        const mentionedAssistantName = atMentionMatch[1].trim();
        const messageText = atMentionMatch[2].trim();
        
        console.log('🎯 ChatPage: Found @ mention:', { mentionedAssistantName, messageText, availableAssistants });
        
        // Check if the mentioned assistant exists in our OpenAI assistants
        if (availableAssistants.includes(mentionedAssistantName) && messageText) {
          console.log('✅ ChatPage: Routing message to assistant:', mentionedAssistantName);
         // Find the OpenAI assistant to get the real ID
         const targetAssistant = openaiAssistants.find(a => a.name === mentionedAssistantName);
         console.log('🔍 ChatPage: Found OpenAI assistant:', targetAssistant);
          setPendingAssistantMessage({ assistant: mentionedAssistantName, message: messageText });
          setInputValue('');
         setMentionedAssistant(null);
          return;
        } else if (!messageText) {
          console.log('⚠️ ChatPage: No message text after @ mention');
          return; // Don't send if there's no message after the @ mention
        } else {
          console.log('⚠️ ChatPage: Assistant not found in available list:', mentionedAssistantName);
        }
      }
      
      // Regular message sending (no @ mention)
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
        }, undefined, uploadedFiles.length > 0 ? uploadedFiles : undefined);
        const updatedThread = chatService.getCurrentThread();
        setCurrentThread(updatedThread);
        
        // Clear uploaded files after sending
        setUploadedFiles([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessage('');
      }
      
      setInputValue('');
      if (selectedPrompt && onPromptUsed) {
        onPromptUsed();
      }
    }
  };

  const handleClearChat = () => {
    if (currentThread) {
      chatService.deleteThread(currentThread.id);
      if (selectedAssistant) {
        const threadId = chatService.createThread(selectedAssistant.id, selectedAssistant.name);
        const newThread = chatService.getThread(threadId);
        setCurrentThread(newThread);
      }
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
      }, undefined, uploadedFiles.length > 0 ? uploadedFiles : undefined);
      const refreshedThread = chatService.getCurrentThread();
      setCurrentThread(refreshedThread);
      
      // Clear uploaded files after sending
      setUploadedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleOpenPromptCatalog = () => {
    setShowPromptCatalog(true);
  };

  const handlePromptSelect = (promptText: string, assistantName: string) => {
    setInputValue(promptText);
    setShowPromptCatalog(false);
    // Optionally switch to the selected assistant if different
    if (assistantName !== selectedAssistant?.name) {
      // You could implement assistant switching here if needed
      console.log('Selected prompt for different assistant:', assistantName);
    }
  };

  const handleOpenFullCatalog = () => {
    setShowPromptCatalog(false);
    // Navigate to full prompt catalog page
    if (onOpenPromptCatalog) {
      onOpenPromptCatalog();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: File[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 512MB for OpenAI)
        if (file.size > 512 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 512MB.`);
          continue;
        }

        // Validate file type (common document types)
        const allowedTypes = [
          'text/plain',
          'text/markdown',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/json',
          'text/html',
          'text/css',
          'text/javascript',
          'application/javascript',
          'text/xml',
          'application/xml'
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(`File type "${file.type}" is not supported. Please upload documents, text files, or code files.`);
          continue;
        }

        newFiles.push(file);
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      console.log('Files uploaded:', newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text') || fileType.includes('plain')) return '📄';
    if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css')) return '💻';
    return '📎';
  };

  if (!selectedAssistant) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assistant Selected</h3>
          <p className="text-gray-500">Please select an assistant to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex bg-gray-50">
      {/* Main Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${showHelpOverlay ? 'flex-[3]' : 'flex-1'}`}>
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedAssistant.name}</span>
            <div className="relative group">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-help" />
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Assistant ID: {selectedAssistant.id}
                {/* Arrow pointing up */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-800"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Model Dropdown */}
            <div className="relative">
              <select className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
                <option>GPT-4o</option>
                <option>GPT-4</option>
                <option>Claude-3.5</option>
                <option>Gemini Pro</option>
                <option>o1-preview</option>
                <option>o1-mini</option>
              </select>
            </div>
            {onOpenPromptCatalog && (
              <button 
                onClick={handleOpenPromptCatalog}
                className="px-2 py-1 sm:px-4 sm:py-1 bg-orange-600 text-white rounded text-xs sm:text-sm hover:bg-orange-700 transition-colors"
              >
                Prompts
              </button>
            )}
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
                Please ask {selectedAssistant.name} your questions
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖱️ ChatPage: Button clicked for assistant:', assistant);
                        handleAssistantSelect(assistant);
                      }}
                     onMouseDown={(e) => {
                       e.preventDefault(); // Prevent input blur
                     }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">{assistant}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white rounded-lg p-2 sm:p-3 border border-gray-200 shadow-sm">
              {/* Mentioned Assistant Indicator */}
              {mentionedAssistant && (
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
                  <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-2.5 h-2.5 text-orange-600" />
                  </div>
                  <span className="text-orange-700 font-medium">@{mentionedAssistant}</span>
                  <button
                    onClick={() => setMentionedAssistant(null)}
                    className="text-orange-400 hover:text-orange-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                className="p-1 sm:p-2 text-gray-400 hover:text-orange-600 transition-colors flex-shrink-0 relative"
                title="Upload files"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
              
              {pinnedAssistant && !mentionedAssistant && (
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-green-700 font-medium">{pinnedAssistant}</span>
                  <button
                    onClick={() => setPinnedAssistant(null)}
                    className="text-green-400 hover:text-green-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.html,.css,.js,.xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <input
                ref={inputRef}
                type="text"
                placeholder={mentionedAssistant ? `Message @${mentionedAssistant}...` : pinnedAssistant ? `Message ${pinnedAssistant}...` : "Ask a question..."}
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
                disabled={isLoading && !isStreaming || (!inputValue.trim() && !isStreaming) || ((pinnedAssistant || mentionedAssistant) && !inputValue.trim())}
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
            
            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Uploaded Files ({uploadedFiles.length})
                  </span>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="text-xs text-red-600 hover:text-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Files will be sent to OpenAI for analysis and can be referenced in your conversation.
                </div>
              </div>
            )}
            
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
                <span 
                  onClick={() => setShowHelpOverlay(true)}
                  className="hidden sm:inline cursor-pointer"
                >
                  Help me with this
                </span>
                <span className="sm:hidden">Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Panel - Slides in from right */}
      <div className={`bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
        showHelpOverlay ? 'w-1/4 opacity-100' : 'w-0 opacity-0 overflow-hidden'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Help me with this</h3>
              <button
                onClick={() => setShowHelpOverlay(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="text-gray-700 space-y-4">
              <p className="text-sm leading-relaxed">
                Need help with something specific? Describe what you're working on and I'll provide targeted assistance.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">I can help you with:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Analyzing documents or images</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Explaining complex concepts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Brainstorming solutions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Writing and editing content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Research and fact-checking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                What do you need help with?
              </label>
              <textarea
                value={helpMessage}
                onChange={(e) => setHelpMessage(e.target.value)}
                placeholder="Describe what you're working on or what you need assistance with..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowHelpOverlay(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (helpMessage.trim()) {
                      setInputValue(helpMessage.trim());
                      setHelpMessage('');
                      setShowHelpOverlay(false);
                    }
                  }}
                  disabled={!helpMessage.trim()}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ask for Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Prompt Catalog Modal */}
      <PromptCatalog
        isOpen={showPromptCatalog}
        onClose={() => setShowPromptCatalog(false)}
        onPromptSelect={handlePromptSelect}
        onOpenFullCatalog={handleOpenFullCatalog}
        selectedAssistant={selectedAssistant?.name}
      />
    </>
  );
};

export default ChatPage;