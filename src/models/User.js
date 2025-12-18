const pool = require('../db');
const bcrypt = require('bcrypt');

class User {
  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, email, created_at, updated_at
    `;
    const result = await pool.query(query, [email, hashedPassword]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async saveRefreshToken(userId, refreshToken) {
    const query = `
      UPDATE users
      SET refresh_token = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email
    `;
    const result = await pool.query(query, [refreshToken, userId]);
    return result.rows[0];
  }

  static async getRefreshToken(userId) {
    const query = 'SELECT refresh_token FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async clearRefreshToken(userId) {
    const query = `
      UPDATE users
      SET refresh_token = NULL, updated_at = NOW()
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  }
}

module.exports = User;
