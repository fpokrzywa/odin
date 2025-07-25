import React, { useState } from 'react';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Users, 
  Brain, 
  Sparkles, 
  CheckCircle,
  Play,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignInClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignInClick }) => {
  const [selectedPricingPlan, setSelectedPricingPlan] = useState<string | null>(null);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI that understands context and provides intelligent responses to complex queries.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant answers and automate tasks with unprecedented speed and efficiency.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control and data encryption.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamlessly integrate with your existing workflows and team processes.'
    }
  ];

  const benefits = [
    'Reduce support ticket volume by 40%',
    'Increase employee productivity by 60%',
    'Automate routine tasks instantly',
    'Access knowledge across all systems',
    '24/7 intelligent assistance',
    'Seamless integration with existing tools'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 transform rotate-45 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg transform -rotate-45">A</span>
                </div>
              </div>
              <span className="text-white text-xl font-light italic">agentic weaver</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={scrollToFeatures} className="text-gray-300 hover:text-white transition-colors">Features</button>
            <button onClick={scrollToPricing} className="text-gray-300 hover:text-white transition-colors">Pricing</button>
            <button onClick={scrollToAbout} className="text-gray-300 hover:text-white transition-colors">About</button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={onSignInClick}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 pt-32 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Star className="w-4 h-4" />
              <span>Experience AI transformation at work</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"> Workplace </span>
              with AI
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Agentic Weaver revolutionizes how employees find answers, automate tasks, and collaborate. 
              Experience the future of workplace productivity with intelligent AI assistance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Try Interactive Demo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-orange-500 hover:text-orange-600 transition-colors">
                Watch Video
              </button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Workplaces
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Agentic Weaver transforms everyday work with intelligent automation and seamless integration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-200">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Measurable Results from Day One
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of organizations that have transformed their workplace productivity with Agentic Weaver.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Live Demo Preview</span>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-orange-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <button
                  onClick={onGetStarted}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-colors"
                >
                  Try Interactive Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">Our Vision</h2>
              
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  AgenticWeaver was founded on the belief that technology should work for you—
                  empowering businesses to create more value for their customers. We see 
                  ourselves as the "weavers" of digital intelligence, threading together innovative AI 
                  tools and automation platforms to craft solutions that propel organizations 
                  forward.
                </p>
                
                <p>
                  Our approach begins with discovery and strategy—diving deep into your 
                  operations to identify friction points and growth opportunities. We then design 
                  and develop bespoke solutions, from AI-driven chatbots to custom automations, 
                  testing and refining each meticulously.
                </p>
                
                <p>
                  Comprised of AI specialists, automation engineers, and business strategists, we 
                  bring a balanced blend of technical expertise and commercial insight to every 
                  project. We thrive on collaborative, transparent relationships—because your 
                  success is our success.
                </p>
              </div>
              
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">100%</div>
                  <div className="text-sm text-gray-400">Tailored Solutions</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
                  <div className="text-sm text-gray-400">Expert Support</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">ROI</div>
                  <div className="text-sm text-gray-400">Focused</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Team collaboration" 
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
                
                {/* Join Our Team Card */}
                <div className="absolute bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 shadow-xl max-w-xs">
                  <h3 className="text-white font-bold text-lg mb-2">Join Our Team</h3>
                  <p className="text-orange-100 text-sm mb-4">We're always looking for talented individuals</p>
                  <button className="w-full bg-white text-orange-600 font-semibold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                    View Opportunities
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400">
              No hidden fees. No surprises. Start free, upgrade when you're ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div 
              className={`bg-gray-800 rounded-2xl p-8 border border-gray-700 relative cursor-pointer transition-all duration-300 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-2 ${
                selectedPricingPlan === 'starter' ? 'scale-105 border-orange-500 shadow-xl shadow-orange-500/20' : ''
              }`}
              onClick={() => setSelectedPricingPlan(selectedPricingPlan === 'starter' ? null : 'starter')}
            >
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-6">Perfect for small teams getting started with AI assistance</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Up to 5 team members
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Basic AI assistance
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Email support
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Standard integrations
                </li>
              </ul>
              
              <button className="w-full py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-orange-500 hover:text-orange-400 transition-colors">
                Get Started
              </button>
            </div>
            
            {/* Professional Plan */}
            <div 
              className={`bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                selectedPricingPlan === 'professional' ? 'scale-105 shadow-2xl' : ''
              }`}
              onClick={() => setSelectedPricingPlan(selectedPricingPlan === 'professional' ? null : 'professional')}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-orange-600 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-orange-100">/month</span>
              </div>
              <p className="text-orange-100 mb-6">Advanced features for growing teams and businesses</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  Up to 25 team members
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  Advanced AI capabilities
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  Custom integrations
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  Analytics dashboard
                </li>
              </ul>
              
              <button className="w-full py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                Start Free Trial
              </button>
            </div>
            
            {/* Enterprise Plan */}
            <div 
              className={`bg-gray-800 rounded-2xl p-8 border border-gray-700 relative cursor-pointer transition-all duration-300 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-2 ${
                selectedPricingPlan === 'enterprise' ? 'scale-105 border-orange-500 shadow-xl shadow-orange-500/20' : ''
              }`}
              onClick={() => setSelectedPricingPlan(selectedPricingPlan === 'enterprise' ? null : 'enterprise')}
            >
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <p className="text-gray-400 mb-6">Tailored solutions for large organizations</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Unlimited team members
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Enterprise AI features
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  24/7 dedicated support
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Custom development
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  On-premise deployment
                </li>
              </ul>
              
              <button onClick={onGetStarted} className="w-full py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-orange-500 hover:text-orange-400 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workplace?
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Experience the power of AI-driven workplace transformation. Try our interactive demo and see the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span>Start Interactive Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button onClick={onGetStarted} className="px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-xl font-semibold text-lg hover:border-orange-500 hover:text-orange-400 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={onSignInClick}
                  className="relative hover:opacity-80 transition-opacity"
                  title=""
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 transform rotate-45 rounded-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm transform -rotate-45">A</span>
                  </div>
                </button>
                <span className="text-white font-light italic">agentic weaver</span>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2025 Agentic Weaver. Experience AI transformation at work.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;