const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
var cors = require('cors')
const app = express();
require("dotenv").config();

const secret = "mostimportantveryimportant";

// json parser
app.use(express.json());
app.use(cors({
  origin:["http://localhost:5173"], credentials:true,
}));

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
    // await client.connect();

    const serviceCollection = client.db("swap").collection("services");
    const serviceBooking = client.db("swap").collection("bookings");


    // all services data
    app.get("/api/v1/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

   // post services in data base
   app.post("/api/v1/services", async (req, res) => {
    const services = req.body;
    console.log(services);
    const result = await serviceCollection.insertOne(services);
    res.send(result);
  })

  //service bookings
  app.post("/api/v1/bookings", async (req, res) => {
    const booking = req.body;
    console.log(booking);
    const result = await serviceBooking.insertOne(booking);
    res.send(result);
  })
  
    // service booking user email based
    app.get("/api/bookings/:userEmail", async (req, res) => {
      console.log(req.query.email);
    
      const userEmail = req.params.userEmail; 

      const result = await serviceBooking.find({userEmail}).toArray();
      res.send(result);

    });

    // service booking get
    app.get("/api/services/:userEmail", async (req, res) => {
      console.log(req.query.email);
    
      const userEmail = req.params.userEmail; 

      const result = await serviceBooking.find({userEmail}).toArray();
      res.send(result);

    });

    // specific service 
    app.get("/api/v1/services/:service_provider_email", async (req, res) => {
    
      const service_provider_email = req.params.service_provider_email;

      const result = await serviceCollection.find({service_provider_email}).toArray();
      res.send(result);

    });

    // update
    app.put("/api/v1/services/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true }; 
      const updateService = {
        $set: {
          service_name: data.service_name,
          service_image: data.service_img,
          service_des: data.service_des,
          service_price: data.service_price,
        },
      };
      const result = await serviceCollection.updateOne(
        filter,
        updateService,
        options
      );
      res.send(result);
    });

    // delete
    app.delete("/api/v1/services/:id", async (req, res) => 
    {const id = req.params.id;const query = {_id: new ObjectId(id) };
    const result = await serviceCollection.deleteOne(query);res.send(result);});

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
