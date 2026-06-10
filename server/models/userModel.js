import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  tokens: {
    type: Number,
    default: 5,
    min: 0
  }
}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema)

export default User