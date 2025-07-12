const pool = require("../db/pool");
const bcrypt = require("bcryptjs");

module.exports = {

    findUserById: async (id) => {
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        return rows[0];
    },

    findUserByUsername: async (username) => {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        return rows[0];
    },

    createUser: async (first_name, last_name, username, password) => {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        const { rows } = await pool.query("INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4) RETURNING *",
            [first_name, last_name, username, hashedPassword]
        );
        return rows[0];
    },
}