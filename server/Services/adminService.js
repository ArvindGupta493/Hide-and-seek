
const AdminNotification = require("../Models/NotificationModel");
const AdminModel = require("../Models/Admin/adminModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/UserModel"); 

class AdminService {

// ============================== Register and login ====================================== //

// Check if email exists
     async checkEmailService(email) {
        const admin = await AdminModel.findOne({ email });
        return admin ? true : false; // Return true if the email exists
    }
 
// Register a new admin
async registerService(adminData) {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const newAdmin = new AdminModel({
        ...adminData,
        password: hashedPassword,
    });
    await newAdmin.save();
    return { success: true, msg: "Admin registered successfully", data: newAdmin };
}
       
// Logic to authenticate the user 
async loginService({ email, password }) {
    console.log(`Attempting to log in user: ${email}`);
    
    const admin = await AdminModel.findOne({ email });                                   // Check if the admin exists by username
    if (!admin) {
        return { success: false, msg: "Invalid email or password", status: 401 };
    } 
    const isPasswordValid = await bcrypt.compare(password, admin.password);                          // Compare passwords
    console.log(`Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
        return { success: false, msg: "Invalid email or password", status: 401 };
    }
    const token = jwt.sign({ id: admin._id }, process.env.ADMIN_KEY, { expiresIn: '10d' });                   // Generate JWT token
    // console.log(`Generated Token: ${token}`); // Debug statement to confirm token generation

  
    return { success: true, msg: "Login successful", status: 200, data: { admin, token } };            // Return success with token
}

async getProfileService(adminId) {
    try {
        const admin = await AdminModel.findById(adminId).select('-password'); // Fetch admin and exclude password field
        if (!admin) {
            return { success: false, msg: "Admin not found", status: 404 };
        }
        return { success: true, msg: "Admin profile fetched", status: 200, data: admin };
    } catch (error) {
        throw new Error("Something went wrong while fetching profile.");
    }
}

async updatePasswordService(adminId, oldPassword, newPassword) {
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
        return { success: false, msg: "Admin not found", status: 404 };
    }

    // Verify the old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isOldPasswordValid) {
        return { success: false, msg: "Old password is incorrect", status: 401 };
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword; // Update the password

    await admin.save(); // Save the updated admin document
    return { success: true, msg: "Password updated successfully", status: 200 };
}
 
// ================================== USER MANAGEMENT ========================================= //

async getUserListService() {
    try {
        // const users = await UserModel.find(); // Adjust the query as needed (e.g., select specific fields)
        const users = await UserModel.find({}, "name email gamesPlayed gamesWon gamesLost isActive");
        return users;
    } catch (error) {
        throw new Error("Error fetching users: " + error.message);
    }
}

async getUsersCountService() {
    try {
        const count = await UserModel.countDocuments(); // Count all users
        return count;
    } catch (error) {
        throw new Error("Error fetching users count: " + error.message);
    }
}

async getUserInfoByEmailService(email) {
    try {
        const user = await UserModel.findOne({ email }).select('-password'); // Exclude password for security
        return user;
    } catch (error) {
        throw new Error("Error fetching user by email: " + error.message);
    }
}

async activateUserByIdService(userId) {
    try {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        user.isActive = true; // ✅ Ensure isActive updates correctly
        await user.save();

        return user;
    } catch (error) {
        throw new Error("Error activating user: " + error.message);
    }
}

async deactivateUserByIdService(userId) {
    try {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        user.isActive = false; // ✅ Ensure isActive updates correctly
        await user.save();

        return user;
    } catch (error) {
        throw new Error("Error deactivating user: " + error.message);
    }
}


async logoutService(adminId) {
    try {
        // here need to be add the logout condition like session timeout or blocking token
        return { success: true, msg: "Logout successful", status: 200 };
    } catch (error) {
        throw new Error("Error during logout: " + error.message);
    }
}

}

module.exports = new AdminService();





