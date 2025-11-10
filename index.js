const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@habit-tracker.2o5xdti.mongodb.net/?appName=habit-tracker`;

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hello Guys!')
})
app.get('/hello', (req, res) => {
  res.send('how are you?')
})

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    await client.connect();

    const db = client.db('Habits')
    const habitCollection = db.collection('Public-Habits')
 
    // all habits
    app.get('/habits', async (req, res) => {

      const result = await habitCollection.find().toArray()
      res.send(result)
    })
// feautred habits
      app.get('/featuredHabits',async (req,res) => {
        const result = await habitCollection.find().sort({ created_at: -1 }).limit(6).toArray()
       res.send(result)
    })
    // mark as complet api
    app.post('/habit-logs' ,async (req,res) => {
      const {_id,user_email} = req.body
      console.log(_id,email);
      const date = new Date()

      const progressCollection = db.collection('habitlogs')
     const existingprogress = await progressCollection.findOne({_id,user_email,date: date})
    
       if(existingprogress){
        return res.send('Already marked complete today')
       }
       
       const dataStructure = {
        _id: new ObjectId(_id),
        user_email,
        date: date,
        completed: true
       }
       await progressCollection.insertOne(dataStructure)
      res.send('Habit marked as complete')
    })
  
  
  app.listen(port, () => {
  console.log(`data base is listening on port ${port}`)})

    await client.db("admin").command({ ping: 1 });
    console.log("DATABASE IS WORKING PERFECTLY");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);