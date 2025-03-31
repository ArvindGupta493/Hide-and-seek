import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./users.module.css"; // Import the CSS module

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
      setFilteredUsers(JSON.parse(savedUsers));
      setLoading(false);
    } else {
      fetchUsers(); // If no saved users, fetch from API
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/get-user-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.succeeded) {
        const fetchedUsers = res.data.ResponseData || [];
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
        localStorage.setItem("users", JSON.stringify(fetchedUsers)); // Save users to localStorage
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = currentStatus
        ? `http://localhost:5000/api/admin/deactivate/${userId}`
        : `http://localhost:5000/api/admin/activate/${userId}`;
  
      await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
  
      // Update user status locally in both lists
      const updateStatus = (userList) =>
        userList.map((user) =>
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        );
  
      const updatedUsers = updateStatus(users);
      const updatedFilteredUsers = updateStatus(filteredUsers);
  
      setUsers(updatedUsers);
      setFilteredUsers(updatedFilteredUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
  
      // Delay the UI reset/navigation by 30 seconds
      setTimeout(() => {
        setFilteredUsers(updatedUsers);
      }, 30000); 
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };
  

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users); 
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/admin/get-user-info/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.data.succeeded && res.data.ResponseData) {
        let foundUser = res.data.ResponseData;
        
        // Check if user already exists in users state
        const existingUser = users.find((user) => user._id === foundUser._id);
  
        if (existingUser) {
          // Use existing user's active state instead of API response (if it's missing)
          foundUser = { ...foundUser, isActive: existingUser.isActive };
        }
  
        // Ensure the user list is updated properly
        const updatedUsers = existingUser ? users : [...users, foundUser];
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));
  
        // Display the searched user
        setFilteredUsers([foundUser]);
      } else {
        setFilteredUsers([]); // No user found
      }
    } catch (error) {
      console.error("Error searching user:", error);
      setFilteredUsers([]);
    }
  };
  
  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User Management</h2>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by User ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className={user.isActive ? styles.deactivateButton : styles.activateButton}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noUsersMessage}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;

