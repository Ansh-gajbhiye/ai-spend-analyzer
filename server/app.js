import express from 'express';
import uploadRoutes from './routes/upload.js';

const app = express();
app.use('/api/upload', uploadRoutes);

export default app;