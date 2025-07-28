import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  BookOpen, 
  Users, 
  Building, 
  MapPin, 
  UserCheck, 
  Receipt, 
  Download, 
  Headphones, 
  Mail, 
  Clock, 
  Key, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  FileText,
  User,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { answersService, type FindAnswersItem } from '../services/answersService';
import { automationsService, type AutomateTasksItem } from '../services/automationsService';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCollapseAll: () => void;
  user: { email: string } | null;
  onSignOut: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  onCollapseAll, 
  user, 
  onSignOut,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [isFindAnswersExpanded, setIsFindAnswersExpanded] = useState(false);
  const [isAutomateTasksExpanded, setIsAutomateTasksExpanded] = useState(false);
  const [isInformationExpanded, setIsInformationExpanded] = useState(false);
  const [isAdministrationExpanded, setIsAdministrationExpanded] = useState(false);
  const [isUserExpanded, setIsUserExpanded] = useState(false);
  const [findAnswersItems, setFindAnswersItems] = useState<FindAnswersItem[]>([]);
  const [isLoadingFindAnswers, setIsLoadingFindAnswers] = useState(false);
  const [automateTasksItems, setAutomateTasksItems] = useState<AutomateTasksItem[]>([]);
  const [isLoadingAutomateTasks, setIsLoadingAutomateTasks] = useState(false);

  // Load Find Answers items from webhook
  useEffect(() => {
    const loadFindAnswersItems = async () => {
      setIsLoadingFindAnswers(true);
      try {
        const response = await answersService.getFindAnswersItems();
        setFindAnswersItems(response.items);
        console.log('📋 Sidebar: Loaded Find Answers items:', response.items.length);
      } catch (error) {
        console.error('❌ Sidebar: Error loading Find Answers items:', error);
        // Fallback items will be used from the service
        const fallbackResponse = await answersService.getFindAnswersItems();
        setFindAnswersItems(fallbackResponse.items);
      } finally {
        setIsLoadingFindAnswers(false);
      }
    };

    loadFindAnswersItems();
  }, []);

  // Load Automate Tasks items from webhook
  useEffect(() => {
    const loadAutomateTasksItems = async () => {
      console.log('🔄 Sidebar: Starting to load Automate Tasks items');
      setIsLoadingAutomateTasks(true);
      try {
        console.log('🔗 Sidebar: Webhook info:', automationsService.getConnectionInfo());
        const response = await automationsService.getAutomateTasksItems();
        console.log('📦 Sidebar: Received response with', response.items.length, 'items');
        setAutomateTasksItems(response.items);
        console.log('📋 Sidebar: Loaded Automate Tasks items:', response.items.length);
      } catch (error) {
        console.error('❌ Sidebar: Error loading Automate Tasks items:', error);
        // Fallback items will be used from the service
        try {
          console.log('🔄 Sidebar: Attempting to get fallback data');
          const fallbackResponse = await automationsService.getAutomateTasksItems();
          setAutomateTasksItems(fallbackResponse.items);
          console.log('✅ Sidebar: Loaded fallback data with', fallbackResponse.items.length, 'items');
        } catch (fallbackError) {
          console.error('❌ Sidebar: Even fallback failed:', fallbackError);
          setAutomateTasksItems([]);
        }
      } finally {
        console.log('🏁 Sidebar: Finished loading Automate Tasks items');
        setIsLoadingAutomateTasks(false);
      }
    };

    loadAutomateTasksItems();
  }, []);

  const aiToolsItems = [
    { id: 'assistants', label: 'AI Assistants', icon: Bot },
    { id: 'prompt-catalog', label: 'Prompt Catalog', icon: BookOpen },
  ];

  // Map webhook items to sidebar format with icons
  const findAnswersMenuItems = findAnswersItems.map(item => ({
    id: item.id,
    label: item.title,
    icon: getIconForItem(item.id)
  }));

  // Map automate tasks items to sidebar format with icons
  const automateTasksMenuItems = automateTasksItems.map(item => ({
    id: item.id,
    label: item.title,
    icon: getIconForAutomateTasksItem(item.id)
  }));

  function getIconForItem(itemId: string) {
    switch (itemId) {
      case 'A1970-1':
      case 'hr-policies':
        return Users;
      case 'A1970-2':
      case 'A1970-3':
      case 'it-support-guides':
        return Headphones;
      case 'knowledge-articles':
        return BookOpen;
      case 'organization-chart':
        return Users;
      case 'conference-rooms':
        return Building;
      case 'customer-accounts':
        return UserCheck;
      case 'expense-reports':
        return Receipt;
      default:
        return FileText;
    }
  }

  function getIconForAutomateTasksItem(itemId: string) {
    switch (itemId) {
      case 'get-software-apps':
        return Download;
      case 'track-support-tickets':
        return Headphones;
      case 'manage-email-groups':
        return Mail;
      case 'request-time-off':
        return Clock;
      case 'reset-password':
        return Key;
      default:
        return Settings; // Default icon for webhook items
    }
  }

  const informationItems = [
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'guidelines', label: 'Guidelines', icon: FileText },
  ];

  const administrationItems = [
    { id: 'admin', label: 'User Management', icon: Settings },
  ];

  const userItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleFindAnswersToggle = () => {
    const newState = !isFindAnswersExpanded;
    setIsFindAnswersExpanded(newState);
    if (newState) {
      setIsAutomateTasksExpanded(false);
      setIsInformationExpanded(false);
      setIsAdministrationExpanded(false);
      setIsUserExpanded(false);
    }
  };

  const handleAutomateTasksToggle = () => {
    const newState = !isAutomateTasksExpanded;
    setIsAutomateTasksExpanded(newState);
    if (newState) {
      setIsFindAnswersExpanded(false);
      setIsInformationExpanded(false);
      setIsAdministrationExpanded(false);
      setIsUserExpanded(false);
    }
  };

  const handleInformationToggle = () => {
    const newState = !isInformationExpanded;
    setIsInformationExpanded(newState);
    if (newState) {
      setIsFindAnswersExpanded(false);
      setIsAutomateTasksExpanded(false);
      setIsAdministrationExpanded(false);
      setIsUserExpanded(false);
    }
  };

  const handleAdministrationToggle = () => {
    const newState = !isAdministrationExpanded;
    setIsAdministrationExpanded(newState);
    if (newState) {
      setIsFindAnswersExpanded(false);
      setIsAutomateTasksExpanded(false);
      setIsInformationExpanded(false);
      setIsUserExpanded(false);
    }
  };

  const handleUserToggle = () => {
    const newState = !isUserExpanded;
    setIsUserExpanded(newState);
    if (newState) {
      setIsFindAnswersExpanded(false);
      setIsAutomateTasksExpanded(false);
      setIsInformationExpanded(false);
      setIsAdministrationExpanded(false);
    }
  };

  const handleFindAnswersItemClick = (sectionId: string) => {
    console.log('Find Answers item clicked:', sectionId);
    console.log('🎯 Sidebar: Calling onSectionChange with:', sectionId);
    console.log('🎯 Sidebar: Available Find Answers items:', findAnswersItems.map(item => ({ id: item.id, title: item.title })));
    if (!isFindAnswersExpanded) {
      setIsFindAnswersExpanded(true);
      setIsAutomateTasksExpanded(false);
      setIsInformationExpanded(false);
      setIsAdministrationExpanded(false);
      setIsUserExpanded(false);
    }
    onSectionChange(sectionId);
  };

  const handleAutomateTasksItemClick = (sectionId: string) => {
    console.log('Automate Tasks item clicked:', sectionId);
    console.log('🎯 Sidebar: Calling onSectionChange with:', sectionId);
    console.log('🎯 Sidebar: Available Automate Tasks items:', automateTasksItems.map(item => ({ id: item.id, title: item.title })));
    if (!isAutomateTasksExpanded) {
      setIsAutomateTasksExpanded(true);
      setIsFindAnswersExpanded(false);
      setIsInformationExpanded(false);
      setIsAdministrationExpanded(false);
      setIsUserExpanded(false);
    }
    onSectionChange(sectionId);
  };

  const handleInformationItemClick = (sectionId: string) => {
    if (!isInformationExpanded) {
      setIsInformationExpanded(true);
      setIsFindAnswersExpanded(false);
      setIsAutomateTasksExpanded(false);
      setIsAdministrationExpanded(false);
      setIsUserExpanded(false);
    }
    onSectionChange(sectionId);
  };

  const handleAdministrationItemClick = (sectionId: string) => {
    if (!isAdministrationExpanded) {
      setIsAdministrationExpanded(true);
      setIsFindAnswersExpanded(false);
      setIsAutomateTasksExpanded(false);
      setIsInformationExpanded(false);
      setIsUserExpanded(false);
    }
    onSectionChange(sectionId);
  };

  const handleUserItemClick = (sectionId: string) => {
    if (!isUserExpanded) {
      setIsUserExpanded(true);
      setIsFindAnswersExpanded(false);
      setIsAutomateTasksExpanded(false);
      setIsInformationExpanded(false);
      setIsAdministrationExpanded(false);
    }
    onSectionChange(sectionId);
  };

  const isAdmin = user?.email === 'freddie@3cpublish.com';

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/odin_icon_white.svg" alt="ODIN" className="w-8 h-8" />
            <h1 className="text-xl font-bold">ODIN</h1>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-500">
        {/* AI Tools Section */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            AI Tools
          </h2>
          <ul className="space-y-1">
            {aiToolsItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Find Answers Section */}
        <div className="px-4 pb-4">
          <button
            onClick={handleFindAnswersToggle}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
          >
            <span>Find Answers</span>
            {isFindAnswersExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isFindAnswersExpanded && (
            <ul className="space-y-1">
              {isLoadingFindAnswers ? (
                <li className="px-3 py-2 text-slate-300 text-sm">Loading...</li>
              ) : (
                findAnswersMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleFindAnswersItemClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
                })
              )}
            </ul>
          )}
        </div>

        {/* Automate Tasks Section */}
        <div className="px-4 pb-4">
          <button
            onClick={handleAutomateTasksToggle}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
          >
            <span>Automations</span>
            {isAutomateTasksExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isAutomateTasksExpanded && (
            <ul className="space-y-1">
              {isLoadingAutomateTasks ? (
                <li className="px-3 py-2 text-slate-300 text-sm">Loading...</li>
              ) : (
                automateTasksMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleAutomateTasksItemClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
                })
              )}
            </ul>
          )}
        </div>

        {/* Information Section */}
        <div className="px-4 pb-4">
          {!isInformationExpanded ? (
            <button
              onClick={handleInformationToggle}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
            >
              <span>Information</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleInformationToggle}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
              >
                <span>Information</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <ul className="space-y-1">
                {informationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleInformationItemClick(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-orange-600 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* User Section */}
        <div className="px-4 pb-4">
          <button
            onClick={handleUserToggle}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
          >
            <span>User</span>
            {isUserExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isUserExpanded && (
            <ul className="space-y-1">
              {userItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleUserItemClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {/* Administration Section - Only show for admin */}
        {isAdmin && (
          <div className="px-4 pb-4">
            <button
              onClick={handleAdministrationToggle}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
            >
              <span>Administration</span>
              {isAdministrationExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isAdministrationExpanded && (
              <ul className="space-y-1">
                {administrationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleAdministrationItemClick(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-orange-600 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </nav>

      {/* Bottom Section - User Info */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-3">
          <User className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-300">{user?.email}</span>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;