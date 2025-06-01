import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';


// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import AnalysisResults from './components/AnalysisResults';
import ChatInterface from './components/ChatInterface';
import UploadInterface from './components/UploadInterface';
import SessionHistory from './components/SessionHistory';


// Services
import { apiService } from './services/api';


function App() {
  const [currentSession, setCurrentSession] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('home'); // home, analysis, chat, history


  useEffect(() => {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('insightforge_session');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        setCurrentSession(sessionData);
        loadSessionResults(sessionData.session_id);
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('insightforge_session');
      }
    }
  }, []);


  const loadSessionResults = async (sessionId) => {
    try {
      setLoading(true);
      const response = await apiService.getSession(sessionId);
      setAnalysisResults(response);
    } catch (error) {
      console.error('Error loading session results:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleUploadComplete = (results) => {
    setCurrentSession({
      session_id: results.session_id,
      created_at: new Date().toISOString()
    });
    setAnalysisResults(results);
    setActiveView('analysis');

    // Save session to localStorage
    localStorage.setItem('insightforge_session', JSON.stringify({
      session_id: results.session_id,
      created_at: new Date().toISOString()
    }));
  };


  const handleNewAnalysis = () => {
    setCurrentSession(null);
    setAnalysisResults(null);
    setActiveView('home');
    localStorage.removeItem('insightforge_session');
  };


  const handleSessionSelect = (session) => {
    setCurrentSession(session);
    loadSessionResults(session.id);
    setActiveView('analysis');

    localStorage.setItem('insightforge_session', JSON.stringify({
      session_id: session.id,
      created_at: session.created_at
    }));
  };


  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />

        <Navbar
          currentSession={currentSession}
          onNewAnalysis={handleNewAnalysis}
          activeView={activeView}
          setActiveView={setActiveView}
        />


        <main className="pt-16">
          <Routes>
            <Route path="/" element={
              <div>
                {activeView === 'home' && (
                  <div>
                    <Hero />
                    <UploadInterface
                      onUploadComplete={handleUploadComplete}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </div>
                )}

                {activeView === 'analysis' && analysisResults && (
                  <div className="container mx-auto px-4 py-8">
                    <Dashboard
                      sessionData={currentSession}
                      results={analysisResults}
                      onNewAnalysis={handleNewAnalysis}
                    />
                    <AnalysisResults
                      results={analysisResults}
                      sessionId={currentSession?.session_id}
                    />
                  </div>
                )}

                {activeView === 'chat' && currentSession && (
                  <div className="container mx-auto px-4 py-8">
                    <ChatInterface
                      sessionId={currentSession.session_id}
                      analysisResults={analysisResults}
                    />
                  </div>
                )}

                {activeView === 'history' && (
                  <div className="container mx-auto px-4 py-8">
                    <SessionHistory
                      onSessionSelect={handleSessionSelect}
                    />
                  </div>
                )}
              </div>
            } />

            <Route path="/analysis/:sessionId" element={
              <div className="container mx-auto px-4 py-8">
                {analysisResults && (
                  <>
                    <Dashboard
                      sessionData={currentSession}
                      results={analysisResults}
                      onNewAnalysis={handleNewAnalysis}
                    />
                    <AnalysisResults
                      results={analysisResults}
                      sessionId={currentSession?.session_id}
                    />
                  </>
                )}
              </div>
            } />

            <Route path="/chat/:sessionId" element={
              <div className="container mx-auto px-4 py-8">
                <ChatInterface
                  sessionId={currentSession?.session_id}
                  analysisResults={analysisResults}
                />
              </div>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
