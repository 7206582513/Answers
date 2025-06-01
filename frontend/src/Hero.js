import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  EyeIcon,
  CpuChipIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  BrainIcon
} from '@heroicons/react/24/outline';


const Hero = () => {
  const features = [
    {
      icon: EyeIcon,
      title: 'Enhanced Computer Vision',
      description: 'CNN-based chart classification and intelligent data extraction from PowerBI PDFs',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: CpuChipIcon,
      title: 'Advanced ML Pipeline',
      description: 'AutoML with XGBoost, LightGBM, and ensemble methods for superior accuracy',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: BrainIcon,
      title: 'Intelligent Chat Engine',
      description: 'Context-aware AI conversations with conversation memory and multi-modal analysis',
      gradient: 'from-green-500 to-blue-600'
    },
    {
      icon: DocumentChartBarIcon,
      title: 'Professional Analytics',
      description: 'Comprehensive EDA, feature engineering, and model comparison with visualizations',
      gradient: 'from-orange-500 to-red-600'
    }
  ];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };


  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };


  return (
    <section className="gradient-bg py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8"
            variants={itemVariants}
          >
            <SparklesIcon className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">
              Powered by Advanced AI & Computer Vision
            </span>
          </motion.div>


          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            variants={itemVariants}
          >
            <span className="text-gradient">InsightForge AI</span>
            <br />
            <span className="text-gray-800">Advanced Analytics Platform</span>
          </motion.h1>


          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
            variants={itemVariants}
          >
            Transform your data analysis with CNN-powered chart recognition, advanced machine learning pipelines,
            and intelligent AI conversations. Upload datasets or PowerBI PDFs for comprehensive insights.
          </motion.p>


          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>CNN Chart Classification</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-200"></div>
              <span>AutoML Pipeline</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-400"></div>
              <span>Intelligent Chat</span>
            </div>
          </motion.div>
        </motion.div>


        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="feature-card glass-effect rounded-xl p-6 text-center group hover:scale-105 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>


        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {[
            { value: '99.5%', label: 'Chart Recognition Accuracy' },
            { value: '10+', label: 'ML Algorithms' },
            { value: '5sec', label: 'Average Analysis Time' },
            { value: '∞', label: 'Conversation Memory' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              variants={itemVariants}
            >
              <div className="text-3xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


export default Hero;
