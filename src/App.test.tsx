import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple test component
const TestPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-900">Test Page</h1>
    <p className="text-gray-600">This is a test page to verify the app is working.</p>
    <div className="mt-4">
      <button 
        onClick={() => alert('Button clicked!')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Button
      </button>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<TestPage />} />
      </Routes>
    </div>
  );
}

export default App;



