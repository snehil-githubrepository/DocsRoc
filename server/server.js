const mongoose = require("mongoose");
const Schema = require("./Schema");
const express = require("express");
const app = express();
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  dbName: "DocsRoc",
});

//https://docsroc.vercel.app/

const io = require("socket.io")(3001, {
  cors: {
    origin: process.env.CLIENT_URI,
    method: ["GET", "POST"],
  },
});

const defaultVal = "";

// app.get("/", (req, res) => {
//   res.send("Hello");
// });

// Endpoint to retrieve a document by ID
// app.get("/documents/:id", async (req, res) => {
//   const documentId = req.params.id;

//   try {
//     // Fetch the document data based on the ID from MongoDB
//     const document = await Schema.findById(documentId);

//     if (!document) {
//       return res.status(404).json({ error: "Document not found" });
//     }

//     // Return the document data
//     return res.status(200).json({ content: document.data }); // Adjust the response data as needed
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

io.on("connection", (socket) => {
  let room = null;

  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    room = documentId;
    //makes its own room when we join
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      //broadcasts everyone the changes except for us
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Schema.findByIdAndUpdate(documentId, { data });
    });
  });

  // Handle leaving the room or disconnecting
  socket.on("disconnect", async () => {
    if (room) {
      const document = await Schema.findById(room);
      if (document && document.data) {
        const ops = document.data.ops;

        // Check if there's content other than just a line break
        const hasContent = ops.some((op) => op.insert && op.insert !== "\n");

        if (!hasContent) {
          console.log("Delete Executed!");
          // If document is considered empty, delete it
          await Schema.findByIdAndDelete(room);
        }
      }
    }
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;
  //finds if already a doc exist in db by this id
  const document = await Schema.findById(id);
  if (document) return document;

  return await Schema.create({ _id: id, data: defaultVal });
}

// const PORT = 3000; // Change the port number if needed
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;
