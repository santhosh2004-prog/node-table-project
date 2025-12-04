const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",        // replace with your username
  host: "localhost",       // or your db host
  database: "SalesDB",     // already exists
  password: "12345",       // replace with your password
  port: 5432,              // default postgres port
});

// API to insert data
app.post("/addSale", async (req, res) => {
  const { id, name, sales } = req.body;

  if (!id || !name || !sales) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const query = `
      INSERT INTO Sales.sales_order (id, name, sales)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        sales = EXCLUDED.sales
    `;
    await pool.query(query, [id, name, sales]);

    res.json({ message: "Sale added successfully!" });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

// ✅ API to fetch all sales
app.get("/getSales", async (req, res) => {
  try {
    const query = `SELECT id, name, sales FROM Sales.sales_order ORDER BY id;`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Database fetch failed" });
  }
});

// ✅ API to analyze sales categories (always return high, medium, low)
app.get("/analyzeSales", async (req, res) => {
  try {
    const query = `
      SELECT categories.category, COALESCE(COUNT(t.sales), 0) AS totalscore
      FROM (VALUES ('high'), ('medium'), ('low')) AS categories(category)
      LEFT JOIN (
          SELECT 
              id,
              sales,
              CASE
                  WHEN sales > 5000 THEN 'high'
                  WHEN sales > 2000 THEN 'medium'
                  ELSE 'low'
              END AS category
          FROM Sales.sales_order
      ) t
      ON categories.category = t.category
      GROUP BY categories.category
      ORDER BY categories.category;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Database analysis failed" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
