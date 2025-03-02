import express from 'express';
import router from './routes';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';

const app = express();
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';

// Allowed Origins
const allowedOrigins = [
    'http://localhost:4200',  // Local Angular app
    'https://bima-soft-93270027ccce.herokuapp.com/'  // Production frontend
];

// CORS Middleware
const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    }
};

app.use(cors(corsOptions));

app.use(bodyParser.json()); // For parsing JSON requests
app.use('/api', router);

app.listen(port, () => {
    console.log(`🚀 Server is running on ${env === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'} mode at http://localhost:${port}`);
});
