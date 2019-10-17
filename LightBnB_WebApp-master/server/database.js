const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool ({
  user: 'vagrant',
  password: '123',
  host:'localhost',
  database: 'lightbnb'
})

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {

  const queryString = `SELECT * FROM users WHERE email = $1`
  return pool.query(queryString, [email])
  .then (res => {
    if (res) {
      return res.rows[0];
    } else {
      return null;
    }
  })
}

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  
  const queryString = `SELECT * FROM users WHERE id = $1`
  return pool.query(queryString, [id])
  .then (res => {
    if (res) {
    } else {
      return null;
    }
  })
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const insertString = `INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *;`
  return pool.query(insertString, [user.name, user.email, user.password])
  .then (res => {
    if (res) {
      return res.rows[0];
    } else {
      return null;
    }
  })
}

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `SELECT 
  properties.*, reservations.id, reservations.start_date as start_date, AVG(rating) as rating
  FROM 
  reservations JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id 
  WHERE reservations.guest_id = $1 AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY start_date
  LIMIT $2;`

  return pool.query(queryString, [guest_id, limit])
  .then(res => {
    if (res) {
      return res.rows;
    } else {
      return null
    }
  })
} 
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options, limit = 10) {
  const queryParams = [];

  let queryString = `
  SELECT properties.*, AVG(property_reviews.rating)
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  let paramsCheck = false;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `${paramsCheck ? 'AND' : 'WHERE'} city LIKE $${queryParams.length}`;
    paramsCheck = true;
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `${paramsCheck ? 'AND' : 'WHERE'} owner_id = $${queryParams.length}`;
    paramsCheck = true;
  }

  if(options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `${paramsCheck ? 'AND' : 'WHERE'} cost_per_night >= $${queryParams.length}`;
    paramsCheck = true;
  }
  
  if(options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `${paramsCheck ? 'AND' : 'WHERE'} cost_per_night <= $${queryParams.length}`;
    paramsCheck = true;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `

  return pool.query(queryString, queryParams)
  .then(res => res.rows);
}
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
