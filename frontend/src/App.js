import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages directly - no index file
import Home from './pages/Home';
import Login from './pages/user/Login';
import StudentDashboard from './pages/user/StudentDashboard';
import TutorDashboard from './pages/user/TutorDashboard';

// Import your new upload page
import UploadResource from './pages/resources/UploadResource';
import MyUploads from './pages/resources/MyUploads';
import BookMarked from './pages/resources/BookMarked';

function App() {
  console.log('App is rendering');
  console.log('Home component:', Home);
  console.log('Login component:', Login);
  
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          
          {/* Your new upload route */}
          <Route path="/upload" element={<UploadResource />} />
          <Route path="/resources/my-uploads" element={<MyUploads />} />
          <Route path="/resources/bookmarked" element={<BookMarked />} />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;