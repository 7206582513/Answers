import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CpuChipIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';


const AnalysisResults = ({ results, sessionId }) => {
  const [activeTab, setActiveTab] = useState('eda');
  const [expandedSections, setExpandedSections] = useState({});


  if (!results) return null;


  const {
    eda_results = {},
    ml_results = {},
    pdf_insights = null
  } = results;


  const tabs = [
    { id: 'eda', label: 'Data Analysis', icon: ChartBarIcon, count: null },
    { id: 'ml', label: 'Model Results', icon: CpuChipIcon, count: ml_results.total_models_trained },
    { id: 'pdf', label: 'Chart Analysis', icon: EyeIcon, count: pdf_insights?.total_charts || 0, disabled: !pdf_insights }
  ];


  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  const handleDownload = async (fileType) => {
    try {
      await apiService.downloadFile(sessionId, fileType);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };


  const CollapsibleSection = ({ title, children, sectionKey, defaultExpanded = false }) => {
    const isExpanded = expandedSections[sectionKey] ?? defaultExpanded;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors duration-200"
        >
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
        {isExpanded && (
          <div className="p-6 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>


      {/* EDA Results */}
      {activeTab === 'eda' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Data Quality */}
          <CollapsibleSection
            title="Data Quality Assessment"
            sectionKey="data_quality"
            defaultExpanded={true}
          >
            {eda_results.data_quality && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 mb-2">Dataset Shape</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {eda_results.data_quality.shape?.[0]?.toLocaleString()} rows
                  </div>
                  <div className="text-sm text-blue-600">
                    {eda_results.data_quality.shape?.[1]} columns
                  </div>
                </div>


                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-700 mb-2">Missing Data</div>
                  <div className="text-2xl font-bold text-green-900">
                    {eda_results.data_quality.missing_percentage ?
                      Math.max(...Object.values(eda_results.data_quality.missing_percentage)).toFixed(1) + '%'
                      : 'N/A'}
                  </div>
                  <div className="text-sm text-green-600">Maximum missing %</div>
                </div>


                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-700 mb-2">Data Types</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {eda_results.data_quality.dtypes ?
                      Object.keys(eda_results.data_quality.dtypes).length : 'N/A'}
                  </div>
                  <div className="text-sm text-purple-600">Different types</div>
                </div>
              </div>
            )}
          </CollapsibleSection>


          {/* Visualizations */}
          <CollapsibleSection
            title="Data Visualizations"
            sectionKey="visualizations"
            defaultExpanded={true}
          >
            {eda_results.visualizations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(eda_results.visualizations).map(([key, path]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="bg-white p-4 rounded border">
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL?.replace('/api', '')}/${path}`}
                        alt={key}
                        className="w-full h-auto"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5Ij5DaGFydCBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>


          {/* Feature Importance */}
          {eda_results.feature_importance && (
            <CollapsibleSection
              title="Feature Importance Analysis"
              sectionKey="feature_importance"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full comparison-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Importance Score</th>
                      <th>P-Value</th>
                      <th>Significance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(eda_results.feature_importance)
                      .sort((a, b) => b[1].score - a[1].score)
                      .slice(0, 10)
                      .map(([feature, stats]) => (
                        <tr key={feature}>
                          <td className="font-medium">{feature}</td>
                          <td>{stats.score.toFixed(4)}</td>
                          <td>{stats.p_value.toFixed(6)}</td>
                          <td>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              stats.significant
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {stats.significant ? 'Significant' : 'Not Significant'}
                            </span>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )}
        </motion.div>
      )}


      {/* ML Results */}
      {activeTab === 'ml' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Best Model Summary */}
          <CollapsibleSection
            title="Best Model Performance"
            sectionKey="best_model"
            defaultExpanded={true}
          >
            {ml_results.best_model && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {ml_results.best_model.name}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(ml_results.best_model.metrics).map(([metric, value]) => (
                      <div key={metric} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">
                          {metric.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold">
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-700 mb-2">
                      {(ml_results.best_model.primary_score * 100).toFixed(1)}%
                    </div>
                    <div className="text-gray-600">Primary Score</div>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleSection>


          {/* Model Comparison */}
          <CollapsibleSection
            title="Model Comparison"
            sectionKey="model_comparison"
            defaultExpanded={true}
          >
            {ml_results.comparison_table && (
              <div className="overflow-x-auto">
                <table className="min-w-full comparison-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      {ml_results.comparison_table[0] &&
                        Object.keys(ml_results.comparison_table[0])
                          .filter(key => key !== 'Model' && key !== 'Visualization')
                          .map(metric => (
                            <th key={metric} className="capitalize">
                              {metric.replace(/_/g, ' ')}
                            </th>
                          ))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {ml_results.comparison_table.map((model, index) => (
                      <tr key={index}>
                        <td className="font-medium">{model.Model}</td>
                        {Object.entries(model)
                          .filter(([key]) => key !== 'Model' && key !== 'Visualization')
                          .map(([metric, value], i) => (
                            <td key={i}>
                              {typeof value === 'number' ? value.toFixed(4) : value}
                            </td>
                          ))
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>


          {/* Training Summary */}
          <CollapsibleSection
            title="Training Summary"
            sectionKey="training_summary"
          >
            {ml_results.training_summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {ml_results.training_summary.successful_models}
                  </div>
                  <div className="text-sm text-green-600">Successful Models</div>
                </div>


                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-700">
                    {ml_results.training_summary.failed_models}
                  </div>
                  <div className="text-sm text-red-600">Failed Models</div>
                </div>


                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {ml_results.total_models_trained}
                  </div>
                  <div className="text-sm text-blue-600">Total Trained</div>
                </div>
              </div>
            )}
          </CollapsibleSection>
        </motion.div>
      )}


      {/* PDF Chart Analysis */}
      {activeTab === 'pdf' && pdf_insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Overview */}
          <CollapsibleSection
            title="Chart Analysis Overview"
            sectionKey="pdf_overview"
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {pdf_insights.total_charts}
                </div>
                <div className="text-sm text-blue-600">Charts Detected</div>
              </div>


              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">
                  {pdf_insights.charts?.length || 0}
                </div>
                <div className="text-sm text-green-600">Successfully Analyzed</div>
              </div>


              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {pdf_insights.charts?.reduce((acc, chart) => acc + (chart.insights?.length || 0), 0) || 0}
                </div>
                <div className="text-sm text-purple-600">Total Insights</div>
              </div>
            </div>
          </CollapsibleSection>


          {/* Individual Charts */}
          {pdf_insights.charts && pdf_insights.charts.map((chart, index) => (
            <CollapsibleSection
              key={index}
              title={`Chart ${index + 1}: ${chart.type} (Page ${chart.page})`}
              sectionKey={`chart_${index}`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Chart Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium capitalize">{chart.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-medium">{(chart.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Page:</span>
                        <span className="font-medium">{chart.page}</span>
                      </div>
                    </div>
                  </div>


                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Extracted Data</h5>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(chart.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>


                {chart.insights && chart.insights.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">AI Insights</h5>
                    <div className="space-y-2">
                      {chart.insights.map((insight, i) => (
                        <div key={i} className="insight-item bg-blue-50 p-3 rounded-lg">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          ))}


          {/* Summary Insights */}
          {pdf_insights.summary_insights && (
            <CollapsibleSection
              title="Summary Insights"
              sectionKey="summary_insights"
            >
              <div className="insights-panel">
                <div className="space-y-3">
                  {pdf_insights.summary_insights.map((insight, index) => (
                    <div key={index} className="insight-item">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          )}
        </motion.div>
      )}


      {/* Download Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ArrowDownTrayIcon className="w-6 h-6 mr-2 text-primary-600" />
          Download Results
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleDownload('cleaned_data')}
            className="btn-secondary w-full"
          >
            Cleaned Dataset
          </button>
          <button
            onClick={() => handleDownload('eda_report')}
            className="btn-secondary w-full"
          >
            EDA Report
          </button>
          <button
            onClick={() => handleDownload('model')}
            className="btn-secondary w-full"
          >
            Best Model
          </button>
          <button
            onClick={() => handleDownload('chat_history')}
            className="btn-secondary w-full"
          >
            Chat History
          </button>
        </div>
      </div>
    </div>
  );
};


export default AnalysisResults;
