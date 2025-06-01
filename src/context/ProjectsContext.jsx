import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/api/apiService';

const ProjectsContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Force refresh by updating timestamp
  const refreshProjects = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  // Get project by ID from current state
  const getProjectById = useCallback((id) => {
    return projects.find(project => project.id === parseInt(id));
  }, [projects]);

  // Delete project from context state
  const deleteProjectFromState = useCallback((id) => {
    setProjects(prev => prev.filter(project => project.id !== parseInt(id)));
    setLastUpdate(Date.now());
  }, []);

  // Add or update project in state
  const updateProjectInState = useCallback((updatedProject) => {
    setProjects(prev => {
      const existingIndex = prev.findIndex(p => p.id === updatedProject.id);
      if (existingIndex >= 0) {
        // Update existing project
        const updated = [...prev];
        updated[existingIndex] = updatedProject;
        return updated;
      } else {
        // Add new project
        return [updatedProject, ...prev];
      }
    });
    setLastUpdate(Date.now());
  }, []);

  const value = {
    projects,
    setProjects,
    isLoading,
    setIsLoading,
    error,
    setError,
    lastUpdate,
    refreshProjects,
    getProjectById,
    deleteProjectFromState,
    updateProjectInState
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};
