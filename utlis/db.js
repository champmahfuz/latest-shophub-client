import mongoose from 'mongoose';

const DbCon = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Database is Connected');
    } catch (error) {
        console.log(error);
    }
}

export default DbCon;