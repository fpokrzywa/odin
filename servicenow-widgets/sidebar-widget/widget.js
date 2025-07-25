function SidebarController($scope, $rootScope) {
  var c = this;
  
  // Initialize data
  c.data.activeSection = c.data.activeSection || 'knowledge-articles';
  
  // Navigation items
  c.findAnswersItems = [
    { icon: 'glyphicon-search', label: 'Knowledge articles', id: 'knowledge-articles' },
    { icon: 'glyphicon-user', label: 'Organization chart', id: 'organization-chart' },
    { icon: 'glyphicon-facetime-video', label: 'Conference rooms', id: 'conference-rooms' },
    { icon: 'glyphicon-credit-card', label: 'Customer accounts', id: 'customer-accounts' },
    { icon: 'glyphicon-list-alt', label: 'Expense reports', id: 'expense-reports' }
  ];
  
  c.automateTasksItems = [
    { icon: 'glyphicon-download-alt', label: 'Get software apps', id: 'software-apps' },
    { icon: 'glyphicon-tag', label: 'Track and update support tickets', id: 'support-tickets' },
    { icon: 'glyphicon-envelope', label: 'Manage email groups', id: 'email-groups' },
    { icon: 'glyphicon-calendar', label: 'Request time off', id: 'time-off' },
    { icon: 'glyphicon-lock', label: 'Reset password', id: 'reset-password' }
  ];
  
  // Methods
  c.setActiveSection = function(section) {
    c.data.activeSection = section;
    $rootScope.$broadcast('sectionChanged', section);
  };
  
  c.toggleMainContent = function() {
    $rootScope.$broadcast('toggleMainContent');
  };
  
  c.collapseAll = function() {
    $rootScope.$broadcast('collapseAll');
  };
}