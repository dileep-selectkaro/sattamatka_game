const marketModel = require("../../admin/models/marketDetails");


//=============fetched previous day to  current day with current time===============

const fetchedData = async (req, res) => {
    try {
        const now = new Date();
        // Start of the previous day
        const startOfPreviousDay = new Date(now);
        startOfPreviousDay.setDate(now.getDate() - 1);
        startOfPreviousDay.setHours(0, 0, 0, 0); 

        // hours and minutes are two digits for the timeCode
        const tempTimeCode = parseInt(`${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`);


        const data = await marketModel.aggregate([
            {
                $match: {
                    $and: [
                        { createdAt: { $gte: startOfPreviousDay, $lte: now } },
                        { timeCode: { $lte: tempTimeCode } } // Filter by timeCode up to the current time
                    ]
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

        res.status(200).send({ message: "Data successfully fetched", data });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
};



// =============fetched only one Current time Data============   
const fetchedOneData = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now); 
        startOfToday.setHours(0, 0, 0, 0); // Set to start of the current day

        //console.log(now);
        const tempTimeCode = parseInt(`${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`);

        const data = await marketModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfToday, $lte: now }, 
                    timeCode: { $lte: tempTimeCode } 
                }
            },
            {
                $sort: { timeCode: -1 } 
            },
            {
                $limit: 1 
            },
            {
                $project: {
                    _id: 1,
                    marketName: 1,
                    randomNumber: 1,
                    time: 1,
                    createdAt: {
                        $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" }
                    }
                }
            }
        ]);

        if (data.length > 0) {
            res.status(200).send({ message: "Data successfully fetched", data: data[0] });
        } else {
            res.status(404).send({ message: "No data found for the current criteria" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
};











// // ============search by date with marketName  =============

// const search = async (req, res) => {
//     try {
//         const { createdAt, marketName } = req.body;

//         if (!createdAt || !marketName) {
//             return res.status(400).json({ message: "Both createdAt and marketName are required for search." });
//         }

//         // Convert the provided date string to a Date object and set to start of day
//         const startOfDay = new Date(createdAt);
//         startOfDay.setUTCHours(0, 0, 0, 0);

//         // Create a new Date object for the end of the day
//         const endOfDay = new Date(createdAt);
//         endOfDay.setUTCHours(23, 59, 59, 999);

//         // Adjust the query to search for documents within the date range
//         const data = await marketModel.find({
//             createdAt: {
//                 $gte: startOfDay,
//                 $lte: endOfDay
//             },
//             marketName: { $regex: new RegExp(marketName, "i") } // Case-insensitive search
//         });

//         res.status(200).json({ message: "Data successfully fetched", data });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };



//=====================search by marketName=================
// const search = async (req, res) => {
//     try {
//         const { marketName } = req.body;

//         if (!marketName) {
//             return res.status(400).json({ message: "Market name is required for search" });
//         }

//         const data = await marketModel.find({
//             marketName: { $regex: new RegExp(marketName, "i") } // Case-insensitive search
//         });

//         res.status(200).json({ message: "Data successfully fetched", data });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };




module.exports = { fetchedData,fetchedOneData};
