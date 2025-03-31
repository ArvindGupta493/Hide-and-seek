const ErrorHandler = require("../../Utils/errorHandler");
const { SuccessHandler } = require("../../Middlewares/responseHandler");
const adminService = require("../../Services/adminService");
const userService = require("../../Services/userService");
const Notification = require("../../Models/NotificationModel"); 


class AdminController {
    async registerAdminController(req, res, next) {
        try {
            const { name, email, username, password } = req.body; 

            // Check if the email already exists
            const checkEmail = await adminService.checkEmailService(email);
            if (checkEmail) {
                return next(new ErrorHandler("This Email ID is already used.", 400));
            }

            // Register the new admin
            const user = await adminService.registerService({ name, email, username, password });
            if (user && user.success) {
                return SuccessHandler(res, user.msg, user.status, user.data);
            } else {
                return next(new ErrorHandler(user.msg, user.status, user.data));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong during registration.", 500, error));
        }
    }   

     async loginController(req, res, next) {
             if (!req.body.email || req.body.email.trim() === "") {
                return next(new ErrorHandler("Email cannot be blank!", 400, {}));
            }
             if (!req.body.password || req.body.password.trim() === "") {
                return next(new ErrorHandler("Password cannot be blank!", 400, {}));
             }
             
             return Promise.resolve(adminService.loginService(req.body)).then(async(data) => {
                        if (data && data.success) {
                            console.log(`Login success, token generated: ${data.data.token}`); // Debug logging
                            return SuccessHandler(res, data.msg, data.status, data.data);
                        } else {
                            return next(new ErrorHandler(data ? data.msg : "Login failed", data ? data.status : 400, {}));
                        }
                    })
                    .catch((error) => {
                        return next(new ErrorHandler("Something went wrong while logging in.", 500, error));
                    });
    }

    async   getProfile(req, res, next) {
        return Promise.resolve(adminService.getProfileService(req.decoded.id)).then((data) => {
            if (data.success) {
                SuccessHandler(res, data.msg, data.status, data.data)
            } else {
                return next(new ErrorHandler(data.msg, data.status, data.data));
            }
        })
    }

    async updatePasswordController(req, res, next) {
        try {
            const { old_password, new_password } = req.body;

            // Validate old and new passwords
            if (!old_password || old_password.trim() === "") {
                return next(new ErrorHandler("Please enter your old password", 400));
            }
            if (!new_password || new_password.trim() === "") {
                return next(new ErrorHandler("Please enter a new password", 400));
            }
            if (new_password.length < 8) {
                return next(new ErrorHandler("New password must be at least 8 characters long", 400));
            }
 
            // Prepare the data for the service 
            const adminId = req.decoded.id; // Get the admin's ID from the decoded token
            const result = await adminService.updatePasswordService(adminId, old_password, new_password);
                
            if (result.success) {
                return SuccessHandler(res, result.msg, result.status, result.data);
            } else {
                return next(new ErrorHandler(result.msg, result.status, result.data));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while updating the password.", 500, error));
        }
    }  


// this is the new format to try the logout byt not updated 

//    async logoutController(req, res, next) {
//     try {
//         const adminId = req.decoded.id;

//         const admin = await adminModel.findById(adminId);
//         if (!admin) {
//             return res.status(404).json({ success: false, message: "admin not found." });
//         }
//         admin.token = null; 
//         await admin.save();

//         res.status(200).json({ success: true, message: "Logout successful." });
//     } catch (error) {
//         return next(new ErrorHandler("Something went wrong during logout.", 500, error));
//     }
//    }


    async logoutController(req, res, next) {
        try {
            const adminId = req.decoded.id; // Get admin ID from token
            const result = await adminService.logoutService(adminId);
            
            if (result.success) {
                return SuccessHandler(res, result.msg, result.status);
            } else {
                return next(new ErrorHandler(result.msg, result.status));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while logging out.", 500, error));
        }
    }





// =================================================== User Management ================================================== // 





    async getUserListController(req, res, next) {
        try {
            const users = await adminService.getUserListService();
            if (users && users.length > 0) {
                return SuccessHandler(res, "User list fetched successfully", 200, users);
            } else {
                return SuccessHandler(res, "No users found", 200, []);
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching the user list.", 500, error));
        }
    }

    async getUsersCountController(req, res, next) {
        try {
            const count = await adminService.getUsersCountService();
            SuccessHandler(res, "User count fetched successfully", 200, { total: count });
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while fetching user count.", 500, error));
        }
    }

    async getUserInfoByIdController(req, res, next) {
        const searchParam = req.params.id; // Can be user ID or email
    
        if (!searchParam) {
            return next(new ErrorHandler("User ID or Email is required", 400));
        } 
    
        try {
            let userInfo;
    
            // Check if the input is a valid MongoDB ObjectId
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(searchParam);
            
            if (isObjectId) {
                userInfo = await adminService.getUserInfoByIdService(searchParam);
            } else {
                userInfo = await adminService.getUserInfoByEmailService(searchParam);
            }
    
            if (userInfo) {
                return SuccessHandler(res, "User information retrieved successfully", 200, userInfo);
            } else {
                return next(new ErrorHandler("User not found", 404));
            }
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while retrieving user information.", 500, error));
        }
    }
    
    async activateUserByIdController(req, res, next) {
        const userId = req.params.id;
    
        if (!userId) {
            return next(new ErrorHandler("User ID is required", 400));
        }
    
        try {
            const updatedUser = await adminService.activateUserByIdService(userId);
            if (!updatedUser) {
                return next(new ErrorHandler("User not found or could not be activated", 404));
            }
            return SuccessHandler(res, "User activated successfully", 200, updatedUser);
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while activating the user.", 500, error));
        }
    }
    
    async deactivateUserByIdController(req, res, next) {
        const userId = req.params.id;
    
        if (!userId) {
            return next(new ErrorHandler("User ID is required", 400));
        }
    
        try {
            const updatedUser = await adminService.deactivateUserByIdService(userId);
            if (!updatedUser) {
                return next(new ErrorHandler("User not found or could not be deactivated", 404));
            }
            return SuccessHandler(res, "User deactivated successfully", 200, updatedUser);
        } catch (error) {
            return next(new ErrorHandler("Something went wrong while deactivating the user.", 500, error));
        }
    }




    // chek why the admin is not able to deactivarte and activate the user correctly intead of tof just showing the message
    // check the user service and the admin service to see if the user is able to be activated or deactivated correctly  
// ==================================================== NOTIFICATON ===================================================== //

async getAdminNotifications(req, res, next) {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }); // Get latest notifications
        return res.status(200).json({
            ResponseCode: 200,
            ResponseMessage: "Notifications fetched successfully.",
            succeeded: true,
            ResponseData: notifications
        });
    } catch (error) {
        return next(new ErrorHandler("Something went wrong while fetching notifications.", 500, error));
    }
}

    


}
module.exports = new AdminController()




