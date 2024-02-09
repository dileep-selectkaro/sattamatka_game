const cron = require('node-cron');
const Market=require("../admin/models/market");
const MarketDetails = require("../admin/models/marketDetails");


// Function to format time in 24-hour format
// const formatTime24 = (hour, minute) => {
//   const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
//   const formattedMinute = minute < 10 ? `0${minute}` : `${minute}`;
//   return `${formattedHour}:${formattedMinute}`;
// };


const formatTime12= (hour, minute) => {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const formattedMinute = minute === 0 ? '00' : minute;
  return `${formattedHour}:${formattedMinute} ${suffix}`;
};

const createData = async () => {
  console.log("created market Details");
  try {
    let markets = await Market.find();
    for (const market of markets) {
      // Loop from 9:00 to 21:00
      for (let hour = 9; hour <= 21; hour++) {
        const limitMinute = hour === 21 ? 15 : 60; // End loop at 21:15
        for (let minute = 0; minute < limitMinute; minute += 15) {
          const time = formatTime12(hour, minute);

          // const randomNumber = Math.floor(Math.random() * 99) + 10;
           
          const randomNum = Math.floor(Math.random() * 100); // Random number between 0 and 99

          // Convert the random number to a string and pad with leading zeros if necessary
          const randomNumber = randomNum.toString().padStart(2, '0');
          
          // Calculate timeCode (minutes since 9:00 AM)
          const timeCode = parseInt(`${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`);
          
          await MarketDetails.create({
            market,
            time,
            randomNumber,
            marketName: market.market,
            timeCode 
          });
        }
      }
    }
    console.log('Data created successfully for the day');
  } catch (error) {
    console.error("Failed to create data:", error);
  }
};

const cronJob = () => {
  console.log("Cron job started...");
  cron.schedule('0 9 * * *', async () => {
      console.log('Running createData task at 9:00 AM daily');
      await createData();
  });
};

// const cronJob = () => {
//   console.log("Cron job started...");
//   cron.schedule('24 11 * * *', async () => { // Schedule at 11:24 AM daily
//     console.log('Running createData task at 11:24 AM daily');
//     await createData();
//   });
// };




module.exports=cronJob;
