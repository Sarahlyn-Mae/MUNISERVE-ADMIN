import React from 'react';
import Sidebar from '../components/sidebar'

const Dashboard = () => {
  return (
    <div>
      <Sidebar />
    <div className="dashboard">
      <div className="sidebar">
        {/* Sidebar content */}
      </div>
      <div className="content">
        {/* Dashboard content */}
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
