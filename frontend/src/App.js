import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages directly - no index file
import Home from './pages/Home';
import Login from './pages/user/Login';
import StudentSignup from './pages/user/StudentSignup';
import TutorSignup from './pages/user/TutorSignup';
import CompleteProfile from './pages/user/CompleteProfile';
import StudentDashboard from './pages/user/StudentDashboard';
import TutorDashboard from './pages/user/TutorDashboard';
import StudentProfileView from './pages/user/StudentProfileView';
import StudentProfileEdit from './pages/user/StudentProfileEdit';
import TutorProfileView from './pages/user/TutorProfileView';
import TutorProfileEdit from './pages/user/TutorProfileEdit';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
  console.log('App is rendering');
  
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentSignup />} />
          <Route path="/register/tutor" element={<TutorSignup />} />
          <Route path="/complete-profile/student" element={<CompleteProfile />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          <Route path="/profile" element={<StudentProfileView />} />
          <Route path="/profile/edit" element={<StudentProfileEdit />} />
          <Route path="/tutor/profile" element={<TutorProfileView />} />
          <Route path="/tutor/profile/edit" element={<TutorProfileEdit />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;