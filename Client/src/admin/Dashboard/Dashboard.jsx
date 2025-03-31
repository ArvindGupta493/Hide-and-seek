import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [totalActiveGames, setTotalActiveGames] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios
      .get("/api/admin/get-user-list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        const userList = res.data.ResponseData || [];
        setUsers(userList);

        setTotalUsers(userList.length);
        setTotalGamesPlayed(
          userList.reduce((sum, user) => sum + (user.gamesPlayed || 0), 0)
        );
        setTotalActiveGames(
          userList.reduce((sum, user) => sum + (user.Activegames || 0), 0)
        );
      })
      .catch(console.error);
  }, []);

  // Handle search by email
  const handleSearch = () => {
    const user = users.find((user) => user.email === searchEmail.trim());

    if (user) {
      setSelectedUser(user);
      setErrorMessage("");
    } else {
      setSelectedUser(null);
      setErrorMessage("No user found with this email.");
    }
  };

  // Close popup when clicking outside
  const handleOverlayClick = () => {
    setSelectedUser(null);
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.dashboardTitle}>Dashboard</h2>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {/* Stats Overview */}
      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Total Games Played</h3>
          <p>{totalGamesPlayed}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Total Active Games</h3>
          <p>{totalActiveGames}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>

      {/* Users Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>UserId</th>
            <th>Email</th>
            <th>Total Games</th>
            <th>Games Won</th>
            <th>Games Lost</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.noData}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user._id}
                className={styles.clickableRow}
                onClick={() => setSelectedUser(user)}
              >
              <td>{user.name}</td>
              <td>{user._id	}</td>
              <td>{user.email}</td>
              <td>{user.gamesPlayed || 0}</td>
              <td>{user.gamesWon || 0}</td>
              <td>{user.gamesLost || 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* User Details Popup */}
      {selectedUser && (
        <div className={styles.popupOverlay} onClick={handleOverlayClick}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            {/* <button
              onClick={() => setSelectedUser(null)}
              className={styles.closeButton}
            >
              X
            </button> */}
            <h3>User Details</h3>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>UserId:</strong> {selectedUser._id	}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Total Games:</strong> {selectedUser.gamesPlayed || 0}</p>
            <p><strong>Games Won:</strong> {selectedUser.gamesWon || 0}</p>
            <p><strong>Games Lost:</strong> {selectedUser.gamesLost || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

// update the also so when the user is clicked on th llist it will show its popup