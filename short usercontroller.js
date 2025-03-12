const Promise = require("bluebird");
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { SuccessHandler } = require("../../Middlewares/responseHandler");
const { sendOtpEmail } = require('../../Services/otpService');
const userService = require("../../Services/userService");
const UserModel = require('../../Models/UserModel'); 
const ErrorHandler = require("../../Utils/errorHandler");
const sendEmail = require('../../Utils/sendEmail'); 

const GameSettings = require("../../Models/GameSettings");
const  NotificationModel  = require("../../Models/NotificationModel");
const { sendNotification } = require("../../Services/notificationService");
const BlacklistedToken = require("../../Models/BlacklistedToken.js");


class UserController {
    async  registerController(req, res, next) {
        try {
            const user = await userService.registerService(req.body);
            return SuccessHandler(res, user.msg, 201, user.data);
        } catch (error) {
            return next(new ErrorHandler("Something went wrong during registration.", 500, error));
        }
    }
    
    async loginController(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await userService.loginService({ email, password });
    
            if (!user.success) {
                return res.status(user.status).json({ success: user.success, message: user.msg });
            }
    
            const { token } = user.data;              // Ensure 'token' is extracted correctly
            if (!token) {
                throw new Error("Token is missing in response from loginService");
            }
            console.log("Received Token:", token);
            return SuccessHandler(res, user.msg, user.status, user.data);
        } catch (error) {
            return next(new ErrorHandler("Something went wrong during login.", 500, error));
        }
    }
     
    async logoutController(req, res, next) {
        try {
            const token = req.headers.authorization?.split(" ")[1]; 
    
            if (!token) {
                return res.status(401).json({ success: false, message: "No token provided." });
            }

            await BlacklistedToken.create({ token });     // Add token to blacklist
            res.status(200).json({ success: true, message: "Logout successful." });
        } catch (error) {
            return next(new ErrorHandler("Something went wrong during logout.", 500, error));
        }
    }
    
 

        async generateOtpController(req, res) {
            try {
                const { email } = req.body;
                const user = await UserModel.findOne({ email });
        
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found.' });
                }
         
                const otp = crypto.randomInt(1000, 9999).toString();
                const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
                const otpExpires = new Date(Date.now() + 10000 * 60 * 1000); // 10000 minutes expiry
        
                // Update the existing user with OTP and expiry
                user.otp = hashedOtp;
                user.otpExpires = otpExpires;
                await user.save();
        
                await sendEmail(user.email, 'Your OTP Code', `Your OTP is: ${otp}`);
                console.log(`OTP sent to ${email}: ${otp}`); // For debugging only. Remove in production.
        
                res.status(200).json({ success: true, message: 'OTP sent successfully.' });
            } catch (error) {
                console.error('Error generating OTP:', error);
                res.status(500).json({ success: false, message: 'Error generating OTP.' });
            }
        }
  
        async verifyOtpController(req, res, next) {
            try {
                const { email, otp } = req.body;
                console.log("Verifying OTP for email:", email); // Debugging line
        
                const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+otp +otpExpires");
                console.log("User found:", user); // Debugging line
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found.' });
                }
        
                const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
                if (user.otp !== hashedOtp || user.otpExpires < new Date()) {
                    return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
                }

                await user.save();
                res.status(200).json({ success: true, message: 'OTP verified successfully.' });
            } catch (error) {
                console.error("Error verifying OTP:", error);  // Debugging line
                return next(new ErrorHandler("Error verifying OTP.", 500, error));
            }
        }

        async updatePasswordController(req, res) {
            try {
                const { email, otp, newPassword, confirmPassword } = req.body;
        
                // Validate input fields
                if (!email || !otp || !newPassword || !confirmPassword) {
                    return res.status(400).json({ message: "All fields are required." });
                }
                if (newPassword !== confirmPassword) {
                    return res.status(400).json({ message: "Passwords do not match." });
                }
                // Check if the user exists
                const user = await UserModel.findOne({ email }).select("+otp +otpExpires");
                if (!user) {
                    return res.status(404).json({ message: "User not found." });
                }
                // Validate OTP
                const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
                console.log("Hashed OTP (Input):", hashedOtp);
                console.log("Stored OTP in DB:", user.otp);
                console.log("OTP Expiry:", user.otpExpires);
                console.log("Current Time:", new Date());
                
                if (user.otp !== hashedOtp || user.otpExpires < new Date()) {
                    return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
                }
                // Hash new password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);

                // Update password and clear OTP
                user.password = hashedPassword;
                user.otp = undefined;
                user.otpExpires = undefined;
                await user.save();
    
                return res.status(200).json({ message: "Password updated successfully." });
            } catch (error) {
                console.error("Error updating password:", error);
                return res.status(500).json({ message: "Internal server error." });
            }
        }

// ===================================== Select a player and save in the database ================================= //

async selectPlayerController(req, res) {
    try {
        const { opponentId, opponentUsername, duration, interval } = req.body;
        const userId = req.decoded.id;

        if (!opponentId && !opponentUsername) {
            return res.status(400).json({ success: false, message: "Opponent ID or Username is required." });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Find opponent by ID or username
        let opponent;
        if (opponentId) {
            opponent = await UserModel.findById(opponentId);
        } else if (opponentUsername) {
            opponent = await UserModel.findOne({ username: opponentUsername });
        }

        if (!opponent) {
            return res.status(404).json({ success: false, message: "Opponent not found." });
        }

        user.opponentId = opponent._id;
        opponent.opponentId = userId;

        // Save game settings
        user.gameSettings = { duration, interval };
        opponent.gameSettings = { duration, interval };

        await user.save();
        await opponent.save();

        res.status(200).json({ 
            success: true, 
            message: "Opponent selected and game settings saved successfully.", 
            selectedOpponent: { id: opponent._id, username: opponent.username },
            gameSettings: { duration, interval }
        });

    } catch (error) {
        console.error("Error selecting opponent:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
}

// ================================ Save game settings with userId and opponentId =============================== //

async   saveGameSettingsController(req, res) {
    try {
        const userId = req.decoded.id;
        const { duration, interval, radius, opponentId } = req.body;

        if (!duration || !interval || !radius || !opponentId) {
            return res.status(400).json({ success: false, message: "All fields are required, including opponentId" });
        }
        if (interval < 1 || interval > 5) {
            return res.status(400).json({ success: false, message: "Interval must be between 1 and 5 minutes" });
        }
        const parsedRadius = parseInt(radius, 10);
        if (![1, 2, 3, 4, 5].includes(parsedRadius)) {
            return res.status(400).json({ success: false, message: "Radius must be between 1km and 5km" });
        }
     
        // Check if opponent exists in the database 
        const opponent = await UserModel.findById(opponentId);
        if (!opponent) {
            return res.status(400).json({ success: false, message: "Opponent not found." });
        }

        // CREATE A NEW GAME SETTINGS DOCUMENT FOR EACH GAME
        const gameSettings = new GameSettings({
            userId,
            duration,
            interval,
            radius: parsedRadius,
            players: [userId, opponentId], 
            status: "waiting",
            startTime: null,
            endTime: null,
        });

        await gameSettings.save();
        console.log("Game Settings Saved:", gameSettings); // Debugging
        res.status(200).json({ success: true, settings: gameSettings });
    } catch (error) {
        console.error("Error saving game settings:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// ============================== choiceController: First player selects "hide" or "seek" ============================== //

async choiceController(req, res) {
    try {
        const { choice } = req.body;
        const userId = req.decoded.id;

        // Find the user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        user.role = choice;

        // Find the opponent
        const opponent = await UserModel.findOne({ _id: user.opponentId }); // Ensure opponentId exists
        if (!opponent) {
            return res.status(404).json({ message: "Opponent not found." });
        }

        opponent.role = choice === "seek" ? "hide" : "seek";   // Assign the opposite role to the opponent

        // Save both users
        await user.save();
        await opponent.save();

        res.status(200).json({ message: "Roles assigned successfully.", userRole: user.role, opponentRole: opponent.role });
    } catch (error) {
        console.error("Error assigning roles:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// ======================== requestAcceptionController: Accept or decline a game request =========================== //

async requestAcceptionController(req, res) {
    try {
        const { decision } = req.body; // 'accept' or 'decline'
        const userId = req.decoded.id;

        const user = await UserModel.findById(userId);
        if (!user || !user.opponentId) {
            return res.status(400).json({ message: 'No opponent request found.' });
        }

        const opponentId = user.opponentId;
        const opponent = await UserModel.findById(opponentId);
        if (!opponent) {
            return res.status(400).json({ message: 'Opponent not found.' });
        }

        if (decision === 'accept') {
            user.gameStatus = 'pending-start'; // Game is now waiting for roles
            opponent.gameStatus = 'pending-start';

            await user.save();
            await opponent.save();

            // Update game settings to add the opponent
            let gameSettings = await GameSettings.findOne({ userId });

            if (!gameSettings) {
                return res.status(400).json({ message: "Game settings not found. Ensure the game settings are created first." });
            }

            if (!gameSettings.players.includes(opponentId)) {
                gameSettings.players.push(opponentId);
                await gameSettings.save();
            }

            // Notify the original requester
            await sendNotification(opponentId, userId, "game-request", "Your game request has been accepted!");

            return res.status(200).json({ success: true, message: "Game request accepted!" });
        } else if (decision === 'decline') {
            // Reset opponent selection
            user.selectedOpponent = null;
            opponent.selectedOpponent = null;

            await user.save();
            await opponent.save();

            // Notify the original requester
            await sendNotification(opponentId, userId, "game-request", "Your game request has been declined.");

            return res.status(200).json({ success: true, message: "Game request declined." });
        } else {
            return res.status(400).json({ message: 'Invalid decision. Must be "accept" or "decline".' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
}

// ================== startGameNowController: Starts the game once both players have confirmed. ================== //

async startGameNowController(req, res) {
    try {
        const userId = req.decoded.id;

        //  Fetch the user and their opponent FIRST
        const user = await UserModel.findById(userId);
        if (!user || !user.opponentId) {
            return res.status(400).json({ message: "No opponent selected. Please select an opponent first." });
        }
        const opponent = await UserModel.findById(user.opponentId);
        if (!opponent) {
            return res.status(400).json({ message: "Selected opponent not found." });
        }

        let gameSettings = await GameSettings.findOne({
            players: userId,
            status: { $ne: "completed" } // Ensure the game is not completed
        });
        
        if (!gameSettings) {
            if (!user.role || !opponent.role) {                              
                return res.status(400).json({ message: "Both players must select hide or seek before starting." });
            }
            if (user.role === opponent.role) {
                return res.status(400).json({ message: "Players must choose different roles (one hides, one seeks)." });
            }
            if (user.gameStatus === 'in-game' || opponent.gameStatus === 'in-game') {
                return res.status(400).json({ message: "Game is already in progress." });
            }

            //  Create new game settings
            gameSettings = new GameSettings({
                players: [userId, opponent._id],
                radius: req.body.range,
                duration: req.body.duration,
                interval: req.body.interval,
                status: 'in-progress',
                startTime: Date.now(),
                endTime: Date.now() + req.body.duration * 60000,
                userId,
            });
        } else {        // Update existing game settings
            gameSettings.status = 'in-progress';
            gameSettings.startTime = Date.now();
            gameSettings.endTime = Date.now() + gameSettings.duration * 60000;
        }
        await gameSettings.save()
            .then((savedGame) => console.log("Game saved:", savedGame))
            .catch((err) => console.error("Error saving game:", err));

        // Corrected: Update game status for both players
        user.gameStatus = 'in-game';
        opponent.gameStatus = 'in-game';
        await user.save();
        await opponent.save();

        // Send notifications
        await sendNotification(userId, opponent._id, "game-status", "The game has started!");
        await sendNotification(opponent._id, userId, "game-status", "The game has started!");

        console.log("Game ID:", gameSettings._id); // Debugging
        console.log("Game settings before save:", gameSettings);
        return res.status(200).json({ success: true, message: "Game started!", gameId: gameSettings._id });
        
    } catch (error) {
        console.error("Error starting game:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}


// ==================================================== Location  ====================================================== //
async updateLocationController(req, res) {
    try {
        const { lat, lng } = req.body;
        const userId = req.decoded.id;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: "Invalid location data." });
        }
        // Update the user's location with a timestamp
        await UserModel.findByIdAndUpdate(userId, {
            location: { lat, lng },
            lastUpdated: new Date() // Store the last update time
        });
        res.json({ success: true, message: "Location updated successfully." });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ success: false, message: "Server error.", error });
    }
}

// ===================================== Fetch the opponent's live location ================================= //
async updateWinLossController(req, res) {
    try {
        const { result } = req.body;
        const userId = req.decoded.id;

        if (!result || !['win', 'loss'].includes(result)) {
            return res.status(400).json({ success: false, message: "Invalid result. Must be 'win' or 'loss'." });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Fetch active game
        let game = await GameSettings.findOne({
            players: userId,
            status: "in-progress"  // Make sure it is active
        });

        if (!game) {
            return res.status(404).json({ success: false, message: "No active game found." });
        }

        // Update user stats
        if (result === 'win') {
            user.gamesWon = (user.gamesWon || 0) + 1;
        } else {
            user.gamesLost = (user.gamesLost || 0) + 1;
        }
        user.gamesPlayed = (user.gamesPlayed || 0) + 1;
        await user.save();

        // Update game status to 'completed'
        game.status = "completed";  
        game.endTime = new Date();  // Set end time
        await game.save();
 
        return res.status(200).json({
            success: true,
            message: `Game result updated: ${result}. Game marked as completed.`,
            stats: {
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                gamesLost: user.gamesLost,
                gameStatus: game.status
            }
        });

    } catch (error) {
        console.error("Error updating game result:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
}

// ================================================ New USER In Process ================================================== //
async startGame(req, res) {
    try {
        const { userId, opponentId, duration, interval, radius } = req.body;

        // Check if either player is already in an unfinished game
        const activeGame = await GameSettings.findOne({
            players: { $in: [userId, opponentId] }, // Check if any of the users are in an ongoing game
            status: { $ne: "completed" },
        });

        if (activeGame) {
            return res.status(400).json({ message: "One of the users is already in an active game. Finish the current game before starting a new one." });
        }

        // Create a new game
        const newGame = new GameSettings({
            userId,
            players: [userId, opponentId],
            duration,
            interval,
            radius,
            status: "in-progress",
            startTime: new Date(),
        });

        await newGame.save();
        // this is the original userController for the whole game so check where it has gone wrong so the user can not play the another game as the user should be able to play other games also with different gameId 

        // Mark users as in-game
        await UserModel.updateMany(
            { _id: { $in: [userId, opponentId] } },
            { $set: { isInGame: true } }
        );

        return res.status(201).json({ message: "Game started successfully", game: newGame });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "A game with this user already exists! Try dropping the unique index." });
        }
        console.error("Error starting game:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

 async finishGame  (req, res) {
    try {
        const { gameId } = req.body;

        // Find the game and update status
        const game = await GameSettings.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        if (game.status === "completed") {
            return res.status(400).json({ message: "Game is already finished" });
        }
 
        game.status = "completed";
        game.endTime = new Date();
        await game.save();

        // Reset user statuses
        await User.updateMany(
            { _id: { $in: game.players } },
            { $set: { isInGame: false } }
        );

        return res.status(200).json({ message: "Game finished successfully" });
    } catch (error) {
        console.error("Error finishing game:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

}

module.exports = new UserController();

// check why after status is completed and game over the user cannot be used again for playing another game after the user finish playing the first game

// the game is already completed so why can't the user play another game

// check the updateWinLossController so that it can complete the game and user can play another game

// check why the new game cannot be played with same user
