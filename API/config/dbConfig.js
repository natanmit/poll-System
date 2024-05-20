'use strict';

// Require the MongoClient from the MongoDB driver
const MongoClient = require('mongodb').MongoClient;

// In-memory cache for the database connection
let db;

/**
 * Get MongoDB client object
 * @param {string} name The name of the collection to get
 * @returns {Promise<Collection>} A promise that resolves to the requested collection
 */
exports.getMongodbCollection = name => {
    if (db) {
        // If we already have a connected db instance, use it
        return Promise.resolve(db.collection(name));
    } else {
        // Connect to the MongoDB server without deprecated options
        return MongoClient.connect(process.env.MONGO_URL)
            .then(client => {
                // Cache the db instance for reuse
                db = client.db(process.env.MONGODB_DB);
                return db.collection(name);
            });
    }
};
