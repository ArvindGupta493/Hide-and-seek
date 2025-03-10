const NotificationModel = require("../Models/NotificationModel");

async function sendNotification(senderId, receiverId, type, message, options = {}) {
    const notification = new NotificationModel({
        userId: senderId,
        opponentId: receiverId,
        type,
        message,
        actions: options.actions || [], // ✅ Handle Accept/Reject actions
        createdAt: new Date()
    });
    await notification.save();
}

module.exports = { sendNotification };
