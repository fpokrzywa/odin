import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, Users, Video, CreditCard, Receipt, Download, Ticket, Mail, Calendar, Lock } from 'lucide-react';

interface MainContentProps {
  activeSection: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeSection }) => {
  const [expandedArticles, setExpandedArticles] = useState<string[]>([]);

  const toggleArticle = (article: string) => {
    setExpandedArticles(prev =>
      prev.includes(article)
        ? prev.filter(a => a !== article)
        : [...prev, article]
    );
  };

  const renderKnowledgeArticles = () => {
    const articles = [
      'US Leave Policies',
      'India Leave Policies',
      'BannerTech Laptop Refresh Policy',
      'Troubleshooting Printers',
      'Global Travel & Expense Policy',
      'How to Update Personal Information in Workday',
    ];

    return (
      <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Knowledge articles</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Moveworks quickly answers employee questions on any topic by finding relevant information
            across all the business systems.
          </p>
        </div>

        {/* Try it yourself section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3 mb-4">
            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-orange-900">Try it yourself!</h2>
          </div>
          
          <div className="text-gray-700 mb-4">
            <p className="mb-4">
              Imagine you are an employee at BannerTech. You are curious about company policies
              and benefits. Here's what you can do with Moveworks:
            </p>
            
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Ask questions about the policies</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Find information tailored to your needs. e.g. Can I take a two-week vacation based on my PTO balance?</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Articles Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semi text-gray-900 mb-6">
            Here are the sample articles that power the answers about your questions
          </h3>
          
          <div className="space-y-3">
            {articles.map((article) => (
              <div key={article} className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleArticle(article)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{article}</span>
                  {expandedArticles.includes(article) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedArticles.includes(article) && (
                  <div className="px-4 pb-4 text-gray-600">
                    <div className="pt-2 border-t border-gray-100">
                      <p>Sample content for {article.toLowerCase()}...</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learn More Link */}
        <div className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors cursor-pointer">
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium">Learn more about Enterprise Search</span>
        </div>
      </>
    );
  };

  const renderGenericContent = (title: string, description: string, icon: React.ElementType) => {
    const IconComponent = icon;
    
    return (
      <>
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <IconComponent className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3 mb-4">
            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-orange-900">Coming Soon!</h2>
          </div>
          
          <div className="text-gray-700">
            <p>
              This feature is currently being developed. Check back soon for updates and new functionality.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can expect:</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Intuitive interface for easy navigation</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Real-time updates and notifications</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Seamless integration with existing systems</span>
            </li>
          </ul>
        </div>
      </>
    );
  };

  const getContentForSection = () => {
    switch (activeSection) {
      case 'knowledge-articles':
        return renderKnowledgeArticles();
      case 'organization-chart':
        return renderGenericContent(
          'Organization Chart',
          'View and navigate your company\'s organizational structure with ease.',
          Users
        );
      case 'conference-rooms':
        return renderGenericContent(
          'Conference Rooms',
          'Find and book available conference rooms for your meetings.',
          Video
        );
      case 'customer-accounts':
        return renderGenericContent(
          'Customer Accounts',
          'Access and manage customer account information and details.',
          CreditCard
        );
      case 'expense-reports':
        return renderGenericContent(
          'Expense Reports',
          'Submit, track, and manage your expense reports efficiently.',
          Receipt
        );
      case 'software-apps':
        return renderGenericContent(
          'Get Software Apps',
          'Request and download approved software applications for your work.',
          Download
        );
      case 'support-tickets':
        return renderGenericContent(
          'Support Tickets',
          'Track and update your IT support tickets and requests.',
          Ticket
        );
      case 'email-groups':
        return renderGenericContent(
          'Email Groups',
          'Manage your email group memberships and distribution lists.',
          Mail
        );
      case 'time-off':
        return renderGenericContent(
          'Request Time Off',
          'Submit and manage your vacation and time-off requests.',
          Calendar
        );
      case 'reset-password':
        return renderGenericContent(
          'Reset Password',
          'Securely reset your passwords for various systems and applications.',
          Lock
        );
      default:
        return renderKnowledgeArticles();
    }
  };

  return (
    <div className="w-1/2 bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {getContentForSection()}
      </div>
    </div>
  );
};

export default MainContent;