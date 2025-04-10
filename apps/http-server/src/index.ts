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

  if (client) {
    client.lPush(
      "submissions",
      JSON.stringify({ problemId, userId, code, language })
    );
  }
  res.status(200).json({ message: "submission recieved." });
});

app.post("/simulate-bulk-submissions", async (req, res) => {
  const { no_of_submissions } = req.body;

  let count = 1;
  let problemId = 1;
  let userId = 1;
  while (count < no_of_submissions) {
    if (client) {
      const submission = {
        problemId,
        userId,
        code: "console.log('hello')",
        language: "JS",
      };
      console.log("submission " + count);
      await client.lPush("submissions", JSON.stringify(submission));

      const random = Math.floor(Math.random() * 11) + 5;
      if (problemId > random) {
        problemId = 1;
        userId++;
      }
      problemId++;
    }

    count++;
  }

  res
    .status(200)
    .json({ message: `Successfully make ${no_of_submissions} submissions ` });
});

app.listen(3300, () => console.log("user is connected successfully"));
