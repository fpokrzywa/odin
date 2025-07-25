import React, { useState } from 'react';
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
  const [isFindAnswersExpanded, setIsFindAnswersExpanded] = useState(true);
  const [isAutomateTasksExpanded, setIsAutomateTasksExpanded] = useState(true);
  const [isInformationExpanded, setIsInformationExpanded] = useState(false);
  const [isAdministrationExpanded, setIsAdministrationExpanded] = useState(true);

  const aiToolsItems = [
    { id: 'assistants', label: 'AI Assistants', icon: Bot },
    { id: 'prompt-catalog', label: 'Prompt Catalog', icon: BookOpen },
  ];

  const findAnswersItems = [
    { id: 'knowledge-articles', label: 'Knowledge articles', icon: BookOpen },
    { id: 'organization-chart', label: 'Organization chart', icon: Users },
    { id: 'conference-rooms', label: 'Conference rooms', icon: Building },
    { id: 'customer-accounts', label: 'Customer accounts', icon: UserCheck },
    { id: 'expense-reports', label: 'Expense reports', icon: Receipt },
  ];

  const automateTasksItems = [
    { id: 'get-software-apps', label: 'Get software apps', icon: Download },
    { id: 'track-support-tickets', label: 'Track and update support tickets', icon: Headphones },
    { id: 'manage-email-groups', label: 'Manage email groups', icon: Mail },
    { id: 'request-time-off', label: 'Request time off', icon: Clock },
    { id: 'reset-password', label: 'Reset password', icon: Key },
  ];

  const informationItems = [
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'guidelines', label: 'Guidelines', icon: FileText },
  ];

  const administrationItems = [
    { id: 'admin', label: 'User Management', icon: Settings },
  ];

  const handleFindAnswersToggle = () => {
    setIsFindAnswersExpanded(!isFindAnswersExpanded);
  };

  const handleAutomateTasksToggle = () => {
    setIsAutomateTasksExpanded(!isAutomateTasksExpanded);
  };

  const handleInformationToggle = () => {
    setIsInformationExpanded(!isInformationExpanded);
  };

  const handleAdministrationToggle = () => {
    setIsAdministrationExpanded(!isAdministrationExpanded);
  };

  const handleFindAnswersItemClick = (sectionId: string) => {
    if (!isFindAnswersExpanded) {
      setIsFindAnswersExpanded(true);
    }
    onSectionChange(sectionId);
  };

  const handleAutomateTasksItemClick = (sectionId: string) => {
    if (!isAutomateTasksExpanded) {
      setIsAutomateTasksExpanded(true);
    }
    onSectionChange(sectionId);
  };

  const handleInformationItemClick = (sectionId: string) => {
    if (!isInformationExpanded) {
      setIsInformationExpanded(true);
    }
    onSectionChange(sectionId);
  };

  const handleAdministrationItemClick = (sectionId: string) => {
    if (!isAdministrationExpanded) {
      setIsAdministrationExpanded(true);
    }
    onSectionChange(sectionId);
  };

  const isAdmin = user?.email === 'freddie@3cpublish.com';

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <img src="/odin_icon_white.svg" alt="ODIN" className="w-8 h-8" />
          <h1 className="text-xl font-bold">ODIN</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
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
              {findAnswersItems.map((item) => {
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
              })}
            </ul>
          )}
        </div>

        {/* Automate Tasks Section */}
        <div className="px-4 pb-4">
          <button
            onClick={handleAutomateTasksToggle}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
          >
            <span>Automate Tasks</span>
            {isAutomateTasksExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isAutomateTasksExpanded && (
            <ul className="space-y-1">
              {automateTasksItems.map((item) => {
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
              })}
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