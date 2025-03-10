const express = require("express")
const router = express.Router()
const auth = require("../Middlewares/auth")
const validate = require("../Middlewares/validation")
// const userController = require("../Controllers/Admin/userController");
const adminController = require("../Controllers/Admin/adminController");
    
//===================================== Auth ====================================== //
router.post("/register",  validate.adminRegisterValidate, validate.isRequestValidate, adminController.registerAdminController);
router.post('/login', validate.adminLoginValidate, validate.isRequestValidate, adminController.loginController);
router.get('/get-profile', auth.adminAuth, adminController.getProfile);
router.post('/update-password', auth.adminAuth, adminController.updatePasswordController);
router.post('/logout', auth.adminAuth, adminController.logoutController);

// ================================ User Management ================================ // 
router.get('/get-users-count', auth.adminAuth, adminController.getUsersCountController);
router.get('/get-user-list', auth.adminAuth, adminController.getUserListController);
router.get('/get-user-info/:id', auth.adminAuth, adminController.getUserInfoByIdController);
router.post('/activate/:id', auth.adminAuth, adminController.activateUserByIdController);
router.post('/deactivate/:id', auth.adminAuth, adminController.deactivateUserByIdController);

// =================================  NOTIFICATIONS =========================================== //
router.get('/notifications', auth.adminAuth, adminController.getAdminNotifications);  //need adjustment for clarification 

module.exports = router

  

// need to creat the api for total games played;