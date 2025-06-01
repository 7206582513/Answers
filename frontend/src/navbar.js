import React from 'react';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';


const Navbar = ({ currentSession, onNewAnalysis, activeView, setActiveView }) => {
  const navItems = [
    { id: 'home', label: 'New Analysis', icon: PlusIcon },
    { id: 'analysis', label: 'Dashboard', icon: ChartBarIcon, disabled: !currentSession },
    { id: 'chat', label: 'AI Chat', icon: ChatBubbleLeftRightIcon, disabled: !currentSession },
    { id: 'history', label: 'History', icon: ClockIcon },
  ];


  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">InsightForge AI</h1>
              <p className="text-xs text-gray-500">Advanced Analytics Platform</p>
            </div>
          </div>


          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isDisabled = item.disabled;


              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && setActiveView(item.id)}
                  disabled={isDisabled}
                  className={`
                    nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'text-primary-600 bg-primary-50 font-medium'
                      : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>


          {/* Session Info & Actions */}
          <div className="flex items-center space-x-4">
            {currentSession && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Session:</span>
                <span className="ml-1 text-primary-600">
                  {currentSession.session_id?.substring(0, 8)}...
                </span>
              </div>
            )}

            <button
              onClick={onNewAnalysis}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
