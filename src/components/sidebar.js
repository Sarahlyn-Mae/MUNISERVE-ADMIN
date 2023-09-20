import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faReceipt,
  faCalendarAlt,
  faNewspaper,
  faGear,
  faArrowRightFromBracket,
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
`;

const SidebarHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  background-color: #1e7566;
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

  .Link {
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

  &:hover {
    background-color: white;
    border-top-left-radius: 50px;
    border-bottom-left-radius: 50px;
    color: green;

    .icon {
      color: #1E7566;
    }
  }

  .icon {
    margin-right: 10px;
    color: white;
    transition: all 0.3s ease;
  }
`;

const BottomMenuItems = styled.div`
  margin-top: auto; /* Push these items to the bottom */
`;

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState('');

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
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
        <Link to="/dashboard">
        <SidebarMenuItem
          onClick={() => handleMenuClick('dashboard')}
          className={activeMenu === 'dashboard' ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faHome} className="icon" />
          Dashboard
        </SidebarMenuItem>
        </Link>
        <SidebarMenuItem
          onClick={() => handleMenuClick('transactions')}
          className={activeMenu === 'transactions' ? 'active' : ''}
        >
          <Link to="/transaction">
          <FontAwesomeIcon icon={faReceipt} className="icon" />
          Transactions
          </Link>
        </SidebarMenuItem>

        <Link to="/appointments">
        <SidebarMenuItem
          onClick={() => handleMenuClick('appointments')}
          className={activeMenu === 'appointments' ? 'active' : ''}
        >
          
          <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
           Appointments
        </SidebarMenuItem>
        </Link>

        <SidebarMenuItem
          onClick={() => handleMenuClick('news')}
          className={activeMenu === 'news' ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faNewspaper} className="icon" />
          News
        </SidebarMenuItem>
      </SidebarMenu>

      <BottomMenuItems>
        <SidebarMenuItem
          onClick={() => handleMenuClick('settings')}
          className={activeMenu === 'settings' ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faGear} className="icon" />
          Settings
        </SidebarMenuItem>
        <SidebarMenuItem
          onClick={() => handleMenuClick('logout')}
          className={activeMenu === 'logout' ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="icon" />
          Logout
        </SidebarMenuItem>
      </BottomMenuItems>
    </SidebarContainer>
  );
};

export default Sidebar;
