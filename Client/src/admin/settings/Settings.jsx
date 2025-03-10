import { useEffect, useState } from "react";
import axios from "axios";
import style from "./settings.module.css";
import { toast } from "react-toastify";

const Settings = () => {
  const [admin, setAdmin] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/admin/get-profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAdmin(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load profile.");
      }
    };
  
    fetchProfile();
  }, []);
  

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (!oldPassword || !newPassword 
      // || !confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    // if (newPassword !== confirmPassword) {
    //   setError("New passwords do not match.");
    //   return;
    // }

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
      toast.success("Password updated Successfully. ");
  
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password.");
      toast.error("Password not updated ");

    }
  };

  return (
    <div className={style.containers}>
      <h2 className={style.title}>Admin Settings</h2>
      <div className={style.container}>

      {error && <p className={style.error}>{error}</p>}
      {message && <p className={style.message}>{message}</p>}

      {admin && (
        <div className={style.adminInfo}>
          <p><strong>Name:</strong> {admin.name}</p>
          <p><strong>Email:</strong> {admin.email}</p>
        </div>
      )}

      <h3 className={style.title}>Change Password</h3>
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
        {/* <input
          type="password"
          placeholder="Confirm New Password"
          className={style.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        /> */}
        <button type="submit" className={style.button}>
          Update Password
        </button>
      </form>
    </div>
    </div>
  );
};

export default Settings;
