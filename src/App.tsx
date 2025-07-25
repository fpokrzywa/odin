import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SignInModal from './components/SignInModal';
import GetStartedModal from './components/GetStartedModal';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightPanel from './components/RightPanel';
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
    // Show main content when a Find Answers section is selected (keep existing functionality)
    const findAnswersSections = ['knowledge-articles', 'organization-chart', 'conference-rooms', 'customer-accounts', 'expense-reports', 'resources', 'guidelines'];
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
    // You can add navigation to a chat interface here if needed
    console.log('Selected assistant:', assistant);
  };

  const handlePromptSelect = (promptText: string, assistantName: string) => {
    // Handle prompt selection - you can integrate this with your chat system
    console.log('Selected prompt:', promptText, 'for assistant:', assistantName);
  };

  const handleCollapseAll = () => {
    setIsSidebarCollapsed(true);
  };

  const handleExpandAll = () => {
    setIsSidebarCollapsed(false);
  };

  const handleToggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', isSidebarCollapsed);
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onCollapseAll={handleCollapseAll}
          user={user}
          onSignOut={handleSignOut}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
        {showMainContent && !isMainContentCollapsed && !isSidebarCollapsed && activeSection !== 'admin' && activeSection !== 'assistants' && activeSection !== 'prompt-catalog' && (
          <MainContent activeSection={activeSection} />
        )}
        {activeSection === 'resources' && !isMainContentCollapsed && !isSidebarCollapsed && (
          <div className="flex-1 flex">
            <ResourcesPage />
          </div>
        )}
        {activeSection === 'guidelines' && !isMainContentCollapsed && !isSidebarCollapsed && (
          <div className="flex-1 flex">
            <GuidelinesPage />
          </div>
        )}
        {activeSection === 'admin' && !isMainContentCollapsed && !isSidebarCollapsed && (
          <div className="flex-1 flex">
            <AdminPage />
          </div>
        )}
        {activeSection === 'assistants' && !isMainContentCollapsed && !isSidebarCollapsed && (
          <div className="flex-1 flex">
            <AssistantsPage onAssistantSelect={handleAssistantSelect} />
          </div>
        )}
        {activeSection === 'prompt-catalog' && !isMainContentCollapsed && !isSidebarCollapsed && (
          <div className="flex-1 flex">
            <PromptCatalogPage onPromptSelect={handlePromptSelect} />
          </div>
        )}
        {(activeSection === 'admin' || activeSection === 'assistants' || activeSection === 'prompt-catalog' || activeSection === 'resources' || activeSection === 'guidelines') && !isMainContentCollapsed && !isSidebarCollapsed ? null : (
          <RightPanel 
            isExpanded={!showMainContent || isSidebarCollapsed || activeSection === 'assistants' || activeSection === 'prompt-catalog' || activeSection === 'resources' || activeSection === 'guidelines'} 
            isFullScreen={isSidebarCollapsed}
            onExpandAll={handleExpandAll}
            user={user}
          />
        )}
      </div>
    </>
  );
}

export default App;