import { Schema, model, Document } from "mongoose";

// Define an interface for the document structure
export interface DocumentData extends Document {
  _id: string;
  data: Record<string, any>; // Adjust the type if `data` has a more specific shape
}

// Define the schema
const DocumentSchema = new Schema<DocumentData>({
  _id: { type: String, required: true },
  data: { type: Object, required: true },
});

// Create the model
const DocumentModel = model<DocumentData>("Document", DocumentSchema);

export default DocumentModel;
