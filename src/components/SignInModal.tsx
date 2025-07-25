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
      
      // Check for admin credentials
      if (email === 'freddie@3cpublish.com' && password === 'Appdev2025!') {
        onSignIn(email, password);
      } else {
        // For demo purposes, accept any other email/password combination
        onSignIn(email, password);
      }
      
      // Reset form
      setEmail('');
      setPassword('');
      setShowPassword(false);
    } catch (err) {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
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