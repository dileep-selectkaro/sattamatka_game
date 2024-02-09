const Market=require("../models/market");
const MarketDetails = require("../models/marketDetails");
const cron = require('node-cron');

// // Function to format time in 24-hour format
// // const formatTime24 = (hour, minute) => {
// //   const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
// //   const formattedMinute = minute < 10 ? `0${minute}` : `${minute}`;
// //   return `${formattedHour}:${formattedMinute}`;
// // };


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
          const randomNumber = Math.floor(Math.random() * 90) + 10;
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





//...............automatically generated  time 12 format................

// const MarketDetails = require("../models/marketDetails");
// const cron = require('node-cron');
// const formatTime = (hour, minute) => {
//   const suffix = hour >= 12 ? 'PM' : 'AM';
//   const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
//   const formattedMinute = minute === 0 ? '00' : minute;
//   return `${formattedHour}:${formattedMinute} ${suffix}`;
// };

// const createData = async () => {
//   try {
//     let markets= await  Market.find();
//     console.log(markets)
//     for (const market of markets) {
//       for (let hour = 9; hour <= 21; hour++) {
//         const limitMinute=hour===21 ?15:60;
//         for (let minute = 0; minute < limitMinute; minute += 15) {
//           const time = formatTime(hour, minute);
//           const randomNumber = Math.floor(Math.random() * 90) + 10;
          
//           await MarketDetails.create({market,time, randomNumber,marketName:market.market });

//         }
//       }
//     }
//     console.log('Data created successfully for the day');
//   } catch (error) {
//     console.error("Failed to create data:", error);
//   }
// };



//----------------fetched ...................

const fetchedData = async (req, res) => {
  try {
     createData()
      const data = await MarketDetails.aggregate([
          {
              $project: {
                  _id: 1,
                  marketName: 1,
                  randomNumber: 1,
                  time: 1,
                  createdAt: {
                      $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                  }
              }
          }
      ]);

      res.status(200).send({ message: "Data successfully fetched", data });
  } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server Error" });
  }
};


//...............update by Id....................
const update = async (req, res) => {
  try {
    const { id } = req.query; 
    const updateData = req.body; 

    const updatedGameDetail = await MarketDetails.findByIdAndUpdate(id, updateData, { new: true, projection: {marketName: 1,randomNumber:1,time:1 } });

    if (!updatedGameDetail) {
      return res.status(404).json({ message: 'GameDetail not found' });
    }

    res.status(200).json({ message: "Updated Successfully", data: updatedGameDetail });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Error updating GameDetail' });
  }
};

  

  // ============search by date with marketName  =============

// const search = async (req, res) => {
//   try {
//       const { createdAt, marketName } = req.body;

//       if (!createdAt || !marketName) {
//           return res.status(400).json({ message: "Both createdAt and marketName are required for search." });
//       }

//       // Convert the provided date string to a Date object and set to start of day
//       const startOfDay = new Date(createdAt);
//       startOfDay.setUTCHours(0, 0, 0, 0);

//       // Create a new Date object for the end of the day
//       const endOfDay = new Date(createdAt);
//       endOfDay.setUTCHours(23, 59, 59, 999);

//       // Use aggregation to search for documents and format createdAt
//       const data = await MarketDetails.aggregate([
//         {
//           $match: {
//             createdAt: {
//               $gte: startOfDay,
//               $lte: endOfDay
//             },
//             marketName: { $regex: new RegExp(marketName, "i") } // Case-insensitive search
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             marketName: 1,
//             randomNumber: 1,
//             time: 1,
//             createdAt: {
//               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
//             }
//           }
//         }
//       ]);

//       res.status(200).json({ message: "Data successfully fetched", data });
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal server error" });
//   }
// };


 // ============search by date with marketName if date not select search current date automatically  =============
const search = async (req, res) => {
  try {
      let { createdAt, marketName } = req.query;
      console.log(createdAt,marketName);
      // If createdAt is not provided, use the current date
      if (!createdAt) {
          const today = new Date();
          createdAt = today.toISOString().split('T')[0]; // Format  "YYYY-MM-DD"
      }

      if (!marketName) {
          return res.status(400).json({ message: "Market name is required for search." });
      }

      
      const startOfDay = new Date(createdAt);
      startOfDay.setUTCHours(0, 0, 0, 0);

      
      const endOfDay = new Date(createdAt);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const data = await MarketDetails.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay
            },
            marketName: { $regex: new RegExp(marketName, "i") } // Case-insensitive search
          }
        },
        {
          $project: {
            _id: 1,
            marketName: 1,
            randomNumber: 1,
            time: 1,
            createdAt: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            }
          }
        }
      ]);

      res.status(200).json({ message: "Data successfully fetched", data });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
  }
};




module.exports={fetchedData,update,search}




























