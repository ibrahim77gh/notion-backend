const path = require("path");
const lumie = require("lumie");
const express = require("express");
const WebSocket = require("ws");
var bodyParser = require("body-parser");

const db = require("./models/index");
const PageModel = db.Pages;

const cors = require("cors");
// app
const app = express();

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
const base64 = require("js-base64").toUint8Array;
// parse application/json
app.use(bodyParser.json());

app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
lumie.load(app, {
  preURL: "api",
  verbose: true,
  ignore: ["*.spec", "*.action"],
  controllers_path: path.join(__dirname, "controllers"),
});

const wss = new WebSocket.Server({ port: 1234 });
const clients = [];
const roomIds = {};
wss.on("connection", (ws, req) => {
  let roomId = req.url.split("/")[1];

  const roomWs = roomIds[roomId] ?? [];
  roomIds[roomId] = [...roomWs, ws];
  console.log("Client connected to :", roomId);
  clients.push(ws);
  // Handle incoming messages from clients
  ws.on("message", (message) => {
    const roomClients = roomIds[roomId] ?? [];
    console.log(roomClients.length)
    // Broadcast the message to all connected clients in a room
    if (roomClients?.length) {
      for (const client of roomClients) {
        const index = clients.indexOf(client);
        if (
          index !== -1 &&
          client != ws &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(message);
        }
      }
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
    roomIds[roomId] = [];
  });
});

const saveContent = async (message, roomId) => {
  await PageModel.update(
    {
      content: JSON.stringify(message),
    },
    {
      where: { title: roomId },
    }
  );
};
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const server = app.listen(8081, "localhost", () => {
  const { address, port } = server.address();
  console.log("Example app listening at http://%s:%s", address, port);
});
