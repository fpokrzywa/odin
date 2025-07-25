function RightPanelController($scope, $rootScope) {
  var c = this;
  
  // Initialize data
  c.data.isExpanded = c.data.isExpanded || false;
  c.data.isFullScreen = c.data.isFullScreen || false;
  c.data.showSamplePrompts = c.data.showSamplePrompts || false;
  c.data.searchQuery = c.data.searchQuery || '';
  
  // Sample prompts
  c.samplePrompts = [
    "What is our vacation policy?",
    "How do I request time off?",
    "When can I get a laptop refresh?"
  ];
  
  // Methods
  c.toggleSamplePrompts = function() {
    c.data.showSamplePrompts = !c.data.showSamplePrompts;
  };
  
  c.selectPrompt = function(prompt) {
    c.data.searchQuery = prompt;
    // Here you would typically trigger a search or send the prompt
    console.log('Selected prompt:', prompt);
  };
  
  c.expandAll = function() {
    $rootScope.$broadcast('expandAll');
  };
  
  // Event listeners
  $rootScope.$on('toggleMainContent', function() {
    c.data.isExpanded = !c.data.isExpanded;
  });
  
  $rootScope.$on('collapseAll', function() {
    c.data.isExpanded = true;
    c.data.isFullScreen = true;
  });
  
  $rootScope.$on('expandAll', function() {
    c.data.isExpanded = false;
    c.data.isFullScreen = false;
  });
}