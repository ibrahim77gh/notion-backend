const { Server } = require("@hocuspocus/server");
const db = require("./models/index");
const PageModel = db.Pages;
const Y = require('yjs');

const path = require("path");
const lumie = require("lumie");
const express = require("express");
const expressWebsockets = require('express-ws')

var bodyParser = require("body-parser");

const cors = require("cors");
// app
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
  timeout: 10000,
  async onStoreDocument(data) {
    // Save to database using Sequelize
    try {
      await PageModel.upsert({
        title: data.documentName,
        content: Buffer.from(
            Y.encodeStateAsUpdate(data.document),
          ),
        });
    } catch (error) {
      console.error("Error saving document to the database:", error);
    }
  },

  async onLoadDocument(data) {
    // Load from the database using Sequelize
    const documentRecord = await PageModel.findOne({
      where: { title: data.documentName },
    });
    
    if (documentRecord) {
      if (documentRecord.content){
        Y.applyUpdate(data.document, documentRecord.content)
        return data.document
      } else {
        const yjsDoc = new Y.Doc();
        return yjsDoc;
      }
    }

    // If not found in the database, create an initial document template
    return createInitialDocTemplate(data.documentName);
  },
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
