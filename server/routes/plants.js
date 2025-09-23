const express = require('express');
const TrefleAPI = require('../services/trefleAPI');
const { UserPlant, FavoritePlant, PlantSearch } = require('../models/Plant');
const router = express.Router();

// Initialize Trefle API
const trefleAPI = new TrefleAPI();

// GET /api/plants/search - Search plants using Trefle API
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    const { firebaseUid } = req.user || {}; // Optional user context
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search plants using Trefle API
    const results = await trefleAPI.searchPlants(q, { page });
    
    // Save search history if user is authenticated
    if (firebaseUid) {
      try {
        const search = new PlantSearch({
          firebaseUid,
          query: q,
          resultsCount: results.meta?.total || 0
        });
        await search.save();
      } catch (searchError) {
        console.error('Error saving search history:', searchError);
        // Don't fail the request if search history fails
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Plant search error:', error);
    res.status(500).json({ error: 'Failed to search plants' });
  }
});

// GET /api/plants - Get plants with filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      commonName, 
      family, 
      genus, 
      edible, 
      vegetable,
      flower_conspicuous 
    } = req.query;
    
    const options = {
      page,
      commonName,
      family,
      genus,
      edible: edible === 'true' ? true : undefined,
      vegetable: vegetable === 'true' ? true : undefined,
      flower_conspicuous: flower_conspicuous === 'true' ? true : undefined
    };
    
    const results = await trefleAPI.getPlants(options);
    res.json(results);
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({ error: 'Failed to get plants' });
  }
});

// GET /api/plants/categories - Get predefined plant categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 'edible',
        name: 'Edible Plants',
        description: 'Plants that produce edible parts',
        endpoint: '/api/plants?edible=true'
      },
      {
        id: 'vegetables',
        name: 'Vegetables',
        description: 'Vegetable plants for food production',
        endpoint: '/api/plants?vegetable=true'
      },
      {
        id: 'flowers',
        name: 'Flowering Plants',
        description: 'Plants with conspicuous flowers',
        endpoint: '/api/plants?flower_conspicuous=true'
      },
      {
        id: 'herbs',
        name: 'Herbs',
        description: 'Herb plants for cooking and medicine',
        endpoint: '/api/plants/families/lamiaceae/plants'
      }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// GET /api/plants/families - Get plant families
router.get('/families', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await trefleAPI.getFamilies({ page });
    res.json(results);
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({ error: 'Failed to get plant families' });
  }
});

// GET /api/plants/families/:slug/plants - Get plants by family
router.get('/families/:slug/plants', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1 } = req.query;
    
    const results = await trefleAPI.getPlantsByFamily(slug, { page });
    res.json(results);
  } catch (error) {
    console.error('Get plants by family error:', error);
    res.status(500).json({ error: 'Failed to get plants by family' });
  }
});

// GET /api/plants/:id - Get specific plant by Trefle ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plant = await trefleAPI.getPlantById(id);
    res.json(plant);
  } catch (error) {
    console.error('Get plant error:', error);
    res.status(404).json({ error: 'Plant not found' });
  }
});

// GET /api/plants/:id/species - Get plant species
router.get('/:id/species', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    
    const species = await trefleAPI.getPlantSpecies(id, { page });
    res.json(species);
  } catch (error) {
    console.error('Get plant species error:', error);
    res.status(500).json({ error: 'Failed to get plant species' });
  }
});

// === USER-SPECIFIC ROUTES (Require authentication) ===

// POST /api/plants/:id/save - Save plant to user's collection
router.post('/:id/save', async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, notes, location } = req.body;
    const { uid: firebaseUid } = req.user;

    // Get plant data from Trefle
    const plantData = await trefleAPI.getPlantById(id);
    
    if (!plantData.data) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const plant = plantData.data;

    // Check if user already has this plant
    const existingPlant = await UserPlant.findOne({
      firebaseUid,
      trefleId: plant.id,
      isActive: true
    });

    if (existingPlant) {
      return res.status(400).json({ error: 'Plant already in your collection' });
    }

    // Save to user's collection
    const userPlant = new UserPlant({
      firebaseUid,
      trefleId: plant.id,
      slug: plant.slug,
      scientificName: plant.scientific_name,
      commonName: plant.common_name,
      family: plant.family,
      genus: plant.genus,
      nickname,
      notes,
      location
    });

    await userPlant.save();
    res.json(userPlant);
  } catch (error) {
    console.error('Save plant error:', error);
    res.status(500).json({ error: 'Failed to save plant' });
  }
});

// POST /api/plants/:id/favorite - Add plant to favorites
router.post('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const { uid: firebaseUid } = req.user;

    // Get plant data from Trefle
    const plantData = await trefleAPI.getPlantById(id);
    
    if (!plantData.data) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const plant = plantData.data;

    // Check if already favorited
    const existingFavorite = await FavoritePlant.findOne({
      firebaseUid,
      trefleId: plant.id
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Plant already in favorites' });
    }

    // Add to favorites
    const favorite = new FavoritePlant({
      firebaseUid,
      trefleId: plant.id,
      slug: plant.slug,
      scientificName: plant.scientific_name,
      commonName: plant.common_name,
      family: plant.family,
      genus: plant.genus
    });

    await favorite.save();
    res.json(favorite);
  } catch (error) {
    console.error('Favorite plant error:', error);
    res.status(500).json({ error: 'Failed to favorite plant' });
  }
});

// DELETE /api/plants/:id/favorite - Remove from favorites
router.delete('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const { uid: firebaseUid } = req.user;

    await FavoritePlant.findOneAndDelete({
      firebaseUid,
      trefleId: parseInt(id)
    });

    res.json({ message: 'Plant removed from favorites' });
  } catch (error) {
    console.error('Unfavorite plant error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// GET /api/plants/user/collection - Get user's plant collection
router.get('/user/collection', async (req, res) => {
  try {
    const { uid: firebaseUid } = req.user;
    const { page = 1, limit = 20 } = req.query;

    const plants = await UserPlant.find({ firebaseUid, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserPlant.countDocuments({ firebaseUid, isActive: true });

    res.json({
      data: plants,
      meta: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user collection error:', error);
    res.status(500).json({ error: 'Failed to get user collection' });
  }
});

// GET /api/plants/user/favorites - Get user's favorite plants
router.get('/user/favorites', async (req, res) => {
  try {
    const { uid: firebaseUid } = req.user;
    const { page = 1, limit = 20 } = req.query;

    const favorites = await FavoritePlant.find({ firebaseUid })
      .sort({ dateAdded: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FavoritePlant.countDocuments({ firebaseUid });

    res.json({
      data: favorites,
      meta: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({ error: 'Failed to get user favorites' });
  }
});

module.exports = router;