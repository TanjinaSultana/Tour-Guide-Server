const express = require('express');
const app = express();
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    //await client.connect();
    const database = client.db("tourGuide");
    const packageCollection = database.collection("package");
    const guidesCollection = database.collection("guide");
    const wishCollection = database.collection("wish");
    const cartCollection = database.collection("cart");
    const userCollection = database.collection("user");
    const paymentCollection = database.collection("payment");
    const storyCollection = database.collection("story");
    const reviewCollection = database.collection("review");

//jwt
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })
    const verifyToken =(req,res,next) =>{
      
      
      if(!req.headers.authorization){
        return res.status(401).send({message:'forbidden'});
      }
      const token =  req.headers.authorization.split(' ')[1];
      if(!token){
        return res.status(401).send({message:'forbidden-access'});
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        //console.log(decoded.foo) // bar
        if(err){
          return res.status(401).send({message:'forbidden-error'});
        }
        req.decoded = decoded;
        next();
      });
    }
    const verifyAdmin = async(req,res,next)=>{
      const email = req.decoded.email;
      const query =  {email : email};
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin'
      if(!isAdmin){
        return res.status(401).send({message:'forbidden-access admin'});
      }
      next();
    }
    const verifyGuide = async(req,res,next)=>{
      const email = req.decoded.email;
      const query =  {email : email};
      const user = await userCollection.findOne(query);
      const isTourGuide = user?.role === 'tourGuide'
      if(!isTourGuide){
        return res.status(401).send({message:'forbidden-access tourguide'});
      }
      next();
    }
  
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
    //story
    app.get('/story',async(req,res) =>{
      const result = await storyCollection.find().toArray();
      res.send(result);
  })
  app.post('/story',async(req,res) =>{
    const item = req.body;
      const result = await storyCollection.insertOne(item);
              res.send(result);
  })
  app.get('/story/:id',async(req,res) =>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await storyCollection.findOne(query);
     res.send(result);
 })
 //review
 app.get('/review',async(req,res) =>{
  const result = await reviewCollection.find().toArray();
  res.send(result);
})
app.post('/review',async(req,res) =>{
const item = req.body;
  const result = await reviewCollection.insertOne(item);
          res.send(result);
})

    //Tour Guides
    app.get('/guide',async(req,res) =>{
        const result = await guidesCollection.find().toArray();
        res.send(result);
    })
    app.post('/guide',async(req,res) =>{

        const item = req.body;
        const result = await guidesCollection.insertOne(item);
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
app.delete('/wish/:id',async(req,res)=>{
  const id = req.params.id;
  console.log(id);
  const query= {_id: new ObjectId(id)}
  const result = await wishCollection.deleteOne(query);
  res.send(result);
})
//story
app.get('/story',async(req,res) =>{
  const result = await storyCollection.find().toArray();
  res.send(result);
})
app.post('/story',async(req,res)=>{
  
  const item = req.body;
  const result = await storyCollection.insertOne(item)
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
app.delete('/cart/:id',async(req,res)=>{
  const id = req.params.id;
  console.log(id);
  const query= {_id: new ObjectId(id)}
  const result = await cartCollection.deleteOne(query);
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
app.get('/user',verifyToken,verifyAdmin,async(req,res)=>{
  const result = await userCollection.find().toArray();
  res.send(result);
})
//cart become accept
app.get('/cart/accept/:email',async(req,res)=>{
  const email = req.params.email;
  const query = {email:email};
  console.log(query);
  const user = await cartCollection.findOne(query);
  console.log(user);
  let accept= false;
  if(user){
    accept = user?.status === 'accept'
  }
  
  res.send({accept});
})

app.patch('/cart/accept/:id',async(req,res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
  const updateDoc = {
    $set:{
      status:'accept'
    },
  };
  const result = await cartCollection.updateOne(filter,updateDoc);
  res.send(result);
})
//cart become reject
app.get('/cart/reject/:email',async(req,res)=>{
  const email = req.params.email;
  const query = {email:email};
  console.log(query);
  const user = await cartCollection.findOne(query);
  console.log(user);
  let reject= false;
  if(user){
    reject = user?.status === 'reject'
  }
  
  res.send({reject});
})

app.patch('/cart/reject/:id',async(req,res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
  const updateDoc = {
    $set:{
      status:'reject'
    },
  };
  const result = await cartCollection.updateOne(filter,updateDoc);
  res.send(result);
})
//user became Admin 
app.get('/user/admin/:email',verifyToken,async(req,res)=>{
  const email = req.params.email;
  if(email !== req.decoded.email){
    return res.status(401).send({message:'forbidden-access'});
  }
  const query = {email:email};
  const user = await userCollection.findOne(query);
  let admin= false;
  if(user){
    admin = user?.role === 'admin'
  }
  
  res.send({admin});
})

app.patch('/user/admin/:id',verifyToken,verifyAdmin,async(req,res)=>{
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
app.get('/user/tourGuide/:email',verifyToken,async(req,res)=>{
  const email = req.params.email;
  const query = {email:email};
  const user = await userCollection.findOne(query);
  let tourGuide= false;
  if(user){
    tourGuide = user?.role === 'tourGuide'
  }
  
  res.send({tourGuide});
})
app.patch('/user/tourGuide/:id',verifyToken,verifyGuide,async(req,res)=>{
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
//payment intent

app.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price * 100);
  console.log(amount, 'amount inside the intent')

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  })
});


app.get('/payments/:email', verifyToken,async (req, res) => {
  const query = { email: req.params.email }
  if (req.params.email !== req.decoded.email) {
    return res.status(403).send({ message: 'forbidden access' });
  }
  const result = await paymentCollection.find(query).toArray();
  res.send(result);
})

app.post('/payments', async (req, res) => {
  const payment = req.body;
  const paymentResult = await paymentCollection.insertOne(payment);
  console.log('payment info',payment);
  const query = {
    _id: {
      $in: payment.cartIds.map(id => new ObjectId(id))
    }
  };

  const deleteResult = await cartCollection.deleteMany(query)
  res.send({paymentResult,deleteResult})
})

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    //console.log("Pinged your deployment. You successfully connected to MongoDB!");
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