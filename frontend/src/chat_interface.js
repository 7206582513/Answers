import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  BrainIcon,
  UserCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { apiService, formatDate } from '../services/api';
import toast from 'react-hot-toast';


const ChatInterface = ({ sessionId, analysisResults }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contextType, setContextType] = useState('general');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);


  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Load chat history on component mount
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);


  const loadChatHistory = async () => {
    try {
      const response = await apiService.getSession(sessionId);
      if (response.chat_history) {
        const formattedMessages = response.chat_history.map(msg => ([
          { type: 'user', content: msg.message, timestamp: msg.timestamp },
          { type: 'ai', content: msg.response, timestamp: msg.timestamp }
        ])).flat();
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };


  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;


    const userMessage = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };


    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);


    try {
      const response = await apiService.chat(
        userMessage.content,
        sessionId,
        contextType
      );


      const aiMessage = {
        type: 'ai',
        content: response.response,
        timestamp: new Date().toISOString()
      };


      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorMessage = {
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };


  const suggestedQuestions = [
    "What are the key insights from my analysis?",
    "Which features are most important for prediction?",
    "How can I improve my model performance?",
    "What patterns do you see in my data?",
    "Explain the model results in simple terms",
    "What are the business implications of these findings?"
  ];


  const contextTypes = [
    { value: 'general', label: 'General', description: 'General data science questions' },
    { value: 'eda_analysis', label: 'Data Analysis', description: 'Questions about EDA results' },
    { value: 'model_performance', label: 'Model Results', description: 'Questions about ML models' },
    { value: 'chart_analysis', label: 'Charts', description: 'Questions about chart analysis' }
  ];


  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <BrainIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h2>
              <p className="text-gray-600">Ask questions about your analysis and data</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Context Selector */}
            <select
              value={contextType}
              onChange={(e) => setContextType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {contextTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <button
              onClick={clearChat}
              className="btn-secondary text-sm"
            >
              Clear Chat
            </button>
          </div>
        </div>


        {/* Context Description */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>Current Context:</strong> {contextTypes.find(t => t.value === contextType)?.description}
          </div>
        </div>
      </div>


      {/* Chat Container */}
      <div className="card">
        <div className="chat-container h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 mb-6">
                Ask me anything about your data analysis, model results, or insights.
              </p>

              {/* Suggested Questions */}
              <div className="max-w-2xl mx-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested questions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user'
                          ? 'bg-primary-500'
                          : message.isError
                            ? 'bg-red-500'
                            : 'bg-gray-600'
                      }`}>
                        {message.type === 'user' ? (
                          <UserCircleIcon className="w-5 h-5 text-white" />
                        ) : (
                          <BrainIcon className="w-5 h-5 text-white" />
                        )}
                      </div>


                      {/* Message Content */}
                      <div className={`chat-message p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'chat-message user bg-primary-500 text-white'
                          : message.isError
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'chat-message ai bg-white border border-gray-200 text-gray-800'
                      }`}>
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user'
                            ? 'text-primary-200'
                            : 'text-gray-500'
                        }`}>
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>


              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <BrainIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>


        {/* Input Area */}
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your analysis..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
              disabled={loading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>


        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedQuestions.slice(0, 3).map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


export default ChatInterface;
