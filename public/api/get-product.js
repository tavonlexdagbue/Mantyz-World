const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).end("Only GET allowed");

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db("store");
    const products = await db.collection("products").find().sort({ createdAt: -1 }).toArray();

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load products" });
  }
};
