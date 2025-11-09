const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = 3000
const { MongoClient, ServerApiVersion } = require('mongodb');
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


    // find,findOne
    app.get('/habits', async (req, res) => {

      const result = await habitCollection.find().toArray()
      res.send(result)
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