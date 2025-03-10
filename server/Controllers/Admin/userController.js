// const ErrorHandler = require("../../Utils/errorHandler");
// const { SuccessHandler } = require("../../Middlewares/responseHandler");
// const adminService = require("../../Services/adminService")

// class UserController{
//     async getUserListController(req, res, next) {
//         try {
//             const users = await adminService.getUserListService();
//             if (users && users.length > 0) {
//                 return SuccessHandler(res, "User list fetched successfully", 200, users);
//             } else {
//                 return SuccessHandler(res, "No users found", 200, []);
//             }
//         } catch (error) {
//             return next(new ErrorHandler("Something went wrong while fetching the user list.", 500, error));
//         }
//     }

//     async getUsersCountController(req, res, next) {
//         try {
//             const count = await adminService.getUsersCountService();
//             SuccessHandler(res, "User count fetched successfully", 200, { total: count });
//         } catch (error) {
//             return next(new ErrorHandler("Something went wrong while fetching user count.", 500, error));
//         }
//     }
//     async getUserInfoByIdController(req, res, next) {
//         const searchParam = req.params.id; // Can be user ID or email
    
//         if (!searchParam) {
//             return next(new ErrorHandler("User ID or Email is required", 400));
//         }
    
//         try {
//             let userInfo;
    
//             // Check if the input is a valid MongoDB ObjectId
//             const isObjectId = /^[0-9a-fA-F]{24}$/.test(searchParam);
            
//             if (isObjectId) {
//                 userInfo = await adminService.getUserInfoByIdService(searchParam);
//             } else {
//                 userInfo = await adminService.getUserInfoByEmailService(searchParam);
//             }
    
//             if (userInfo) {
//                 return SuccessHandler(res, "User information retrieved successfully", 200, userInfo);
//             } else {
//                 return next(new ErrorHandler("User not found", 404));
//             }
//         } catch (error) {
//             return next(new ErrorHandler("Something went wrong while retrieving user information.", 500, error));
//         }
//     }
    
 
//     async activateUserByIdController(req, res, next) {
//         const userId = req.params.id;
    
//         if (!userId) {
//             return next(new ErrorHandler("User ID is required", 400));
//         }
    
//         try {
//             const updatedUser = await adminService.activateUserByIdService(userId);
//             if (!updatedUser) {
//                 return next(new ErrorHandler("User not found or could not be activated", 404));
//             }
//             return SuccessHandler(res, "User activated successfully", 200, updatedUser);
//         } catch (error) {
//             return next(new ErrorHandler("Something went wrong while activating the user.", 500, error));
//         }
//     }
    
//     async deactivateUserByIdController(req, res, next) {
//         const userId = req.params.id;
    
//         if (!userId) {
//             return next(new ErrorHandler("User ID is required", 400));
//         }
    
//         try {
//             const updatedUser = await adminService.deactivateUserByIdService(userId);
//             if (!updatedUser) {
//                 return next(new ErrorHandler("User not found or could not be deactivated", 404));
//             }
//             return SuccessHandler(res, "User deactivated successfully", 200, updatedUser);
//         } catch (error) {
//             return next(new ErrorHandler("Something went wrong while deactivating the user.", 500, error));
//         }
//     }
    
// }
// module.exports = new UserController()
