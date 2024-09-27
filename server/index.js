const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const port = 3000;
const cors = require('cors');
const { listModels, queryOllama } = require('./ollama'); // Import Ollama functions


const app = express();


app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send.json({
    message: "Hello World",
  });
});


// Route to handle user details submission
app.post('/api/users', (req, res) => {
  const userDetails = req.body;

  // Path to the JSON file
  const filePath = path.join(__dirname, 'userDetails.json');

  // Read the existing data
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Server error');
    }

    // Parse existing data or initialize an empty array
    const existingUsers = data ? JSON.parse(data) : [];

    // Add new user details to the array
    existingUsers.push(userDetails);

    // Write the updated data back to the file
    fs.writeFile(filePath, JSON.stringify(existingUsers, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Server error');
      }
      res.status(201).send(userDetails); // Send back the saved user details
    });
  });
});


// Route to get available models
app.get('/models', async (req, res) => {
  try {
    const models = await listModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Route to send a question to Ollama API
app.post('/query', async (req, res) => {
  const { question, model = 'llama3.1' } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const models = await listModels();
    if (!models.includes(model)) {
      return res.status(404).json({ error: `Model "${model}" not found. Available models: ${models.join(', ')}` });
    }

    const answer = await queryOllama(question, model);
    res.json({ answer });
  } catch (error) {
    console.error('Error querying Ollama:', error.message);
    res.status(500).json({ error: 'Failed to query Ollama' });
  }
});



app.listen(3000, () => {
  console.log(`Server is listening is ${port}...`);
});
