import React, { useState } from 'react';
import { 
  Search, 
  Users, 
  Video, 
  CreditCard, 
  Receipt, 
  Download, 
  Ticket, 
  Mail, 
  Calendar, 
  Lock,
  ChevronRight,
  ChevronDown,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCollapseAll: () => void;
  user: { email: string } | null;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  onCollapseAll,
  user,
  onSignOut 
}) => {
  const [isFindAnswersExpanded, setIsFindAnswersExpanded] = useState(false);
  const [isAutomateTasksExpanded, setIsAutomateTasksExpanded] = useState(true);
  const [isAdministrationExpanded, setIsAdministrationExpanded] = useState(true);

  const findAnswersItems = [
    { icon: Search, label: 'Knowledge articles', id: 'knowledge-articles' },
    { icon: Users, label: 'Organization chart', id: 'organization-chart' },
    { icon: Video, label: 'Conference rooms', id: 'conference-rooms' },
    { icon: CreditCard, label: 'Customer accounts', id: 'customer-accounts' },
    { icon: Receipt, label: 'Expense reports', id: 'expense-reports' },
  ];

  const automateTasksItems = [
    { icon: Download, label: 'Get software apps', id: 'software-apps' },
    { icon: Ticket, label: 'Track and update support tickets', id: 'support-tickets' },
    { icon: Mail, label: 'Manage email groups', id: 'email-groups' },
    { icon: Calendar, label: 'Request time off', id: 'time-off' },
    { icon: Lock, label: 'Reset password', id: 'reset-password' },
  ];

  // Check if user is admin
  const isAdmin = user?.email === 'freddie@3cpublish.com';

  const handleFindAnswersToggle = () => {
    setIsFindAnswersExpanded(!isFindAnswersExpanded);
  };

  const handleFindAnswersItemClick = (itemId: string) => {
    if (!isFindAnswersExpanded) {
      setIsFindAnswersExpanded(true);
    }
    onSectionChange(itemId);
  };

  const handleAutomateTasksToggle = () => {
    setIsAutomateTasksExpanded(!isAutomateTasksExpanded);
  };

  const handleAutomateTasksItemClick = (itemId: string) => {
    if (!isAutomateTasksExpanded) {
      setIsAutomateTasksExpanded(true);
    }
    onSectionChange(itemId);
  };

  const handleAdministrationToggle = () => {
    setIsAdministrationExpanded(!isAdministrationExpanded);
  };

  const handleAdministrationItemClick = (itemId: string) => {
    if (!isAdministrationExpanded) {
      setIsAdministrationExpanded(true);
    }
    onSectionChange(itemId);
  };
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Weaver</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">PLAYGROUND</span>
          </div>
          <button
            onClick={onCollapseAll}
            className="p-1 hover:bg-gray-600 rounded transition-colors"
            title="Collapse sidebar"
          >
            <Menu className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6">
        {/* Find Answers Section */}
        <div className="mb-8">
          <button
            onClick={handleFindAnswersToggle}
            className="flex items-center justify-between w-full px-6 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider hover:text-white transition-colors"
          >
            <span>Find Answers</span>
            {isFindAnswersExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isFindAnswersExpanded && (
            <nav className="space-y-1 mt-4">
              {findAnswersItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleFindAnswersItemClick(item.id)}
                  className={`flex items-center px-6 py-2 text-sm font-medium transition-colors w-full text-left ${
                    activeSection === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Automate Tasks Section */}
        <div className="mb-8">
          <button
            onClick={handleAutomateTasksToggle}
            className="flex items-center justify-between w-full px-6 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider hover:text-white transition-colors"
          >
            <span>Automate Tasks</span>
            {isAutomateTasksExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isAutomateTasksExpanded && (
            <nav className="space-y-1 mt-4">
              {automateTasksItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAutomateTasksItemClick(item.id)}
                  className={`flex items-center px-6 py-2 text-sm font-medium transition-colors w-full text-left ${
                    activeSection === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Admin Section - Only show for admin users */}
        {isAdmin && (
          <div className="mb-8">
            <button
              onClick={handleAdministrationToggle}
              className="flex items-center justify-between w-full px-6 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider hover:text-white transition-colors"
            >
              <span>Administration</span>
              {isAdministrationExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isAdministrationExpanded && (
              <nav className="space-y-1 mt-4">
                <button
                  onClick={() => handleAdministrationItemClick('admin')}
                  className={`flex items-center px-6 py-2 text-sm font-medium transition-colors w-full text-left ${
                    activeSection === 'admin'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <Users className="mr-3 h-4 w-4" />
                  User Management
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-gray-600 mt-auto bg-gray-800">
        <div className="mb-4">
          <p className="text-xs text-gray-300 mb-3">
            Reach out to experience it live in your environment.
          </p>
          <button className="w-full bg-orange-500 text-white py-2 px-4 rounded font-medium text-sm hover:bg-orange-600 transition-colors">
            Contact Sales
          </button>
        </div>
        <a href="#" className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
          {user ? (
            <div className="w-full">
              <div className="flex items-center text-sm text-gray-300 mb-2">
                <Users className="mr-2 h-4 w-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <button 
                onClick={onSignOut}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              Sign in
            </>
          )}
        </a>
      </div>
    </div>
  );
};

export default Sidebar;