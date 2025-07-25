import React, { useState, useEffect } from 'react';
import { ChevronDown, Settings, User, Menu, X } from 'lucide-react';
import { getCompanyName, getCompanyLogo } from '../utils/companyConfig';

interface HeaderProps {
  onNavigate: (page: 'chat' | 'assistants' | 'prompt-catalog' | 'resources') => void;
  currentPage: 'chat' | 'assistants' | 'prompt-catalog' | 'resources';
  onOpenPromptCatalog: () => void;
  onOpenSettings: () => void;
  onOpenAcknowledgment: () => void;
  onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  currentPage, 
  onOpenPromptCatalog, 
  onOpenSettings, 
  onOpenAcknowledgment,
  onOpenProfile
}) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Listen for profile changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const handleNavigate = (page: 'chat' | 'assistants' | 'prompt-catalog' | 'resources') => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleOpenPromptCatalog = () => {
    onOpenPromptCatalog();
    setMobileMenuOpen(false);
  };

  const handleOpenSettings = () => {
    onOpenSettings();
    setMobileMenuOpen(false);
  };

  const handleOpenAcknowledgment = () => {
    onOpenAcknowledgment();
    setMobileMenuOpen(false);
  };

  const handleOpenProfile = () => {
    onOpenProfile();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 relative">
      <div className="flex items-center justify-between">
        {/* Logo and main navigation - always visible */}
        <div className="flex items-center space-x-3">
          <img 
            src={getCompanyLogo()}
            alt={`${getCompanyName()} Logo`}
            className="w-10 h-10 rounded-lg object-contain"
          />
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-3">
            <button 
              onClick={() => onNavigate('assistants')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'assistants' 
                  ? 'text-orange-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              AI Storefront
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => onNavigate('chat')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'chat' 
                  ? 'text-orange-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              AI Chat
            </button>
          </div>

          {/* Mobile: Show current page title */}
          <div className="md:hidden">
            <span className="text-sm font-medium text-gray-800">
              {currentPage === 'assistants' && 'AI Store'}
              {currentPage === 'chat' && 'AI Chat'}
              {currentPage === 'prompt-catalog' && 'Prompts'}
              {currentPage === 'resources' && 'Resources'}
            </span>
          </div>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors">
            <span>Manage Content</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onNavigate('prompt-catalog')}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            Prompt Catalog
          </button>
          
          <button 
            onClick={() => onNavigate('resources')}
            className={`transition-colors ${
              currentPage === 'resources' 
                ? 'text-orange-600' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Resources
          </button>
          
          {!userProfile?.hasAcceptedGuidelines && (
            <button 
              onClick={onOpenAcknowledgment}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Guidelines
            </button>
          )}
          
          <div className="flex items-center space-x-3 ml-8">
            <button 
              onClick={onOpenSettings}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenProfile}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* Mobile hamburger menu button */}
        <div className="md:hidden mobile-menu-container">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="absolute top-full right-0 left-0 bg-white border-b border-gray-200 shadow-lg z-50">
              <div className="px-4 py-3 space-y-3">
                {/* Main navigation */}
                <div className="space-y-2">
                  <button 
                    onClick={() => handleNavigate('assistants')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 'assistants' 
                        ? 'text-orange-600 bg-orange-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    AI Storefront
                  </button>
                  <button 
                    onClick={() => handleNavigate('chat')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 'chat' 
                        ? 'text-orange-600 bg-orange-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    AI Chat
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <button 
                    onClick={() => handleNavigate('prompt-catalog')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentPage === 'prompt-catalog' 
                        ? 'text-orange-600 bg-orange-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Prompt Catalog
                  </button>
                  
                  <button 
                    onClick={() => handleNavigate('resources')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentPage === 'resources' 
                        ? 'text-orange-600 bg-orange-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Resources
                  </button>

                  <button className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span>Manage Content</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                </div>

                {!userProfile?.hasAcceptedGuidelines && (
                  <div className="border-t border-gray-200 pt-3">
                    <button 
                      onClick={handleOpenAcknowledgment}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Guidelines
                    </button>
                  </div>
                )}

                {/* User actions */}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <button 
                    onClick={handleOpenSettings}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={handleOpenProfile}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;