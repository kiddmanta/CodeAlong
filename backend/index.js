const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB.js');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const userRoutes = require('./routes/auth.js');
const playgroundRoutes = require('./routes/playground.js');
const { initializeSocket } = require('./scoket/socket.js');
const axios = require('axios'); // Import axios for making HTTP requests to executor server
const { error } = require('console');
const ErrorHandler = require('./middlewares/ErrorHandler.js');


dotenv.config();

const PORT = process.env.PORT || 5000;
const EXEC_PORT = process.env.EXECUTOR_URL;


connectDB();

const app = express();

app.use(cors({
    origin: "*",
    //credentials: true
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const httpServer = createServer(app);

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: "*", // TODO: change this to the frontend URL
        credentials: true
    }
});

app.set('io', io);

initializeSocket(io);

// app.get("/",function(req,res){
//     res.send("Hello");
// });

app.use('/api/users', userRoutes);
app.use('/api/playground', playgroundRoutes);

app.use(ErrorHandler);

app.post('/api/execute', async (req, res) => {
    try {
        // Extract code, language, and input from request body
        const { code, language, input } = req.body;
        console.log('Executing code...');
        // Make HTTP POST request to executor server
        const response = await axios.post(`${EXEC_PORT}/execute`, {
            code,
            language,
            input
        });
        // Forward executor server response to client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error executing code:', error.message);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

httpServer.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});

