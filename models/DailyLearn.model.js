import mongoose from 'mongoose';

const DaySchema = new mongoose.Schema({
  dayNumber: Number,
  topic: String,
  content: String, // AI-generated module (lesson/article/summary)
  quiz: {
    questions: [
      {
        question: String,
        options: [String],
        answer: String,
      },
    ],
  },
  completed: { type: Boolean, default: false },
  userSummary: { type: String, default: "" },
  score:{ type:Number,default:0 }
});

const TrackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  difficulty: String,
  totalDays: Number,
  days: [DaySchema],
  currentDay: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Track', TrackSchema);
