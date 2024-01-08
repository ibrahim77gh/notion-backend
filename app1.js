const { Server } = require("@hocuspocus/server");
const { Database } = require("@hocuspocus/extension-database");
// const mysql = require("mysql2/promise");
// const config = require("./config/config.json");
const db = require("./models/index");
const PageModel = db.Pages;
const Y = require('yjs');

const path = require("path");
const lumie = require("lumie");
const express = require("express");
const expressWebsockets = require('express-ws')

// const document = require('@tiptap/extension-document')
// const paragraph = require('@tiptap/extension-paragraph')
// const text = require('@tiptap/extension-text')


// const WebSocket = require("ws");
var bodyParser = require("body-parser");

const cors = require("cors");
const { TiptapTransformer } = require("@hocuspocus/transformer");
// app
// const app = express();
const { app } = expressWebsockets(express());

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = Server.configure({
  port: 1234,
  extensions: [
    new Database({
      // Replace onLoadDocument with fetch
      fetch: async ({ documentName }) => {
        return new Promise((resolve, reject) => {
          db?.get(
            `
            SELECT data FROM "pages" WHERE title = $name ORDER BY rowid DESC
          `,
            {
              $name: documentName,
            },
            (error, row) => {
              if (error) {
                reject(error);
              }

              resolve(row?.data);
            }
          );
        });
      },
      // Replace onStoreDocument with store
      store: async ({ documentName, state }) => {
        return new Promise((resolve, reject) => {
          db?.run(
            `
            INSERT INTO "pages" ("title", "content") VALUES ($name, $data)
              ON CONFLICT(name) DO UPDATE SET data = $data
          `,
            {
              $name: documentName,
              $data: state,
            },
            (error) => {
              if (error) {
                reject(error);
              }

              resolve();
            }
          );
        });
      },
    }),
  ],
  async onAuthenticate(data) {
    const { token } = data;

    // Example test if a user is authenticated with a token passed from the client
    if (token !== "super-secret-token") {
      throw new Error("Not authorized!");
    }

    // You can set contextual data to use it in other hooks
    // return {
    //   user: {
    //     id: 1234,
    //     name: "John",
    //   },
    // };
  },
});

async function createInitialDocTemplate(documentName) {

  // Save the initial document template to the database
  try {
      await PageModel.create({
      title: documentName,
      content: null,
    });
  } catch (error) {
    console.error("Error creating initial document template:", error);
  } finally {
    console.log('Page made')
  }
  const yjsDoc = new Y.Doc();
  return yjsDoc;

}

app.ws("/collaboration", (websocket, request) => {
  const context = {
    user: {
      id: 1234,
      name: "Jane",
    },
  };

  server.handleConnection(websocket, request, context);
});

app.listen(1234, () => console.log("Listening on http://127.0.0.1:1234"));
