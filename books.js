const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const { v4: uuid } = require("uuid");

const app = express();
const PORT = 5000;
const DATA_FILE = "./data/books.json";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 1. Default API
app.get("/", (req, res) => {
  res.json({ message: "server running healthy" });
});

// 2. Get all books
app.get("/books", async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

// 3. Get book by id
app.get("/book/:id", async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
    const book = data.find((book) => book.id === req.params.id);

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: "no data found" });
    }
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

// 4. Post a new book
app.post("/postbook", async (req, res) => {
  const { title, author, price } = req.body;

  if (!title || !author || !price) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newBook = { id: uuid(), title, author, price };

  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
    const exists = data.find((book) => book.title === title);

    if (exists) {
      return res.status(400).json({ message: "book already exists" });
    }

    data.push(newBook);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

    res.status(201).json({ message: "added new book", book: newBook });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

// 5. Modify or edit book by id
app.patch("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, price } = req.body;
  try {
    let data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
    const index = data.findIndex((book) => book.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "no book found" });
    }
    const existing = data[index];
    const updated = {
      ...existing,
      title: title !== undefined ? title : existing.title,
      author: author !== undefined ? author : existing.author,
      price: price !== undefined ? price : existing.price,
    };
    data[index] = updated;
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ message: "book modified", book: updated });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

// 6. Delete book by id
app.delete("/deletebook/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
    const book = data.find((book) => book.id === id);

    if (!book) {
      return res.status(404).json({ message: "no book found" });
    }

    const updatedData = data.filter((book) => book.id !== id);
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2));

    res.json({ message: "book deleted", deletedBook: book });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

// Start server
app.listen(PORT, () => console.log(`server is running at port ${PORT}`));
