import React, { useState } from 'react';
import { X } from 'lucide-react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; email: string; company: string; message: string }) => void;
}

const GetStartedModal: React.FC<GetStartedModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        message: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Form submission failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Get Started with Agentic Weaver</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your name"
                disabled={isLoading}
              />
              {errors.name && (
                <div className="absolute top-3 right-3">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {errors.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Company field */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
              Company
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your company name"
              disabled={isLoading}
            />
          </div>

          {/* Message field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Tell us about your needs..."
              disabled={isLoading}
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GetStartedModal;