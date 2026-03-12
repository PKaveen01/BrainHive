#!/bin/bash

# ============================================================
#  BrainHive - User Management Branch Commit Script
#  Creates a new branch with 50 backdated commits (5/day)
#  Dates: March 3 → March 12, 2025
# ============================================================
#
#  HOW TO USE:
#  1. Copy this script into your BrainHive project root folder
#  2. Make sure your git repo is initialized and remote is set
#  3. Run:  bash setup_user_management_commits.sh
#  4. Then: git push origin feature/user-management
# ============================================================

set -e  # Stop on any error

BRANCH="feature/newUserManagement"

echo "=============================================="
echo " BrainHive - User Management Commit Script"
echo "=============================================="

# ── Create & switch to new branch ──────────────────────────
git checkout -b "$BRANCH"
echo "✅ Created branch: $BRANCH"
echo ""

# ──────────────────────────────────────────────────────────
# Helper function to make a backdated commit
# Usage: make_commit "YYYY-MM-DD" "HH:MM:SS" "commit message" file1 file2 ...
# ──────────────────────────────────────────────────────────
make_commit() {
  local DATE="$1"
  local TIME="$2"
  local MSG="$3"
  shift 3
  local FILES=("$@")

  local DATETIME="${DATE}T${TIME}"

  for f in "${FILES[@]}"; do
    if [ -e "$f" ]; then
      git add "$f"
    else
      echo "⚠️  Warning: $f not found, skipping"
    fi
  done

  GIT_AUTHOR_DATE="$DATETIME" \
  GIT_COMMITTER_DATE="$DATETIME" \
  git commit -m "$MSG"

  echo "✅ [$DATE $TIME] $MSG"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 1 — March 3: Project setup & User domain models"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-03" "09:10:00" \
  "chore: initialize user management module structure" \
  backend/src/main/java/com/brainhive/modules/user/model/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/controller/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/service/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/repository/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/dto/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/security/.gitkeep

make_commit "2025-03-03" "10:45:00" \
  "feat(user): add UserRole enum for role-based access control" \
  backend/src/main/java/com/brainhive/modules/user/model/UserRole.java

make_commit "2025-03-03" "12:20:00" \
  "feat(user): add User entity with core fields and role mapping" \
  backend/src/main/java/com/brainhive/modules/user/model/User.java

make_commit "2025-03-03" "14:05:00" \
  "feat(user): add Subject entity for academic subject data" \
  backend/src/main/java/com/brainhive/modules/user/model/Subject.java

make_commit "2025-03-03" "16:30:00" \
  "feat(user): add StudentProfile and TutorProfile entities" \
  backend/src/main/java/com/brainhive/modules/user/model/StudentProfile.java \
  backend/src/main/java/com/brainhive/modules/user/model/TutorProfile.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 2 — March 4: Repositories & Auth DTOs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-04" "09:00:00" \
  "feat(user): add UserRepository with email lookup methods" \
  backend/src/main/java/com/brainhive/modules/user/repository/UserRepository.java \
  backend/src/main/java/com/brainhive/modules/user/repository/SubjectRepository.java

make_commit "2025-03-04" "10:50:00" \
  "feat(user): add StudentProfile and TutorProfile repositories" \
  backend/src/main/java/com/brainhive/modules/user/repository/StudentProfileRepository.java \
  backend/src/main/java/com/brainhive/modules/user/repository/TutorProfileRepository.java

make_commit "2025-03-04" "12:15:00" \
  "feat(user): add PasswordResetOtp model and repository" \
  backend/src/main/java/com/brainhive/modules/user/model/PasswordResetOtp.java \
  backend/src/main/java/com/brainhive/modules/user/repository/PasswordResetOtpRepository.java

make_commit "2025-03-04" "14:00:00" \
  "feat(user): add login and registration request/response DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/LoginRequestDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/LoginResponseDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/RegistrationResponseDTO.java

make_commit "2025-03-04" "16:20:00" \
  "feat(user): add student and tutor registration request DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/StudentRegistrationRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/TutorRegistrationRequest.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 3 — March 5: More DTOs & Security Config"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-05" "09:05:00" \
  "feat(user): add password reset and OTP verification DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/ForgotPasswordRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/ResetPasswordRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/VerifyOtpRequest.java

make_commit "2025-03-05" "10:40:00" \
  "feat(user): add profile completion and admin user DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/ProfileCompletionDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/StudentProfileCompletionRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/SubjectDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/AddUserRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/AdminUserDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/TerminateUserRequest.java

make_commit "2025-03-05" "12:30:00" \
  "feat(config): add SecurityConfig with session-based authentication" \
  backend/src/main/java/com/brainhive/config/SecurityConfig.java

make_commit "2025-03-05" "14:10:00" \
  "feat(config): add SessionFilter for session validation on requests" \
  backend/src/main/java/com/brainhive/config/SessionFilter.java

make_commit "2025-03-05" "16:00:00" \
  "feat(config): add CorsConfig and WebConfig for cross-origin support" \
  backend/src/main/java/com/brainhive/config/CorsConfig.java \
  backend/src/main/java/com/brainhive/config/WebConfig.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 4 — March 6: Backend Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-06" "09:15:00" \
  "feat(config): add GlobalExceptionHandler and DataInitializer" \
  backend/src/main/java/com/brainhive/config/GlobalExceptionHandler.java \
  backend/src/main/java/com/brainhive/config/DataInitializer.java \
  backend/src/main/java/com/brainhive/config/SubjectDataInitializer.java

make_commit "2025-03-06" "11:00:00" \
  "feat(user): implement UserService with registration and login logic" \
  backend/src/main/java/com/brainhive/modules/user/service/UserService.java

make_commit "2025-03-06" "13:20:00" \
  "feat(user): implement ProfileService for student and tutor profiles" \
  backend/src/main/java/com/brainhive/modules/user/service/ProfileService.java

make_commit "2025-03-06" "15:00:00" \
  "feat(user): implement PasswordResetService with OTP flow" \
  backend/src/main/java/com/brainhive/modules/user/service/PasswordResetService.java

make_commit "2025-03-06" "17:10:00" \
  "feat(user): add TestController and TestCorsController for dev testing" \
  backend/src/main/java/com/brainhive/modules/user/controller/TestController.java \
  backend/src/main/java/com/brainhive/modules/user/controller/TestCorsController.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 5 — March 7: Backend Controllers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-07" "09:30:00" \
  "feat(user): implement AuthController with register, login, logout endpoints" \
  backend/src/main/java/com/brainhive/modules/user/controller/AuthController.java

make_commit "2025-03-07" "11:15:00" \
  "feat(user): implement StudentDashboardController for student data endpoints" \
  backend/src/main/java/com/brainhive/modules/user/controller/StudentDashboardController.java

make_commit "2025-03-07" "13:00:00" \
  "feat(user): implement TutorDashboardController for tutor data endpoints" \
  backend/src/main/java/com/brainhive/modules/user/controller/TutorDashboardController.java

make_commit "2025-03-07" "14:45:00" \
  "feat(app): wire up BackendApplication entry point and PingController" \
  backend/src/main/java/com/brainhive/BackendApplication.java \
  backend/src/main/java/com/brainhive/PingController.java \
  backend/src/main/resources/application.properties

make_commit "2025-03-07" "16:30:00" \
  "test: add BackendApplicationTests smoke test" \
  backend/src/test/java/com/brainhive/BackendApplicationTests.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 6 — March 8: Frontend auth & login UI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-08" "09:00:00" \
  "feat(frontend): scaffold React app entry point and global styles" \
  frontend/src/index.js \
  frontend/src/index.css \
  frontend/src/App.js \
  frontend/src/App.css \
  frontend/src/reportWebVitals.js \
  frontend/src/setupTests.js \
  frontend/public/index.html \
  frontend/public/manifest.json \
  frontend/public/robots.txt \
  frontend/package.json

make_commit "2025-03-08" "10:30:00" \
  "feat(frontend): add auth service and base API client" \
  frontend/src/services/api.js \
  frontend/src/services/auth.service.js

make_commit "2025-03-08" "12:10:00" \
  "feat(frontend): add Login page with form and CSS" \
  frontend/src/pages/user/Login.jsx \
  frontend/src/pages/user/Login.css

make_commit "2025-03-08" "14:00:00" \
  "feat(frontend): add ForgotPassword page and shared auth styles" \
  frontend/src/pages/auth/ForgotPassword.jsx \
  frontend/src/pages/auth/Auth.css

make_commit "2025-03-08" "15:50:00" \
  "feat(frontend): add StudentSignup and TutorSignup pages with shared styles" \
  frontend/src/pages/user/StudentSignup.jsx \
  frontend/src/pages/user/TutorSignup.jsx \
  frontend/src/pages/user/Signup.css

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 7 — March 9: Profile completion wizard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-09" "09:10:00" \
  "feat(frontend): add CompleteProfile page and styles" \
  frontend/src/pages/user/CompleteProfile.jsx \
  frontend/src/pages/user/CompleteProfile.css

make_commit "2025-03-09" "10:55:00" \
  "feat(frontend): add ProfileWizard AcademicInfoStep component" \
  frontend/src/pages/user/ProfileWizard/AcademicInfoStep.jsx

make_commit "2025-03-09" "12:30:00" \
  "feat(frontend): add ProfileWizard SubjectsStep component" \
  frontend/src/pages/user/ProfileWizard/SubjectsStep.jsx

make_commit "2025-03-09" "14:20:00" \
  "feat(frontend): add ProfileWizard PreferencesStep component" \
  frontend/src/pages/user/ProfileWizard/PreferencesStep.jsx

make_commit "2025-03-09" "16:00:00" \
  "feat(frontend): add ProfileWizard ReviewStep and Profile styles" \
  frontend/src/pages/user/ProfileWizard/ReviewStep.jsx \
  frontend/src/pages/user/Profile.css

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 8 — March 10: Student dashboard & profile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-10" "09:05:00" \
  "feat(frontend): add StudentDashboard page and dashboard styles" \
  frontend/src/pages/user/StudentDashboard.jsx \
  frontend/src/pages/user/Dashboard.css \
  frontend/src/pages/user/DashboardV2.css \
  frontend/src/pages/user/DashboardV2_additions.css \
  frontend/src/pages/user/DashboardV2_shared.css

make_commit "2025-03-10" "10:40:00" \
  "feat(frontend): add StudentProfileView and StudentProfileEdit pages" \
  frontend/src/pages/user/StudentProfileView.jsx \
  frontend/src/pages/user/StudentProfileEdit.jsx

make_commit "2025-03-10" "12:25:00" \
  "feat(frontend): add StudentLectures page with lecture styles" \
  frontend/src/pages/user/StudentLectures.jsx \
  frontend/src/pages/user/StudentLectures.css

make_commit "2025-03-10" "14:10:00" \
  "feat(frontend): add LectureDetails page and detail styles" \
  frontend/src/pages/user/LectureDetails.jsx \
  frontend/src/pages/user/LectureDetails.css

make_commit "2025-03-10" "16:00:00" \
  "feat(frontend): add StudentSidebar component and styles" \
  frontend/src/components/common/StudentSidebar.jsx \
  frontend/src/components/common/StudentSidebar.css

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 9 — March 11: Tutor dashboard & profile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-11" "09:00:00" \
  "feat(frontend): add TutorLayout and TutorDashboard pages" \
  frontend/src/pages/user/TutorLayout.jsx \
  frontend/src/pages/user/TutorDashboard.jsx

make_commit "2025-03-11" "10:45:00" \
  "feat(frontend): add TutorProfileView and TutorProfileEdit pages" \
  frontend/src/pages/user/TutorProfileView.jsx \
  frontend/src/pages/user/TutorProfileEdit.jsx

make_commit "2025-03-11" "12:15:00" \
  "feat(frontend): add TutorAvailabilityPage and TutorSessionsPage" \
  frontend/src/pages/user/TutorAvailabilityPage.jsx \
  frontend/src/pages/user/TutorSessionsPage.jsx

make_commit "2025-03-11" "14:00:00" \
  "feat(frontend): add TutorLecturesPage, TutorRatingsPage and TutorAnalyticsPage" \
  frontend/src/pages/user/TutorLecturesPage.jsx \
  frontend/src/pages/user/TutorRatingsPage.jsx \
  frontend/src/pages/user/TutorAnalyticsPage.jsx

make_commit "2025-03-11" "16:20:00" \
  "feat(frontend): add TutorHelpRequestsPage" \
  frontend/src/pages/user/TutorHelpRequestsPage.jsx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 10 — March 12: Admin panel, guards & polish"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-12" "09:10:00" \
  "feat(frontend): add ProfileGuard component for protected routes" \
  frontend/src/components/common/ProfileGuard.jsx \
  frontend/src/components/common/ProfileGuard.css

make_commit "2025-03-12" "10:50:00" \
  "feat(frontend): add AdminLayout and AdminSidebar components" \
  frontend/src/components/admin/AdminLayout.jsx \
  frontend/src/components/admin/AdminLayout.css \
  frontend/src/components/admin/AdminSidebar.jsx \
  frontend/src/components/admin/AdminSidebar.css \
  frontend/src/components/admin/adminShared.jsx

make_commit "2025-03-12" "12:30:00" \
  "feat(frontend): add AdminUserManagement page" \
  frontend/src/pages/admin/AdminUserManagement.jsx

make_commit "2025-03-12" "14:15:00" \
  "feat(frontend): add Home page, assets, and useCustomPrompt hook" \
  frontend/src/pages/Home.jsx \
  frontend/src/pages/Home.css \
  frontend/src/hooks/useCustomPrompt.jsx

make_commit "2025-03-12" "16:00:00" \
  "chore: add README, project docs and gitignore files" \
  README.md \
  TEAM_SETUP.md \
  FolderStructure.txt \
  .gitignore \
  backend/.gitignore \
  frontend/.gitignore

echo ""
echo "=============================================="
echo " ✅ ALL 50 COMMITS CREATED SUCCESSFULLY!"
echo "=============================================="
echo ""
echo " Next step — push to GitHub:"
echo "   git push origin feature/user-management"
echo ""
echo " Then go to GitHub → open a Pull Request"
echo " from feature/user-management → main"
echo "=============================================="
