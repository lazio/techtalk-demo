const fs = require("fs");
const path = require("path");

const bodyParser = require("body-parser");
const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  database: "practice",
  port: 5432,
});

// create application/json parser
const jsonParser = bodyParser.json();

app.get("/", (req, res) => {
  fs.readFile(path.resolve(__dirname, "views", "index.html"), (error, data) => {
    if (error) throw error;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

app.post("/", (req, res) => {
  const body = [];

  req.on("data", (data) => {
    body.push(Buffer.from(data));
  });
  req.on("end", () => {
    console.log(body);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body.toString()));
  });
});

// GET /api/v1/restaurants - get all restaurants
// GET /api/v1/restaurants/:id - get restaurant by ID
// POST /api/v1/restaurants - add new restaurant
// PUT /api/v1/restaurants/:id - update existing restaurant
// DELETE /api/v1/restaurants/:id - get restaurant by ID

app.get("/api/v1/users", async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM users;");

    res.send({
      status: "success",
      data: {
        users: results.rows,
      },
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

app.get("/api/v1/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const results = await pool.query("SELECT * FROM users WHERE id=$1;", [id]);

    res.send({
      status: "success",
      data: {
        users: results.rows[0],
      },
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

app.post("/api/v1/users/", jsonParser, async (req, res) => {
  const { firstname, lastname, age } = req.body;

  console.log(req.body);

  try {
    const results = await pool.query(
      "INSERT INTO users (firstname, lastname, age) values ($1, $2, $3) RETURNING *",
      [firstname, lastname, age]
    );

    res.send({
      status: "success",
      data: {
        users: results.rows[0],
      },
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

app.put("/api/v1/users/:id", jsonParser, async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, age } = req.body;

  try {
    const results = await pool.query(
      "UPDATE users SET firstname = $1, lastname = $2, age = $3 WHERE id = $4 RETURNING *",
      [firstname, lastname, age, id]
    );

    res.send({
      status: "success",
      data: {
        users: results.rows[0],
      },
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

app.delete("/api/v1/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const results = await pool.query("DELETE FROM users WHERE id = $1", [id]);

    res.send({
      status: "success",
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}.`);
});
