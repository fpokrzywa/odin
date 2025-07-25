import React, { useState } from 'react';
import { ExternalLink, Mail, Users, BookOpen, HelpCircle, FileText } from 'lucide-react';
import { getCompanyName } from '../utils/companyConfig';
import { getCompanyBotName } from '../utils/companyConfig';

interface ResourcesPageProps {}

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'engagement' | 'contact'>('learn');

  const learnResources = [
    {
      category: 'Generative AI',
      items: [
        { title: `${getCompanyName()} AI Learning Academy`, hasLink: true },
        { title: `${getCompanyName()} AI Store`, hasLink: true },
        { title: 'Prompt Design Quick Reference Guide', hasLink: true },
        { title: `AI at ${getCompanyName()}`, hasLink: true },
        { title: `${getCompanyName()} ${getCompanyBotName()}`, hasLink: true },
        { title: `${getCompanyName()} Responsible AI`, hasLink: true }
      ]
    },
    {
      category: 'Models',
      items: [
        { title: `What models is ${getCompanyName()} using and what are the Differences Between the GenAI Models?`, hasLink: true }
      ]
    },
    {
      category: 'FAQs',
      items: [
        { title: `Who can access the ${getCompanyName()} AI Store?`, hasLink: true },
        { title: `How long are conversations stored in the ${getCompanyName()} AI Store?`, hasLink: true },
        { title: `Does the ${getCompanyName()} AI Store converse in different languages?`, hasLink: true },
        { title: `Can I use the ${getCompanyName()} AI Store on my mobile device?`, hasLink: true },
        { title: `Can I upload files into ${getCompanyName()} ${getCompanyBotName()}?`, hasLink: true },
        { title: `Why is ${getCompanyName()} ${getCompanyBotName()} giving me incorrect information?`, hasLink: true}
      ]
    }
  ];

  const engagementResources = [
    {
      category: 'New AI',
      items: [
        { title: 'AI Leads to Report New AI Use Cases', hasLink: true },
        { title: 'How do I submit an idea for a new AI use case? AI Idea Capture Form', hasLink: true }
      ]
    },
    {      
      category: `Adding Your Tool to the ${getCompanyName()} ${getCompanyBotName()}`,
      items: [
        { title: `Does ${getCompanyName()} provide access to OpenAI API for employees?`, hasLink: true }
      ]
    }
  ];

  const contactInfo = [
    { title: 'AI Leads to Report New AI Use Cases –', contact: 'Support', hasLink: true },
    { title: 'AI Intake Team –', contact: 'AI_Team@agenticweaver.com', hasLink: true },
    { title: `Report a Bug/Suggestion for the ${getCompanyName()} ${getCompanyBotName()}`, hasLink: true },
    { title: `${getCompanyName()} AI Team`, contact: 'AI_Team@agenticweaver.com', hasLink: true }
  ];

  const renderResourceItem = (item: any, index: number) => (
    <div key={index} className="flex items-center space-x-3 py-2">
      <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
      <span className={`text-sm ${item.isHighlighted ? 'text-pink-600' : 'text-gray-700'} flex-1`}>
        {item.title}
      </span>
      {item.hasLink && (
        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-pink-600 transition-colors cursor-pointer flex-shrink-0" />
      )}
    </div>
  );

  const renderContactItem = (item: any, index: number) => (
    <div key={index} className="flex items-center space-x-3 py-2">
      <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <span className="text-sm text-gray-700">{item.title}</span>
        {item.contact && (
          <span className="text-sm text-gray-700 ml-1">{item.contact}</span>
        )}
      </div>
      {item.hasLink && (
        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-pink-600 transition-colors cursor-pointer flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            About the {getCompanyName()} Gen AI Storefront
          </h1>
          <p className="text-gray-600 leading-relaxed">
            The {getCompanyName()} AI Store is a versatile platform designed to enhance your productivity by leveraging advanced AI capabilities.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'learn'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learn</span>
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'engagement'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Engagement Process For New AI</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'contact'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {activeTab === 'learn' && (
            <div className="space-y-8">
              {learnResources.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    {section.category === 'Generative AI' && <FileText className="w-5 h-5 text-orange-600" />}
                    {section.category === 'Models' && <HelpCircle className="w-5 h-5 text-orange-600" />}
                    {section.category === 'FAQs' && <HelpCircle className="w-5 h-5 text-orange-600" />}
                    <span>{section.category}</span>
                  </h3>
                  <div className="space-y-1 pl-4">
                    {section.items.map((item, itemIndex) => renderResourceItem(item, itemIndex))}
                  </div>
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Have more questions about AI at {getCompanyName()}? Visit</span>
                  <button className="text-sm text-gray-700 hover:text-orange-600 transition-colors flex items-center space-x-1">
                    <span>AgenticWeaver.com</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-8">
              {engagementResources.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span>{section.category}</span>
                  </h3>
                  <div className="space-y-1 pl-4">
                    {section.items.map((item, itemIndex) => renderResourceItem(item, itemIndex))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="space-y-1">
                {contactInfo.map((item, index) => renderContactItem(item, index))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;