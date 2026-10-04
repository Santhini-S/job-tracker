import express from 'express';
import { Job } from '../models/Job';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index'; // Import socket.io instance for real-time notifications

const router = express.Router();

// Apply auth middleware to all job routes
router.use(authenticate);

// Get all jobs for the current user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new job application
router.post('/', async (req: AuthRequest, res) => {
  try {
    const job = new Job({ ...req.body, userId: req.userId });
    await job.save();
    
    // Notify clients about the new job
    io.emit('job-added', job);
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a job application (e.g. status change for Kanban drag-and-drop)
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Notify clients about the update
    io.emit('job-updated', job);

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a job application
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    io.emit('job-deleted', req.params.id);

    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Resume Scoring Endpoint
router.post('/:id/score', async (req: AuthRequest, res) => {
  try {
    const { resume } = req.body;
    if (!resume) return res.status(400).json({ error: 'Resume is required' });

    const job = await Job.findOne({ _id: req.params.id, userId: req.userId });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.jobDescription) return res.status(400).json({ error: 'Job has no description to score against' });

    // Force read API key from .env file to bypass terminal restart requirement
    const fs = require('fs');
    const path = require('path');
    let apiKey = process.env.GEMINI_API_KEY;
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.+)/);
        if (match && match[1]) {
          apiKey = match[1].trim();
        }
      }
    } catch (e) {
      console.error("Could not read .env file directly");
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key is completely missing from .env file.' });
    }

    // Initialize Google Gen AI
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `
    Analyze the following resume against the job description.
    Provide a match score from 0 to 100, and a short gap analysis detailing what the resume is missing.
    Format your response EXACTLY as valid JSON with two keys: "score" (number) and "feedback" (string). Do NOT use markdown code blocks.
    
    Job Description:
    ${job.jobDescription}
    
    Resume:
    ${resume}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let aiResult;
    try {
      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      aiResult = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse AI response', response.text);
      return res.status(500).json({ error: 'Failed to process AI response' });
    }

    job.resumeScore = aiResult.score;
    job.aiFeedback = aiResult.feedback;
    await job.save();

    // Notify clients about the update
    io.emit('job-updated', job);

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during AI scoring' });
  }
});

export default router;
