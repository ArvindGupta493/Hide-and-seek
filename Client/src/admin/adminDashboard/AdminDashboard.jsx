import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import Users from "../users/Users";
import Notifications from "../notifications/Notifications";
import Settings from "../settings/Settings";
import Dashboard from "../Dashboard/Dashboard";
import styles from "./AdminDashboard.module.css";
import defaultAvatar from "../../assets/avatar.jpg"; // Import the image
import logo from "../../assets/logo.png"; // Import the logo

const isAdmin = () => {
  return localStorage.getItem("role") === "admin";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const adminName = localStorage.getItem("adminName") || "Admin";
  const adminImage = localStorage.getItem("adminImage") || defaultAvatar; // Use imported avatar as default

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!isAdmin()) return <Navigate to="/login" replace />;

  const handleSectionChange = (num) => {
    setSection(num);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Hide & Seek Logo" className={styles.logo} />
          <span className={styles.adminPanelText}>Admin Panel</span>
        </div>

        <div className={styles.profileContainer} onClick={() => setShowDropdown(!showDropdown)}>
          <img src={adminImage} alt="Admin" className={styles.profileImage} />
          
          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {/* <p className={styles.adminName}>{adminName}</p> */}
              <button onClick={() => handleSectionChange(1)} className={styles.adminName}>{adminName}</button>
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>
          )}
        </div>
      </header>
 
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <nav>
          <ul className={styles.sidebarMenu}>
            <li><div onClick={() => handleSectionChange(1)} className={styles.sidebarLink}>Dashboard</div></li>
            <li><div onClick={() => handleSectionChange(2)} className={styles.sidebarLink}>Manage Users</div></li>
            <li><div onClick={() => handleSectionChange(3)} className={styles.sidebarLink}>Notifications</div></li>
            <li><div onClick={() => handleSectionChange(4)} className={styles.sidebarLink}>Settings</div></li>
            <li><button onClick={handleLogout} className={styles.logoutButton}>Logout</button></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {section === 1 && <Dashboard />}
        {section === 2 && <Users />}
        {section === 3 && <Notifications />}
        {section === 4 && <Settings />}
      </main>
    </div>
  );
};

export default AdminDashboard;




















// import { Navigate, useNavigate } from "react-router-dom";
// import {useState} from "react";
// import Users from "../users/Users";
// import Notifications from "../notifications/Notifications";
// import Settings from "../settings/Settings";
// import Dashboard from "../Dashboard/Dashboard";
// import styles from "./AdminDashboard.module.css";
// // import axios from "axios";

// const isAdmin = () => {
//   return localStorage.getItem("role") === "admin";
// };

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [section, setSection] = useState(1);

//   // Fetch User Count

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   if (!isAdmin()) return <Navigate to="/login" replace />;

//   const handleSectionChange = (num) => {
//     setSection(num);
//   };
//   return (
//     <div className={styles.dashboardContainer}>
//       {/* Sidebar */}
//       <aside className={styles.sidebar}>
//         <h1 className={styles.sidebarTitle}>Admin Panel</h1>
//         <nav>
//           <ul className={styles.sidebarMenu}>
//             <li><div onClick={() => handleSectionChange(1)} className={styles.sidebarLink} >   Dashboard  </div> </li>
//             <li><div onClick={() => handleSectionChange(2)} className={styles.sidebarLink} >   Manage Users  </div> </li>
//             <li><div  onClick={() => handleSectionChange(3)}  className={styles.sidebarLink} >   Notifications  </div> </li>
//             <li><div  onClick={() => handleSectionChange(4)}  className={styles.sidebarLink} >   Settings  </div> </li>
//             <li><button onClick={handleLogout} className={styles.logoutButton}>  Logout  </button> </li>
//           </ul>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className={styles.mainContent}>
//         {section == 1 && <Dashboard />}
//         {section == 2 && <Users />}
//         {section == 3 && <Notifications />}
//         {section == 4 && <Settings />}
//       </main>
//     </div>
//   );
// };
// export default AdminDashboard;



