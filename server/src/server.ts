import mongoose from "mongoose";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import DocumentModel, { DocumentData } from "./DBSchema";

dotenv.config();

const defaultVal = "";

mongoose
  .connect(process.env.MONGO_URI || "", {
    dbName: "DocsRoc",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

console.log("WebSocket server running on ws://localhost:3001");

type MessageType = "get-document" | "send-changes" | "save-document";

interface ClientMessage {
  type: MessageType;
  documentId?: string;
  data?: any;
  delta?: any;
}

app.get("/", (req, res) => {
  res.send("Hello");
});

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

wss.on("connection", (ws: WebSocket) => {
  let room: string | null = null;

  ws.on("message", async (message: string) => {
    try {
      const parsedMessage: ClientMessage = JSON.parse(message);
      const { type, documentId, data, delta } = parsedMessage;

      switch (type) {
        case "get-document": {
          if (!documentId) throw new Error("Document ID is required");
          const document = await findOrCreateDocument(documentId);
          room = documentId;

          // Join the client to the room
          (ws as any).room = documentId;

          // Send the initial document data
          ws.send(
            JSON.stringify({ type: "load-document", data: document.data })
          );
          break;
        }

        case "send-changes": {
          if (!documentId || !delta) break;

          broadcastToRoom(documentId, ws, {
            type: "receive-changes",
            delta,
          });
          break;
        }

        case "save-document": {
          if (!documentId || !data) break;

          await DocumentModel.findByIdAndUpdate(documentId, { data });
          break;
        }

        default:
          console.error("Unknown message type:", type);
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.on("close", async () => {
    if (room) {
      const document = await DocumentModel.findById(room);
      if (document && document.data) {
        const ops = document.data.ops;

        const hasContent = ops.some(
          (op: any) => op.insert && op.insert !== "\n"
        );

        if (!hasContent) {
          console.log("Deleting empty document:", room);
          await DocumentModel.findByIdAndDelete(room);
        }
      }
    }
  });
});

function broadcastToRoom(room: string, sender: WebSocket, message: any): void {
  wss.clients.forEach((client) => {
    if (
      (client as any).room === room &&
      client !== sender &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(JSON.stringify(message));
    }
  });
}

async function findOrCreateDocument(id: string): Promise<DocumentData> {
  if (id == null) throw new Error("Document ID is required");
  const document = await DocumentModel.findById(id);
  if (document) return document as DocumentData;
  return await DocumentModel.create({ _id: id, data: defaultVal });
}

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`HTTP and WebSocket server running on http://localhost:${PORT}`);
});
