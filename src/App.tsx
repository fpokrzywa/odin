import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SignInModal from './components/SignInModal';
import GetStartedModal from './components/GetStartedModal';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightPanel from './components/RightPanel';
import ChatPage from './components/ChatPage';
import ProfileOverlay from './components/ProfileOverlay';
import SettingsOverlay from './components/SettingsOverlay';
import { Bot, BookOpen, FileText, LogOut, User } from 'lucide-react';
import AdminPage from './components/AdminPage';
import AssistantsPage from './components/AssistantsPage';
import PromptCatalogPage from './components/PromptCatalogPage';
import ResourcesPage from './components/ResourcesPage';
import GuidelinesPage from './components/GuidelinesPage';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [activeSection, setActiveSection] = useState('assistants');
  const [isMainContentCollapsed, setIsMainContentCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<{ name: string; id: string } | null>(null);
  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);
  const [selectedPromptText, setSelectedPromptText] = useState<string>('');

  const handleGetStarted = () => {
    setShowGetStartedModal(true);
  };

  const handleGetStartedSubmit = (formData: { name: string; email: string; company: string; message: string }) => {
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    setShowGetStartedModal(false);
    // Optionally show a success message or redirect
    alert('Thank you for your interest! We will contact you soon.');
  };

  const handleSignInClick = () => {
    setShowSignInModal(true);
  };

  const handleSignIn = (email: string, password: string) => {
    // Check if admin credentials
    if (email === 'freddie@3cpublish.com' && password === 'Appdev2025!') {
      setUser({ email });
      setIsSignedIn(true);
      setShowSignInModal(false);
      setShowLanding(false);
      setActiveSection('assistants'); // Go to assistants page by default
    } else {
      // Regular user login
      setUser({ email });
      setIsSignedIn(true);
      setShowSignInModal(false);
      setShowLanding(false);
      setActiveSection('assistants'); // Go to assistants page by default
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    setShowLanding(true);
    setActiveSection('assistants');
    setShowMainContent(false);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Load ODIN assistant when Find Answers sections are selected
    const findAnswersSections = ['knowledge-articles', 'organization-chart', 'conference-rooms', 'customer-accounts', 'expense-reports', 'resources', 'guidelines'];
    if (findAnswersSections.includes(section)) {
      const odinAssistant = { name: 'ODIN', id: 'odin' };
      setSelectedAssistant(odinAssistant);
      setActiveSection('chat');
    }
    
    // Show main content when a Find Answers section is selected (keep existing functionality)
    if (findAnswersSections.includes(section)) {
      setShowMainContent(true);
    } else {
      setShowMainContent(false);
    }
    // If the main content is collapsed, expand it when a nav item is clicked
    if (isMainContentCollapsed) {
      setIsMainContentCollapsed(false);
    }
    // If the sidebar is collapsed, expand it when a nav item is clicked
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  const handleAssistantSelect = (assistant: { name: string; id: string }) => {
    setSelectedAssistant(assistant);
    // Navigate to chat page when assistant is selected
    setActiveSection('chat');
    // Collapse sidebar when entering chat page
    setIsSidebarCollapsed(true);
  };

  const handlePromptSelect = (promptText: string, assistantName: string) => {
    // Set the selected prompt text and assistant
    setSelectedPromptText(promptText);
    
    // Find or create assistant object
    const assistantId = assistantName.toLowerCase().replace(/\s+/g, '_');
    setSelectedAssistant({ name: assistantName, id: assistantId });
    
    // Navigate to chat page
    setActiveSection('chat');
    // Collapse sidebar when entering chat page
    setIsSidebarCollapsed(true);
  };

  const handleCollapseAll = () => {
    setIsSidebarCollapsed(true);
  };

  const handleExpandAll = () => {
    setIsSidebarCollapsed(false);
  };

  const handleToggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', isSidebarCollapsed);
    setIsSidebarCollapsed(prev => {
      console.log('Toggling sidebar from', prev, 'to', !prev);
      return !prev;
    });
  };
  // Always show landing page first, then show main app after sign in
  if (showLanding && !isSignedIn) {
    return (
      <>
        <LandingPage 
          onGetStarted={handleGetStarted} 
          onSignInClick={handleSignInClick}
        />
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          onSignIn={handleSignIn}
        />
        <GetStartedModal
          isOpen={showGetStartedModal}
          onClose={() => setShowGetStartedModal(false)}
          onSubmit={handleGetStartedSubmit}
        />
      </>
    );
  }

  // Show main application only after user is signed in
  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {!isSidebarCollapsed && (
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onCollapseAll={handleCollapseAll}
            user={user}
            onSignOut={handleSignOut}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        )}
        {isSidebarCollapsed && (
          <div className="w-16 bg-slate-800 text-white flex flex-col h-full">
            {/* Collapsed sidebar with just icons */}
            <div className="p-4 border-b border-slate-700">
              <button
                onClick={handleToggleSidebar}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded transition-colors"
                title="Expand sidebar"
              >
                <img src="/odin_icon_white.svg" alt="ODIN" className="w-6 h-6" />
              </button>
            </div>
            
            {/* Icon navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {/* AI Tools Icons */}
                <button
                  onClick={() => handleSectionChange('assistants')}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                    activeSection === 'assistants'
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="AI Assistants"
                >
                  <Bot className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleSectionChange('prompt-catalog')}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                    activeSection === 'prompt-catalog'
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Prompt Catalog"
                >
                  <BookOpen className="w-6 h-6" />
                </button>
                
                {/* Divider */}
                <div className="h-px bg-slate-700 my-2"></div>
                
                {/* Other sections as icons */}
                <button
                  onClick={() => handleSectionChange('knowledge-articles')}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                    activeSection === 'knowledge-articles'
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Knowledge Articles"
                >
                  <BookOpen className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleSectionChange('resources')}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                    activeSection === 'resources'
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Resources"
                >
                  <FileText className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleSectionChange('profile')}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Profile"
                >
                  <User className="w-6 h-6" />
                </button>
              </div>
            </nav>
            
            {/* User section */}
            <div className="p-2 border-t border-slate-700">
              <button
                onClick={handleSignOut}
                className="w-12 h-12 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title={`Sign out (${user?.email})`}
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
        {showMainContent && !isMainContentCollapsed && !isSidebarCollapsed && activeSection !== 'admin' && activeSection !== 'assistants' && activeSection !== 'prompt-catalog' && activeSection !== 'resources' && activeSection !== 'guidelines' && (
          <MainContent activeSection={activeSection} />
        )}
        {activeSection === 'resources' && (
          <div className="flex-1 flex">
            <ResourcesPage />
          </div>
        )}
        {activeSection === 'guidelines' && (
          <div className="flex-1 flex">
            <GuidelinesPage />
          </div>
        )}
        {activeSection === 'admin' && (
          <div className="flex-1 flex">
            <AdminPage />
          </div>
        )}
        {activeSection === 'assistants' && (
          <div className="flex-1 flex">
            <AssistantsPage onAssistantSelect={handleAssistantSelect} />
          </div>
        )}
        {activeSection === 'prompt-catalog' && (
          <div className="flex-1 flex">
            <PromptCatalogPage onPromptSelect={handlePromptSelect} />
          </div>
        )}
        {activeSection === 'chat' && (
          <div className="flex-1 flex">
            <ChatPage 
              selectedAssistant={selectedAssistant}
              selectedPrompt={selectedPromptText}
              onPromptUsed={() => setSelectedPromptText('')}
              onOpenPromptCatalog={() => setActiveSection('prompt-catalog')}
            />
          </div>
        )}
        {activeSection === 'profile' && (
          <div className="flex-1 flex">
            <ProfileOverlay 
              isOpen={true}
              onClose={() => setActiveSection('assistants')}
            />
          </div>
        )}
        {activeSection === 'settings' && (
          <div className="flex-1 flex">
            <SettingsOverlay 
              isOpen={true}
              onClose={() => setActiveSection('assistants')}
            />
          </div>
        )}
      </div>
      
      {/* Overlay Components */}
      <ProfileOverlay 
        isOpen={showProfileOverlay}
        onClose={() => setShowProfileOverlay(false)}
      />
      <SettingsOverlay 
        isOpen={showSettingsOverlay}
        onClose={() => setShowSettingsOverlay(false)}
      />
    </>
  );
}

export default App;