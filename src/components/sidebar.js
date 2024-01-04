import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faReceipt,
  faCalendarAlt,
  faNewspaper,
  faGear,
  faArrowRightFromBracket,
  faUser,
  faTeletype,
  faFileLines,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.png';

const SidebarContainer = styled.div`
  width: 250px;
  height: 100%;
  background-color: #1e7566;
  color: white;
  position: fixed;
  display: flex;
  flex-direction: column;
  margin-top: 0px;
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  background-color: #1e7566;
  border-top-right-radius: 50px;
`;

const SidebarLogo = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 10px;
`;

const SidebarTitle = styled.span`
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2.5px;
  display: flex;
  align-items: center;

  span.muni {
    color: white;
  }

  span.serve {
    color: #3fc589;
  }
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* Allow the menu to grow and push Settings/Logout to the bottom */

  .link {
    color: white;
    text-decoration: none;
  }
`;

const SidebarMenuItem = styled.li`
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  margin-left: 40px;
  margin-top: 4px;
  justify-content: justify;
  background-color: ${(props) => (props.isActive ? 'white' : 'transparent')};
  border-radius: 50px;
  color: ${(props) => (props.isActive ? '#1e7566' : 'white')};
  width: 160px;

  .icon {
    margin-right: 10px;
    color: ${(props) => (props.isActive ? '#1e7566' : 'white')};
    transition: all 0.3s ease;
  }

  .link:hover {
    text-decoration: none; /* Remove underline on hover */
    color: green;
  }
`;

const BottomMenuItems = styled.div`
  margin-top: auto; /* Push these items to the bottom */
`;

const Sidebar = () => {
  const location = useLocation();
  const history = useHistory();
  const [activeMenu, setActiveMenu] = useState('');

  useEffect(() => {
    const currentPath = location.pathname;
    setActiveMenu(currentPath);
  }, [location]);

  const handleLogout = () => {
    // Perform logout logic (e.g., sign out from authentication)
    // After successful logout, navigate to the login page
    // Replace '/login' with the actual path of your login page
    history.push('/login');
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarLogo src={logo} alt="Logo" />
        <SidebarTitle>
          <span className="muni">MUNI</span>
          <span className="serve">SERVE</span>
        </SidebarTitle>
      </SidebarHeader>

      <SidebarMenu>
        <Link to="/dashboard" className="link">
          <SidebarMenuItem isActive={activeMenu === '/dashboard'}>
            <FontAwesomeIcon icon={faHome} className="icon" />
            Dashboard
          </SidebarMenuItem>
        </Link>

        <Link to="/transactions" className="link">
          <SidebarMenuItem isActive={activeMenu === '/transactions'}>
            <FontAwesomeIcon icon={faReceipt} className="icon" />
            Transactions
          </SidebarMenuItem>
        </Link>

        <Link to="/appointments" className="link">
          <SidebarMenuItem isActive={activeMenu === '/appointments'}>
            <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
            Appointments
          </SidebarMenuItem>
        </Link>

        <Link to="/users" className="link">
        <SidebarMenuItem
            onClick={() => setActiveMenu('/users')}
            isActive={activeMenu === '/users'}
          >
            <FontAwesomeIcon icon={faUser} className="icon" />
            Users
          </SidebarMenuItem>
        </Link>

        <Link to="/reports" className="link">
          <SidebarMenuItem isActive={activeMenu === '/reports'}>
            <FontAwesomeIcon icon={faFolder} className="icon" />
            Reports
          </SidebarMenuItem>
        </Link>

      </SidebarMenu>

      <BottomMenuItems>
        <SidebarMenuItem
          onClick={() => setActiveMenu('/settings')}
          isActive={activeMenu === '/settings'}
        >
          <FontAwesomeIcon icon={faGear} className="icon" />
          Settings
        </SidebarMenuItem>
        <SidebarMenuItem onClick={handleLogout} isActive={activeMenu === '/logout'}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="icon" />
          Logout
        </SidebarMenuItem>
      </BottomMenuItems>
    </SidebarContainer>
  );
};

export default Sidebar;
