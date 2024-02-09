const mongoose = require('mongoose');

const marketDetailsSchema = new mongoose.Schema({
  time: String,
  timeCode:Number,
  randomNumber: Number,
  marketName:String,
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    
  }
  
},{timestamps:true});

module.exports = mongoose.model('marketDetail', marketDetailsSchema);













// const mongoose = require('mongoose');

// const validateTimeFormat = (time) => {
//   // Simple validation for HH:MM AM/PM format, adjust regex as needed
//   return /^([01]?[0-9]|2[0-3]):[0-5][0-9] [AP]M$/.test(time);
// };

// const gameDetailsSchema = new mongoose.Schema({
//   game: String,
//   time: {
//     type: String,
//     validate: [validateTimeFormat, 'Please fill a valid time format (HH:MM AM/PM)'],
//     default: () => {
//       // Optionally set a default time, ensure it matches your validation
//       const now = new Date();
//       return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//     }
//   },
//   randomNumber: Number,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('GameDetail', gameDetailsSchema);




