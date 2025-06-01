import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiService, validateFile, formatFileSize } from '../services/api';


const UploadInterface = ({ onUploadComplete, loading, setLoading }) => {
  const [files, setFiles] = useState({ dataset: null, pdf: null });
  const [taskType, setTaskType] = useState('classification');
  const [targetColumn, setTargetColumn] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: Upload, 2: Configure, 3: Analysis


  const onDatasetDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && validateFile(file, ['text/csv'], 50 * 1024 * 1024)) { // 50MB limit
      setFiles(prev => ({ ...prev, dataset: file }));
      toast.success('Dataset uploaded successfully!');
    }
  }, []);


  const onPDFDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && validateFile(file, ['application/pdf'], 20 * 1024 * 1024)) { // 20MB limit
      setFiles(prev => ({ ...prev, pdf: file }));
      toast.success('PDF uploaded successfully!');
    }
  }, []);


  const datasetDropzone = useDropzone({
    onDrop: onDatasetDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: loading
  });


  const pdfDropzone = useDropzone({
    onDrop: onPDFDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: loading
  });


  const handleAnalyze = async () => {
    if (!files.dataset) {
      toast.error('Please upload a dataset file');
      return;
    }


    if (!targetColumn.trim()) {
      toast.error('Please specify the target column');
      return;
    }


    setLoading(true);
    setStep(3);


    try {
      const formData = new FormData();
      formData.append('file', files.dataset);
      formData.append('task_type', taskType);
      formData.append('target_column', targetColumn.trim());

      if (files.pdf) {
        formData.append('pdf_file', files.pdf);
      }


      const results = await apiService.uploadDataset(
        formData,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      );


      onUploadComplete(results);
    } catch (error) {
      console.error('Analysis failed:', error);
      setStep(2);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };


  const resetFiles = () => {
    setFiles({ dataset: null, pdf: null });
    setTargetColumn('');
    setStep(1);
  };


  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your Analysis
          </h2>
          <p className="text-gray-600 text-lg">
            Upload your dataset and optional PowerBI PDF for comprehensive AI-powered insights
          </p>
        </div>


        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[
            { number: 1, title: 'Upload Files', icon: CloudArrowUpIcon },
            { number: 2, title: 'Configure', icon: DocumentTextIcon },
            { number: 3, title: 'Analyze', icon: ChartBarIcon }
          ].map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.number;
            const isCompleted = step > stepItem.number;


            return (
              <React.Fragment key={stepItem.number}>
                <div className={`flex items-center space-x-3 ${isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive ? 'border-primary-600 bg-primary-50' :
                    isCompleted ? 'border-green-600 bg-green-50' :
                    'border-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium">{stepItem.title}</span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    step > stepItem.number ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>


        {/* Step 1: File Upload */}
        {step === 1 && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Dataset Upload */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-2 text-primary-600" />
                Dataset Upload (Required)
              </h3>

              <div
                {...datasetDropzone.getRootProps()}
                className={`upload-zone p-8 text-center cursor-pointer transition-all duration-300 ${
                  datasetDropzone.isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                } ${files.dataset ? 'border-green-500 bg-green-50' : ''}`}
              >
                <input {...datasetDropzone.getInputProps()} />

                {files.dataset ? (
                  <div className="text-green-600">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-medium">{files.dataset.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(files.dataset.size)}</p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drop your CSV dataset here</p>
                    <p className="text-sm">or click to browse files (Max: 50MB)</p>
                  </div>
                )}
              </div>
            </div>


            {/* PDF Upload (Optional) */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-accent-600" />
                PowerBI PDF Upload (Optional)
              </h3>

              <div
                {...pdfDropzone.getRootProps()}
                className={`upload-zone p-8 text-center cursor-pointer transition-all duration-300 ${
                  pdfDropzone.isDragActive ? 'border-accent-500 bg-accent-50' : 'border-gray-300'
                } ${files.pdf ? 'border-green-500 bg-green-50' : ''}`}
              >
                <input {...pdfDropzone.getInputProps()} />

                {files.pdf ? (
                  <div className="text-green-600">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-medium">{files.pdf.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(files.pdf.size)}</p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drop your PowerBI PDF here</p>
                    <p className="text-sm">for enhanced chart analysis (Max: 20MB)</p>
                  </div>
                )}
              </div>
            </div>


            {files.dataset && (
              <div className="flex justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Continue to Configuration</span>
                  <PlayIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}


        {/* Step 2: Configuration */}
        {step === 2 && (
          <motion.div
            className="card max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-6">Analysis Configuration</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Task Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTaskType('classification')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      taskType === 'classification'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Classification</div>
                    <div className="text-sm text-gray-500">Predict categories/classes</div>
                  </button>
                  <button
                    onClick={() => setTaskType('regression')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      taskType === 'regression'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Regression</div>
                    <div className="text-sm text-gray-500">Predict numeric values</div>
                  </button>
                </div>
              </div>


              <div>
                <label htmlFor="targetColumn" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Column Name
                </label>
                <input
                  id="targetColumn"
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the column name you want to predict"
                />
                <p className="mt-2 text-sm text-gray-500">
                  This should match exactly with a column name in your CSV file
                </p>
              </div>


              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back to Upload
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!targetColumn.trim()}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Start Analysis</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}


        {/* Step 3: Analysis in Progress */}
        {step === 3 && loading && (
          <motion.div
            className="card max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center animate-bounce-subtle">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-semibold mb-4">Analysis in Progress</h3>
            <p className="text-gray-600 mb-6">
              Our AI is processing your data with advanced ML algorithms and computer vision...
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="progress-bar h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <div className="text-sm text-gray-500">
              {uploadProgress}% complete
            </div>


            <button
              onClick={resetFiles}
              className="btn-secondary mt-6"
            >
              Cancel Analysis
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};


export default UploadInterface;
