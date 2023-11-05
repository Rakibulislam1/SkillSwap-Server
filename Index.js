const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config()

const secret = 'mostimportantveryimportant'

app.use(express.json())

// mongodb URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v6vphhi.mongodb.net/swap?retryWrites=true&w=majority`;


// mongodb connection
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


    const serviceCollection = client.db('swap').collection('services');

    // all services data
    app.get('/api/v1/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })



    app.post('/api/v1/auth/access-token', async (req, res) => {
      // create token and send to client
      const user = req.body
      const token = jwt.sign(user, secret)
      res.cookie('token', {
        httpOnly : true,
        secure : true,
        sameSite: 'none'
      }).send({ success: true })
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${5000}`)
})