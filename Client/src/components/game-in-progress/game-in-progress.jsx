import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from "prop-types";
import style from "./game-in-progress.module.css";

// Constants
const API_BASE_URL = "http://localhost:5000/api/user";
const INTERVAL_DURATION = 120; // 2 minutes in seconds
const STATUS_CHECK_INTERVAL = 5000; // 5 seconds
const LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

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

  // Game state
  const [gameState, setGameState] = useState({
    duration: parseInt(localStorage.getItem("gameDuration")) || null,
    intervalTime: parseInt(localStorage.getItem("intervalDuration")) || 0,
    remainingIntervals: parseInt(localStorage.getItem("remainingClicks")) || 0,
    userLocation: null,
    isTrackingLive: false,
    userRole: null,
    opponentFound: false
  });

  // Refs
  const timers = useRef({
    game: null,
    interval: null,
    location: null,
    statusCheck: null
  });
  const isPaused = useRef(false);

  // Helper functions
  const updateLocalStorage = (key, value) => {
    localStorage.setItem(key, value);
  };

  const clearGameData = () => {
    localStorage.removeItem("gameDuration");
    localStorage.removeItem("intervalDuration");
    localStorage.removeItem("remainingClicks");
  };

  const stopAllTimers = () => {
    Object.values(timers.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
  };

  // API calls
  const fetchGameSettings = useCallback(async () => {
    try {
      if (localStorage.getItem("gameDuration")) return; // Prevent resetting duration
  
      const response = await axios.get(`${API_BASE_URL}/duration-and-intervals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      if (response.data.success) {
        const { duration, interval, role } = response.data.settings;
        const gameDuration = duration * 60;
        
        setGameState(prev => ({
          ...prev,
          duration: gameDuration,
          remainingIntervals: interval,
          userRole: role
        }));
  
        updateLocalStorage("gameDuration", gameDuration);
        updateLocalStorage("remainingClicks", interval);
      }
    } catch (error) {
      toast.error("Error fetching game settings.");
      console.error("Error getting duration and interval:", error);
    }
  }, []);
  
  const updateLocation = useCallback(async (position) => {
    const { latitude, longitude } = position.coords;
    const newLocation = { lat: latitude, lng: longitude };

    setGameState(prev => ({ ...prev, userLocation: newLocation }));

    try {
      await axios.post(`${API_BASE_URL}/update-location`, {
        lat: latitude,
        lng: longitude,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  }, []);

  const checkGameStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game-status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.found) {
        setGameState(prev => ({ ...prev, opponentFound: true }));
        handleGameEnd(gameState.userRole === "seeker" ? "win" : "loss");
      }
    } catch (error) {
      console.error("Error checking game status:", error);
    }
  }, [gameState.userRole]);

 const handleGameEnd = useCallback(async (result) => {
  if (gameState.opponentFound) return; // Prevent duplicate calls

  stopAllTimers(); // Stop all active timers
  clearGameData(); // Clear game-related data from localStorage

  try { 
    const response = await axios.post(
      `${API_BASE_URL}/win-loss`,
      { result },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (response.data.success) {
      toast.success(result === "win" ? "You won!" : "Game over!");
      navigate(`/${result}`); // Navigate to win/loss page
    }
  } catch (error) {
    console.error("Error updating game result:", error);
    toast.error("Error ending game");
  }

  setGameState(prev => ({ ...prev, opponentFound: true })); // Mark game as ended
}, [navigate, gameState.opponentFound]);


const handleManualGameEnd = useCallback(() => {
  toast.info("Game paused - confirm to end");
  stopAllTimers();
  isPaused.current = true;
  navigate("/confirmation", { 
    state: { fromGame: true } // Add this to identify navigation source
  });
}, [navigate]);

  const handleIntervalClick = useCallback(() => {
    if (gameState.remainingIntervals > 0 && gameState.intervalTime === 0) {
      setGameState(prev => ({
        ...prev,
        intervalTime: INTERVAL_DURATION,
        remainingIntervals: prev.remainingIntervals - 1,  
        isTrackingLive: true
      }));

      updateLocalStorage("remainingClicks", gameState.remainingIntervals - 1);
      toast.info(`Live tracking started! ${gameState.remainingIntervals - 1} intervals remaining.`);
    }
  }, [gameState.remainingIntervals, gameState.intervalTime]);

  // Effects
  useEffect(() => {
    fetchGameSettings();
    
    return () => {
      stopAllTimers();
    };
  }, [fetchGameSettings]);
  
  useEffect(() => {
    if (!isPaused.current && !gameState.opponentFound) {
      if (gameState.duration > 0) {
        timers.current.game = setTimeout(() => {
          setGameState(prev => {
            const newDuration = prev.duration - 1;
            updateLocalStorage("gameDuration", newDuration);
            return { ...prev, duration: newDuration };
          });
        }, 1000);
      } else if (gameState.duration === 0 && !gameState.opponentFound) {
        console.log("Game duration reached zero, ending game...");
        handleGameEnd(gameState.userRole === "seeker" ? "loss" : "win");
      }
    }
  }, [gameState.duration, gameState.userRole, gameState.opponentFound, handleGameEnd]);
  
  

  useEffect(() => {
    if (gameState.intervalTime > 0) {
      timers.current.interval = setTimeout(() => {
        setGameState(prev => ({ ...prev, intervalTime: prev.intervalTime - 1 }));
      }, 1000);
    } else if (gameState.intervalTime === 0 && gameState.isTrackingLive) {
      setGameState(prev => ({ ...prev, isTrackingLive: false }));
      toast.info("Interval ended. Showing range only.");
    }
  }, [gameState.intervalTime, gameState.isTrackingLive]);

  useEffect(() => {
    timers.current.statusCheck = setInterval(checkGameStatus, STATUS_CHECK_INTERVAL);
    return () => clearInterval(timers.current.statusCheck);
  }, [checkGameStatus]);

  useEffect(() => {
    const getLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          updateLocation,
          (error) => console.error("Error getting location:", error),
          { enableHighAccuracy: true }
        );
      }
    };

    getLocation();

    if (gameState.isTrackingLive) {
      timers.current.location = setInterval(getLocation, LOCATION_UPDATE_INTERVAL);
    } else {
      clearInterval(timers.current.location);
    }

    return () => clearInterval(timers.current.location);
  }, [gameState.isTrackingLive, updateLocation]);

  useEffect(() => {
    if (location.pathname === "/confirmation") {
      isPaused.current = true;
      stopAllTimers();
    } else {
      isPaused.current = false;
    }
  }, [location.pathname]);

  // Format time display
  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  
  return (
    <div className={style.countdownContainer}>
      <div className={style.header}>
        <p>Game Duration<br />
          <span>{gameState.duration !== null ? `${formatTime(gameState.duration)} left` : "Loading..."}</span>
        </p>
        <p>Interval Duration {gameState.remainingIntervals > 0 ? `(${gameState.remainingIntervals} left)` : "(Disabled)"}<br />
          <span>{formatTime(gameState.intervalTime)} left</span>
        </p>
      </div>

      {gameState.userLocation ? (
        <MapContainer 
          center={[gameState.userLocation.lat, gameState.userLocation.lng]} 
          zoom={15} 
          style={{ height: '400px', width: '100%', borderRadius: '15px' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleMarker 
            center={[gameState.userLocation.lat, gameState.userLocation.lng]} 
            radius={10} 
            pathOptions={{ color: gameState.isTrackingLive ? 'red' : 'blue', fillOpacity: 0.7 }} 
          />
          <LiveLocationUpdater 
            userLocation={gameState.userLocation} 
            shouldTrack={gameState.isTrackingLive} 
          />
        </MapContainer>
      ) : <p>Loading map...</p>}

      <div className={style.buttonArea}>
        <button 
          className={style.endGameButton} 
          onClick={handleManualGameEnd}
        >
          END GAME
        </button>
        <button 
          className={style.endGameButton} 
          onClick={handleIntervalClick} 
          disabled={gameState.remainingIntervals === 0 || gameState.intervalTime > 0}
        >
          {gameState.isTrackingLive ? "Tracking Live..." : "Start Interval"}
        </button>
      </div>
    </div>
  );
};

export default CountdownPage;


//  check the code as it hit the win-loss api when from the /confirmation page it was redirected back to the countdown page as it should  not happen and just resume the game where it left of do update the code



// check the code so as it hit the win-loss api when/ from the conformation page it was redirected back to the countdown page but it restart the the gameduration and also hit the win-loss api which should not happen up untill the game duration timer runs out   but the the dureation timer hit 0 it is not hitting the  wun-loss api and redirectiong to the "/won" or "/loss" page respectively according to the the result of the game when game dureation hit 0








































































// // CountdownPage.jsx
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import style from "./game-in-progress.module.css";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import PropTypes from "prop-types";

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

//   // Handle game end (for timer expiration or opponent found)
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
//         navigate(`/${result}`);
//       } else {
//         toast.error("Failed to update game result.");
//       }
//     } catch (error) {
//       console.error("Error updating game result:", error);
//       toast.error("Error updating game result.");
//     }

//     // Clear game data
//     localStorage.removeItem("gameDuration");
//     localStorage.removeItem("intervalDuration");
//     localStorage.removeItem("remainingClicks");
//   }, [navigate]);

//   const handleGameEndBasedOnRole = useCallback(() => {
//     if (userRole === "seeker") {
//       handleGameEnd("loss");
//     } else if (userRole === "hider") {
//       handleGameEnd("win");
//     }
//   }, [userRole, handleGameEnd]);

//   // Handle manual game end (when user clicks button)
//   const handleManualGameEnd = useCallback(() => {
//     toast.info("Game Paused - Confirm to end game");
//     clearTimeout(gameTimerRef.current);
//     clearTimeout(intervalRef.current);
//     isPausedRef.current = true;
//     navigate("/confirmation");
//   }, [navigate]);

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
//       localStorage.setItem("remainingClicks", remainingClicks - 1);
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
//       gameTimerRef.current = setTimeout(() => {
//         setGameDuration((prev) => {
//           const newDuration = prev - 1;
//           localStorage.setItem("gameDuration", newDuration);
//           return newDuration;
//         });
//       }, 1000);
//     } else if (gameDuration === 0) {
//       clearTimeout(gameTimerRef.current);
//       toast.success("Game Over!");
//       handleGameEndBasedOnRole();
//     }
  
//     return () => clearTimeout(gameTimerRef.current);
//   }, [gameDuration, opponentFound, handleGameEndBasedOnRole]);

//   // Pause game when navigating away
//   useEffect(() => {
//     if (location.pathname === "/confirmation") {
//       isPausedRef.current = true;
//       clearTimeout(gameTimerRef.current);
//       clearTimeout(intervalRef.current);
//     } else {
//       isPausedRef.current = false;
//     }
//   }, [location.pathname]);

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
//         <button 
//           className={style.endGameButton} 
//           onClick={handleManualGameEnd}
//         >
//           END GAME
//         </button>
//         <button 
//           className={style.endGameButton} 
//           onClick={handleIntervalClick} 
//           disabled={remainingClicks === 0 || intervalDuration > 0}
//         >
//           {shouldTrackLive ? "Tracking Live..." : "Start Interval"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CountdownPage;


// check the  issue  when the user click on the endgame button it have to go to confirmation page but it is not going to the confirmation page because the win -loss api is already hit which should not happen up untill confimation or the game duration timer runs out  but the the dureation timer hit 0 it is not hitting the  wun-loss api and redirectiong to the "/won" or "/loss" page respectively according to the the result of the game when game dureation hit 0 