import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AssistantsPage from './components/AssistantsPage';
import PromptCatalog from './components/PromptCatalog';
import PromptCatalogPage from './components/PromptCatalogPage';
import ResourcesPage from './components/ResourcesPage';
import SettingsOverlay from './components/SettingsOverlay';
import AcknowledgmentOverlay from './components/AcknowledgmentOverlay';
import ProfileOverlay from './components/ProfileOverlay';
import { chatService } from './services/chatService';
import { getCompanyBotName } from './utils/companyConfig';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'chat' | 'assistants' | 'prompt-catalog' | 'resources'>('assistants');
  const [selectedAssistant, setSelectedAssistant] = useState<string>(getCompanyBotName());
  const [promptCatalogOpen, setPromptCatalogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [acknowledgmentOpen, setAcknowledgmentOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('');

  // Auto-close sidebar on mobile devices
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar on mobile (screens smaller than 768px)
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        // Auto-open sidebar on desktop if on chat page
        if (currentPage === 'chat') {
          setSidebarOpen(true);
        }
      }
    };

    // Check on initial load
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentPage]);

  // Load user profile on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setUserProfile(parsedProfile);
      // Set the preferred assistant as the default selected assistant
      if (parsedProfile.preferredAssistant) {
        setSelectedAssistant(parsedProfile.preferredAssistant);
      }
    }
  }, []);

  // Listen for profile changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile(parsedProfile);
        // Update selected assistant if preferred assistant changed
        if (parsedProfile.preferredAssistant && parsedProfile.preferredAssistant !== selectedAssistant) {
          setSelectedAssistant(parsedProfile.preferredAssistant);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedAssistant]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAssistantSelect = (assistant: { name: string; id: string }) => {
    setSelectedAssistant(assistant.name);
    setSelectedAssistantId(assistant.id);
    setCurrentPage('chat');
  };

  const handleNavigateToChat = () => {
    // When navigating to chat, use the user's preferred assistant if available
    if (userProfile?.preferredAssistant) {
      setSelectedAssistant(userProfile.preferredAssistant);
    }
    setCurrentPage('chat');
  };

  const handlePromptSelect = (promptText: string, assistantName: string) => {
    setSelectedPrompt(promptText);
    setSelectedAssistant(assistantName);
    setCurrentPage('chat');
    setPromptCatalogOpen(false);
  };

  const handleOpenFullPromptCatalog = () => {
    setCurrentPage('prompt-catalog');
    setPromptCatalogOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header 
        onNavigate={(page) => {
          if (page === 'chat') {
            handleNavigateToChat();
          } else {
            setCurrentPage(page);
          }
        }}
        currentPage={currentPage}
        onOpenPromptCatalog={() => setPromptCatalogOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAcknowledgment={() => setAcknowledgmentOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />
      <div className="flex-1 flex overflow-hidden">
        {currentPage === 'chat' && (
          <>
            <Sidebar 
              isOpen={sidebarOpen} 
              onToggle={toggleSidebar}
              onThreadSelect={(threadId, assistantName) => {
                setSelectedAssistant(assistantName);
                // Force MainContent to refresh by updating the selected assistant ID
                const thread = chatService.getThread(threadId);
                if (thread) {
                  setSelectedAssistantId(thread.assistantId);
                }
                // Ensure we're on the chat page
                if (currentPage !== 'chat') {
                  setCurrentPage('chat');
                }
              }}
            />
            <MainContent 
              selectedAssistant={selectedAssistant} 
              selectedAssistantId={selectedAssistantId}
              selectedPrompt={selectedPrompt}
              onPromptUsed={() => setSelectedPrompt('')}
              onOpenPromptCatalog={() => setPromptCatalogOpen(true)}
            />
          </>
        )}
        {currentPage === 'assistants' && <AssistantsPage onAssistantSelect={handleAssistantSelect} />}
        {currentPage === 'prompt-catalog' && (
          <PromptCatalogPage onPromptSelect={handlePromptSelect} />
        )}
        {currentPage === 'resources' && <ResourcesPage />}
      </div>
      <PromptCatalog 
        isOpen={promptCatalogOpen} 
        onClose={() => setPromptCatalogOpen(false)} 
        onPromptSelect={handlePromptSelect}
        onOpenFullCatalog={handleOpenFullPromptCatalog}
        selectedAssistant={selectedAssistant}
      />
      <SettingsOverlay 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <AcknowledgmentOverlay 
        isOpen={acknowledgmentOpen}
        onClose={() => setAcknowledgmentOpen(false)}
      />
      <ProfileOverlay 
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}

export default App;