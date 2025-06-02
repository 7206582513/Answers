import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService, validateFile, formatFileSize } from '../services/api';
import toast from 'react-hot-toast';

const UploadInterface = ({ onUploadComplete, loading, setLoading }) => {
  const [uploadType, setUploadType] = useState('dataset');
  const [taskType, setTaskType] = useState('classification');
  const [targetColumn, setTargetColumn] = useState('');
  const [files, setFiles] = useState({ dataset: null, pdf: null, chart: null });
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDatasetDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && validateFile(file, ['text/csv'], 50 * 1024 * 1024)) {
      setFiles(prev => ({ ...prev, dataset: file }));
    }
  }, []);

  const onPdfDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && validateFile(file, ['application/pdf'], 20 * 1024 * 1024)) {
      setFiles(prev => ({ ...prev, pdf: file }));
    }
  }, []);

  const onChartDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && validateFile(file, ['image/jpeg', 'image/png', 'image/jpg'], 10 * 1024 * 1024)) {
      setFiles(prev => ({ ...prev, chart: file }));
    }
  }, []);

  const {
    getRootProps: getDatasetRootProps,
    getInputProps: getDatasetInputProps,
    isDragActive: isDatasetDragActive
  } = useDropzone({
    onDrop: onDatasetDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const {
    getRootProps: getPdfRootProps,
    getInputProps: getPdfInputProps,
    isDragActive: isPdfDragActive
  } = useDropzone({
    onDrop: onPdfDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const {
    getRootProps: getChartRootProps,
    getInputProps: getChartInputProps,
    isDragActive: isChartDragActive
  } = useDropzone({
    onDrop: onChartDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  const handleDatasetUpload = async () => {
    if (!files.dataset || !targetColumn.trim()) {
      toast.error('Please select a dataset file and specify target column');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', files.dataset);
      formData.append('task_type', taskType);
      formData.append('target_column', targetColumn);

      if (files.pdf) {
        formData.append('pdf_file', files.pdf);
      }

      const result = await apiService.uploadDataset(
        formData,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      );

      onUploadComplete(result);
      toast.success('Dataset uploaded and analyzed successfully!');

      // Reset form
      setFiles({ dataset: null, pdf: null, chart: null });
      setTargetColumn('');
      setUploadProgress(0);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChartUpload = async () => {
    if (!files.chart) {
      toast.error('Please select a chart image');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const result = await apiService.analyzeChart(
        files.chart,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      );

      onUploadComplete(result);
      toast.success('Chart analyzed successfully!');

      // Reset form
      setFiles({ dataset: null, pdf: null, chart: null });
      setUploadProgress(0);

    } catch (error) {
      console.error('Chart analysis error:', error);
      toast.error('Chart analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        {/* Upload Type Selector */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload & Analyze</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setUploadType('dataset')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadType === 'dataset'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Dataset Analysis
            </button>
            <button
              onClick={() => setUploadType('chart')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadType === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Image className="h-4 w-4 inline mr-2" />
              Chart Analysis
            </button>
          </div>
        </div>

        {uploadType === 'dataset' && (
          <div className="space-y-6">
            {/* Dataset Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset File (CSV) *
              </label>
              <div
                {...getDatasetRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDatasetDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : files.dataset
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getDatasetInputProps()} />
                {files.dataset ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{files.dataset.name}</p>
                      <p className="text-xs text-green-600">{formatFileSize(files.dataset.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('dataset');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your CSV file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Max file size: 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type *
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="classification">Classification</option>
                  <option value="regression">Regression</option>
                  <option value="clustering">Clustering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Column *
                </label>
                <input
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  placeholder="e.g., price, category, target"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Optional PDF Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File (Optional)
              </label>
              <div
                {...getPdfRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isPdfDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : files.pdf
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getPdfInputProps()} />
                {files.pdf ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{files.pdf.name}</p>
                      <p className="text-xs text-green-600">{formatFileSize(files.pdf.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('pdf');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileText className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Drop PDF file for chart analysis</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleDatasetUpload}
              disabled={loading || !files.dataset || !targetColumn.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Analyzing...' : 'Upload & Analyze Dataset'}
            </button>
          </div>
        )}

        {uploadType === 'chart' && (
          <div className="space-y-6">
            {/* Chart Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Image *
              </label>
              <div
                {...getChartRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isChartDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : files.chart
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getChartInputProps()} />
                {files.chart ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{files.chart.name}</p>
                      <p className="text-xs text-green-600">{formatFileSize(files.chart.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('chart');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your chart image here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: PNG, JPG, JPEG (Max: 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleChartUpload}
              disabled={loading || !files.chart}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Analyzing Chart...' : 'Analyze Chart'}
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadInterface;
