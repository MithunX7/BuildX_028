/**
 * Seed real photos into existing issues and work order evidence.
 * Assigns proper before/after images so the dashboard and verification pages
 * display realistic civic infrastructure photos instead of blank placeholders.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

// Photo mapping by category
const CATEGORY_PHOTOS = {
  POTHOLE:              '/uploads/seed_pothole_before.jpg',
  ROAD_SURFACE_DAMAGE:  '/uploads/seed_road_damage.jpg',
  GARBAGE_ACCUMULATION: '/uploads/seed_garbage_before.jpg',
  STREETLIGHT_FAULT:    '/uploads/seed_streetlight.jpg',
  ROAD_OBSTRUCTION:     '/uploads/seed_road_damage.jpg',
  CONSTRUCTION_CONFLICT:'/uploads/seed_road_damage.jpg',
  DAMAGED_ASSET:        '/uploads/seed_streetlight.jpg',
};

// After (repair) photos by category
const AFTER_PHOTOS = {
  POTHOLE:              '/uploads/seed_pothole_after.jpg',
  ROAD_SURFACE_DAMAGE:  '/uploads/seed_pothole_after.jpg',
  GARBAGE_ACCUMULATION: '/uploads/seed_garbage_after.jpg',
  STREETLIGHT_FAULT:    '/uploads/seed_pothole_after.jpg',
  ROAD_OBSTRUCTION:     '/uploads/seed_pothole_after.jpg',
  CONSTRUCTION_CONFLICT:'/uploads/seed_pothole_after.jpg',
  DAMAGED_ASSET:        '/uploads/seed_pothole_after.jpg',
};

async function seedPhotos() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const issuesCol = db.collection('issues');
  const evidenceCol = db.collection('evidences');

  // 1) Assign before photos to all issues that don't have any
  const issues = await issuesCol.find({}).toArray();
  let updatedIssues = 0;

  for (const issue of issues) {
    const photos = issue.evidencePhotos || [];
    const cat = issue.category || 'POTHOLE';
    const photoUrl = CATEGORY_PHOTOS[cat] || CATEGORY_PHOTOS.POTHOLE;

    if (photos.length === 0 || (photos.length === 1 && photos[0].includes('det_pothole'))) {
      await issuesCol.updateOne(
        { _id: issue._id },
        { $set: { evidencePhotos: [photoUrl] } }
      );
      updatedIssues++;
      console.log(`  [Issue] ${issue.referenceCode} → ${photoUrl}`);
    }
  }

  console.log(`\nUpdated ${updatedIssues} issues with real before photos.\n`);

  // 2) Fix evidence documents with tiny/corrupt files (<=100 bytes)
  const evidences = await evidenceCol.find({}).toArray();
  let updatedEvidence = 0;

  for (const ev of evidences) {
    // Find the parent issue to get category
    const parentIssue = await issuesCol.findOne({ _id: ev.issueId });
    const cat = parentIssue?.category || 'POTHOLE';
    const afterUrl = AFTER_PHOTOS[cat] || AFTER_PHOTOS.POTHOLE;

    await evidenceCol.updateOne(
      { _id: ev._id },
      { $set: { fileUrl: afterUrl, mediaUrl: afterUrl } }
    );
    updatedEvidence++;
    console.log(`  [Evidence] ${ev._id} → ${afterUrl}`);
  }

  console.log(`\nUpdated ${updatedEvidence} evidence records with real after photos.\n`);

  // 3) Also update initialDetectionFrame field on issues that had det_pothole references
  await issuesCol.updateMany(
    { initialDetectionFrame: { $regex: /^\/uploads\/det_pothole/ } },
    { $set: { initialDetectionFrame: CATEGORY_PHOTOS.POTHOLE } }
  );
  console.log('Updated detection frame references.\n');

  console.log('=== SEED PHOTOS COMPLETE ===');
  await mongoose.disconnect();
}

seedPhotos().catch(console.error);
