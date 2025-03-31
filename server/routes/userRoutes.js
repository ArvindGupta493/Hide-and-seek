const express = require("express")
const router = express.Router()
const auth = require("../Middlewares/auth");
const validate = require("../Middlewares/validation");
const userController = require("../Controllers/user/userController");

const { upload, imageNotificationController } = require("../Controllers/user/notificationController"); 

// ====================================================== ROUTES ========================================================= //
router.post("/register",validate.registerValidate, validate.isRequestValidate, userController.registerController);
router.post('/login', validate.loginValidate, validate.isRequestValidate, userController.loginController);
router.get('/get_profile', auth.privateAuth, userController.getUserProfileController); 
router.post('/logout', auth.privateAuth, userController.logoutController);

// ============================================== PASSWORD UPADTED THROUGH OTP =============================================//
router.post('/otp_generate', validate.generateValidate, validate.isRequestValidate, userController.generateOtpController);
router.post('/otp_verify', validate.otpValidate, validate.isRequestValidate, userController.verifyOtpController);
router.post('/update_password', validate.updatedPwdValidate, validate.isRequestValidate, userController.updatePasswordController);

// ===================================================== USER GAME ======================================================= //
router.post('/select-player', auth.privateAuth, userController.selectPlayerController);
router.get('/get-users-in-range', auth.privateAuth, userController.getUserListController);   
router.post('/duration-and-interval',auth.privateAuth, userController.saveGameSettingsController); 
router.get('/duration-and-intervals',auth.privateAuth, userController.savedGameSettingsController);
router.post('/choice', auth.privateAuth, userController.choiceController);
router.get('/game-status' ,auth.privateAuth, userController.statusController);    
router.post('/game-start-now', auth.privateAuth, userController.startGameNowController); 
     
// ================================================== Notifiacation  ====================================================== //
router.post('/request-acception', auth.privateAuth, userController.requestAcceptionController);
// router.get('/notifications' ,auth.privateAuth, userController.NotificationsController);    //it is fro the other player
router.post('/contactUsNotification' ,auth.privateAuth, userController.NotificationController);  
router.post("/contactUsNotifications", auth.privateAuth, upload.single("image"), imageNotificationController);

// ================================================ USER In Process ================================================== //
router.post("/update-location", auth.privateAuth, userController.updateLocationController);
router.get("/get-user-location", auth.privateAuth, userController.getUserLocationController);      //need to fix
router.post("/win-loss", auth.privateAuth, userController.updateWinLossController);
router.get("/GameHistroy", auth.privateAuth, userController.getGameHistoryController);

// ================================================ New USER In Process ================================================== //
router.post("/start-game", auth.privateAuth, userController.startGame);
router.post("/finish-game", auth.privateAuth,userController.finishGame);
router.get("/game-status/:userId",auth.privateAuth, userController.checkGameStatus);

module.exports = router; 
