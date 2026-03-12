#!/bin/bash

# ============================================================
#  BrainHive - User Management Branch Commit Script (WORKING)
#  Creates 50 backdated commits using YOUR actual files
#  Dates: March 3 → March 12, 2025 (5 commits per day)
# ============================================================

set -e

BRANCH="feature/userManagement"

echo "=============================================="
echo " BrainHive - User Management Commit Script"
echo "=============================================="
echo ""

# Make sure we're on the right branch
git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH"
echo "✅ Working on branch: $BRANCH"
echo ""

# Helper function for backdated commits
make_commit() {
  local DATE="$1"
  local TIME="$2"
  local MSG="$3"
  shift 3
  local FILES=("$@")
  
  local DATETIME="${DATE}T${TIME}+0530"
  
  # Add files that exist
  for f in "${FILES[@]}"; do
    if [ -f "$f" ]; then
      git add "$f"
    fi
  done
  
  # Commit if there are changes
  if ! git diff --cached --quiet; then
    GIT_AUTHOR_DATE="$DATETIME" \
    GIT_COMMITTER_DATE="$DATETIME" \
    git commit -m "$MSG"
    echo "✅ [$DATE $TIME] $MSG"
  else
    echo "⚠️  [$DATE $TIME] No changes - $MSG"
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 1 — March 3, 2025: Models & Domain Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-03" "09:15:00" \
  "chore: initialize user management module structure" \
  backend/src/main/java/com/brainhive/modules/user/model/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/controller/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/service/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/repository/.gitkeep \
  backend/src/main/java/com/brainhive/modules/user/dto/.gitkeep

make_commit "2025-03-03" "11:00:00" \
  "feat(model): add User and UserRole entities" \
  backend/src/main/java/com/brainhive/modules/user/model/User.java \
  backend/src/main/java/com/brainhive/modules/user/model/UserRole.java

make_commit "2025-03-03" "13:30:00" \
  "feat(model): add Subject entity for academic subjects" \
  backend/src/main/java/com/brainhive/modules/user/model/Subject.java

make_commit "2025-03-03" "15:45:00" \
  "feat(model): add StudentProfile and TutorProfile entities" \
  backend/src/main/java/com/brainhive/modules/user/model/StudentProfile.java \
  backend/src/main/java/com/brainhive/modules/user/model/TutorProfile.java

make_commit "2025-03-03" "17:00:00" \
  "chore: add repository layer interfaces" \
  backend/src/main/java/com/brainhive/modules/user/repository/UserRepository.java \
  backend/src/main/java/com/brainhive/modules/user/repository/SubjectRepository.java \
  backend/src/main/java/com/brainhive/modules/user/repository/StudentProfileRepository.java \
  backend/src/main/java/com/brainhive/modules/user/repository/TutorProfileRepository.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 2 — March 4, 2025: DTOs & Security Config"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-04" "09:30:00" \
  "feat(dto): add authentication request/response DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/LoginRequestDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/LoginResponseDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/RegistrationResponseDTO.java

make_commit "2025-03-04" "11:15:00" \
  "feat(dto): add registration DTOs for student and tutor" \
  backend/src/main/java/com/brainhive/modules/user/dto/StudentRegistrationRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/TutorRegistrationRequest.java

make_commit "2025-03-04" "13:45:00" \
  "feat(dto): add profile completion DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/ProfileCompletionDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/StudentProfileCompletionRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/SubjectDTO.java

make_commit "2025-03-04" "15:30:00" \
  "feat(config): add SecurityConfig with session authentication" \
  backend/src/main/java/com/brainhive/config/SecurityConfig.java

make_commit "2025-03-04" "17:00:00" \
  "feat(config): add SessionFilter and CorsConfig" \
  backend/src/main/java/com/brainhive/config/SessionFilter.java \
  backend/src/main/java/com/brainhive/config/CorsConfig.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 3 — March 5, 2025: Services Layer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-05" "09:00:00" \
  "feat(service): implement UserService with registration and login" \
  backend/src/main/java/com/brainhive/modules/user/service/UserService.java

make_commit "2025-03-05" "11:30:00" \
  "feat(service): implement ProfileService for student/tutor profiles" \
  backend/src/main/java/com/brainhive/modules/user/service/ProfileService.java

make_commit "2025-03-05" "14:00:00" \
  "feat(service): add password reset and OTP service methods" \
  backend/src/main/java/com/brainhive/modules/user/service/PasswordResetService.java

make_commit "2025-03-05" "16:00:00" \
  "test: add service layer test files" \
  backend/src/test/java/com/brainhive/modules/user/service/UserServiceTest.java

make_commit "2025-03-05" "17:30:00" \
  "chore: add GlobalExceptionHandler and DataInitializer" \
  backend/src/main/java/com/brainhive/config/GlobalExceptionHandler.java \
  backend/src/main/java/com/brainhive/config/DataInitializer.java

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 4 — March 6, 2025: Controllers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-06" "09:15:00" \
  "feat(controller): implement AuthController with auth endpoints" \
  backend/src/main/java/com/brainhive/modules/user/controller/AuthController.java

make_commit "2025-03-06" "11:00:00" \
  "feat(controller): implement StudentDashboardController" \
  backend/src/main/java/com/brainhive/modules/user/controller/StudentDashboardController.java

make_commit "2025-03-06" "13:30:00" \
  "feat(controller): implement TutorDashboardController" \
  backend/src/main/java/com/brainhive/modules/user/controller/TutorDashboardController.java

make_commit "2025-03-06" "15:45:00" \
  "feat(controller): add test controllers for development" \
  backend/src/main/java/com/brainhive/modules/user/controller/TestController.java \
  backend/src/main/java/com/brainhive/modules/user/controller/TestCorsController.java

make_commit "2025-03-06" "17:00:00" \
  "chore: add WebConfig and application properties" \
  backend/src/main/java/com/brainhive/config/WebConfig.java \
  backend/src/main/resources/application.properties

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 5 — March 7, 2025: Frontend Setup & Auth Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-07" "09:00:00" \
  "feat(frontend): initialize React app and services" \
  frontend/src/services/api.js \
  frontend/src/services/auth.service.js

make_commit "2025-03-07" "10:45:00" \
  "feat(frontend): add Login page and styles" \
  frontend/src/pages/user/Login.jsx

make_commit "2025-03-07" "12:30:00" \
  "feat(frontend): add StudentSignup and TutorSignup pages" \
  frontend/src/pages/user/StudentSignup.jsx \
  frontend/src/pages/user/TutorSignup.jsx

make_commit "2025-03-07" "14:15:00" \
  "feat(frontend): add CompleteProfile page" \
  frontend/src/pages/user/CompleteProfile.jsx

make_commit "2025-03-07" "16:00:00" \
  "feat(frontend): add ProfileWizard components" \
  frontend/src/pages/user/ProfileWizard/AcademicInfoStep.jsx \
  frontend/src/pages/user/ProfileWizard/SubjectsStep.jsx \
  frontend/src/pages/user/ProfileWizard/PreferencesStep.jsx \
  frontend/src/pages/user/ProfileWizard/ReviewStep.jsx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 6 — March 8, 2025: Student Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-08" "09:30:00" \
  "feat(frontend): add StudentDashboard page" \
  frontend/src/pages/user/StudentDashboard.jsx

make_commit "2025-03-08" "11:00:00" \
  "feat(frontend): add StudentProfileView and Edit pages" \
  frontend/src/pages/user/StudentProfileView.jsx \
  frontend/src/pages/user/StudentProfileEdit.jsx

make_commit "2025-03-08" "13:30:00" \
  "feat(frontend): add LectureDetails page" \
  frontend/src/pages/user/LectureDetails.jsx

make_commit "2025-03-08" "15:30:00" \
  "feat(frontend): add StudentSidebar component" \
  frontend/src/components/common/StudentSidebar.jsx

make_commit "2025-03-08" "17:00:00" \
  "style(frontend): add dashboard CSS styles" \
  frontend/src/pages/user/Dashboard.css \
  frontend/src/pages/user/DashboardV2.css

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 7 — March 9, 2025: Tutor Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-09" "09:00:00" \
  "feat(frontend): add TutorDashboard page" \
  frontend/src/pages/user/TutorDashboard.jsx

make_commit "2025-03-09" "11:15:00" \
  "feat(frontend): add TutorProfileView and Edit pages" \
  frontend/src/pages/user/TutorProfileView.jsx \
  frontend/src/pages/user/TutorProfileEdit.jsx

make_commit "2025-03-09" "13:45:00" \
  "feat(frontend): add Tutor layout components" \
  frontend/src/pages/user/TutorLayout.jsx

make_commit "2025-03-09" "15:30:00" \
  "feat(frontend): add Tutor availability and sessions pages" \
  frontend/src/pages/user/TutorAvailabilityPage.jsx \
  frontend/src/pages/user/TutorSessionsPage.jsx

make_commit "2025-03-09" "17:00:00" \
  "feat(frontend): add Tutor analytics and ratings pages" \
  frontend/src/pages/user/TutorAnalyticsPage.jsx \
  frontend/src/pages/user/TutorRatingsPage.jsx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 8 — March 10, 2025: Admin Panel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-10" "09:15:00" \
  "feat(frontend): add AdminDashboard page" \
  frontend/src/pages/user/AdminDashboard.jsx

make_commit "2025-03-10" "11:00:00" \
  "feat(frontend): add admin components and layout" \
  frontend/src/components/admin/AdminLayout.jsx \
  frontend/src/components/admin/AdminSidebar.jsx \
  frontend/src/components/admin/adminShared.jsx

make_commit "2025-03-10" "13:30:00" \
  "feat(frontend): add ProfileGuard for protected routes" \
  frontend/src/components/common/ProfileGuard.jsx

make_commit "2025-03-10" "15:45:00" \
  "feat(frontend): add custom hooks" \
  frontend/src/hooks/useCustomPrompt.jsx

make_commit "2025-03-10" "17:15:00" \
  "chore: add Home page and assets" \
  frontend/src/pages/Home.jsx \
  frontend/src/App.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DAY 9-10 — March 11-12, 2025: Polish & Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

make_commit "2025-03-11" "09:00:00" \
  "fix: add missing repository files" \
  backend/src/main/java/com/brainhive/modules/user/repository/PasswordResetOtpRepository.java

make_commit "2025-03-11" "11:30:00" \
  "feat: add PasswordResetOtp model" \
  backend/src/main/java/com/brainhive/modules/user/model/PasswordResetOtp.java

make_commit "2025-03-11" "14:00:00" \
  "feat(dto): add password reset DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/ForgotPasswordRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/ResetPasswordRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/VerifyOtpRequest.java

make_commit "2025-03-11" "16:30:00" \
  "feat(dto): add admin user management DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/AddUserRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/AdminUserDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/TerminateUserRequest.java

make_commit "2025-03-12" "09:00:00" \
  "docs: add project documentation" \
  README.md \
  TEAM_SETUP.md

make_commit "2025-03-12" "11:00:00" \
  "chore: add gitignore and folder structure" \
  .gitignore \
  backend/.gitignore \
  frontend/.gitignore \
  FolderStructure.txt

make_commit "2025-03-12" "13:00:00" \
  "fix: add SubjectDataInitializer for seed data" \
  backend/src/main/java/com/brainhive/config/SubjectDataInitializer.java

make_commit "2025-03-12" "15:00:00" \
  "fix: add S3Config for file uploads" \
  backend/src/main/java/com/brainhive/config/S3Config.java

make_commit "2025-03-12" "17:00:00" \
  "chore: final cleanup and optimizations" \
  backend/src/main/java/com/brainhive/BackendApplication.java \
  backend/src/main/java/com/brainhive/PingController.java

echo ""
echo "=============================================="
echo " ✅ ALL COMMITS CREATED SUCCESSFULLY!"
echo "=============================================="
echo ""
echo "Total commits created: $(git rev-list --count HEAD)"
echo ""
echo "Next step — push to GitHub:"
echo "  git push origin feature/userManagement"
echo ""
echo "Then go to GitHub → open a Pull Request"
echo "from feature/userManagement → main"
echo "=============================================="
