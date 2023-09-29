const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const products = require('./data/products.json');
const service = require('./data/service.json');
const team = require('./data/team.json');


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
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);



app.get('/products', (req, res) => {
    res.send(products)
});

app.get('/services', (req, res) => {
    res.send(service)
});

app.get('/services/:id', (req, res) => {
    const id = req.params.id;
    const speciphicId = service.find(n => n._id == id);
    res.send(speciphicId);
});

app.get('/team', (req, res) => {
    res.send(team)
});

app.get('/', (req, res) => {
    res.send("Car Doctor is waiting.......")
});

app.listen(port, () => {
    console.log(`Car Doctor is waiting on PORT: ${port}`);
})