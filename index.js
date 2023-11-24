const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5005;
//middlewares
app.use(cors());
app.use(express.json())
console.log(process.env.DB_USER);
 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.asca0m7.mongodb.net/?retryWrites=true&w=majority`;

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
    const database = client.db("tourGuide");
    const packageCollection = database.collection("package");
    const guidesCollection = database.collection("guide");
    const wishCollection = database.collection("wish");
  
    //all packages--------------------------
    app.get('/packages',async(req,res) =>{
        const result = await packageCollection.find().toArray();
        res.send(result);
    })
    app.get('/packages/:id',async(req,res) =>{
       const id = req.params.id;
       const query = {_id: new ObjectId(id)}
       const result = await packageCollection.findOne(query);
        res.send(result);
    })
    //Tour Guides
    app.get('/guide',async(req,res) =>{
        const result = await guidesCollection.find().toArray();
        res.send(result);
    })
    app.get('/guide/:id',async(req,res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await guidesCollection.findOne(query);
         res.send(result);
     })
//wishlist 
app.post('/wish',async(req,res)=>{
    const item = req.body;
    const result = await wishCollection.insertOne(item)
    res.send(result);
})
app.get('/wish',async(req,res) =>{
    const result = await wishCollection.find().toArray();
    res.send(result);
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', function (req, res) {
    
    res.send('guide is sitting ')
   })
app.listen(port , () => {
    
    console.log(`tour guide is sitting  on port ${port}`)
   })