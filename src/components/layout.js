// components/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/appointments">Appointments</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/users">Users</Link></li>
      </ul>
    </nav>
  );
};

const Layout = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
