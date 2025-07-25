import React, { useState, useEffect } from 'react';
import { X, User, Shield, CheckCircle, XCircle, Settings, Mail, Calendar, RefreshCw } from 'lucide-react';
import { getCompanyName } from '../utils/companyConfig';
import { getCompanyBotName } from '../utils/companyConfig';
import { openaiService, type Assistant } from '../services/openaiService';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  hasAcceptedGuidelines: boolean;
  isAdmin: boolean;
  lastLogin: string;
  preferredAssistant: string;
}

interface ProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Smith',
    email: 'john.smith@agenticweaver.com',
    role: 'Senior Data Scientist',
    department: 'Research & Development',
    joinDate: '2023-01-15',
    hasAcceptedGuidelines: false,
    isAdmin: false,
    lastLogin: '2024-01-15 09:30 AM',
    preferredAssistant: getCompanyBotName()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [openaiAssistants, setOpenaiAssistants] = useState<Assistant[]>([]);
  const [isRefreshingAssistants, setIsRefreshingAssistants] = useState(false);

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setEditedProfile(parsedProfile);
    }
  }, []);

  // Load OpenAI assistants
  useEffect(() => {
    loadOpenAIAssistants();
  }, []);

  const loadOpenAIAssistants = async () => {
    try {
      const result = await openaiService.listAssistants();
      const convertedAssistants = result.assistants.map(assistant => 
        openaiService.convertToInternalFormat(assistant)
      );
      setOpenaiAssistants(convertedAssistants);
    } catch (error) {
      console.error('Error loading OpenAI assistants:', error);
      // Fallback to empty array if OpenAI assistants can't be loaded
      setOpenaiAssistants([]);
    }
  };

  const handleRefreshAssistants = async () => {
    setIsRefreshingAssistants(true);
    try {
      const result = await openaiService.listAssistants(true); // Force refresh
      const convertedAssistants = result.assistants.map(assistant => 
        openaiService.convertToInternalFormat(assistant)
      );
      setOpenaiAssistants(convertedAssistants);
    } catch (error) {
      console.error('Error refreshing OpenAI assistants:', error);
    } finally {
      setIsRefreshingAssistants(false);
    }
  };

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleGuidelinesToggle = () => {
    const updatedProfile = { ...profile, hasAcceptedGuidelines: !profile.hasAcceptedGuidelines };
    setProfile(updatedProfile);
    setEditedProfile(updatedProfile);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleAdminToggle = () => {
    const updatedProfile = { ...profile, isAdmin: !profile.isAdmin };
    setProfile(updatedProfile);
    setEditedProfile(updatedProfile);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  // Default assistants as fallback
  const defaultAssistants = [
    getCompanyBotName(),
    'IT Support',
    'HR Support',
    'Advance Policies Assistant',
    'Redact Assistant',
    'ADEPT Assistant',
    'RFP Assistant',
    'Resume Assistant'
  ];

  // Use OpenAI assistants if available, otherwise use default list
  const availableAssistants = openaiAssistants.length > 0 
    ? openaiAssistants.map(assistant => assistant.name)
    : defaultAssistants;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">User Profile</h2>
              <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-pink-600 hover:text-pink-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.role}
                    onChange={(e) => setEditedProfile({ ...editedProfile, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                {isEditing ? (
                  <select
                    value={editedProfile.department}
                    onChange={(e) => setEditedProfile({ ...editedProfile, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option>Research & Development</option>
                    <option>Commercial</option>
                    <option>Human Resources</option>
                    <option>Information Technology</option>
                    <option>Compliance</option>
                    <option>Finance</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{formatDate(profile.joinDate)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <p className="text-gray-900">{profile.lastLogin}</p>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Assistant</label>
              <div className="flex items-center space-x-2">
                <select
                  value={profile.preferredAssistant}
                  onChange={(e) => setProfile({ ...profile, preferredAssistant: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {availableAssistants.map((assistant) => (
                    <option key={assistant} value={assistant}>
                      {assistant}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleRefreshAssistants}
                  disabled={isRefreshingAssistants}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh assistants from OpenAI"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingAssistants ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h3>
            
            <div className="space-y-4">
              {/* Guidelines Acceptance */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    profile.hasAcceptedGuidelines ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {profile.hasAcceptedGuidelines ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Guidelines Acceptance</h4>
                    <p className="text-sm text-gray-500">
                      {profile.hasAcceptedGuidelines 
                        ? 'You have accepted the AI usage guidelines' 
                        : 'Please accept the AI usage guidelines to continue'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGuidelinesToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    profile.hasAcceptedGuidelines ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profile.hasAcceptedGuidelines ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Admin Status */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    profile.isAdmin ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${profile.isAdmin ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Administrator Access</h4>
                    <p className="text-sm text-gray-500">
                      {profile.isAdmin 
                        ? 'You have administrator privileges' 
                        : 'Standard user access'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAdminToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    profile.isAdmin ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profile.isAdmin ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Export Data</div>
                <div className="text-sm text-gray-500">Download your account data and chat history</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Reset Preferences</div>
                <div className="text-sm text-gray-500">Reset all settings to default values</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-600">
                <div className="font-medium">Delete Account</div>
                <div className="text-sm text-red-500">Permanently delete your account and all data</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverlay;