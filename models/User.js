import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    default: 'local'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  accounts: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  investmentSkill: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  budgetPerMonth: {
    type: Number
  }, 
  access_token: {
    type: String
  }
});

export default mongoose.model('User', userSchema);
