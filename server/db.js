// Database connection and operations
const { Pool } = require('pg');

// Create a pool connection using the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Initialize the database tables
async function initializeDatabase() {
  try {
    // Create players table to store ped preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_peds (
        id SERIAL PRIMARY KEY,
        player_identifier VARCHAR(50) NOT NULL UNIQUE,
        model_hash VARCHAR(50) NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create clothing preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_clothing (
        id SERIAL PRIMARY KEY,
        player_identifier VARCHAR(50) NOT NULL,
        component_id INTEGER NOT NULL,
        drawable_id INTEGER NOT NULL,
        texture_id INTEGER NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_identifier, component_id)
      )
    `);

    console.log('^2[PEDMENU]^7: Database initialized successfully');
    return true;
  } catch (error) {
    console.error('^1[PEDMENU]^7: Database initialization failed:', error);
    return false;
  }
}

// Save player's ped model
async function savePlayerPed(playerIdentifier, modelHash) {
  try {
    const query = `
      INSERT INTO player_peds (player_identifier, model_hash, last_updated)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (player_identifier)
      DO UPDATE SET model_hash = $2, last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [playerIdentifier, modelHash]);
    return result.rows[0];
  } catch (error) {
    console.error('^1[PEDMENU]^7: Error saving player ped:', error);
    return null;
  }
}

// Get player's ped model
async function getPlayerPed(playerIdentifier) {
  try {
    const query = `
      SELECT * FROM player_peds
      WHERE player_identifier = $1
      LIMIT 1
    `;
    
    const result = await pool.query(query, [playerIdentifier]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('^1[PEDMENU]^7: Error getting player ped:', error);
    return null;
  }
}

// Save player's clothing component
async function savePlayerClothing(playerIdentifier, componentId, drawableId, textureId) {
  try {
    const query = `
      INSERT INTO player_clothing
        (player_identifier, component_id, drawable_id, texture_id, last_updated)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (player_identifier, component_id)
      DO UPDATE SET drawable_id = $3, texture_id = $4, last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [playerIdentifier, componentId, drawableId, textureId]);
    return result.rows[0];
  } catch (error) {
    console.error('^1[PEDMENU]^7: Error saving player clothing:', error);
    return null;
  }
}

// Get all player's clothing components
async function getPlayerClothing(playerIdentifier) {
  try {
    const query = `
      SELECT * FROM player_clothing
      WHERE player_identifier = $1
    `;
    
    const result = await pool.query(query, [playerIdentifier]);
    return result.rows;
  } catch (error) {
    console.error('^1[PEDMENU]^7: Error getting player clothing:', error);
    return [];
  }
}

// Delete player's saved data
async function deletePlayerData(playerIdentifier) {
  try {
    // Delete player clothing
    await pool.query(`
      DELETE FROM player_clothing
      WHERE player_identifier = $1
    `, [playerIdentifier]);
    
    // Delete player ped
    await pool.query(`
      DELETE FROM player_peds
      WHERE player_identifier = $1
    `, [playerIdentifier]);
    
    return true;
  } catch (error) {
    console.error('^1[PEDMENU]^7: Error deleting player data:', error);
    return false;
  }
}

// Export database functions
module.exports = {
  initializeDatabase,
  savePlayerPed,
  getPlayerPed,
  savePlayerClothing,
  getPlayerClothing,
  deletePlayerData
};