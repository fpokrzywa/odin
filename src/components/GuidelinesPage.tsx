import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileText, Users, Mail } from 'lucide-react';
import { getCompanyName } from '../utils/companyConfig';

interface GuidelinesPageProps {}

const GuidelinesPage: React.FC<GuidelinesPageProps> = () => {
  const [acknowledgedSections, setAcknowledgedSections] = useState<string[]>([]);

  const toggleAcknowledgment = (sectionId: string) => {
    setAcknowledgedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const allSectionsAcknowledged = acknowledgedSections.length === 6; // Total number of sections

  const handleSaveAcknowledgment = () => {
    // Save acknowledgment to user profile
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      profile.hasAcceptedGuidelines = true;
      profile.guidelinesAcknowledgedAt = new Date().toISOString();
      localStorage.setItem('userProfile', JSON.stringify(profile));
      // Trigger storage event to notify other components
      window.dispatchEvent(new Event('storage'));
    }
    
    // Show success message
    alert('Guidelines acknowledgment saved successfully!');
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              AI Usage Guidelines
            </h1>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Welcome to {getCompanyName()} AI Store! These guidelines outline the policies and best practices for using AI tools responsibly and effectively within our organization.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Monitoring and Compliance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitoring and Compliance</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>The use of this resource is subject to monitoring.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      You must follow all {getCompanyName()} Company policies, and procedures including the{' '}
                      <a href="#" className="text-orange-600 hover:text-orange-700 underline">
                        {getCompanyName()} Responsible AI SOP
                      </a>.
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
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
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleAcknowledgment('monitoring')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    acknowledgedSections.includes('monitoring')
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {acknowledgedSections.includes('monitoring') && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Accuracy and Verification */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Accuracy and Verification</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Responses from {getCompanyName()} AI Store may be inaccurate. Always verify accuracy of responses.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cross-reference important information with authoritative sources before making decisions.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use human judgment and expertise to validate AI-generated content.</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleAcknowledgment('accuracy')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    acknowledgedSections.includes('accuracy')
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {acknowledgedSections.includes('accuracy') && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Copyright and Permissions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Copyright, Permissions, and Licensed Data</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Third party materials may be subject to copyright. Ensure that you have the necessary permissions.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      In some instances, {getCompanyName()} has acquired a license to use certain data (including personal data). In such cases, there might be restrictions on the use of the data. You should verify that your intended use is compatible with such licenses.
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleAcknowledgment('copyright')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    acknowledgedSections.includes('copyright')
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {acknowledgedSections.includes('copyright') && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Ethical Concerns */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ethical Concerns</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      If you encounter an ethical concern, such as biased AI output, report it immediately to the{' '}
                      <a href="mailto:hr@agenticweaver.com" className="text-orange-600 hover:text-orange-700 underline">
                        {getCompanyName()} HR Team
                      </a>{' '}
                      &{' '}
                      <a href="mailto:ai_team@agenticweaver.com" className="text-orange-600 hover:text-orange-700 underline">
                        AI Team
                      </a>.
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Be aware of potential biases in AI-generated content and take steps to mitigate them.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use AI tools in a manner that promotes fairness, inclusivity, and respect for all individuals.</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleAcknowledgment('ethics')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    acknowledgedSections.includes('ethics')
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {acknowledgedSections.includes('ethics') && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Personal Data Usage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Using Personal Data</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use only the personal data needed to achieve your business objective.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Avoid making automated decisions about individuals based solely on AI output.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use personal data in accordance with the privacy notice or consent provided by individuals.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ensure compliance with GDPR, CCPA, and other applicable privacy regulations.</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleAcknowledgment('personal-data')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    acknowledgedSections.includes('personal-data')
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {acknowledgedSections.includes('personal-data') && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Questions and Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions and Contact Information</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      For questions or concerns, please reach out to the Data Risk Office (
                      <a href="mailto:ai_admin@agenticweaver.com" className="text-orange-600 hover:text-orange-700 underline">
                        ai_admin@agenticweaver.com
                      </a>
                      ) or the{' '}
                      <a href="mailto:privacy@agenticweaver.com" className="text-orange-600 hover:text-orange-700 underline">
                        Privacy Law Team
                      </a>.
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      For technical support, contact the{' '}
                      <a href="mailto:support@agenticweaver.com" className="text-orange-600 hover:text-orange-700 underline">
                        IT Support Team
                      </a>.
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Report security incidents to{' '}
                      <a href="mailto:security@agenticweaver.com" className="text-orange-600 hover:text-orange-700 underline">
                        security@agenticweaver.com
                      </a>.
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleAcknowledgment('contact')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    acknowledgedSections.includes('contact')
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {acknowledgedSections.includes('contact') && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Acknowledgment Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acknowledgment Summary</h3>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sections Acknowledged:</span>
                  <span className={`text-sm font-semibold ${allSectionsAcknowledged ? 'text-green-600' : 'text-orange-600'}`}>
                    {acknowledgedSections.length} / 6
                  </span>
                </div>
                {allSectionsAcknowledged && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSaveAcknowledgment}
                disabled={!allSectionsAcknowledged}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  allSectionsAcknowledged
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {allSectionsAcknowledged 
                  ? 'Save Acknowledgment' 
                  : 'Please acknowledge all sections above'
                }
              </button>
              
              {allSectionsAcknowledged && (
                <p className="text-sm text-gray-600 mt-3">
                  By clicking "Save Acknowledgment", you confirm that you have read, understood, and agree to follow these AI usage guidelines.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;