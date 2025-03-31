import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import style from "./game-in-progress.module.css";
import { toast } from "react-toastify";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
 
// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map updates
import PropTypes from 'prop-types';

const LiveLocationUpdater = ({ userLocation, shouldTrack }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldTrack && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, shouldTrack, map]);

  return null;
};

LiveLocationUpdater.propTypes = {
  userLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  shouldTrack: PropTypes.bool.isRequired,
};

const CountdownPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State variables
  const [gameDuration, setGameDuration] = useState(() => parseInt(localStorage.getItem("gameDuration")) || null);
  const [intervalDuration, setIntervalDuration] = useState(() => parseInt(localStorage.getItem("intervalDuration")) || 0);
  const [remainingClicks, setRemainingClicks] = useState(() => parseInt(localStorage.getItem("remainingClicks")) || 0);
  const [userLocation, setUserLocation] = useState(null);
  const [shouldTrackLive, setShouldTrackLive] = useState(false);
  const [userRole, setUserRole] = useState(null); // Store user role (seeker or hider)

  // Refs for timers
  const gameTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const isPausedRef = useRef(false);

  // Fetch game settings and user role on mount
  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/duration-and-intervals", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data.success) {
          const { duration, interval, role } = response.data.settings;
          const newGameDuration = duration * 60;
          setGameDuration(newGameDuration);
          setRemainingClicks(interval);
          setUserRole(role);  // Set user role (seeker or hider)
          localStorage.setItem("gameDuration", newGameDuration);
          localStorage.setItem("remainingClicks", interval);
        }
      } catch (error) {
        toast.error("Error fetching game settings.");
        console.error("Error getting duration and interval ", error);
      }
    };
    fetchGameSettings();
  }, []);

  // Update user location
  useEffect(() => {
    const updateLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };
            setUserLocation(newLocation);
            console.log('Location from Geolocation:', newLocation);
  
            try {
              await axios.post("http://localhost:5000/api/user/update-location", {
                lat: latitude,
                lng: longitude,
              }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              });
              console.log('Location sent to API:', newLocation);
            } catch (error) {
              console.error("Error updating location:", error);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
          },
          { enableHighAccuracy: true }
        );
      }
    };
  
    // Initial location update
    updateLocation();
  
    if (shouldTrackLive) {
      locationIntervalRef.current = setInterval(updateLocation, 5000);
    } else {
      clearInterval(locationIntervalRef.current);
    }
  
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [shouldTrackLive]);
  

  // Handle interval button click
  const handleIntervalClick = () => {
    if (remainingClicks > 0 && intervalDuration === 0) {
      setIntervalDuration(120);
      setRemainingClicks((prev) => prev - 1);
      setShouldTrackLive(true);
      toast.info(`Live tracking started! ${remainingClicks - 1} intervals remaining.`);
    }
  };

  // Handle interval countdown
  useEffect(() => {
    if (intervalDuration > 0) {
      intervalRef.current = setTimeout(() => {
        setIntervalDuration((prev) => prev - 1);
      }, 1000);
    } else if (intervalDuration === 0 && shouldTrackLive) {
      setShouldTrackLive(false);
      toast.info("Interval ended. Showing range only.");
    }

    return () => clearTimeout(intervalRef.current);
  }, [intervalDuration, shouldTrackLive]);

  // Handle game countdown
  // useEffect(() => {
  //   if (gameDuration > 0) {
  //     gameTimerRef.current = setTimeout(() => setGameDuration((prev) => prev - 1), 1000);
  //   } else if (gameDuration === 0) {
  //     clearTimeout(gameTimerRef.current);
  //     toast.success("Game Over!");
  //     handleGameEndBasedOnRole();
  //   }

  //   return () => clearTimeout(gameTimerRef.current);
  // }, [gameDuration]);





//   2  new Handle game countdown
// useEffect(() => {
//   if (isPausedRef.current) return;

//   if (gameDuration > 0) {
//     gameTimerRef.current = setTimeout(() => setGameDuration((prev) => prev - 1), 1000);
//   } else if (gameDuration === 0) {
//     clearTimeout(gameTimerRef.current);
//     toast.success("Game Over!");
//     setTimeout(() => navigate("/won"), 2000);
//     handleGameEndBasedOnRole();

//   }

//   return () => clearTimeout(gameTimerRef.current);
// }, [gameDuration, navigate]);





//  Handle game countdown
 useEffect(() => {
  if (isPausedRef.current) return;

  if (gameDuration > 0) {
    gameTimerRef.current = setTimeout(() => setGameDuration((prev) => prev - 1), 1000);
  } else if (gameDuration === 0) {
    clearTimeout(gameTimerRef.current);
    toast.success("Game Over!");
    // Delay to ensure the message is visible before navigating
    setTimeout(() => {
      handleGameEndBasedOnRole();
    }, 2000);
  }

  return () => clearTimeout(gameTimerRef.current);
}, [gameDuration]);

  // Function to handle the game end based on the user's role

  useEffect(() => {
        if (location.pathname === "/confirmation") {
          isPausedRef.current = true;
          clearTimeout(gameTimerRef.current);
          clearTimeout(intervalRef.current);
        } else {
          isPausedRef.current = false;
        }
      }, [location.pathname]);
    

  const handleEndGame = () => {
    toast.info("Game Paused");
    clearTimeout(gameTimerRef.current);
    clearTimeout(intervalRef.current);
    navigate("/confirmation");
  };

  // Handle game end
  const handleGameEnd = useCallback(async (result) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/win-loss",
        { result },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data.success) {
        toast.success("Game result updated!");
      } else {
        toast.error("Failed to update game result.");
      }
    } catch (error) {
      console.error("Error updating game result:", error);
      toast.error("Error updating game result.");
    }

    localStorage.removeItem("gameDuration");
    localStorage.removeItem("intervalDuration");
    navigate(`/${result}`);
  }, [navigate]);

  const handleGameEndBasedOnRole = () => {
    if (userRole === "seeker") {
      // If the user is the seeker, check if the hider has been found (based on some condition)
      handleGameEnd("win"); // Assuming the seeker wins if the game duration hits 0
    } else if (userRole === "hider") {
      // If the user is the hider, check if the seeker has not found the hider (based on some condition)
      handleGameEnd("loss"); // Assuming the hider wins if the game duration hits 0
    }
  };
  
  return (
    <div className={style.countdownContainer}>
      <div className={style.header}>
        <p>Game Duration<br />
          <span>{gameDuration !== null ? `${Math.floor(gameDuration / 60)}:${(gameDuration % 60).toString().padStart(2, "0")} left` : "Loading..."}</span>
        </p>
        <p>Interval Duration {remainingClicks > 0 ? `(${remainingClicks} left)` : "(Disabled)"}<br />
          <span>{Math.floor(intervalDuration / 60)}:{(intervalDuration % 60).toString().padStart(2, "0")} left</span>
        </p>
      </div>

      {userLocation ? (
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={15} style={{ height: '400px', width: '100%', borderRadius: '15px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={10} pathOptions={{ color: shouldTrackLive ? 'red' : 'blue', fillOpacity: 0.7 }} />
          <LiveLocationUpdater userLocation={userLocation} shouldTrack={shouldTrackLive} />
        </MapContainer>
      ) : <p>Loading map...</p>}

      <div className={style.buttonArea}>
        <button className={style.endGameButton} onClick={handleEndGame}>END GAME</button>
        <button className={style.endGameButton} onClick={handleIntervalClick} disabled={remainingClicks === 0 || intervalDuration > 0}>
          {shouldTrackLive ? "Tracking Live..." : "Start Interval"}
        </button>
      </div>
    </div>
  );
};

export default CountdownPage;


// update the code so that it will decide on the basis of the the role the user choseif the user chooses hide and the opponent cannot find the user till timmer run out the user win  and same is the case with the seeker if the seeker find the hider before the time run out the seeker win and if the seeker cannot find the hider till the time run out the hider win


// add another function to handle the game end if the game duration hit 0 it will navigate to the loss page or the win page according to the result like the user is seeker and the hider is found or the user is hider and the seeker is not found 

// update the useEffect to handle the game end based on the user role when the game duration hit 0 it will call the function handleGameEndBasedOnRole to handle the game end based on the user role like the user is seeker and the hider is found or the user is hider and the seeker is not found









































































































































// this was the last updated code

// // CountdownPage.jsx
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import style from "./game-in-progress.module.css";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import PropTypes from "prop-types"; // Import PropTypes



// // Fix for default marker icons in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });
// const LiveLocationUpdater = ({ userLocation, shouldTrack }) => {
//   const map = useMap();
  
//   useEffect(() => {
//     if (shouldTrack && userLocation) {
//       map.flyTo([userLocation.lat, userLocation.lng], 15);
//     }
//   }, [userLocation, shouldTrack, map]);

//   return null;
// };

// // Add PropTypes validation
// LiveLocationUpdater.propTypes = {
//   userLocation: PropTypes.shape({
//     lat: PropTypes.number.isRequired,
//     lng: PropTypes.number.isRequired,
//   }),
//   shouldTrack: PropTypes.bool.isRequired,
// };
// const CountdownPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // State variables
//   const [gameDuration, setGameDuration] = useState(() => parseInt(localStorage.getItem("gameDuration")) || null);
//   const [intervalDuration, setIntervalDuration] = useState(() => parseInt(localStorage.getItem("intervalDuration")) || 0);
//   const [remainingClicks, setRemainingClicks] = useState(() => parseInt(localStorage.getItem("remainingClicks")) || 0);
//   const [userLocation, setUserLocation] = useState(null);
//   const [shouldTrackLive, setShouldTrackLive] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [opponentFound, setOpponentFound] = useState(false);

//   // Refs for timers
//   const gameTimerRef = useRef(null);
//   const intervalRef = useRef(null);
//   const locationIntervalRef = useRef(null);
//   const isPausedRef = useRef(false);
//   const checkOpponentIntervalRef = useRef(null);



//   // Handle game end
//   const handleGameEnd = useCallback(async (result) => {
//     try {
//       clearInterval(checkOpponentIntervalRef.current);
//       const response = await axios.post(
//         "http://localhost:5000/api/user/win-loss",
//         { result },
//         { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//       );

//       if (response.data.success) {
//         toast.success("Game result updated!");
//         setTimeout(() => navigate(`/${result}`), 2000);
//       } else {
//         toast.error("Failed to update game result.");
//       }
//     } catch (error) {
//       console.error("Error updating game result:", error);
//       toast.error("Error updating game result.");
//     }

//     localStorage.removeItem("gameDuration");
//     localStorage.removeItem("intervalDuration");
//   }, [navigate]);

// const handleGameEndBasedOnRole = useCallback(() => {
//   if (userRole === "seeker") {
//     handleGameEnd("loss");
//   } else if (userRole === "hider") {
//     handleGameEnd("win");
//   }
// }, [userRole, handleGameEnd]);

//   // Fetch game settings and user role on mount
//   useEffect(() => {
//     const fetchGameSettings = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/user/duration-and-intervals", {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });

//         if (response.data.success) {
//           const { duration, interval, role } = response.data.settings;
//           const newGameDuration = duration * 60;
//           setGameDuration(newGameDuration);
//           setRemainingClicks(interval);
//           setUserRole(role);
//           localStorage.setItem("gameDuration", newGameDuration);
//           localStorage.setItem("remainingClicks", interval);
//         }
//       } catch (error) {
//         toast.error("Error fetching game settings.");
//         console.error("Error getting duration and interval ", error);
//       }
//     };
//     fetchGameSettings();
//   }, []);

//   // Check if opponent was found (for seeker) or if you were found (for hider)
//   useEffect(() => {
//     const checkGameStatus = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/user/game-status", {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });

//         if (response.data.found) {
//           setOpponentFound(true);
//           if (userRole === "seeker") {
//             // Seeker found the hider
//             handleGameEnd("win");
//           } else if (userRole === "hider") {
//             // Hider was found by seeker
//             handleGameEnd("loss");
//           }
//         }
//       } catch (error) {
//         console.error("Error checking game status:", error);
//       }
//     };

//     checkOpponentIntervalRef.current = setInterval(checkGameStatus, 5000);
//     return () => clearInterval(checkOpponentIntervalRef.current);
//   }, [userRole, handleGameEnd]);

//   // Update user location
//   useEffect(() => {
//     const updateLocation = async () => {
//       if ("geolocation" in navigator) {
//         navigator.geolocation.getCurrentPosition(
//           async (position) => {
//             const { latitude, longitude } = position.coords;
//             const newLocation = { lat: latitude, lng: longitude };
//             setUserLocation(newLocation);

//             try {
//               await axios.post("http://localhost:5000/api/user/update-location", {
//                 lat: latitude,
//                 lng: longitude,
//               }, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//               });
//             } catch (error) {
//               console.error("Error updating location:", error);
//             }
//           },
//           (error) => {
//             console.error("Error getting location:", error);
//           },
//           { enableHighAccuracy: true }
//         );
//       }
//     };

//     // Initial location update
//     updateLocation();

//     if (shouldTrackLive) {
//       locationIntervalRef.current = setInterval(updateLocation, 5000);
//     } else {
//       clearInterval(locationIntervalRef.current);
//     }

//     return () => {
//       if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
//     };
//   }, [shouldTrackLive]);

//   // Handle interval button click
//   const handleIntervalClick = () => {
//     if (remainingClicks > 0 && intervalDuration === 0) {
//       setIntervalDuration(120);
//       setRemainingClicks((prev) => prev - 1);
//       setShouldTrackLive(true);
//       toast.info(`Live tracking started! ${remainingClicks - 1} intervals remaining.`);
//     }
//   };

//   // Handle interval countdown
//   useEffect(() => {
//     if (intervalDuration > 0) {
//       intervalRef.current = setTimeout(() => {
//         setIntervalDuration((prev) => prev - 1);
//       }, 1000);
//     } else if (intervalDuration === 0 && shouldTrackLive) {
//       setShouldTrackLive(false);
//       toast.info("Interval ended. Showing range only.");
//     }

//     return () => clearTimeout(intervalRef.current);
//   }, [intervalDuration, shouldTrackLive]);

//   // Handle game countdown
//   useEffect(() => {
//     if (isPausedRef.current || opponentFound) return;
  
//     if (gameDuration > 0) {
//       gameTimerRef.current = setTimeout(() => setGameDuration((prev) => prev - 1), 1000);
//     } else if (gameDuration === 0) {
//       clearTimeout(gameTimerRef.current);
//       toast.success("Game Over!");
//       handleGameEndBasedOnRole();  // This is now properly defined
//     }
  
//     return () => clearTimeout(gameTimerRef.current);
//   }, [gameDuration, opponentFound, handleGameEndBasedOnRole]);
  
//   useEffect(() => {
//     if (location.pathname === "/confirmation") {
//       isPausedRef.current = true;
//       clearTimeout(gameTimerRef.current);
//       clearTimeout(intervalRef.current);
//     } else {
//       isPausedRef.current = false;
//     }
//   }, [location.pathname]);

//   const handleEndGame = () => {
//     toast.info("Game Paused");
//     clearTimeout(gameTimerRef.current);
//     clearTimeout(intervalRef.current);
//     isPausedRef.current = true;  // Ensure game is paused properly
//     navigate("/confirmation");  // Just navigate, don't end game
//   };
  


//   return (
//     <div className={style.countdownContainer}>
//       <div className={style.header}>
//         <p>Game Duration<br />
//           <span>{gameDuration !== null ? `${Math.floor(gameDuration / 60)}:${(gameDuration % 60).toString().padStart(2, "0")} left` : "Loading..."}</span>
//         </p>
//         <p>Interval Duration {remainingClicks > 0 ? `(${remainingClicks} left)` : "(Disabled)"}<br />
//           <span>{Math.floor(intervalDuration / 60)}:{(intervalDuration % 60).toString().padStart(2, "0")} left</span>
//         </p>
//       </div>

//       {userLocation ? (
//         <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={15} style={{ height: '400px', width: '100%', borderRadius: '15px' }}>
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//           <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={10} pathOptions={{ color: shouldTrackLive ? 'red' : 'blue', fillOpacity: 0.7 }} />
//           <LiveLocationUpdater userLocation={userLocation} shouldTrack={shouldTrackLive} />
//         </MapContainer>
//       ) : <p>Loading map...</p>}

//       <div className={style.buttonArea}>
//         <button className={style.endGameButton} onClick={handleEndGame}>END GAME</button>
//         <button className={style.endGameButton} onClick={handleIntervalClick} disabled={remainingClicks === 0 || intervalDuration > 0}>
//           {shouldTrackLive ? "Tracking Live..." : "Start Interval"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CountdownPage;























import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import style from "./confirmation.module.css";
import logo from "../../assets/logo.png";

const Confirmation = () => {
  const navigate = useNavigate();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [error, setError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const sendChoice = async () => {
    if (!selectedChoice) {
      setError("Please select 'YES' or 'NO' to continue.");
      return;
    }

    try {
      const result = selectedChoice === "hide" ? "win" : "loss"; // Mapping choices
      const response = await fetch("http://localhost:5000/api/user/win-loss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) throw new Error("Failed to send your choice.");

      const data = await response.json();
      console.log("Choice submitted successfully:", data);

      setIsWaiting(true);

      if (result === "win") {
        navigate("/win", { state: data.stats }); // Redirect to win screen
      } else {
        navigate(-1); // Go back to previous page on loss
      }
    } catch (err) {
      setError(`Error sending choice: ${err.message}`);
    }
  };
 
  return (
    <div className={style.wrapper}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>

      <div className={style.container}>
        <h1 className={style.title}>OH NO!</h1>
        <p>Did the seeker find you?</p>

        <div className={style.choiceContainer}>
          <button
            className={`${style.choiceButton} ${selectedChoice === "hide" ? style.selected : ""}`}
            onClick={() => setSelectedChoice("hide")}
          >
            YES 
          </button>

          <div className={style.box}>
            <p> </p>
          </div>

          <button
            className={`${style.choiceButtons} ${selectedChoice === "seek" ? style.selected : ""}`}
            onClick={() => setSelectedChoice("seek")}
          >
            NO
          </button>
        </div>

        {error && <p className={style.error}>{error}</p>}

        <button
          className={style.sendButton}
          onClick={sendChoice}
          disabled={isWaiting}
        >
          {isWaiting ? "WAITING FOR RESPONSE..." : "Send" }
        </button>
      </div>
    </div>
  );
};

// export default Confirmation;

