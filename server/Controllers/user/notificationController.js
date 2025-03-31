const multer = require("multer");
const path = require("path");
const NotificationModel = require("../../Models/NotificationModel");
const UserModel = require("../../Models/UserModel");

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save images in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter (only images allowed)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

// Initialize Multer
const upload = multer({ storage, fileFilter });

// Notification API with Image Upload
async function imageNotificationController(req, res) {
    try {
        const { message } = req.body;
        const userId = req.decoded.id;
        const image = req.file ? `/uploads/${req.file.filename}` : null; // ✅ Store image path

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        // Fetch user details
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Create a new notification with the image
        const notification = new NotificationModel({
            userId,
            email: user.email,
            username: user.username,
            message,
            image,  // ✅ Store uploaded image
            type: "user-message",
            status: "unread"
        });

        await notification.save();
        return res.status(200).json({ success: true, message: "Message sent to admin successfully." });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: "Server error.", error });
    }
}

module.exports = { upload, imageNotificationController };
