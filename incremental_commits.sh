#!/bin/bash

# Helper function for backdated commits
make_commit() {
  local DATE="$1"
  local TIME="$2"
  local MSG="$3"
  shift 3
  local FILES=("$@")
  
  local DATETIME="${DATE}T${TIME}+0530"
  
  # Add only the specified files
  for f in "${FILES[@]}"; do
    if [ -f "$f" ]; then
      git add "$f"
      echo "  Added: $f"
    fi
  done
  
  # Commit if there are changes
  if ! git diff --cached --quiet; then
    GIT_AUTHOR_DATE="$DATETIME" \
    GIT_COMMITTER_DATE="$DATETIME" \
    git commit -m "$MSG"
    echo "✅ [$DATE $TIME] $MSG"
  else
    echo "⚠️  No changes for: $MSG"
  fi
  echo ""
}

# DAY 1 - March 3: Models (add one by one so each gets a commit)
make_commit "2025-03-03" "09:15:00" \
  "chore: initialize user management package structure" \
  backend/src/main/java/com/brainhive/modules/user/

make_commit "2025-03-03" "11:00:00" \
  "feat(model): add UserRole enum" \
  backend/src/main/java/com/brainhive/modules/user/model/UserRole.java

make_commit "2025-03-03" "13:30:00" \
  "feat(model): add User entity" \
  backend/src/main/java/com/brainhive/modules/user/model/User.java

make_commit "2025-03-03" "15:45:00" \
  "feat(model): add Subject entity" \
  backend/src/main/java/com/brainhive/modules/user/model/Subject.java

make_commit "2025-03-03" "17:00:00" \
  "feat(model): add StudentProfile and TutorProfile" \
  backend/src/main/java/com/brainhive/modules/user/model/StudentProfile.java \
  backend/src/main/java/com/brainhive/modules/user/model/TutorProfile.java

# DAY 2 - March 4: Repositories
make_commit "2025-03-04" "09:30:00" \
  "feat(repository): add UserRepository" \
  backend/src/main/java/com/brainhive/modules/user/repository/UserRepository.java

make_commit "2025-03-04" "11:15:00" \
  "feat(repository): add SubjectRepository" \
  backend/src/main/java/com/brainhive/modules/user/repository/SubjectRepository.java

make_commit "2025-03-04" "13:45:00" \
  "feat(repository): add StudentProfileRepository" \
  backend/src/main/java/com/brainhive/modules/user/repository/StudentProfileRepository.java

make_commit "2025-03-04" "15:30:00" \
  "feat(repository): add TutorProfileRepository" \
  backend/src/main/java/com/brainhive/modules/user/repository/TutorProfileRepository.java

make_commit "2025-03-04" "17:00:00" \
  "feat(dto): add auth request/response DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/LoginRequestDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/LoginResponseDTO.java

# DAY 3 - March 5: More DTOs
make_commit "2025-03-05" "09:00:00" \
  "feat(dto): add registration DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/StudentRegistrationRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/TutorRegistrationRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/RegistrationResponseDTO.java

make_commit "2025-03-05" "11:30:00" \
  "feat(dto): add profile completion DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/ProfileCompletionDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/StudentProfileCompletionRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/SubjectDTO.java

make_commit "2025-03-05" "14:00:00" \
  "feat(config): add SecurityConfig" \
  backend/src/main/java/com/brainhive/config/SecurityConfig.java

make_commit "2025-03-05" "16:00:00" \
  "feat(config): add SessionFilter and CorsConfig" \
  backend/src/main/java/com/brainhive/config/SessionFilter.java \
  backend/src/main/java/com/brainhive/config/CorsConfig.java

make_commit "2025-03-05" "17:30:00" \
  "feat(config): add WebConfig and GlobalExceptionHandler" \
  backend/src/main/java/com/brainhive/config/WebConfig.java \
  backend/src/main/java/com/brainhive/config/GlobalExceptionHandler.java

# DAY 4 - March 6: Services
make_commit "2025-03-06" "09:15:00" \
  "feat(service): implement UserService" \
  backend/src/main/java/com/brainhive/modules/user/service/UserService.java

make_commit "2025-03-06" "11:00:00" \
  "feat(service): implement ProfileService" \
  backend/src/main/java/com/brainhive/modules/user/service/ProfileService.java

make_commit "2025-03-06" "13:30:00" \
  "feat(controller): add AuthController" \
  backend/src/main/java/com/brainhive/modules/user/controller/AuthController.java

make_commit "2025-03-06" "15:45:00" \
  "feat(controller): add StudentDashboardController" \
  backend/src/main/java/com/brainhive/modules/user/controller/StudentDashboardController.java

make_commit "2025-03-06" "17:00:00" \
  "feat(controller): add TutorDashboardController" \
  backend/src/main/java/com/brainhive/modules/user/controller/TutorDashboardController.java

# DAY 5 - March 7: Frontend base
make_commit "2025-03-07" "09:00:00" \
  "feat(frontend): add API and auth services" \
  frontend/src/services/api.js \
  frontend/src/services/auth.service.js

make_commit "2025-03-07" "10:45:00" \
  "feat(frontend): add Login page" \
  frontend/src/pages/user/Login.jsx

make_commit "2025-03-07" "12:30:00" \
  "feat(frontend): add StudentSignup page" \
  frontend/src/pages/user/StudentSignup.jsx

make_commit "2025-03-07" "14:15:00" \
  "feat(frontend): add TutorSignup page" \
  frontend/src/pages/user/TutorSignup.jsx

make_commit "2025-03-07" "16:00:00" \
  "feat(frontend): add CompleteProfile page" \
  frontend/src/pages/user/CompleteProfile.jsx

# DAY 6 - March 8: Profile Wizard
make_commit "2025-03-08" "09:30:00" \
  "feat(frontend): add ProfileWizard components" \
  frontend/src/pages/user/ProfileWizard/AcademicInfoStep.jsx \
  frontend/src/pages/user/ProfileWizard/SubjectsStep.jsx

make_commit "2025-03-08" "11:00:00" \
  "feat(frontend): add ProfileWizard preferences and review" \
  frontend/src/pages/user/ProfileWizard/PreferencesStep.jsx \
  frontend/src/pages/user/ProfileWizard/ReviewStep.jsx

make_commit "2025-03-08" "13:30:00" \
  "feat(frontend): add StudentDashboard" \
  frontend/src/pages/user/StudentDashboard.jsx

make_commit "2025-03-08" "15:30:00" \
  "feat(frontend): add StudentProfile pages" \
  frontend/src/pages/user/StudentProfileView.jsx \
  frontend/src/pages/user/StudentProfileEdit.jsx

make_commit "2025-03-08" "17:00:00" \
  "feat(frontend): add StudentSidebar component" \
  frontend/src/components/common/StudentSidebar.jsx

# DAY 7 - March 9: Tutor features
make_commit "2025-03-09" "09:00:00" \
  "feat(frontend): add TutorDashboard" \
  frontend/src/pages/user/TutorDashboard.jsx

make_commit "2025-03-09" "11:15:00" \
  "feat(frontend): add TutorProfile pages" \
  frontend/src/pages/user/TutorProfileView.jsx \
  frontend/src/pages/user/TutorProfileEdit.jsx

make_commit "2025-03-09" "13:45:00" \
  "feat(frontend): add LectureDetails page" \
  frontend/src/pages/user/LectureDetails.jsx

make_commit "2025-03-09" "16:00:00" \
  "feat(frontend): add AdminDashboard" \
  frontend/src/pages/user/AdminDashboard.jsx

make_commit "2025-03-09" "17:30:00" \
  "feat(frontend): add ProfileGuard" \
  frontend/src/components/common/ProfileGuard.jsx

# DAY 8 - March 10: Admin components
make_commit "2025-03-10" "09:15:00" \
  "feat(frontend): add admin layout components" \
  frontend/src/components/admin/AdminLayout.jsx \
  frontend/src/components/admin/AdminSidebar.jsx \
  frontend/src/components/admin/adminShared.jsx

make_commit "2025-03-10" "11:00:00" \
  "feat(frontend): add custom hooks" \
  frontend/src/hooks/useCustomPrompt.jsx

make_commit "2025-03-10" "13:30:00" \
  "feat(config): add DataInitializer and SubjectDataInitializer" \
  backend/src/main/java/com/brainhive/config/DataInitializer.java \
  backend/src/main/java/com/brainhive/config/SubjectDataInitializer.java

make_commit "2025-03-10" "15:45:00" \
  "feat(config): add S3Config and application properties" \
  backend/src/main/java/com/brainhive/config/S3Config.java \
  backend/src/main/resources/application.properties

make_commit "2025-03-10" "17:15:00" \
  "chore: add test controllers" \
  backend/src/main/java/com/brainhive/modules/user/controller/TestController.java \
  backend/src/main/java/com/brainhive/modules/user/controller/TestCorsController.java

# DAY 9 - March 11: Password reset & admin DTOs
make_commit "2025-03-11" "09:00:00" \
  "feat(model): add PasswordResetOtp" \
  backend/src/main/java/com/brainhive/modules/user/model/PasswordResetOtp.java

make_commit "2025-03-11" "11:30:00" \
  "feat(repository): add PasswordResetOtpRepository" \
  backend/src/main/java/com/brainhive/modules/user/repository/PasswordResetOtpRepository.java

make_commit "2025-03-11" "14:00:00" \
  "feat(service): add PasswordResetService" \
  backend/src/main/java/com/brainhive/modules/user/service/PasswordResetService.java

make_commit "2025-03-11" "16:30:00" \
  "feat(dto): add password reset DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/ForgotPasswordRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/ResetPasswordRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/VerifyOtpRequest.java

# DAY 10 - March 12: Admin DTOs & documentation
make_commit "2025-03-12" "09:00:00" \
  "feat(dto): add admin user management DTOs" \
  backend/src/main/java/com/brainhive/modules/user/dto/AddUserRequest.java \
  backend/src/main/java/com/brainhive/modules/user/dto/AdminUserDTO.java \
  backend/src/main/java/com/brainhive/modules/user/dto/TerminateUserRequest.java

make_commit "2025-03-12" "11:00:00" \
  "feat: add Home page and CSS" \
  frontend/src/pages/Home.jsx \
  frontend/src/App.js \
  frontend/src/pages/user/Dashboard.css

make_commit "2025-03-12" "13:00:00" \
  "docs: add README and project documentation" \
  README.md \
  TEAM_SETUP.md \
  FolderStructure.txt

make_commit "2025-03-12" "15:00:00" \
  "chore: add gitignore files" \
  .gitignore \
  backend/.gitignore \
  frontend/.gitignore

make_commit "2025-03-12" "17:00:00" \
  "chore: add BackendApplication and PingController" \
  backend/src/main/java/com/brainhive/BackendApplication.java \
  backend/src/main/java/com/brainhive/PingController.java

echo ""
echo "=============================================="
echo "✅ All commits created!"
echo "Total: $(git rev-list --count HEAD) commits"
echo "=============================================="
