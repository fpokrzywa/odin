import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to validate user against webhook
  const validateUserCredentials = async (email: string, password: string): Promise<boolean> => {
    const webhookUrl = import.meta.env.VITE_N8N_GET_USERS_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('VITE_N8N_GET_USERS_WEBHOOK_URL not configured');
      return false;
    }

    try {
      // Add email as parameter to webhook URL
      const webhookUrlWithParams = `${webhookUrl}?id=${encodeURIComponent(email)}`;
      console.log('Validating user credentials against webhook:', webhookUrlWithParams);
      const response = await fetch(webhookUrlWithParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`);
      }

      // Read response as text first to handle empty responses
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        console.error('User validation webhook returned empty response for user:', email);
        return false;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse webhook response as JSON:', parseError);
        return false;
      }
      
      console.log('User validation webhook response received');
      
      // Handle single user response or array
      let user;
      if (Array.isArray(data)) {
        // Array response - find matching user
        user = data.find(u => u.id === email || u.email === email);
      } else if (data && typeof data === 'object') {
        // Single user object response
        if (data.id === email || data.email === email) {
          user = data;
        }
      }
      
      if (!user) {
        console.log('User not found in webhook response for email:', email);
        return false;
      }

      // Check password
      if (user.password === password) {
        console.log('User credentials validated successfully');
        return true;
      } else {
        console.log('Password does not match');
        return false;
      }

    } catch (error) {
      console.error('Error validating user credentials:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate credentials against webhook
      const isValidUser = await validateUserCredentials(email, password);
      
      if (isValidUser) {
        console.log('User authentication successful');
        
        // Load and cache user profile data from webhook
        await loadAndCacheUserProfile(email);
        
        onSignIn(email, password);
      } else {
        if (isValidUser === false) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError('Authentication service unavailable. Please check webhook configuration or try again later.');
        }
      }
      
      // Reset form on successful login
      if (isValidUser) {
        setEmail('');
        setPassword('');
        setShowPassword(false);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAndCacheUserProfile = async (email: string) => {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_GET_USERS_WEBHOOK_URL;
      if (!webhookUrl) {
        console.warn('VITE_N8N_GET_USERS_WEBHOOK_URL not configured for profile loading');
        return;
      }

      // Add email as parameter to webhook URL
      const webhookUrlWithParams = `${webhookUrl}?id=${encodeURIComponent(email)}`;
      console.log('Loading user profile from webhook for caching:', webhookUrlWithParams);
      
      const response = await fetch(webhookUrlWithParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`);
      }

      // Read response as text first to handle empty responses
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        console.error('User profile webhook returned empty response for user:', email);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse user profile webhook response as JSON:', parseError);
        return;
      }
      
      console.log('🔍 SignInModal: Raw webhook response for profile caching:', data);
      
      // Handle single user response or array
      let user;
      if (Array.isArray(data)) {
        // Array response - find matching user
        user = data.find(u => u.id === email || u.email === email);
        console.log('🔍 SignInModal: Found user in array:', user);
      } else if (data && typeof data === 'object') {
        // Single user object response
        if (data.id === email || data.email === email) {
          user = data;
          console.log('🔍 SignInModal: Using single user object:', user);
        }
      }
      
      if (user) {
        console.log('✅ SignInModal: User profile loaded successfully from webhook for caching:', user);
        
        // Map webhook user data to profile format
        const userProfile = {
          firstName: user.firstname || user.first_name || '',
          lastName: user.lastname || user.last_name || '',
          email: user.email || user.id || email,
          role: Array.isArray(user.roles) ? user.roles[0] : (user.role || 'User'),
          department: user.department || 'General',
          company: user.Company || user.company || 'Agentic Weaver',
          joinDate: user.joinDate || user.created_at || user.join_date || '2023-01-15',
          hasAcceptedGuidelines: user.hasAcceptedGuidelines !== undefined ? user.hasAcceptedGuidelines : false,
          isAdmin: user.isAdmin !== undefined ? user.isAdmin : (email === 'freddie@3cpublish.com'),
          lastLogin: new Date().toLocaleString(),
          preferredAssistant: user.preferredAssistant || user.preferred_assistant || 'ODIN'
        };
        
        console.log('📋 SignInModal: Mapped user profile:', userProfile);
        
        // Cache to localStorage
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        console.log('💾 SignInModal: User profile cached to localStorage');
        
        // Small delay to ensure localStorage is written before triggering event
        setTimeout(() => {
          window.dispatchEvent(new Event('storage'));
          console.log('📡 SignInModal: Storage event triggered');
        }, 100);
      } else {
        console.log('❌ SignInModal: User not found in webhook response for email:', email);
      }

    } catch (error) {
      console.error('❌ SignInModal: Error loading user profile from webhook for caching:', error);
      // Don't throw error - just log it and continue with login
    }
  };

  const handleDemoSignIn = () => {
    setEmail('freddie@3cpublish.com');
    setPassword('Appdev2025!');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 transform rotate-45 rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg transform -rotate-45">A</span>
              </div>
            </div>
            <span className="text-gray-900 text-xl font-light italic">agentic weaver</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Demo credentials info */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Admin Access</p>
              <p className="text-xs text-orange-600">Use admin credentials to access the system</p>
            </div>
            <button
              onClick={handleDemoSignIn}
              className="px-3 py-1 bg-orange-500 text-white text-xs rounded font-medium hover:bg-orange-600 transition-colors"
            >
              Use Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Contact Sales
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;