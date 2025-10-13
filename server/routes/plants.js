const express = require('express');
const TrefleAPI = require('../services/trefleAPI');
const { UserPlant } = require('../models/Plant');
const router = express.Router();

const trefleAPI = new TrefleAPI();

// GET /api/plants - Get plants from Trefle API
router.get('/', async (req, res) => {
  try {
    const results = await trefleAPI.getPlants();
    res.json(results);
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({ error: 'Failed to get plants' });
  }
});

// GET /api/plants/search - Search plants
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });
    
    const results = await trefleAPI.searchPlants(q);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search plants' });
  }
});

// POST /api/plants/save - Save plant to database
router.post('/save', async (req, res) => {
  try {
    const { userId, plantData } = req.body;
    if (!userId || !plantData) {
      return res.status(400).json({ error: 'userId and plantData required' });
    }
    
    const exists = await UserPlant.findOne({ 
      firebaseUid: userId, 
      trefleId: plantData.id 
    });
    
    if (exists) {
      return res.status(409).json({ error: 'Plant already saved', plant: exists });
    }
    
    const plant = await UserPlant.create({
      firebaseUid: userId,
      trefleId: plantData.id,
      commonName: plantData.common_name,
      scientificName: plantData.scientific_name,
      family: plantData.family,
      familyCommonName: plantData.family_common_name,
      genus: plantData.genus,
      imageUrl: plantData.image_url,
      slug: plantData.slug,
      year: plantData.year,
      author: plantData.author,
      bibliography: plantData.bibliography,
      status: plantData.status,
      rank: plantData.rank,
      synonyms: plantData.synonyms || []
    });
    
    res.status(201).json({ message: 'Plant saved', plant });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save plant' });
  }
});

// DELETE /api/plants/delete/:plantId - Remove plant from user's collection
router.delete('/delete/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    const { userId } = req.body;
    console.log('🗑️  Remove plant request - userId:', userId, 'plantId:', plantId);
    
    if (!userId || !plantId) {
      return res.status(400).json({ error: 'userId and plantId required' });
    }

    const plant = await UserPlant.findOneAndDelete({ 
      firebaseUid: userId, 
      _id: plantId 
    });
    
    if (!plant) {
      console.log('⚠️  Plant not found or already removed');
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    console.log('✅ Plant removed successfully:', plant.scientificName);
    res.json({ message: 'Plant removed successfully', plant });
  } catch (error) {
    console.error('❌ Remove error:', error);
    res.status(500).json({ error: 'Failed to remove plant' });
  }
});

// GET /api/plants/user/:userId - Get user's plants
router.get('/user/:userId', async (req, res) => {
  try {
    const plants = await UserPlant
      .find({ firebaseUid: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({ data: plants });
  } catch (error) {
    console.error('Get user plants error:', error);
    res.status(500).json({ error: 'Failed to get plants' });
  }
});

module.exports = router;