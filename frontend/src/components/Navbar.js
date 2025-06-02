import React from 'react';
import { Home, BarChart3, MessageSquare, History, Plus } from 'lucide-react';

const Navbar = ({ currentSession, onNewAnalysis, activeView, setActiveView }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">InsightForge</span>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => setActiveView('home')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'home'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </button>

                {currentSession && (
                  <>
                    <button
                      onClick={() => setActiveView('analysis')}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeView === 'analysis'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analysis
                    </button>

                    <button
                      onClick={() => setActiveView('chat')}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeView === 'chat'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActiveView('history')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'history'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentSession && (
              <div className="hidden md:block text-sm text-gray-500">
                Session: {currentSession.session_id?.slice(0, 8)}...
              </div>
            )}

            <button
              onClick={onNewAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Analysis
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
