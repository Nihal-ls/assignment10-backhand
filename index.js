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
      try {
        const data = req.body;
        const email = data.Completed_by;
        const habitId = data.habit_id;

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

        // Find the last completed record for this habit
        const lastCompletion = await CompletedHabitCollection.find({
          Completed_by: email,
          habit_id: habitId
        }).sort({ completed_at: -1 }).limit(1).toArray();

        // Check if already completed today
        if (lastCompletion.length > 0) {
          const lastDate = new Date(lastCompletion[0].completed_date);
          if (lastDate.toISOString().split("T")[0] === todayStr) {
            return res.status(400).json({ message: "You already completed this habit today." });
          }
        }

        // Calculate streak
        let streak = 1;
        if (lastCompletion.length > 0) {
          const lastDate = new Date(lastCompletion[0].completed_date);
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);

          if (lastDate.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0]) {
            streak = lastCompletion[0].streak + 1; // consecutive day → increase streak
          }
          // else missed a day → streak stays 1
        }

        // Prepare completion record
        const completionData = {
          habit_id: habitId,
          Completed_by: email,
          completed_at: today,
          completed_date: todayStr,
          streak
        };

        const result = await CompletedHabitCollection.insertOne(completionData);

        res.json({
          success: true,
          message: "Habit completed successfully!",
          streak: completionData.streak,
          insertedId: result.insertedId
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
      }
    });

    app.get('/completedHabits', async (req, res) => {

      const email = req.query.email;
      const completed = await CompletedHabitCollection.find({ Completed_by: email }).toArray();
      res.json(completed);

    });
    // search
    app.get('/search' ,async (req,res) => {
      const searchedText = req.query.search
     
      const result = await habitCollection.find({habit_name: {$regex: searchedText,$options: 'i'}}).toArray()
       res.send(result)
    })
    app.get('/filter' ,async (req,res) => {
      const filterCategory = req.query.filter
     
      const result = await habitCollection.find({category: filterCategory}).toArray()
       res.send(result)
    })


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