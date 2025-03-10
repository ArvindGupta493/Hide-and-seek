// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema({
//     message: { type: String, required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Notification', notificationSchema);



 
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opponentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["game-request", "game-status", "app-update"], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "read"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
    