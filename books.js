const express = require("express");
const path = require("path");
const cors = require("cors");
const { json } = require("stream/consumers");
const fs = require("fs").promises;
const uuid = require("uuid").v4;

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// 1.default api

app.get("/", (req, res) => {
  res.json({ message: "serever running healthy" });
});

// 2.get books
app.get("/books", async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile("./data/books.json"));
    console.log(data);
    res.json(data);
  } catch (error) {
    res.json({ message: "internal server error" });
  }
});

// 3.get books by id
app.get("/books/:id", async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile("./data/books.json")).filter(
      (book) => book.id == req.params.id
    );
    if (data.length > 0) {
      res.json(data);
    } else {
      res.json({ message: "no data found" });
    }
  } catch (error) {
    res.json({ message: "internal server error" });
  }
});

// 4.post a new book
app.post("/post", async (req, res) => {
  console.log(req.body);
  const { title, author, price } = req.body;
  const newBook = {
    id: uuid(),
    title,
    author,
    price,
  };
  try {
    const data = JSON.parse(await fs.readFile("./data/books.json"));
    const some = await data.find((book) => book.title == title);
    console.log(some);
    if (!some) {
      data.push(newBook);
      await fs.writeFile("./data/books.json", JSON.stringify(data));
      console.log(data);
      res.json({ message: "added new book", book: newBook });
    } else {
      res.json({ message: "book exists" });
    }
  } catch (error) {
    res.status(500).json({ message: "internal server eror" });
  }
});

// 5.modify or edit any book using id
app.patch("/editbook/:id", async (req, res) => {
  console.log(req.params);
  console.log(req.body);

  const { id } = req.params;
  const { title, author, price } = req.body;

  try {
    const data = JSON.parse(await fs.readFile("./data/books.json")).map(
      (book) => {
        if (book.id == id) {
          return {
            ...book,
            title: title || book.title,
            author: author || book.author,
            price: price || book.price,
          };
        }
        return book;
      }
    );
    await fs.writeFile("./data/books.json", JSON.stringify(data));
    console.log(data);
    res.json({ message: "book modified", id });
  } catch (error) {
    res.status(500).json({ message: "internal server eror" });
  }
});

// 6.dlete a book using id
app.delete("/deletebook/:id", async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  try {
    const data = JSON.parse(await fs.readFile("./data/books.json"));
    const some = await data.some((book) => book.id == id);
    console.log(some);
    if (some) {
      const updatedData = await data.filter((book) => book.id !== id);
      await fs.writeFile("./data/books.json", JSON.stringify(updatedData));
      res.json({ message: "book deleted" });
    } else {
      res.json({ message: "no book found" });
    }
  } catch (error) {
    res.status(500).json({ message: "internal server eror" });
  }
});

app.listen(5000, () => console.log("server is running at port 5000"));
