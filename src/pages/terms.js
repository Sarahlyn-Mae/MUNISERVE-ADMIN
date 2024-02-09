import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import { Link, useLocation, useHistory } from 'react-router-dom';
import {
  faEdit,
  faTrashAlt,
  faPlus,
  faFileAlt,
  faLock,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import "./settings.css";
import useAuth from "../components/useAuth";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsIqHHA8727cGeTjr0dUQQmttqJ2nW_IE",
  authDomain: "muniserve-4dc11.firebaseapp.com",
  projectId: "muniserve-4dc11",
  storageBucket: "muniserve-4dc11.appspot.com",
  messagingSenderId: "874813480248",
  appId: "1:874813480248:web:edd1ff1f128b5bb4a2b5cd",
  measurementId: "G-LS66HXR3GT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AdminSettings = () => {
  const [newUser, setNewUser] = useState({ id: null, name: "", email: "" });
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");

  // Function for the account name
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user?.email; // Use optional chaining to prevent null access
        const truncatedEmail =
          email.length > 10 ? `${email.substring(0, 10)}...` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "admin_users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };

    fetchUsers();
  }, [db]);

  const openModal = (action, userId = null) => {
    setModalAction(action);
    if (action === "edit") {
      const userToEdit = users.find((user) => user.id === userId);
      setNewUser({ ...userToEdit });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalAction("");
    setNewUser({ name: "", email: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalAction === "add") {
      await addDoc(collection(db, "admin_users"), newUser);
    } else if (modalAction === "edit") {
      await updateDoc(doc(db, "admin_users", newUser.id), newUser);
    } else if (modalAction === "delete") {
      await deleteDoc(doc(db, "admin_users", newUser.id));
    }
    closeModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const addNewUser = async () => {
    try {
      await addDoc(collection(db, "admin_users"), newUser);
      closeModal();
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const editUser = async () => {
    try {
      await updateDoc(doc(db, "admin_users", newUser.id), newUser);
      closeModal();
    } catch (error) {
      console.error("Error editing user: ", error);
    }
  };

  const deleteUser = async () => {
    try {
      await deleteDoc(doc(db, "admin_users", newUser.id));
      closeModal();
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="icons">
          <h1>Settings</h1>
          <img src={notification} alt="Notification.png" className="notif" />
          <img src={logo} alt="logo" className="account-img" />
          <div className="account-names">
            <h2>{userEmail}</h2>
          </div>
        </div>
      </div>

      <div className="heading">
        <h4>Terms and Conditions</h4>
      </div>

      <div className="terms">
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
  );
};

export default AdminSettings;
