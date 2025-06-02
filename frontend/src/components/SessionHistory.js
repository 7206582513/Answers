import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { apiService, formatDate } from '../services/api';
import toast from 'react-hot-toast';


const SessionHistory = ({ onSessionSelect }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');


  useEffect(() => {
    loadSessions();
  }, []);


  const loadSessions = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate session data since the backend endpoint might not be implemented yet
      const mockSessions = [
        {
          id: 'session_1',
          created_at: new Date().toISOString(),
          task_type: 'classification',
          target_column: 'target',
          dataset_info: {
            shape: [1000, 15],
            filename: 'sales_data.csv'
          }
        },
        {
          id: 'session_2',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          task_type: 'regression',
          target_column: 'price',
          dataset_info: {
            shape: [2500, 20],
            filename: 'housing_data.csv'
          }
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load session history');
    } finally {
      setLoading(false);
    }
  };


  const deleteSession = async (sessionId, event) => {
    event.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }


    try {
      await apiService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };


  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.dataset_info?.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.target_column?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || session.task_type === filterType;

    return matchesSearch && matchesFilter;
  });


  const getTaskIcon = (taskType) => {
    switch (taskType) {
      case 'classification':
        return ChartBarIcon;
      case 'regression':
        return CpuChipIcon;
      default:
        return DocumentTextIcon;
    }
  };


  const getTaskColor = (taskType) => {
    switch (taskType) {
      case 'classification':
        return 'bg-blue-100 text-blue-800';
      case 'regression':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session history...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Session History
        </h1>
        <p className="text-gray-600">
          View and manage your previous analysis sessions
        </p>
      </div>


      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>


          {/* Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
            </select>
          </div>
        </div>
      </div>


      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm || filterType !== 'all' ? 'No matching sessions found' : 'No sessions yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Start your first analysis to see it appear here'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSessions.map((session, index) => {
            const TaskIcon = getTaskIcon(session.task_type);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => onSessionSelect(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TaskIcon className="w-6 h-6 text-white" />
                    </div>


                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {session.dataset_info?.filename || 'Unknown Dataset'}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskColor(session.task_type)}`}>
                          {session.task_type}
                        </span>
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>Target: {session.target_column}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ChartBarIcon className="w-4 h-4" />
                          <span>
                            {session.dataset_info?.shape?.[0]?.toLocaleString()} rows × {session.dataset_info?.shape?.[1]} cols
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDate(session.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Actions */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete session"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>


                {/* Session Preview Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500">Session ID:</span>
                      <span className="font-mono text-gray-700">{session.id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center space-x-2 text-primary-600">
                      <EyeIcon className="w-4 h-4" />
                      <span>View Analysis</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}


      {/* Summary Stats */}
      {sessions.length > 0 && (
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {sessions.length}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessions.filter(s => s.task_type === 'classification').length}
              </div>
              <div className="text-sm text-gray-600">Classification</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sessions.filter(s => s.task_type === 'regression').length}
              </div>
              <div className="text-sm text-gray-600">Regression</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default SessionHistory;


