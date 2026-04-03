import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// User module
import Home from './pages/Home';
import Login from './pages/user/Login';
import StudentSignup from './pages/user/StudentSignup';
import TutorSignup from './pages/user/TutorSignup';
import CompleteProfile from './pages/user/CompleteProfile';
import StudentDashboard from './pages/user/StudentDashboard';
import LectureDetails from './pages/user/LectureDetails';
import StudentProfileView from './pages/user/StudentProfileView';
import StudentProfileEdit from './pages/user/StudentProfileEdit';
import TutorProfileView from './pages/user/TutorProfileView';
import TutorProfileEdit from './pages/user/TutorProfileEdit';
import ForgotPassword from './pages/auth/ForgotPassword';

// Tutor dashboard pages
import TutorDashboard        from './pages/user/TutorDashboard';
import TutorHelpRequestsPage from './pages/user/TutorHelpRequestsPage';
import TutorSessionsPage     from './pages/user/TutorSessionsPage';
import TutorAvailabilityPage from './pages/user/TutorAvailabilityPage';
import TutorLecturesPage     from './pages/user/TutorLecturesPage';
import TutorRatingsPage      from './pages/user/TutorRatingsPage';
import TutorAnalyticsPage    from './pages/user/TutorAnalyticsPage';

// Admin module (split pages)
import AdminDashboard        from './pages/admin/AdminDashboard';
import AdminUserManagement   from './pages/admin/AdminUserManagement';
import AdminTutorApprovals   from './pages/admin/AdminTutorApprovals';
import AdminPendingResources from './pages/admin/AdminPendingResources';
import AdminActiveResources  from './pages/admin/AdminActiveResources';
import AdminReportResources  from './pages/admin/AdminReportResources';
import AdminAnalytics        from './pages/admin/AdminAnalytics';
import AdminGroup            from './pages/admin/AdminGroup';

// Resources module
import UploadResource    from './pages/resources/UploadResource';
import MyUploads         from './pages/resources/MyUploads';
import BookMarked        from './pages/resources/BookMarked';
import ResourceDiscovery from './pages/resources/ResourceDiscovery';

// Peer Help module
import RequestHelp from './pages/peerhelp/RequestHelp';
import FindTutors  from './pages/peerhelp/FindTutors';
import MyRequests  from './pages/peerhelp/MyRequests';

// Collaboration module
import GroupsPage      from './pages/collaboration/GroupsPage';
import GroupDetailPage from './pages/collaboration/GroupDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public */}
          <Route path="/"                 element={<Home />} />
          <Route path="/login"            element={<Login />} />
          <Route path="/register/student" element={<StudentSignup />} />
          <Route path="/register/tutor"   element={<TutorSignup />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />

          {/* Profile setup */}
          <Route path="/complete-profile/student" element={<CompleteProfile />} />

          {/* Student */}
          <Route path="/dashboard/student"                     element={<StudentDashboard />} />
          <Route path="/dashboard/student/lectures/:lectureId" element={<LectureDetails />} />

          {/* Tutor dashboard — each section is its own page */}
          <Route path="/dashboard/tutor"              element={<TutorDashboard />} />
          <Route path="/dashboard/tutor/requests"     element={<TutorHelpRequestsPage />} />
          <Route path="/dashboard/tutor/sessions"     element={<TutorSessionsPage />} />
          <Route path="/dashboard/tutor/availability" element={<TutorAvailabilityPage />} />
          <Route path="/dashboard/tutor/lectures"     element={<TutorLecturesPage />} />
          <Route path="/dashboard/tutor/ratings"      element={<TutorRatingsPage />} />
          <Route path="/dashboard/tutor/analytics"    element={<TutorAnalyticsPage />} />

          {/* Admin — legacy URL redirects to new overview */}
          <Route path="/dashboard/admin" element={<Navigate to="/admin/overview" replace />} />

          {/* Admin split pages */}
          <Route path="/admin/overview"           element={<AdminDashboard />} />
          <Route path="/admin/users"              element={<AdminUserManagement />} />
          <Route path="/admin/tutors"             element={<AdminTutorApprovals />} />
          <Route path="/admin/resources/pending"  element={<AdminPendingResources />} />
          <Route path="/admin/resources/active"   element={<AdminActiveResources />} />
          <Route path="/admin/resources/reported" element={<AdminReportResources />} />
          <Route path="/admin/groups"             element={<AdminGroup />} />
          <Route path="/admin/analytics"          element={<AdminAnalytics />} />

          {/* Profile routes */}
          <Route path="/profile"            element={<StudentProfileView />} />
          <Route path="/profile/edit"       element={<StudentProfileEdit />} />
          <Route path="/tutor/profile"      element={<TutorProfileView />} />
          <Route path="/tutor/profile/edit" element={<TutorProfileEdit />} />

          {/* Resources */}
          <Route path="/upload"               element={<UploadResource />} />
          <Route path="/resources/my-uploads" element={<MyUploads />} />
          <Route path="/resources/bookmarked" element={<BookMarked />} />
          <Route path="/resources/discovery"  element={<ResourceDiscovery />} />

          {/* Peer Help */}
          <Route path="/request-help" element={<RequestHelp />} />
          <Route path="/find-tutors"  element={<FindTutors />} />
          <Route path="/my-requests"  element={<MyRequests />} />

          {/* Collaboration */}
          <Route path="/collaboration/groups"          element={<GroupsPage />} />
          <Route path="/collaboration/groups/:groupId" element={<GroupDetailPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
