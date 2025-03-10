import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import PropTypes from "prop-types";
import style from "./StartGame.module.css";
import logo from "../../assets/logo.png";
import lines from "../../assets/Line 2.png";
import sideUpper from "../../assets/right side upper.png";
import rightButton from "../../assets/right side arrow .png";
import leftButton from "../../assets/left side arrow.png";
import { toast } from "react-toastify";
import Hamberger from "../hamberger/hamberger";

const StartGame = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [range, setRange] = useState(10);
  const [duration, setDuration] = useState(20);
  const [interval, setInterval] = useState(1);
  const [players, setPlayers] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(`Location access denied: ${err.message}`);
          toast.error(`Location access denied: ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported in this browser.");
    }
  }, []);
  const findPlayers = useCallback(async () => {
    if (!location) return;
  
    try {
      console.log("Fetching players with range:", range);
      const response = await fetch(`/api/user/get-users-in-range?range=${range}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Server Error: ${await response.text()}`);
      }
  
      const data = await response.json();
      console.log("API Response:", data); // Log response to check if it's empty
      setPlayers(data.players || []);
    } catch (err) {
      setError(`Error fetching players: ${err.message}`);
    }
  }, [location, range]);


  

  useEffect(() => {
    if (location) {
      console.log("Calling findPlayers because location changed.");
      findPlayers();
    }
  }, [location, range]); 
  

  const saveGameSettings = async () => {
    try {
      const response = await fetch("/api/user/duration-and-interval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ duration, interval }),
      });

      if (!response.ok) throw new Error("Failed to save game settings.");
    } catch (err) {
      setError(`Error saving settings: ${err.message}`);
    }
  };

  const selectOpponent = async () => {
    if (!selectedOpponent) {
      setError("Please select an opponent to start the game.");
      return;
    }

    try {
      const response = await fetch("/api/user/select-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ selectedOpponent }),
      });

      if (!response.ok) throw new Error("Failed to select opponent.");
    } catch (err) {
      setError(`Error selecting opponent: ${err.message}`);
    }
  };

  const handleNext = async () => {
    try {
      await saveGameSettings();
      await selectOpponent();
      toast.success("Game settings saved, opponent selected. Starting game...");
      navigate("/game-started", { state: { selectedOpponent } });
    } catch (err) {
      setError(`Error starting game: ${err.message}`);
    }
  };

  return (
    <div className={style.wrapper}>
      <div className={style.wholePage}>
        <Hamberger />
        <div className={style.logoContainer}>
          <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
        </div>

        <div className={style.container}>
          <div className={style.section}>
            <h3>Select Opponent</h3>
            <ul className={style.playerList}>
              {players.length > 0 ? (
                players.map((player) => (
                  <li
                    key={player.id}
                    className={`${style.playerItem} ${
                      selectedOpponent === player.id ? style.selected : ""
                    }`}
                    onClick={() => setSelectedOpponent(player.id)}
                  >
                    {player.username}
                  </li>
                ))
              ) : (
                <li className={style.noPlayers}>No players found within range.</li>
              )}
            </ul>
          </div>

          <div className={style.section}>
            <h3>Select Radius</h3>
            <div className={style.buttonGroup}>
              {[1, 2, 3, 4, 5].map((km) => (
                <button
                  key={km}
                  className={`${style.rangeButton} ${range === km ? style.active : ""}`}
                  onClick={() => setRange(km)}
                >
                  {km} KM
                </button>
              ))}
            </div>
          </div>

          <div className={style.lineContainer}>
            <img src={lines} alt="line" className={style.line} />
            <img src={sideUpper} alt="upperline" className={style.sideUpper} />
          </div>

          <div className={style.section}>
            <h3>Select Game Duration</h3>
            <div className={style.durationContainer}>
              <img
                src={leftButton}
                alt="Decrease Duration"
                className={style.rightlogo}
                onClick={() => setDuration(Math.max(duration - 1, 1))}
              />
              <span className={style.durationValue}>{duration}</span>
              <img
                src={rightButton}
                alt="Increase Duration"
                className={style.rightlogo}
                onClick={() => setDuration(duration + 1)}
              />
            </div>
            <p>Minutes</p>
          </div>

          <div className={style.section}>
            <h3>Select Intervals</h3>
            <div className={style.buttonGroups}>
              {[1, 2, 3, 4, 5].map((min) => (
                <button
                  key={min}
                  className={`${style.intervalButton} ${interval === min ? style.active : ""}`}
                  onClick={() => setInterval(min)}
                >
                  {min}’
                </button>
              ))}
            </div>
          </div>

          {error && <p className={style.error}>{error}</p>}

          <button className={style.nextButton} onClick={handleNext}>
            START GAME
          </button>
        </div>
      </div>
    </div>
  );
};

// StartGame.propTypes = {
//   userId: PropTypes.string,
// };

export default StartGame;


// why it showing (No players found within range.)




























const handleNext = async () => {
    if (!opponentUsername) {
        setError("Please select an opponent to start the game.");
        return;
    }

    const selectedOpponent = players.find(player => player.username === opponentUsername);
    if (!selectedOpponent) {
        setError("Invalid opponent selection.");
        return;
    }

    try {
        // Save Game Settings
        await saveGameSettings(selectedOpponent.id);

        // Select Opponent
        const response = await fetch("http://localhost:5000/api/user/select-player", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ opponentId: selectedOpponent.id }),
        });

        if (!response.ok) {
            throw new Error("Failed to select opponent.");
        }

        toast.success("Settings saved and opponent selected successfully");
        navigate("/game-started", { state: { opponentUsername: selectedOpponent.username } });

    } catch (err) {
        setError(`Error selecting opponent: ${err.message}`);
    }
};

// Updated saveGameSettings function
const saveGameSettings = async (opponentId) => {
    try {
        const response = await fetch("http://localhost:5000/api/user/duration-and-interval", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ duration, interval, radius: range, opponentId }),
        });

        if (!response.ok) {
            throw new Error("Failed to save game settings.");
        }
    } catch (err) {
        setError(`Error saving settings: ${err.message}`);
    }
};

























































import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import style from "./game-in-progress.module.css";
import { toast } from "react-toastify";
import { GoogleMap, Circle, LoadScript } from "@react-google-maps/api";
import axios from "axios";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "15px",
};

const CountdownPage = () => {
  const navigate = useNavigate();

  // State variables
  const [gameDuration, setGameDuration] = useState(0);
  const [intervalDuration, setIntervalDuration] = useState(0);
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [remainingClicks, setRemainingClicks] = useState(0);
  
  // Refs for timers
  const gameTimerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/duration-and-interval", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data.success) {
          const { duration, interval } = response.data.settings;
          setGameDuration(duration * 60);
          setIntervalDuration(0); // Initially 0, set when the button is clicked
          setRemainingClicks(interval); // Number of times the button can be clicked
        } else {
          toast.error("Failed to fetch game settings.");
        }
      } catch (error) {
        toast.error("Error fetching game settings.");
      }
    };

    fetchGameSettings();
  }, []);

  useEffect(() => {
    if (intervalDuration > 0) {
      intervalRef.current = setTimeout(() => setIntervalDuration((prev) => prev - 1), 1000);
    }

    return () => clearTimeout(intervalRef.current);
  }, [intervalDuration]);

  // Handle Interval Button Click
  const handleIntervalClick = () => {
    if (remainingClicks > 0) {
      setIntervalDuration(120); // Start 2-minute countdown
      setRemainingClicks((prev) => prev - 1);
      toast.info(`You can start interval ${remainingClicks - 1} more time(s).`);
    }
  };

  // Handle "END GAME" button
  const handleEndGame = () => {
    toast.info("Game Ended");
    clearTimeout(gameTimerRef.current);
    clearTimeout(intervalRef.current);
    navigate("/confirmation");
  };

  return (
    <div className={style.countdownContainer}>
      <div className={style.header}>
        <p>
          Game Duration<br />
          <span>
            {Math.floor(gameDuration / 60)}:{(gameDuration % 60).toString().padStart(2, "0")} left
          </span>
        </p>
        <p>
          Interval Duration<br />
          <span>
            {Math.floor(intervalDuration / 60)}:{(intervalDuration % 60).toString().padStart(2, "0")} left
          </span>
        </p>
      </div>

      {/* Google Map with Live Location */}
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation} zoom={15}>
          <Circle
            center={userLocation}
            radius={500}
            options={{ strokeColor: "#00ff00", fillColor: "#00ff0050" }}
          />
        </GoogleMap>
      </LoadScript>

      {/* Interval Button */}
      <button
        className={style.endGameButton}
        onClick={handleIntervalClick}
        disabled={remainingClicks === 0}
      >
        Interval {remainingClicks > 0 ? `(${remainingClicks} left)` : "(Disabled)"}
      </button>

      {/* End Game Button */}
      <button className={style.endGameButton} onClick={handleEndGame}>
        END GAME
      </button>
    </div>
  );
};

// export default CountdownPage;
























































<button
className={style.endGameButton}
onClick={handleIntervalClick}
disabled={remainingClicks === 0}
>
Interval {remainingClicks > 0}
</button>




  const handleIntervalClick = () => {
    if (remainingClicks > 0) {
      setIntervalDuration(120); // Start 2-minute countdown
      setRemainingClicks((prev) => prev - 1);
      toast.info(`You can start interval ${remainingClicks - 1} more time(s).`);
    }
  };