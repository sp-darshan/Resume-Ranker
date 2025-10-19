import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const MONGO_URI = process.env.ATLAS_URI || process.env.MONGODB_URI || process.env.MONGO_URI
const DB_NAME = process.env.DB_NAME || 'ResumeRankerDB'

if (!MONGO_URI) {
  throw new Error('MongoDB URI not set. Add ATLAS_URI or MONGODB_URI to your .env or Vercel env vars.')
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB: already connected')
    return mongoose.connection
  }

  try {
    // supply dbName explicitly; avoid deprecated useNewUrlParser/useUnifiedTopology options
    const conn = await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME
    })
    console.log(`MongoDB connected: host=${conn.connection.host} db=${conn.connection.name}`)
    return mongoose.connection
  } catch (err) {
    console.error('MongoDB connection error:', err)
    throw err
  }
}

export async function listCollections() {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  try {
    const cols = await mongoose.connection.db.listCollections().toArray()
    const names = cols.map(c => c.name)
    console.log('MongoDB collections:', names)
    return names
  } catch (err) {
    console.error('Failed to list collections:', err)
    throw err
  }
}

export default connectDB