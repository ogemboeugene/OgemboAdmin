import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import ProfileForm from './pages/profile/ProfileForm';
import ProjectList from './pages/projects/ProjectList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectDetails from './pages/projects/ProjectDetails';
import EducationForm from './pages/profile/EducationForm';
import ViewAllEducation from './pages/profile/ViewAllEducation';
import ExperienceForm from './pages/profile/ExperienceForm';
import ViewAllExperience from './pages/profile/ViewAllExperience';
import SkillsForm from './pages/profile/SkillsForm';
import Calendar from './pages/calendar/Calendar';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Settings from './pages/settings/Settings';
import Tasks from './pages/tasks/Tasks';
import Help from './pages/help/Help';
import './App.css';

// Protected route component
const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();
  
  // Show loading indicator while checking auth status
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<ProfileForm />} />
              
              {/* Skills routes */}
              <Route path="skills" element={<SkillsForm />} />
                {/* Education routes */}
              <Route path="education" element={<ViewAllEducation />} />
              <Route path="education/new" element={<EducationForm />} />
              <Route path="education/:id/edit" element={<EducationForm editMode />} />
              <Route path="education/:id/view" element={<EducationForm editMode readOnly />} />
                {/* Experience routes */}
              <Route path="experience" element={<ViewAllExperience />} />
              <Route path="experience/new" element={<ExperienceForm />} />
              <Route path="experience/:id/edit" element={<ExperienceForm editMode />} />
              <Route path="experience/:id/view" element={<ExperienceForm editMode readOnly />} />
              
              {/* Project routes */}
              <Route path="projects" element={<ProjectList />} />
              <Route path="projects/new" element={<ProjectForm />} />
              <Route path="projects/:id/edit" element={<ProjectForm editMode />} />
              <Route path="projects/:id/view" element={<ProjectDetails />} />
              
              {/* Calendar route */}
              <Route path="calendar" element={<Calendar />} />

              {/* Settings route */}
              <Route path="settings" element={<Settings />} />

              {/* Help route */}
              <Route path="help" element={<Help />} />
              
              {/* Tasks route */}
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/upcoming" element={<Tasks filter="upcoming" />} />
              <Route path="tasks/completed" element={<Tasks filter="completed" />} />
              <Route path="tasks/new" element={<Tasks showNewTaskForm={true} />} />
                        
              {/* Redirect to dashboard for any other routes */}
              <Route path="*" element={
                <div className="not-found">
                  <h2>404 - Page Not Found</h2>
                  <p>The page you are looking for does not exist.</p>
                </div>
              } />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
