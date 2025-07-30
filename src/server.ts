import mongoose from 'mongoose'; 
import app from './app';
import config from './config';

console.log('--- server.ts execution started ---');

async function main() {
  try {
    console.log('Attempting to connect to database...');
    await mongoose.connect(config.database_url as string);
    console.log('Database connected successfully!');

    console.log(`Starting Express app on port ${config.port}...`);
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log('--- server.ts execution finished successfully ---');
    });
  } catch (err: any) {
    console.error('Failed to start application:', err.message);
    console.error('Full error details:', err);
    process.exit(1);
  }
}

console.log('Calling main() function...');
main();