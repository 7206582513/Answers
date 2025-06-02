import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Database, Target, Activity, Download } from 'lucide-react';
import { formatDate } from '../services/api';

const Dashboard = ({ sessionData, results, onNewAnalysis }) => {
  const handleDownload = (fileType) => {
    // This would trigger the download API
    console.log(`Downloading ${fileType} for session ${sessionData?.session_id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Dashboard</h2>
          <p className="text-gray-600">Session: {sessionData?.session_id}</p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => handleDownload('model')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Model
          </button>
          <button
            onClick={() => handleDownload('report')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Report
          </button>
          <button
            onClick={onNewAnalysis}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Created</p>
              <p className="text-lg font-semibold text-gray-900">
                {sessionData?.created_at ? formatDate(sessionData.created_at) : 'Just now'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Dataset</p>
              <p className="text-lg font-semibold text-gray-900">
                {results?.dataset_info?.shape ?
                  `${results.dataset_info.shape[0]} × ${results.dataset_info.shape[1]}` :
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Task Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {sessionData?.task_type || 'Analysis'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Accuracy</p>
              <p className="text-lg font-semibold text-gray-900">
                {results?.ml_results?.accuracy ?
                  `${(results.ml_results.accuracy * 100).toFixed(1)}%` :
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {results?.eda_results && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
          <div className="text-sm text-gray-600">
            <p>Target Column: <span className="font-medium">{sessionData?.target_column}</span></p>
            <p>Columns: <span className="font-medium">{results.dataset_info?.columns?.length || 0}</span></p>
            <p>Rows: <span className="font-medium">{results.dataset_info?.shape?.[0] || 0}</span></p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
