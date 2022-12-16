import mongoose from 'mongoose';
const { Schema } = mongoose;

const schema = new Schema({
    uid: String,
    startTime: Date,
    endTime: Date,
    lastUpdated: Date,
    canceled: Boolean
});

export default mongoose.model("scheduledDate", schema);