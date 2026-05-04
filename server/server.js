require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

// Middleware

// Parse JSON bodies
app.use(express.json());

app.use(express.static('public'));

// Create a MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password123',
    database: process.env.DB_NAME || 'cards_db',
    waitForConnections: true,
    connectionLimit: 10
});

// Gallery search endpoint with filters
app.get('/api/cards', async (req, res) => {
    try {
        // 1. Start with a base query
        let sql = 'SELECT * FROM cards WHERE 1=1';
        let params = [];

        // 2. Add filters dynamically
        const filters = {
            search: 'name LIKE ?',
            name: 'name LIKE ?',
            domain: 'domain LIKE ?',
            energy: 'energy = ?',
            type: 'card_types LIKE ?',
            rarity: 'rarity LIKE ?',
            artist: 'artist LIKE ?',
            tags: 'tags LIKE ?'
        };

        // 3. Loop through the filters to keep the code clean
        for (const [key, clause] of Object.entries(filters)) {
            if (req.query[key]) {
                sql += ` AND ${clause}`;
                
                // Add % wildcards for LIKE clauses, but not for Exact matches (like energy)
                const val = (clause.includes('LIKE')) ? `%${req.query[key]}%` : req.query[key];
                params.push(val);
            }
        }

        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching cards:', err);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Hash passwords
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Basic check for username and password
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the database
        const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
        await db.execute(sql, [username, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error('Error registering user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Handle logins
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Basic check for username and password
        if (!username || !password) {
            return res.status(401).json({ error: 'Username and password are required' });
        }
        // Fetch the user from the database
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.execute(sql, [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];

        // Compare the provided password with the stored hash
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful!', token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid access token' });
        }
        req.user = user;
        next();
    });
}

// My Collection backend
app.get('/api/my-collection', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Base query with the JOIN and the mandatory User ID filter
        let sql = `
            SELECT c.* FROM cards c
            JOIN collections col ON c.id = col.card_id
            WHERE col.user_id = ?
        `;
        let params = [userId];

        // 2. Define filter mapping with aliases (c.)
        const filters = {
            search: 'c.name LIKE ?',
            name: 'c.name LIKE ?',
            domain: 'c.domain LIKE ?',
            energy: 'c.energy = ?',
            type: 'c.card_types LIKE ?',
            rarity: 'c.rarity LIKE ?',
            artist: 'c.artist LIKE ?',
            tags: 'c.tags LIKE ?'
        };

        // 3. Dynamically append filters
        for (const [key, clause] of Object.entries(filters)) {
            if (req.query[key]) {
                sql += ` AND ${clause}`;
                const val = (clause.includes('LIKE')) ? `%${req.query[key]}%` : req.query[key];
                params.push(val);
            }
        }

        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching collection:', err);
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
});

// Add to collection endpoint
app.post('/api/my-collection', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cardId } = req.body;

        // INSERT IGNORE INTO to avoid duplicates
        const sql = 'INSERT IGNORE INTO collections (user_id, card_id) VALUES (?, ?)';
        const [result] = await db.execute(sql, [userId, cardId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Card already in collection' });
        }

        res.status(201).json({ message: 'Card added to collection' });
    } catch (err) {
        console.error('Error adding to collection:', err);
        res.status(500).json({ error: 'Failed to add card to collection' });
    }
});

app.delete('/api/my-collection/:cardId', authenticateToken, async (req, res) => {
    try 
    {
        const { cardId } = req.params; // Get cardId from URL parameters
        const userId = req.user.userId; // Get userId from authenticated token

        const sql = 'DELETE FROM collections WHERE user_id = ? AND card_id = ?';
        const [result] = await db.execute(sql, [userId, cardId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Card not found in collection' });
        }
        res.json({ message: 'Card removed from collection' });
    } catch (err) {
        console.error('Error removing from collection:', err);
        res.status(500).json({ error: 'Failed to remove card from collection' });
    }
});
