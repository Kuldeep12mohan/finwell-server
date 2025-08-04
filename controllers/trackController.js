import Track from '../models/DailyLearn.model.js';
import User from '../models/User.js';
import { getAITrack } from '../utils/openAiTrackGen.js';

export async function genTrack(req,res){
    const { topic,level } = req.body;
    const { userId } = req.user
    try{
    const aiTrack = await getAITrack(topic, level);
    console.log(aiTrack.days)

    // save into db as well 
    const newTrack = new Track({
      userId,
      title: aiTrack.title,
      description: aiTrack.description,
      difficulty: aiTrack.difficulty,
      totalDays: aiTrack.days.length,
      days: aiTrack.days,
    });

    await newTrack.save();

    res.status(201).json({
      message: 'Track generated and saved successfully',
      track: newTrack,
    });
    }
    catch(e){
        console.log(e)
        res.json({
            message : "some error occured",
            status : 500
        })
    }
}



export async function getTracks(req,res){
    const { userId } = req.user;
    try{
        const tracks = await Track.find({
            userId
        }).populate("days");
        console.log(tracks);
        return res.json({
            tracks,
            status : 200
        })
    }
    catch(e){
        res.json({
            message : "some error occurred",
            status : 500
        })
    }
}

export async function saveTrack(req, res) {
  const { userId } = req.user;
  const { interest, difficulty } = req.body;

  try {
    const aiTrack = await getAITrack(interest, difficulty);

    const newTrack = new Track({
      userId,
      title: aiTrack.title,
      description: aiTrack.description,
      difficulty: aiTrack.difficulty,
      totalDays: aiTrack.days.length,
      days: aiTrack.days,
    });

    await newTrack.save();

    res.status(201).json({
      message: 'Track generated successfully',
      track: newTrack,
    });
  } catch (error) {
    console.error("Error generating track:", error.message);
    res.status(500).json({ message: 'Failed to generate learning track' });
  }
}

export async function completeDay(req, res) {
  const { trackId, dayNumber, summary, score } = req.body;
  const track = await Track.findById(trackId);

  const day = track.days.find(d => d.dayNumber === dayNumber);
  if (!day) return res.status(404).json({ message: 'Day not found' });

  day.completed = true;
  day.userSummary = summary;
  day.score = score
  if (track.currentDay === dayNumber) track.currentDay += 1;
  if (track.currentDay > track.totalDays) track.isCompleted = true;

  await track.save();

  res.json({ message: 'Day marked complete', track });
}
