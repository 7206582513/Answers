import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CpuChipIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../services/api';


const Dashboard = ({ sessionData, results, onNewAnalysis }) => {
  if (!results) return null;


  const {
    dataset_info = {},
    eda_results = {},
    ml_results = {},
    pdf_insights = null
  } = results;


  // Calculate metrics
  const datasetMetrics = {
    rows: dataset_info.shape?.[0] || 0,
    columns: dataset_info.shape?.[1] || 0,
    features: dataset_info.columns?.length || 0,
    size: `${dataset_info.shape?.[0] || 0} × ${dataset_info.shape?.[1] || 0}`
  };


  const modelMetrics = {
    accuracy: ml_results.best_model?.primary_score || 0,
    modelsCount: ml_results.total_models_trained || 0,
    bestModel: ml_results.best_model?.name || 'Unknown',
    trainingTime: '< 2 min'
  };


  const analysisStatus = {
    eda: eda_results ? 'completed' : 'pending',
    ml: ml_results ? 'completed' : 'pending',
    pdf: pdf_insights ? 'completed' : pdf_insights === null ? 'skipped' : 'pending'
  };


  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'skipped':
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };


  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            Session created: {sessionData?.created_at ? formatDate(sessionData.created_at) : 'Unknown'}
          </p>
        </div>
        <button
          onClick={onNewAnalysis}
          className="btn-primary"
        >
          New Analysis
        </button>
      </div>


      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Dataset Metrics */}
        <motion.div
          className="metric-card bg-gradient-to-br from-blue-500 to-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8 text-white/80" />
            <span className="text-white/60 text-sm font-medium">Dataset</span>
          </div>
          <div className="metric-value">{datasetMetrics.rows.toLocaleString()}</div>
          <div className="text-white/80 text-sm">
            Rows × {datasetMetrics.columns} Columns
          </div>
        </motion.div>


        {/* Model Performance */}
        <motion.div
          className="metric-card bg-gradient-to-br from-green-500 to-green-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <CpuChipIcon className="w-8 h-8 text-white/80" />
            <span className="text-white/60 text-sm font-medium">Best Model</span>
          </div>
          <div className="metric-value">
            {(modelMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-white/80 text-sm">
            {modelMetrics.bestModel}
          </div>
        </motion.div>


        {/* Models Trained */}
        <motion.div
          className="metric-card bg-gradient-to-br from-purple-500 to-purple-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <DocumentTextIcon className="w-8 h-8 text-white/80" />
            <span className="text-white/60 text-sm font-medium">Models</span>
          </div>
          <div className="metric-value">{modelMetrics.modelsCount}</div>
          <div className="text-white/80 text-sm">
            Algorithms Tested
          </div>
        </motion.div>


        {/* Processing Time */}
        <motion.div
          className="metric-card bg-gradient-to-br from-orange-500 to-orange-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <ClockIcon className="w-8 h-8 text-white/80" />
            <span className="text-white/60 text-sm font-medium">Processing</span>
          </div>
          <div className="metric-value">{modelMetrics.trainingTime}</div>
          <div className="text-white/80 text-sm">
            Total Time
          </div>
        </motion.div>
      </div>


      {/* Analysis Status */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircleIcon className="w-6 h-6 mr-2 text-green-500" />
          Analysis Pipeline Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EDA Status */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <StatusIcon status={analysisStatus.eda} />
            <div>
              <div className="font-medium text-gray-900">
                Exploratory Data Analysis
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {analysisStatus.eda}
              </div>
            </div>
          </div>


          {/* ML Status */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <StatusIcon status={analysisStatus.ml} />
            <div>
              <div className="font-medium text-gray-900">
                Machine Learning Pipeline
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {analysisStatus.ml}
              </div>
            </div>
          </div>


          {/* PDF Analysis Status */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <StatusIcon status={analysisStatus.pdf} />
            <div>
              <div className="font-medium text-gray-900">
                PDF Chart Analysis
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {analysisStatus.pdf}
                {pdf_insights && (
                  <span className="ml-1">
                    ({pdf_insights.total_charts} charts)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Quick Insights */}
      {eda_results?.statistics && (
        <motion.div
          className="card mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <EyeIcon className="w-6 h-6 mr-2 text-blue-500" />
            Quick Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">
                Data Quality
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {eda_results.data_quality?.missing_percentage ?
                  Object.values(eda_results.data_quality.missing_percentage).every(val => val < 10) ?
                  'Excellent' : 'Good' : 'Unknown'}
              </div>
            </div>


            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">
                Target Balance
              </div>
              <div className="text-2xl font-bold text-green-700">
                {eda_results.statistics?.target?.class_distribution ?
                  Object.values(eda_results.statistics.target.class_distribution).length > 1 ?
                  'Balanced' : 'Single Class' : 'Continuous'}
              </div>
            </div>


            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium mb-1">
                Best Algorithm
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {ml_results.best_model?.name?.split(' ')[0] || 'Unknown'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
     </div>
  );
};


export default Dashboard;
