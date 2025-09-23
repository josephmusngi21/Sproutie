const mongoose = require('mongoose');

// User's personal plant collection (saved from Trefle API)
const userPlantSchema = new mongoose.Schema({
  // Trefle API data
  trefleId: { type: Number, required: true }, // Trefle plant ID
  slug: { type: String, required: true }, // Trefle plant slug
  scientificName: { type: String, required: true },
  commonName: { type: String },
  family: { type: String },
  genus: { type: String },
  
  // User-specific data
  firebaseUid: { type: String, required: true }, // User who saved this plant
  nickname: { type: String }, // User's custom name for the plant
  notes: { type: String }, // User's notes about this plant
  dateAdded: { type: Date, default: Date.now },
  
  // User's growing info
  plantedDate: { type: Date },
  harvestDate: { type: Date },
  location: { type: String }, // Where user is growing it
  
  // User's photos and progress
  photos: [{
    url: { type: String },
    caption: { type: String },
    dateTaken: { type: Date, default: Date.now }
  }],
  
  // Growing progress tracking
  growthStages: [{
    stage: { type: String }, // 'seed', 'sprout', 'growing', 'flowering', 'harvesting'
    date: { type: Date },
    notes: { type: String },
    photo: { type: String }
  }],
  
  // Care reminders
  careReminders: [{
    type: { type: String }, // 'water', 'fertilize', 'prune', 'harvest'
    frequency: { type: String }, // 'daily', 'weekly', 'monthly'
    lastDone: { type: Date },
    nextDue: { type: Date }
  }],
  
  isActive: { type: Boolean, default: true }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
userPlantSchema.index({ firebaseUid: 1, isActive: 1 });
userPlantSchema.index({ trefleId: 1 });
userPlantSchema.index({ firebaseUid: 1, trefleId: 1 });

// User's favorite plants (bookmarked from Trefle)
const favoriteePlantSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },
  trefleId: { type: Number, required: true },
  slug: { type: String, required: true },
  scientificName: { type: String, required: true },
  commonName: { type: String },
  family: { type: String },
  genus: { type: String },
  dateAdded: { type: Date, default: Date.now }
});

favoriteePlantSchema.index({ firebaseUid: 1 });
favoriteePlantSchema.index({ firebaseUid: 1, trefleId: 1 }, { unique: true });

// Plant search history
const plantSearchSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },
  query: { type: String, required: true },
  searchDate: { type: Date, default: Date.now },
  resultsCount: { type: Number }
});

plantSearchSchema.index({ firebaseUid: 1, searchDate: -1 });

module.exports = {
  UserPlant: mongoose.model('UserPlant', userPlantSchema),
  FavoritePlant: mongoose.model('FavoritePlant', favoriteePlantSchema),
  PlantSearch: mongoose.model('PlantSearch', plantSearchSchema)
};