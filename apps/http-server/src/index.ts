import express from "express";
import { createClient } from "redis";

const client = createClient();
client.connect();

const app = express();
app.use(express.json())

app.post("/submit", (req, res) => {
    console.log('req.body',req.body)
  const { problemId, userId, code, language } = req.body;

  client.lPush(
    "submissions",
    JSON.stringify({ problemId, userId, code, language })
  );

  res.status(200).json({message: 'submission recieved.'})
});

app.listen(3000)