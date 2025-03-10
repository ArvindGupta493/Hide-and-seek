import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "./gameHistroy.module.css";
import logo from "../../assets/logo.png";
import axios from 'axios';

const GameHistory = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const token = localStorage.getItem("token"); // Get auth token
        const response = await axios.get("http://localhost:5000/api/user/GameHistroy", {
          headers: {
            "Authorization": `Bearer ${token}`, // Send token for authentication
            "Content-Type": "application/json"
          }
        });

        setGames(response.data.history); // ✅ Use response.data instead of response.json()
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch game history");
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, []);

  return (
    <div className={style.historyContainer}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>
      
      <h1>Game History</h1>

      {loading ? (
        <p>Loading game history...</p>
      ) : error ? (
        <p className={style.errorText}>{error}</p>
      ) : games.length > 0 ? (
        <table className={style.gameTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Opponent</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={index} className={game.result === "Win" ? style.winRow : style.loseRow}>
                <td>{new Date(game.gameDate).toLocaleDateString()}</td>
                <td>{game.opponentName}</td>
                <td className={game.result === "Win" ? style.winText : style.loseText}>
                  {game.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No games played yet.</p>
      )}

      <button className={style.backButton} onClick={() => navigate(-1)}>
        Done
      </button>
    </div>
  );
};

export default GameHistory;
