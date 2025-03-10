
const User = require("../Models/UserModel");

const AdminNotification = require("../Models/NotificationModel"); // New model for admin notifications
const UserModel = require("../Models/UserModel");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const GameSettings = require("../Models/GameSettings");

class UserService { 
    async registerService(userData) {
        const newUser = new UserModel(userData);
        await newUser.savePassword(userData.password);
        await newUser.save();
        return { success: true, msg: "User registered successfully", data: newUser };
        // console.log("User saved successfully:", newUser);
    }

    // =========================================== Authenticate the user ================================================= //


    async loginService({ email, password }) {
        const user = await UserModel.findOne({ email }).select('+password');
        if (!user) {
            return { success: false, msg: "Invalid username or password", status: 401 };
        }

        const isMatch = await user.checkPassword(password);  // no this work & because of savepassword used in for newdata
        if (!isMatch) {
            return { success: false, msg: "Invalid password", status: 401 };
        }
        const token = this.generateToken(user);            // Generate a token (implement the token generation logic)
        return {
            success: true,
            msg: "Login successful",
            status: 200,
            data: {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                token,
            }
        };
    }  
    // generateToken(user) {
    //     const jwt = require('jsonwebtoken');
    //     const token = jwt.sign({ id: user._id }, process.env.PRIVATE_KEY, { expiresIn: '60000h' });
    //     return token;
    // }  
    generateToken(user) {
        const jwt = require('jsonwebtoken');
        if (!process.env.PRIVATE_KEY) {
            console.error("PRIVATE_KEY is missing in environment variables");
            throw new Error("Server misconfiguration: PRIVATE_KEY is missing");
        }
        return jwt.sign({ id: user._id }, process.env.PRIVATE_KEY, { expiresIn: '7d' });
    }
    
    
    // ================================================ get profile ==================================================== // 


    async getUserProfileService(userId) {
        try {
            const user = await UserModel.findById(userId).select("-password"); // Exclude the password field
            if (!user) {
                return { success: false, msg: "User not found", status: 404 };
            }
            return {
                success: true,
                msg: "User profile fetched successfully",
                status: 200,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    gameWon: user.game_won,
                    gameLost: user.game_lost,
                    totalGame: user.Total_game,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            };
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return { success: false, msg: "Error fetching user profile", status: 500 };
        }
    }

}

module.exports = new UserService();
  





// async generateOtpService(email) {
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//         return { success: false, msg: "User not found", status: 404 };
//     }

//     // Generate 4-digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

//     user.otp = hashedOtp;
//     user.otpExpires = Date.now() + 10 * 60 * 1000; 
//     await user.save();

//     // Send OTP via email
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER, 
//             pass: process.env.EMAIL_PASS  
//         }
//     });  
 
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Your OTP Code',
//         text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`
//     };

//     await transporter.sendMail(mailOptions);

//     return { success: true, msg: "OTP generated and sent to your email", status: 200 };
// }

// async verifyOtpService({ email, otp }) {
//     try {
//         // db.users.find({ email: "thearvindgupta493@gmail.com" })
        
//         const user = await UserModel.findOne({ email }).select("+otp +otpExpires");
//         console.log("User found:", user); // Debugging line

//         if (!user) {
//             return { success: false, msg: "User not found", status: 404 };
//         }

//         if (!user.otp || !user.otpExpires) {
//             return { success: false, msg: "OTP not found. Request a new OTP.", status: 400 };
//         }

//         // Check if OTP is expired
//         if (Date.now() > user.otpExpires) {
//             return { success: false, msg: "OTP expired", status: 400 };
//         }

//         const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
//         if (hashedOtp !== user.otp) {
//             return { success: false, msg: "Invalid OTP", status: 400 };
//         }


//         const otpRecord = await OTPModel.findOne({ email: req.body.email, otp: req.body.otp });
//         if (!otpRecord) return res.status(400).json({ message: "Invalid OTP or user not found" });

//         // Clear OTP after successful verification
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save();

//         return { success: true, msg: "OTP verified successfully", status: 200 };
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         return { success: false, msg: "Internal Server Error", status: 500 };
//     }
// }

// async updatePasswordService(userId, oldPassword, newPassword) {
//     const user = await UserModel.findById(userId);
//       if (!user) {
//         return { success: false, msg: "User not found", status: 404 };
//     }

// // Verify the old password
//     const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
//     if (!isOldPasswordValid) {
//         return { success: false, msg: "Old password is incorrect", status: 401 };
//     }

// // Hash the new password
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedNewPassword; // Update the password

//     await user.save(); // Save the updated user document
//     return { success: true, msg: "Password updated successfully", status: 200 };
// }

// async updatePasswordservice(email, newPassword) {
//     const user = await UserModel.findOne({ email });
//     // const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+otp +otpExpires");
    
//     if (!user) {
//         return { success: false, msg: "User not found", status: 404 };
//     }

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedNewPassword;

//     await user.save();
//     return { success: true, msg: "Password updated successfully", status: 200 };
// }



// // ========================================== GAME ================================================ //


// // async getUserListService(userId, radius = 5000) {
// //     try {
// //         // Fetch the current user's location
// //         const currentUser = await UserModel.findById(userId).lean();
    
// //         if (!currentUser?.location?.coordinates) {
// //             throw new Error("User location not found or invalid.");
// //         }

// //         console.log("Current user coordinates:", currentUser.location.coordinates);
// //         // Fetch nearby users within the specified radius
// //         const nearbyUsers = await UserModel.find({
// //             _id: { $ne: userId },  // Exclude the current user
// //             "location.coordinates": { $exists: true }, // Ensure users have valid locations
// //             location: {
// //                 $near: {
// //                     $geometry: {
// //                         type: "Point",
// //                         coordinates: currentUser.location.coordinates,
// //                     },
// //                     $maxDistance: radius,            
// //                 },
// //             },
// //         }).lean();

// //         return nearbyUsers;
// //     } catch (error) {
// //         console.error("Error finding nearby users:", error);
// //         throw new Error(`Error finding nearby users: ${error.message}`);
// //     }
// // }


// async getUserListService(userId) {
// try {
//     const currentUser = await UserModel.findById(userId).lean();

//     if (!currentUser?.location?.coordinates) {
//         throw new Error("User location not found or invalid.");
//     }

//     console.log("Current user coordinates:", currentUser.location.coordinates);

//     // Fetch all users except the current user
//     const allUsers = await UserModel.find({
//         _id: { $ne: userId },
//         // "location.coordinates": { $exists: true }
//     }).lean();

//     console.log("Nearby Users:", allUsers); // Debugging log

//     return allUsers;
// } catch (error) {
//     console.error("Error finding users:", error);
//     throw new Error(`Error finding users: ${error.message}`);
// }
// }


// async saveGameSettingsService (userId, duration, interval, radius) {
//     try {
//         const settings = await GameSettings.findOneAndUpdate(
//             { userId },
//             { duration, interval, radius },
//             { upsert: true, new: true }
//         );
//         return settings;
//     } catch (error) {
//         throw new Error(`Error saving game settings: ${error.message}`);
//     }
// };
