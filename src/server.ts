import app from './app';

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API v1: http://localhost:${PORT}/api/v1`);
});