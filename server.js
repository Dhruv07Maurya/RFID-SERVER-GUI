const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3001; // Changed port number

app.use(cors());
app.use(bodyParser.json());

const uri =
  "mongodb+srv://swayam88:1234@cluster0.wnwpthu.mongodb.net/product?retryWrites=true&w=majority"; // Replace with your MongoDB Atlas connection string
const dbName = "product";
const collectionName = "product";

let db;

// Connect to MongoDB Atlas
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

// API endpoint to check UID and update ProductOwner
app.get("/checkUID", async (req, res) => {
  const uid = req.query.uid;

  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  try {
    const collection = db.collection(collectionName);

    // Find the product with the given UID
    const product = await collection.findOne({ UID: uid });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Respond with the product details
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to purchase a product and update ProductOwner
app.post("/purchaseProduct", async (req, res) => {
  const uid = req.body.uid;

  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  try {
    const collection = db.collection(collectionName);

    // Check product availability and update ProductOwner field
    const product = await collection.findOne({ UID: uid });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.ProductOwner === "supermarket") {
      // Update ProductOwner field
      const result = await collection.updateOne(
        { UID: uid },
        { $set: { ProductOwner: "swayam_raut" } }
      );
      if (result.modifiedCount > 0) {
        return res.json({
          success: true,
          message: "Product purchased successfully",
          product,
        });
      } else {
        return res.status(400).json({ error: "Product update failed" });
      }
    } else {
      return res.json({
        success: true,
        message: "Product already owned",
        product,
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to return a product to supermarket
app.post("/returnProduct", async (req, res) => {
  const uid = req.body.uid;

  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  try {
    const collection = db.collection(collectionName);

    // Update ProductOwner field to 'supermarket'
    const result = await collection.updateOne(
      { UID: uid, ProductOwner: "swayam_raut" },
      { $set: { ProductOwner: "supermarket" } }
    );

    if (result.modifiedCount > 0) {
      return res.json({
        success: true,
        message: "Product returned to supermarket",
      });
    } else {
      return res
        .status(404)
        .json({ error: "Product not found or not owned by swayam_raut" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to get all products owned by 'swayam_raut'
app.get("/purchases", async (req, res) => {
  try {
    const collection = db.collection(collectionName);

    const products = await collection
      .find({ ProductOwner: "swayam_raut" })
      .toArray();

    res.json(products);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
