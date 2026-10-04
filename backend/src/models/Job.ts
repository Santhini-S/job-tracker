import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'Applied',
  },
  salary: String,
  location: String,
  jobDescription: String,
  priority: {
    type: String,
    enum: ['Dream Job', 'Backup', 'On a whim'],
    default: 'Backup',
  },
  resumeScore: Number, // For AI matching
  aiFeedback: String,  // For AI feedback
  appliedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);
