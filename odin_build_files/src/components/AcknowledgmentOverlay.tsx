import React, { useState } from 'react';
import { X } from 'lucide-react';
import { getCompanyName } from '../utils/companyConfig';

interface AcknowledgmentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AcknowledgmentOverlay: React.FC<AcknowledgmentOverlayProps> = ({ isOpen, onClose }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    if (acknowledged) {
      // Save acknowledgment to user profile
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        profile.hasAcceptedGuidelines = true;
        localStorage.setItem('userProfile', JSON.stringify(profile));
        // Trigger storage event to notify other components
        window.dispatchEvent(new Event('storage'));
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Acknowledgement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-gray-700">
            Welcome to {getCompanyName()} AI Store! This outlines the guidelines and policies for using AI Store, a digital resource designed to enhance productivity and collaboration.
          </p>
          
          {/* Monitoring and Compliance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Monitoring and Compliance</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>The use of this resource is subject to monitoring.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  You must follow all {getCompanyName()} Company policies, and procedures including the{' '}
                  <a href="#" className="text-orange-600 hover:text-orange-700 underline">
                    {getCompanyName()} Responsible AI SOP
                  </a>.
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  Your use of publicly available consumer versions of GenAI tools and similar products are subject to this{' '}
                  <a href="#" className="text-orange-600 hover:text-orange-700 underline">
                    announcement
                  </a>{' '}
                  and other relevant{' '}
                  <a href="#" className="text-orange-600 hover:text-orange-700 underline">
                    {getCompanyName()} policies
                  </a>.
                </span>
              </li>
            </ul>
          </div>

          {/* Accuracy and Verification */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Accuracy and Verification</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Responses from {getCompanyName()} AI Store may be inaccurate. Always verify accuracy of responses.</span>
              </li>
            </ul>
          </div>

          {/* Copyright, Permissions, and Licensed Data */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Copyright, Permissions, and Licensed Data</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Third party materials may be subject to copyright. Ensure that you have the necessary permissions.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  In some instances, {getCompanyName()} has acquired a license to use certain data (including personal data). In such cases, there might be restrictions on the use of the data. You should verify that your intended use is compatible with such licenses.
                </span>
              </li>
            </ul>
          </div>

          {/* Ethical Concerns */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ethical Concerns</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  If you encounter an ethical concern, such as biased AI output, report it immediately to the{' '}
                  <a href="#" className="text-orange-600 hover:text-orange-700 underline">
                    {getCompanyName()} HR Team & AI Team
                  </a>.
                </span>
              </li>
            </ul>
          </div>

          {/* Using personal data */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Using personal data</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Use only the personal data needed to achieve your business objective.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Avoid making automated decisions about individuals based solely on AI output.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Use personal data in accordance with the privacy notice or consent provided by individuals.</span>
              </li>
            </ul>
          </div>

          {/* Questions and Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions and Contact Information</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  For questions or concerns, please reach out to the Data Risk Office (
                  <a href="mailto:ai_admin@agenticweaver.com" className="text-orange-600 hover:text-orange-700 underline">
                    ai_admin@agenticweaver.com
                  </a>
                  ) or the{' '}
                  <a href="#" className="text-orange-600 hover:text-orange-700 underline">
                    Privacy Law Team
                  </a>.
                </span>
              </li>
            </ul>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">
                I Acknowledge my Responsibility to use this AI based on {getCompanyName()} Guidelines Above
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={!acknowledged}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              acknowledged
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgmentOverlay;