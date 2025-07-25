function MainContentController($scope, $rootScope) {
  var c = this;
  
  // Initialize data
  c.data.activeSection = c.data.activeSection || 'knowledge-articles';
  c.data.isCollapsed = c.data.isCollapsed || false;
  c.expandedArticles = [];
  
  // Knowledge articles data
  c.knowledgeArticles = [
    { id: 'us-leave', title: 'US Leave Policies' },
    { id: 'india-leave', title: 'India Leave Policies' },
    { id: 'laptop-refresh', title: 'BannerTech Laptop Refresh Policy' },
    { id: 'printer-troubleshooting', title: 'Troubleshooting Printers' },
    { id: 'travel-expense', title: 'Global Travel & Expense Policy' },
    { id: 'workday-update', title: 'How to Update Personal Information in Workday' }
  ];
  
  // Section configurations
  c.sectionConfig = {
    'organization-chart': {
      title: 'Organization Chart',
      description: 'View and navigate your company\'s organizational structure with ease.',
      icon: 'glyphicon-user'
    },
    'conference-rooms': {
      title: 'Conference Rooms',
      description: 'Find and book available conference rooms for your meetings.',
      icon: 'glyphicon-facetime-video'
    },
    'customer-accounts': {
      title: 'Customer Accounts',
      description: 'Access and manage customer account information and details.',
      icon: 'glyphicon-credit-card'
    },
    'expense-reports': {
      title: 'Expense Reports',
      description: 'Submit, track, and manage your expense reports efficiently.',
      icon: 'glyphicon-list-alt'
    },
    'software-apps': {
      title: 'Get Software Apps',
      description: 'Request and download approved software applications for your work.',
      icon: 'glyphicon-download-alt'
    },
    'support-tickets': {
      title: 'Support Tickets',
      description: 'Track and update your IT support tickets and requests.',
      icon: 'glyphicon-tag'
    },
    'email-groups': {
      title: 'Email Groups',
      description: 'Manage your email group memberships and distribution lists.',
      icon: 'glyphicon-envelope'
    },
    'time-off': {
      title: 'Request Time Off',
      description: 'Submit and manage your vacation and time-off requests.',
      icon: 'glyphicon-calendar'
    },
    'reset-password': {
      title: 'Reset Password',
      description: 'Securely reset your passwords for various systems and applications.',
      icon: 'glyphicon-lock'
    }
  };
  
  // Methods
  c.toggleArticle = function(articleId) {
    var index = c.expandedArticles.indexOf(articleId);
    if (index > -1) {
      c.expandedArticles.splice(index, 1);
    } else {
      c.expandedArticles.push(articleId);
    }
  };
  
  c.isArticleExpanded = function(articleId) {
    return c.expandedArticles.indexOf(articleId) > -1;
  };
  
  c.getCurrentSectionTitle = function() {
    var config = c.sectionConfig[c.data.activeSection];
    return config ? config.title : 'Knowledge Articles';
  };
  
  c.getCurrentSectionDescription = function() {
    var config = c.sectionConfig[c.data.activeSection];
    return config ? config.description : 'Find answers to your questions.';
  };
  
  c.getCurrentSectionIcon = function() {
    var config = c.sectionConfig[c.data.activeSection];
    return config ? config.icon : 'glyphicon-search';
  };
  
  // Event listeners
  $rootScope.$on('sectionChanged', function(event, section) {
    c.data.activeSection = section;
    c.data.isCollapsed = false;
  });
  
  $rootScope.$on('toggleMainContent', function() {
    c.data.isCollapsed = !c.data.isCollapsed;
  });
  
  $rootScope.$on('collapseAll', function() {
    c.data.isCollapsed = true;
  });
  
  $rootScope.$on('expandAll', function() {
    c.data.isCollapsed = false;
  });
}