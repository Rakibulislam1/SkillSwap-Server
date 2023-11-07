const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
var cors = require('cors')
const app = express();
require("dotenv").config();

const secret = "mostimportantveryimportant";

// json parser
app.use(express.json());
app.use(cors());

// cookie parser
app.use(cookieParser());

// middleware
const gateman = (req, res) => {
  const token = req.cookies;

  if(!token){
    return res.status(401).send({message: 'You are not authorized'})
  }

  // verify a token symmetric
  jwt.verify(token, secret, function (err, decoded) {
    if(err){
      return res.status(401).send({message: 'You are not authorized'}) 
    }
  });
};

// mongodb URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v6vphhi.mongodb.net/swap?retryWrites=true&w=majority`;

// mongodb connection
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("swap").collection("services");
    const serviceBooking = client.db("swap").collection("bookings");

    // all services data
    app.get("/api/v1/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //service bookings
    app.post("/api/v1/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await serviceBooking.insertOne(booking);
      res.send(result);
    })

    app.post("/api/v1/auth/access-token", (req, res) => {
      // create token and send to client
      const user = req.body;
      const token = jwt.sign(user, secret);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "none",
        })
        .send({ success: true });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${5000}`);
});
