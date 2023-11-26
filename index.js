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
    const cartCollection = database.collection("cart");
    const userCollection = database.collection("user");
  
    //all packages--------------------------
    app.get('/packages',async(req,res) =>{
        const result = await packageCollection.find().toArray();
        res.send(result);
    })
    app.post('/packages',async(req,res) =>{
      const item = req.body;
        const result = await packageCollection.insertOne(item);
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
//cartList 

app.get('/cart',async(req,res) =>{
  const result = await cartCollection.find().toArray();
  res.send(result);
})

app.post('/cart',async(req,res)=>{
  const item = req.body;
  const result = await cartCollection.insertOne(item)
  res.send(result);
})
//userList  
app.post('/user',async(req,res)=>{
  const item = req.body;
  const query = {email: item.email}
  const existingUser = await userCollection.findOne(query);
  if(existingUser){
    return res.send({message:"Already Have this user"})
  }
  const result = await userCollection.insertOne(item)
  res.send(result);
})
app.get('/user',async(req,res)=>{
  const result = await userCollection.find().toArray();
  res.send(result);
})
//user became Admin 
app.get('/user/admin/:email',async(req,res)=>{
  const email = req.params.email;
  const query = {email:email};
  const user = await userCollection.findOne(query);
  let admin= false;
  if(user){
    admin = user?.role === 'admin'
  }
  
  res.send({admin});
})

app.patch('/user/admin/:id',async(req,res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
  const updateDoc = {
    $set:{
      role:'admin'
    },
  };
  const result = await userCollection.updateOne(filter,updateDoc);
  res.send(result);
})
//user tourist 
app.get('/user/tourGuide/:email',async(req,res)=>{
  const email = req.params.email;
  const query = {email:email};
  const user = await userCollection.findOne(query);
  let tourGuide= false;
  if(user){
    tourGuide = user?.role === 'tourGuide'
  }
  
  res.send({tourGuide});
})
app.patch('/user/tourGuide/:id',async(req,res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
  const updateDoc = {
    $set:{
      role:'tourGuide'
    },
  };
  const result = await userCollection.updateOne(filter,updateDoc);
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