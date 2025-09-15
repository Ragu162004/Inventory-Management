const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGOURL="mongodb+srv://ragu16102004_db_user:DP8qxDKDgQ3PMWiY@app.xa5dvdk.mongodb.net/?retryWrites=true&w=majority&appName=App");
    // const conn = await mongoose.connect(MONGOURL="mongodb://localhost:27017/inventory");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
