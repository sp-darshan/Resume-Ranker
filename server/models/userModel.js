import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const userSchema = new mongoose.Schema({
    uid: {type: String, default: uuidv4, unique: true},
    username: {type: String, required: true, unique: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    tokens: {type: Number, default: 5},
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;