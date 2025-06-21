const { MongoClient } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const multiparty = require("multiparty");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uri = process.env.MONGO_URI;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end("Only POST allowed");

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parse error" });

    const { name, price, description } = fields;
    const file = files.image?.[0];

    if (!name || !price || !file) return res.status(400).json({ error: "Missing required fields" });

    try {
      const upload = await cloudinary.uploader.upload(file.path, { folder: "products" });
      const client = await MongoClient.connect(uri);
      const db = client.db("store");

      await db.collection("products").insertOne({
        name: name[0],
        price: parseFloat(price[0]),
        description: description?.[0] || "",
        image: upload.secure_url,
        createdAt: new Date()
      });

      res.status(200).json({ message: "Product added successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save product" });
    }
  });
};

export const config = { api: { bodyParser: false } };
