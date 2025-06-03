import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import DbCon from './utlis/db.js';
import AuthRoutes from './routes/auth.route.js';
import cookieparser from 'cookie-parser'


dotenv.config()
const PORT = process.env.PORT || 5000
const app = express()


DbCon()
app.use(express.json()); // For parsing application/json
app.use(cookieparser())
app.use(express.urlencoded({ extended: true })); // For form data
const corsOptions = {
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true, // Allow credentials (cookies)
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Remember-Me'], // Add your custom header
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));

app.use('/api/auth', AuthRoutes)

app.get('/', (req, res) => {
    res.send("Hello")
})

app.listen(PORT, () => {
    console.log(`Server is rinning on ${PORT}`);
})

