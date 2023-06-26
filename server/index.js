require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { permissionsCheck } = require("./helpers");
const path = require('path');

const PORT = process.env.PORT || 9001;
const app = express();
app.use(express.json());
app.use(cors());

const auth = {
  username: process.env.SIGNALWIRE_PROJECT_KEY, // Project-ID
  password: process.env.SIGNALWIRE_TOKEN, // API token
};
const apiurl = process.env.SIGNALWIRE_SPACE; // <your username>.signalwire.com

app.use(express.static(path.resolve(__dirname, '../dist')));

app.post("/api/get_token", async (req, res) => {
  let { user_name, room_name, mod } = req.body;

  console.log(user_name, room_name, apiurl + "/api/video/room_tokens");
  try {
    let token = await axios.post(
      "https://" + apiurl + "/api/video/room_tokens",
      {
        user_name,
        room_name: room_name,
        permissions: permissionsCheck(mod),
      },
      { auth }
    );

    token = token.data?.token;
    return res.json({ token });
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
});

app.get("/get_recording/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const rec = await axios.get(
      `https://${apiurl}/api/video/room_recordings/${id}`,
      {
        auth,
      }
    );
    res.json(rec.data);
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
