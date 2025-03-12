const mongoose = require("mongoose");

const GameSettingsSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },  // Unique game ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // REMOVE unique: true
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    duration: { type: Number, required: true },
    interval: { type: Number, required: true },
    radius: { type: Number, required: true },
    status: { type: String, enum: ["waiting", "in-progress", "completed"], default: "waiting" },
    startTime: { type: Date },
    endTime: { type: Date },    
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
    createdAt: { type: Date, default: Date.now },
    finishedAt: { type: Date }
});

const GameSettings = mongoose.model("GameSettings", GameSettingsSchema);
module.exports = GameSettings;






// const mongoose = require("mongoose");

// const gameSettingsSchema = new mongoose.Schema({
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//         duration: { type: Number, required: true },
//         interval: { type: Number, required: true },
//         radius: { type: Number, required: true },
//         players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
//         roles: { type: Map, of: String },
//         status: { type: String, enum: ['waiting', 'ready-to-start', 'in-progress', 'completed'], default: 'waiting' },
//         winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//         startTime: Date,
//         endTime: Date
// });

// const GameSettings = mongoose.model("GameSettings", gameSettingsSchema);
// module.exports = GameSettings;

// const mongoose = require("mongoose");

// const GameSettingsSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     duration: { type: Number, required: true },
//     interval: { type: Number, required: true },
//     radius: { type: Number, required: true },
//     // status: { type: String, enum: ["waiting", "in-progress", "completed"], default: "waiting" },
//     startTime: { type: Date },
//     endTime: { type: Date },
//     winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//     player1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     player2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
//     createdAt: { type: Date, default: Date.now },
//     finishedAt: { type: Date }

// });
// const GameSettings = mongoose.model("GameSettings", GameSettingsSchema);
// module.exports = GameSettings;
