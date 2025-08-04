import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  ai: {
    type: String,
    required: true
  }
}, { _id: false });

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: {
    type: [messageSchema],
    default: []
  },
  fromAccountId:{
    type:String,
  }
});

export default mongoose.model('ChatHistory', chatHistorySchema);
