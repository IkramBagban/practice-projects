import express from "express";
import { createClient } from "redis";

let client = null;
try {
  client = createClient();
  if (client) client.connect();
  else console.log("redis not connected");
} catch (error) {
  console.log("some error while connecting redis");
}

const app = express();
app.use(express.json());

app.post("/submit", (req, res) => {
  console.log("req.body", req.body);
  const { problemId, userId, code, language } = req.body;
  if (client)
    client.lPush(
      "submissions",
      JSON.stringify({ problemId, userId, code, language })
    );

  res.status(200).json({ message: "submission recieved." });
});

app.listen(3300, ()=> console.log("user is connected successfully"));
