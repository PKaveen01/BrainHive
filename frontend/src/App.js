import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// User module
import Home from './pages/Home';
import Login from './pages/user/Login';
import StudentSignup from './pages/user/StudentSignup';
import TutorSignup from './pages/user/TutorSignup';
import CompleteProfile from './pages/user/CompleteProfile';
import StudentDashboard from './pages/user/StudentDashboard';
import TutorDashboard from './pages/user/TutorDashboard';
import LectureDetails from './pages/user/LectureDetails';
import StudentProfileView from './pages/user/StudentProfileView';
import StudentProfileEdit from './pages/user/StudentProfileEdit';
import TutorProfileView from './pages/user/TutorProfileView';
import TutorProfileEdit from './pages/user/TutorProfileEdit';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/user/AdminDashboard';

// Resources module
import UploadResource from './pages/resources/UploadResource';
import MyUploads from './pages/resources/MyUploads';
import BookMarked from './pages/resources/BookMarked';
import ResourceDiscovery from './pages/resources/ResourceDiscovery';

// Peer Help module
import RequestHelp from './pages/peerhelp/RequestHelp';
import FindTutors from './pages/peerhelp/FindTutors';
import MyRequests from './pages/peerhelp/MyRequests';

// Collaboration module
import GroupsPage from './pages/collaboration/GroupsPage';
import GroupDetailPage from './pages/collaboration/GroupDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentSignup />} />
          <Route path="/register/tutor" element={<TutorSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Profile setup */}
          <Route path="/complete-profile/student" element={<CompleteProfile />} />

          {/* Student dashboards */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/student/lectures/:lectureId" element={<LectureDetails />} />

          {/* Tutor dashboard */}
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />

          {/* Admin */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />

          {/* Profile routes */}
          <Route path="/profile" element={<StudentProfileView />} />
          <Route path="/profile/edit" element={<StudentProfileEdit />} />
          <Route path="/tutor/profile" element={<TutorProfileView />} />
          <Route path="/tutor/profile/edit" element={<TutorProfileEdit />} />

          {/* Resources module */}
          <Route path="/upload" element={<UploadResource />} />
          <Route path="/resources/my-uploads" element={<MyUploads />} />
          <Route path="/resources/bookmarked" element={<BookMarked />} />
          <Route path="/resources/discovery" element={<ResourceDiscovery />} />

          {/* Peer Help module */}
          <Route path="/request-help" element={<RequestHelp />} />
          <Route path="/find-tutors" element={<FindTutors />} />
          <Route path="/my-requests" element={<MyRequests />} />

          {/* Collaboration module */}
          <Route path="/collaboration/groups" element={<GroupsPage />} />
          <Route path="/collaboration/groups/:groupId" element={<GroupDetailPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
