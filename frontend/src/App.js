import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages directly - no index file
import Home from './pages/Home';
import Login from './pages/user/Login';
import StudentDashboard from './pages/user/StudentDashboard';
import TutorDashboard from './pages/user/TutorDashboard';
import LectureDetails from './pages/user/LectureDetails';

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
          <Route path="/dashboard/student/lectures/:lectureId" element={<LectureDetails />} />
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;