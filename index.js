const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
// const products = require("./data/products.json");
// const service = require('./data/service.json');
const team = require("./data/team.json");

// mdiileware
app.use(express.json());
app.use(cors());

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4njvdfp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unAuthorization" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).send({ error: true, message: "unAuthorization" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("carDoctor").collection("services");
    const checkoutCollection = client.db("carDoctor").collection("checkouts");
    const productCollection = client.db("carDoctor").collection("products");

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      console.log(token);
      res.send({ token });
    });

    // products
    app.get("/products", async (req, res) => {
      console.log(req.query);
      const page = parseInt(req.query.page || 0);
      const limit = parseInt(req.query.limit || 10);
      const skip = page * limit;

      const result = await productCollection.find().skip(skip).limit(limit).toArray();
      res.send(result);
    });

    app.get("/totalProduct", async (req, res) => {
      const result = await productCollection.estimatedDocumentCount();
      res.send({ totalProduct: result });
    });

    // get data
    app.get("/services", async (req, res) => {
      const courser = serviceCollection.find();
      const result = await courser.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        // projection: {description: 1, title:1, price:1},
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });

    // checkouts
    app.get("/checkouts", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log("after verify decoded: ", decoded);
      if (decoded.email !== req.query.email) {
        return res
          .status(403)
          .send({ error: true, message: "forbidden access" });
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await checkoutCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/checkouts", async (req, res) => {
      const checkout = req.body;
      console.log(checkout);
      const result = await checkoutCollection.insertOne(checkout);
      res.send(result);
    });

    app.delete("/checkouts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await checkoutCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/checkouts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatingBooking = req.body;
      const updateDoc = {
        $set: {
          status: updatingBooking.status,
        },
      };
      const result = await checkoutCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

// app.get("/products", (req, res) => {
//   res.send(products);
// });

// app.get('/services', (req, res) => {
//     res.send(service)
// });

// app.get('/services/:id', (req, res) => {
//     const id = req.params.id;
//     const speciphicId = service.find(n => n._id == id);
//     res.send(speciphicId);
// });

app.get("/team", (req, res) => {
  res.send(team);
});

app.get("/", (req, res) => {
  res.send("Car Doctor is waiting.......");
});

app.listen(port, () => {
  console.log(`Car Doctor is waiting on PORT: ${port}`);
});
