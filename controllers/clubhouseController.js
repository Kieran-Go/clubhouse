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

    giveMembership: async (userId) => {
        await pool.query("UPDATE users SET is_member = TRUE WHERE id = $1", [userId]);
    },

    makeAdmin: async (userId) => {
        await pool.query("UPDATE users SET is_admin = TRUE WHERE id = $1", [userId]);
    },

    createMessage: async (title, content, userId) => {
        const { rows } = await pool.query(
            "INSERT INTO messages (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
            [title, content, userId]
        );
        return rows[0];
    },

    deleteMessage: async (id) => {
        await pool.query("DELETE FROM messages WHERE id = $1", [id]);
    },

    getAllMessages: async () => {
    const { rows } = await pool.query(`
        SELECT messages.*, users.username 
        FROM messages
        JOIN users ON messages.user_id = users.id
        ORDER BY messages.timestamp ASC
    `);
    return rows;
    },
}