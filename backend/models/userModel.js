const pool = require("../db");
const bcrypt = require("bcrypt");

class User {
  static async create(userData) {
    try {
      const { username, email, password, location, account_type } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
      INSERT INTO users (username, email, password, location, account_type)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] =  await pool.query(query, [
        username,
        email,
        hashedPassword,
        location,
        account_type,
      ]);
      return result
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const query = "SELECT * FROM users WHERE email = ?";
      const [rows] = await pool.query(query, [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(user_id) {
    try {
      const query = "SELECT * FROM users WHERE user_id = ?";
      const [rows] = await pool.query(query, [user_id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const query = "SELECT * FROM users";
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(userData) {
    try {
      const { user_id, username, email, location, account_type } = userData;
      const query = `
      UPDATE users
      SET username = ?, email = ?, location = ?, account_type = ?
      WHERE user_id = ?
    `;
      await pool.query(query, [
        username,
        email,
        location,
        account_type,
        user_id,
      ]);
    } catch (error) {
      throw error;
    }
  }

  static async delete(user_id) {
    try {
      const query = "DELETE FROM users WHERE user_id = ?";
      await pool.query(query, [user_id]);
      return Promise.resolve;
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error("Error comparing passwords");
    }
  }

  // Function to authenticate user (simplified example)
  static async authenticateUser(email, password, callback) {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            callback(null, user);
          } else {
            callback("Invalid credentials");
          }
        });
      } else {
        callback("User not found");
      }
    });
  }

  // Function to check if user is admin
  static async isAdmin(user) {
    return user.account_type === "admin";
  }

  // Function to check if user is normal user
  static async isNormalUser(user) {
    return (
      user.account_type === "investor" || user.account_type === "entrepreneur"
    );
  }
}

module.exports = User;
