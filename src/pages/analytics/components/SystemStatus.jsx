import React from 'react';
import { FaServer } from 'react-icons/fa';

const SystemStatus = ({ systemStatusData, isLoading = false }) => {
  console.log('🔍 SystemStatus render:', { systemStatusData, isLoading });
  
  return (
    <div style={{ 
      background: '#fff', 
      border: '2px solid #007bff', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px 0',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        marginBottom: '15px'
      }}>
        <FaServer style={{ color: '#007bff', fontSize: '24px' }} />
        <h3 style={{ margin: 0, color: '#333' }}>🚀 System Status Component</h3>
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        {!systemStatusData ? (
          <div>
            <h4 style={{ color: '#dc3545', margin: '0 0 10px 0' }}>❌ No System Status Data</h4>
            <p><strong>Status:</strong> Component is rendering but no data received</p>
            <p><strong>isLoading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Check console for API errors</strong></p>
          </div>
        ) : (
          <div>
            <h4 style={{ color: '#28a745', margin: '0 0 10px 0' }}>✅ System Status Data Found!</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <strong>System Health:</strong> {systemStatusData.systemHealth || 'Unknown'}
              </div>
              <div>
                <strong>Health Score:</strong> {systemStatusData.healthScore || 0}/100
              </div>
              <div>
                <strong>Total Users:</strong> {systemStatusData.platform?.totalUsers || 0}
              </div>
              <div>
                <strong>Active Users:</strong> {systemStatusData.platform?.activeUsers || 0}
              </div>
              <div>
                <strong>Total Projects:</strong> {systemStatusData.platform?.totalProjects || 0}
              </div>
              <div>
                <strong>Active Projects:</strong> {systemStatusData.platform?.activeProjects || 0}
              </div>
              <div>
                <strong>Total Tasks:</strong> {systemStatusData.platform?.totalTasks || 0}
              </div>
              <div>
                <strong>Completed Tasks:</strong> {systemStatusData.platform?.completedTasks || 0}
              </div>
              <div>
                <strong>Alerts Count:</strong> {systemStatusData.alerts?.length || 0}
              </div>
            </div>
            
            {systemStatusData.alerts && systemStatusData.alerts.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h5>System Alerts:</h5>
                {systemStatusData.alerts.map((alert, index) => (
                  <div key={index} style={{ 
                    background: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    padding: '8px', 
                    margin: '5px 0',
                    borderRadius: '4px'
                  }}>
                    <strong>[{alert.type}]</strong> {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;
