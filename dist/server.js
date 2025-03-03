"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';
// Allowed Origins
// const allowedOrigins = [
//     'http://localhost:4200',  // Local Angular app
//     'https://bima-soft-93270027ccce.herokuapp.com/'  // Production frontend
// ];
// // CORS Middleware
// const corsOptions: CorsOptions = {
//     origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'), false);
//         }
//     }
// };
const corsOptions = {
    origin: true, // Allow all origins
};
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json()); // For parsing JSON requests
app.use('/api', routes_1.default);
app.listen(port, () => {
    console.log(`🚀 Server is running on ${env === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'} mode at http://localhost:${port}`);
});
