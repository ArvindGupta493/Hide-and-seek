import { useEffect, useState } from "react";
import PropTypes from "prop-types"; // ✅ Import PropTypes
import axios from "axios";
import style from "./settings.module.css";
import { toast } from "react-toastify";

const Settings = ({ activeSection }) => {
  const [admin, setAdmin] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [section, setSection] = useState(activeSection || "profile"); // Default to profile

  useEffect(() => {
    if (activeSection) {
      setSection(activeSection);
    }
  }, [activeSection]); // ✅ Re-run whenever activeSection changes
  

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const response = await axios.get("/api/admin/get-profile", {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       });
  //       // setAdmin(response.data.data);
  //       setAdmin(response.data);
  //     } catch (error) {
  //       setError(error.response?.data?.message || "Failed to load profile.");
  //     }
  //   };

  //   fetchProfile();
  // }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/admin/get-profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
  
        console.log("API Response:", response.data); // ✅ Debug API response
  
        // Correctly extract admin profile data
        setAdmin(response.data.ResponseData);
  
      } catch (error) {
        console.error("Profile Fetch Error:", error);
        setError(error.response?.data?.message || "Failed to load profile.");
      }
    };
  
    fetchProfile();
  }, []);
  
  

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/admin/update-password",
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setMessage(response.data.message);
      setError("");
      setOldPassword("");
      setNewPassword("");
      toast.success("Password updated Successfully.");

    } catch (err) {
      setError(err.response?.data?.message || "Error updating password.");
      toast.error("Password not updated ");
    }
  };

  return (
    <div className={style.container}>
      <h2 className={style.title}>Admin Settings</h2>

      <div className={style.navTabs}>
        <button 
          className={section === "profile" ? style.activeTab : style.tab}
          onClick={() => setSection("profile")}
        >
          Profile
        </button>
        <button 
          className={section === "password" ? style.activeTab : style.tab}
          onClick={() => setSection("password")}
        >
          Change Password
        </button>
      </div>

      {section === "profile" && (
  <div className={style.profileSection}>
    <h3>Admin Profile</h3>
    {error && <p className={style.error}>{error}</p>}

    {admin ? (
      <>
        <p><strong>Name:</strong> {admin.name || "N/A"}</p>
        <p><strong>Username:</strong> {admin.username || "N/A"}</p>
        <p><strong>Email:</strong> {admin.email || "N/A"}</p>
      </>
    ) : (
      <>
        <p>Loading profile...</p>
        <p>Check console for API response.</p> 
      </>
    )}
  </div>
)}



      {section === "password" && (
        <div className={style.passwordSection}>
          <h3>Change Password</h3>
          {error && <p className={style.error}>{error}</p>}
          {message && <p className={style.message}>{message}</p>}
          <form onSubmit={handlePasswordUpdate} className={style.form}>
            <input
              type="password"
              placeholder="Old Password"
              className={style.input}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              className={style.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit" className={style.button}>
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ✅ Add PropTypes validation
Settings.propTypes = {
  activeSection: PropTypes.string, // activeSection should be a string
};

export default Settings;
