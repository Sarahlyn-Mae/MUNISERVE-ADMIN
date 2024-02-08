import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import { faEdit, faTrashAlt, faPlus, faCancel, faFileAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import './settings.css'; 
import useAuth from "../components/useAuth";


const AdminSettings = () => {
  const [newUser, setNewUser] = useState({ id: null, name: '', email: '' });
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin', email: 'admin@example.com' }
  ]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);

  //Function for the account name
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user.email;
        const truncatedEmail = email.length > 5 ? `${email.substring(0, 5)}...` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const addUser = () => {
    if (editingUserId !== null) {
      // Edit existing user
      setUsers(users.map(user => (user.id === editingUserId ? newUser : user)));
      setEditingUserId(null);
    } else {
      // Add new user
      setUsers([...users, { ...newUser, id: users.length + 1 }]);
    }
    setNewUser({ id: null, name: '', email: '' });
    setShowAddUser(false);
  };

  const editUser = (userId) => {
    const userToEdit = users.find(user => user.id === userId);
    setNewUser(userToEdit);
    setEditingUserId(userId);
    setShowAddUser(true);
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const [showContent, setShowContent] = useState(false);

  const toggleContent = () => {
    setShowContent(!showContent);
  };
  
  const [showTermsContent, setShowTermsContent] = useState(false);
  const [showPrivacyContent, setShowPrivacyContent] = useState(false);

  const toggleTermsContent = () => {
    setShowTermsContent(!showTermsContent);
    // Close Privacy Policy content when opening Terms and Conditions
    setShowPrivacyContent(false);
  };

  const togglePrivacyContent = () => {
    setShowPrivacyContent(!showPrivacyContent);
    // Close Terms and Conditions content when opening Privacy Policy
    setShowTermsContent(false);
  };


  return (
    <div className="container">
    <div className="header">
      <div className="icons">
        <h1>Settings</h1>
        <img src={notification} alt="Notification.png" className="notif" />
        <img src={logo} alt="logo" className="account-img" />
        <div className="account-name">
          <h1>{userEmail}</h1>
        </div>
      </div>
    </div>

      <div className="admin-profile">
      <img src={logo}
          alt="Admin Profile"
          className="profile-image"
        />
       <div>
  {users.map((user) => (
    <div key={user.id} className="user-container">
      <div className="user-info">
        <p>{user.email}</p>
        <h3>{user.name}</h3>
      </div>

      <div className="user-buttons">
        <button onClick={() => setShowAddUser(!showAddUser)}>
          {showAddUser ? <FontAwesomeIcon icon={faCancel} /> : <FontAwesomeIcon icon={faPlus} />}
        </button>

        <button onClick={() => editUser(user.id)}>
          <FontAwesomeIcon icon={faEdit} />
        </button>

        <button onClick={() => deleteUser(user.id)}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </div>
    </div>
  ))}
</div>

      </div>

      {showAddUser && (
        <div className='add-user'>
          <h3>{editingUserId !== null ? 'Add User' : 'Add a New User'}</h3>
          <form>
            <div className='name'>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder='Enter your name'
              value={newUser.name}
              onChange={handleInputChange}
            />
            </div>
            <div className='email'>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder='Enter your email'
              value={newUser.email}
              onChange={handleInputChange}
            />
           </div>
            <button type="button" onClick={addUser}>
              {editingUserId !== null ? 'Edit User' : 'Add User'}
            </button>
          </form>
        </div>
      )}

<div className="content-container">
        <div className="arrow" onClick={toggleTermsContent}>
      <h2> <span> <FontAwesomeIcon icon={faFileAlt} className="icon" /></span><span className='text'> Terms and Conditions</span> 
      <span className='show'> {showTermsContent  ? '▲' : '▼'} </span></h2>
      </div>

      {showTermsContent && (
        <div>
          <div className="legal-information">
        
        <p>These terms and conditions govern the use and administration of the settings for the Muniserve. By accessing or using the administrative settings, you agree to comply with and be bound by these Terms. If you do not agree with any part of these Terms, you may not access or use the administrative settings.</p>
        <h4>1. Access Rights</h4>
        <p>You are granted access to the administrative settings based on your role and responsibilities within the municipality.</p>
        <h4>2. Security</h4>
        <p>You are responsible for maintaining the confidentiality of your account credentials and ensuring the security of your account. Any actions taken using your account will be deemed as authorized by you.</p>
        <h4>3. Authorized Use</h4>
        <p>You agree to use the administrative settings only for purposes authorized by the municipality and in compliance with applicable laws and regulations.</p>
        <h4>4. Accuracy of Information</h4>
        <p>You are responsible for the accuracy and completeness of the information provided or modified through the administrative settings.</p>
        <h4>5. Data Handling</h4>
        <p>In the course of using the administrative settings, you may have access to sensitive data. You agree to handle such data in accordance with applicable privacy laws and organizational policies.</p>
        <h4>6.Confidentiality</h4>
        <p>You shall maintain the confidentiality of any information accessed through the administrative settings, especially concerning user data and system configurations.</p>
        <h4>7. Integrity</h4>
        <p>You agree not to engage in any activities that may compromise the integrity or availability of the system.</p>
        <h4>8. Updates and Changes </h4>
        <p>The municipality reserves the right to update, modify, or change the administrative settings, and you agree to comply with any such updates.</p>
        <h4>9. Termination of Access</h4>
        <p>The organization reserves the right to terminate your access to the administrative settings at any time, with or without cause.</p>
        <h4>10. Consequences of Termination</h4>
        <p>Upon termination, you shall cease all use of the administrative settings, and any data or configurations associated with your account may be deleted.</p>
      </div>
      </div>
       
      )}
  </div>
  <div className="privacy-container">
      <div className="arrow" onClick={togglePrivacyContent}>
      <h2><span><FontAwesomeIcon icon={faLock} className="icon" /></span> <span className='text'>Privacy Policy</span> 
      <span className='show1'>{showPrivacyContent ? '▲' : '▼'} </span></h2>
      </div>
 
      {showPrivacyContent && (
        <div>
          
        
      <div className="legal-information">
        
      <p>Welcome to Muniserve! This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you access and use our admin settings.</p>
      <h4>1. Account Information</h4>
      <p>When you create an admin account, we may collect your name, email address, and other necessary information to create and manage your account.</p>
      <h4>2. Admin Account Management</h4>
      <p>We use your account information to manage your admin settings, provide customer support, and communicate with you about your account.</p>
      <h4>3. Legal Compliance</h4>
      <p>We may disclose your information to comply with applicable laws, regulations, legal processes, or governmental requests.</p>
      <h4>4. Security</h4>
      <p>We implement security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
      <h4>5. Your Choices and Rights</h4>
      <p>You have the right to access, correct, or delete your personal information. You can manage your preferences in the admin settings or contact us for assistance.</p>
      </div>
      </div>
      )}
      </div>
      </div>
  );
};

export default AdminSettings;
