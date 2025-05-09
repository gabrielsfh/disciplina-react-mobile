import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meubanco';

export async function connectDB() {
    try {
        await mongoose.connect(
            MONGO_URI,
            {
                useNewUrlParser: true,
                userUnifiedTopology: true
            });
        console.log('MongoDB conectado em', MONGO_URI);
    } catch (err) {
        console.error('Erro ao coenctar MongoDB:', err);
        process.exit(1);
    }
}