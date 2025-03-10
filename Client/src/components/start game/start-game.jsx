import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useCallback } from "react";
import style from "./StartGame.module.css";
import logo from "../../assets/logo.png";
import line from "../../assets/Line.png";
import lines from "../../assets/Line 2.png";
import sideUpper from "../../assets/right side upper.png";
import sideLower from "../../assets/left side lower.png";
import rightButton from "../../assets/right side arrow .png";
import leftButton from "../../assets/left side arrow.png";
import { toast } from "react-toastify";
import Hamberger from "../hamberger/hamberger";

const StartGame = ({ userId }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [range, setRange] = useState(1);
  const [duration, setDuration] = useState(20);
  const [interval, setInterval] = useState(1);
  const [players, setPlayers] = useState([]);
  const [opponentUsername, setSelectedOpponent] = useState("");
  const [error, setError] = useState("");
  console.log("selected opppppppp", opponentUsername);
  console.log("playersSSSSSSSS", players);

  // Clear errors automatically after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 30000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Get user location and update it in real-time
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
        },
        (err) => {
          setError(`Location access denied: ${err.message}`);
          toast.error(`Location access denied: ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 } // Increased timeout
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported in this browser.");
    }
  }, [userId]);

  const findPlayers = useCallback(async () => {
    if (!location) {
      setError("Location not available yet.");
      return;
    }

    try {
      console.log(
        "Sending request to:",
        `http://localhost:5000/api/user/get-users-in-range?range=${range}`
      );

      const response = await fetch(
        `/api/user/get-users-in-range?range=${range}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      const contentType = response.headers.get("content-type");
      const rawResponse = await response.text(); // Read raw response
      console.log("Raw Response:", rawResponse);

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Unexpected response from server. Possible error page received."
        );
      }

      const data = JSON.parse(rawResponse);
      console.log("Fetched Players:", data);

      if (!data.players || data.players.length === 0) {
        setError("No players found within the selected range.");
        setPlayers([]);
        return;
      }

      setPlayers(data.players);
      setError("");
    } catch (err) {
      console.error("Error fetching players:", err);
      setError(`Error fetching players: ${err.message}`);
      setPlayers([]);
    }
  }, [location, range]);

  useEffect(() => {
    findPlayers();
  }, [findPlayers, range]);

  // Save game settings (Duration & Interval)

  // const saveGameSettings = async (opponentId) => {
  //   try {
  //       const response = await fetch("http://localhost:5000/api/user/duration-and-interval", {
  //           method: "POST",
  //           headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //           body: JSON.stringify({ duration, interval, radius: range, opponentId }),
  //       });

  //       if (!response.ok) {
  //           throw new Error("Failed to save game settings.");
  //       }
  //   } catch (err) {
  //       setError(`Error saving settings: ${err.message}`);
  //   }
  // };

  const saveGameSettings = async (opponentId) => {
    try {
      if (!opponentId || typeof opponentId !== "string") {
        throw new Error("Invalid opponentId format.");
      }

      const response = await fetch(
        "http://localhost:5000/api/user/duration-and-interval",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            duration,
            interval,
            radius: range,
            opponentId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save game settings.");
      }

      console.log("Game settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err.message);
    }
  };

  const handleNext = async (id) => {
    console.log('opponentUsername::',id);
    
    if (!id) {
      setError("Please select an opponent to start the game.");
      return;
    }

    try {
      await saveGameSettings(id); // Ensure settings are saved with opponent

      const response = await fetch(
        "http://localhost:5000/api/user/select-player",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ opponentId:id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to select opponent.");
      }

      toast.success("Settings saved and opponent selected successfully");

      // Navigate with selected values
      navigate("/game-started", {
        // testing git
        state: { duration, interval, opponentUsername, userLocation: location },
      });
    } catch (err) {
      setError(`Error selecting opponent: ${err.message}`);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      setError("User ID is missing. Please log in again.");
      toast.error("User ID is missing. Please log in again.");
    }
  }, []);

  return (
    <div className={style.wrapper}>
      <div className={style.wholePage}>
        <Hamberger />

        <div className={style.logoContainer}>
          <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
        </div>

        {/* Main Container */}
        <div className={style.container}>
          {/* Opponent Selection */}
          <div className={style.section}>
            <div className={style.dropdownContainer}>
              <div className={style.searchIcon}>🔍</div>

              <select
  className={style.dropdown}
  value={opponentUsername?._id || ""}
  onChange={(e) => {
    const opponent = players.find((player) => player._id === e.target.value);
    setSelectedOpponent(opponent);
  }}
>
  <option value="" disabled>
    Select Opponent
  </option>
  {players.length > 0 ? (
    players.map((player) => (
      <option key={player._id} value={player._id}>
        {player.username}
      </option>
    ))
  ) : (
    <option disabled>No players found within range.</option>
  )}
</select>

            </div>
            {/* Display error directly under dropdown */}
            {error && <p className={style.error}>{error}</p>}
          </div>

          {/* Radius Selection */}
          <div className={style.section}>
            <h3>Select Radius</h3>
            <div className={style.buttonGroup}>
              {[1, 2, 3, 4, 5].map((km) => (
                <button
                  key={km}
                  className={`${style.rangeButton} ${
                    range === km ? style.active : ""
                  }`}
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

          {/* Game Duration */}
          <div className={style.section}>
            <h3>Select Game Duration</h3>
            <div className={style.durationContainer}>
              <img
                src={leftButton}
                alt="Hide & Seek Logo"
                className={style.rightlogo}
                onClick={() => setDuration(duration - 1)}
                disabled={duration <= 1}
              />

              <span className={style.durationValue}>{duration}</span>

              <img
                src={rightButton}
                alt="Hide & Seek Logo"
                className={style.rightlogo}
                onClick={() => setDuration(duration + 1)}
              />
            </div>
            <p>Minutes</p>
          </div>

          <div className={style.lineContainers}>
            <img src={sideLower} alt="upperline" className={style.sideLower} />
            <img src={line} alt="line" className={style.lines} />
          </div>

          {/* Interval Selection */}
          <div className={style.section}>
            <h3>Select Intervals</h3>
            <div className={style.buttonGroups}>
              {[1, 2, 3, 4, 5].map((min) => (
                <button
                  key={min}
                  className={`${style.intervalButton} ${
                    interval === min ? style.active : ""
                  }`}
                  onClick={() => setInterval(min)}
                >
                  {min}’
                </button>
              ))}
            </div>
          </div>

          <div className={style.lineContainer}>
            <img src={lines} alt="line" className={style.line} />
            <img src={sideUpper} alt="upperline" className={style.sideUpper} />
          </div>

          {error && <p className={style.error}>{error}</p>}

          <button
            className={style.nextButton}
            onClick={()=>handleNext(opponentUsername._id)}
            //   disabled={!selectedOpponent}
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};

StartGame.propTypes = {
  userId: PropTypes.string,
};

export default StartGame;

// need to add the function to be correctly place game duration and interval
