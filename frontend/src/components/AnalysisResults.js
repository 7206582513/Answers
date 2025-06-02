import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalysisResults = ({ results, sessionId }) => {
  const [activeTab, setActiveTab] = useState('eda');
  const [expandedSections, setExpandedSections] = useState({
    basicStats: true,
    correlations: false,
    distributions: false,
    outliers: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderBasicStats = () => {
    if (!results?.eda_results?.basic_stats) return null;

    const stats = results.eda_results.basic_stats;

    return (
      <div className="space-y-4">
        {Object.entries(stats).map(([column, columnStats]) => (
          <div key={column} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">{column}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(columnStats).map(([stat, value]) => (
                <div key={stat}>
                  <p className="text-gray-600 capitalize">{stat}</p>
                  <p className="font-medium text-gray-900">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMLResults = () => {
    if (!results?.ml_results) return null;

    const mlResults = results.ml_results;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Model Performance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {(mlResults.accuracy * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {mlResults.model_type || 'Auto-ML'}
              </p>
              <p className="text-sm text-gray-600">Model Type</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {mlResults.features_used || 'All'}
              </p>
              <p className="text-sm text-gray-600">Features</p>
            </div>
          </div>
        </div>

        {mlResults.feature_importance && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Feature Importance</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mlResults.feature_importance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="importance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderPDFInsights = () => {
    if (!results?.pdf_insights) return null;

    const pdfInsights = results.pdf_insights;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            PDF Analysis Summary
          </h3>
          <p className="text-gray-700 mb-2">
            Total Charts Found: <span className="font-medium">{pdfInsights.total_charts || 0}</span>
          </p>
          {pdfInsights.summary_insights && (
            <p className="text-gray-700">{pdfInsights.summary_insights}</p>
          )}
        </div>

        {pdfInsights.charts && pdfInsights.charts.map((chart, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Chart {chart.chart} (Page {chart.page})
              </h4>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {chart.type}
              </span>
            </div>

            <p className="text-gray-600 mb-3">
              Confidence: {(chart.confidence * 100).toFixed(1)}%
            </p>

            {chart.insights && chart.insights.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Insights:</h5>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {chart.insights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('eda')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'eda'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            EDA Results
          </button>

          <button
            onClick={() => setActiveTab('ml')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ml'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            ML Results
          </button>

          {results?.pdf_insights && (
            <button
              onClick={() => setActiveTab('pdf')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pdf'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PieChartIcon className="h-4 w-4 inline mr-2" />
              PDF Analysis
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'eda' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Exploratory Data Analysis</h3>

            {/* Basic Statistics */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('basicStats')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <h4 className="text-lg font-medium text-gray-900">Basic Statistics</h4>
                {expandedSections.basicStats ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.basicStats && (
                <div className="p-4 border-t border-gray-200">
                  {renderBasicStats()}
                </div>
              )}
            </div>

            {/* Sample visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Sample Visualization</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'A', value: 400 },
                    { name: 'B', value: 300 },
                    { name: 'C', value: 200 },
                    { name: 'D', value: 278 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Category A', value: 35 },
                        { name: 'Category B', value: 25 },
                        { name: 'Category C', value: 20 },
                        { name: 'Category D', value: 20 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ml' && renderMLResults()}
        {activeTab === 'pdf' && renderPDFInsights()}
      </div>
    </motion.div>
  );
};

export default AnalysisResults;
