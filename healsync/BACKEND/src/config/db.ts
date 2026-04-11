import mongoose from 'mongoose'
import dns from 'dns'

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env')
  }
  // Node.js v24 on Windows has a querySrv bug with local
  // DNS servers — use Google DNS to resolve Atlas SRV records
  dns.setServers(['8.8.8.8', '8.8.4.4'])
  try {
    await mongoose.connect(uri, {
      family: 4,
    })
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  }
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected')
  })
}
