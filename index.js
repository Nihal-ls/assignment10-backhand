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
    const CompletedHabitCollection = db.collection('Completed-Habits')

    // all habits
    app.get('/habits', async (req, res) => {

      const result = await habitCollection.find().toArray()
      res.send(result)
    })
    // feautred habits
    app.get('/featuredHabits', async (req, res) => {
      const result = await habitCollection.find().sort({ created_at: -1 }).limit(6).toArray()
      res.send(result)
    })

    // Post habits
    app.post('/habits', async (req, res) => {
      const data = req.body
      const result = habitCollection.insertOne(data)
      res.send({
        succeess: true
      })
    })

    // delete my habit
    app.delete('/habits/:id', async (req, res) => {
      const { id } = req.params
      const objectId = new ObjectId(id)
      const filter = { _id: objectId }
      const result = await habitCollection.deleteOne(filter)
      res.send({
        success: true,
        result
      })

    })

    // update habit
    app.put('/habits/:id', async (req, res) => {

      const { id } = req.params
      const data = req.body
      console.log(data);
      const objectId = new ObjectId(id)
      const filter = { _id: objectId }
      const update = {
        $set: data
      }
      const result = await habitCollection.updateOne(filter, update)

      res.send({
        succeess: true
      })
    })
    app.post('/completedHabits', async (req, res) => {
      const data = req.body
      const result = await CompletedHabitCollection.insertOne(data)
      res.send(result);
    });
    app.get('/completedHabits', async (req, res) => {
      const email = req.query.email;
      const query = email ? { Completed_by: email } : {};
      const result = await CompletedHabitCollection.find(query).toArray();
      res.send(result);
    });


    app.listen(port, () => {
      console.log(`data base is listening on port ${port}`)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("DATABASE IS WORKING PERFECTLY");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);