const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
   
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, 
  username: { type: String, required: true },
  password: { type: String, required: true, select: false }, 
  uuid: { type: String }, 
  login_type: { type: String },
  status: { type: String, default: "0" },
  address: { type: String, required: false },
  otp: { type: String, select: false }, 
  otpExpires: { type: Date, select: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  },   
  role: { type: String, enum: ['hide', 'seek'], default: null },
  game_won:{ type: String, default: "0" },
  game_lost:{ type: String, default: "0" },
  Total_game:{ type: String, default: "0" },
  isAvailable: { type: Boolean, default: true },
  opponentId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null } 
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

UserSchema.methods.savePassword = async function (password) {
  const hashed_password = await bcrypt.hash(password, 10);
  this.password = hashed_password;
};

UserSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('users', UserSchema);   

















// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const bcrypt = require("bcrypt");

// const UserSchema = new mongoose.Schema({
//   name:  { type: String, required: true},
//   email: { type: String, required: true },
//   username: { type: String, required: true },
//   password: { type: String, required: true, selected: false }, 
//   uuid:     { type: String }, 
//   login_type: { type: String},
//   status:     { type: String, default: "0" },
//   address:    { type: String, required: false },                  // check if it is necessary 
//   otp: { type: String, select: false }, 
//   otpExpires: { type: Date, select: false },
//   location: {
//     type: { type: String, enum: ['Point'], default: 'Point' },
//     coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
// },
//   role: { type: String, enum: ['hide', 'seek'], default: null },
//   isAvailable: { type: Boolean, default: true },
//   opponentId:{ type: String }                                        // correct it 

// },{ timestamps: true});

// UserSchema.index({ location: '2dsphere' });

// UserSchema.methods.savePassword = async function (password) {
//   const hashed_password = await bcrypt.hash(password, 10); 
//   this.password = hashed_password;  
// };

// UserSchema.methods.checkPassword = async function (password) {
//   const isMatch = await bcrypt.compare(password, this.password);
//   return isMatch;
// };

// module.exports = mongoose.model('users', UserSchema);
