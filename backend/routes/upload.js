const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseDocument } = require('../services/parserService');
const { scoreCandidate } = require('../services/scoringService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/', upload.fields([{ name: 'resume', maxCount: 10 }, { name: 'jd', maxCount: 1 }]), async (req, res) => {
  try {
    const files = req.files;
    let jdText = req.body.jdText || '';

    if (!files.resume || files.resume.length === 0) {
      return res.status(400).json({ error: 'No resumes uploaded.' });
    }

    if (files.jd && files.jd.length > 0) {
      jdText = await parseDocument(files.jd[0].path, files.jd[0].mimetype);
    }

    if (!jdText || jdText.trim() === '') {
      return res.status(400).json({ error: 'No Job Description provided.' });
    }

    const results = [];

    // Process each resume
    for (const resume of files.resume) {
      const resumeText = await parseDocument(resume.path, resume.mimetype);
      
      // Score candidate using AI
      const scoreData = await scoreCandidate(resumeText, jdText);
      
      // Save to Database
      // Note: We're doing a simple DB save here. The 'name' is extracted or we default to the filename.
      const candidateName = scoreData.candidateName || resume.originalname.split('.')[0];
      
      // Try/catch DB save individually so one failure doesn't stop all
      try {
        const savedCandidate = await prisma.candidate.create({
          data: {
            name: candidateName,
            resume_path: resume.path,
            match_score: scoreData.matchScore,
            matching_skills: scoreData.matchingSkills,
            missing_skills: scoreData.missingSkills
          }
        });
        results.push(savedCandidate);
      } catch (dbError) {
        console.error('DB Error:', dbError);
        // Fallback for when Prisma is not configured yet by user
        results.push({
          id: 'temp-' + Date.now(),
          name: candidateName,
          resume_path: resume.path,
          match_score: scoreData.matchScore,
          matching_skills: scoreData.matchingSkills,
          missing_skills: scoreData.missingSkills,
          note: 'Database not connected. Memory object only.'
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.match_score - a.match_score);

    res.status(200).json({ success: true, candidates: results });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process documents.', details: error.message });
  }
});

// Route to get all candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: {
        match_score: 'desc'
      }
    });
    res.status(200).json({ success: true, candidates });
  } catch (error) {
    console.error('Fetch Candidates Error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates. Ensure DB is connected.' });
  }
});

module.exports = router;

// Route to delete all candidates
router.delete('/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany();
    // Delete files from filesystem
    for (const candidate of candidates) {
      if (candidate.resume_path) {
        const fullPath = path.resolve(candidate.resume_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }
    // Delete from DB
    await prisma.candidate.deleteMany();
    res.status(200).json({ success: true, message: 'All candidates deleted' });
  } catch (error) {
    console.error('Delete All Candidates Error:', error);
    res.status(500).json({ error: 'Failed to delete candidates.' });
  }
});

// Route to delete a single candidate
router.delete('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (candidate) {
      if (candidate.resume_path) {
        const fullPath = path.resolve(candidate.resume_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      await prisma.candidate.delete({
        where: { id: parseInt(id) }
      });
      res.status(200).json({ success: true, message: 'Candidate deleted' });
    } else {
      res.status(404).json({ error: 'Candidate not found' });
    }
  } catch (error) {
    console.error('Delete Candidate Error:', error);
    res.status(500).json({ error: 'Failed to delete candidate.' });
  }
});
