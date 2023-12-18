import React, { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useParams } from "react-router-dom";

export default function GoogleDocsAppBar() {
  const [documentTitle, setDocumentTitle] = useState("Untitled document");
  const [showSuccess, setShowSuccess] = useState(false);
  const { id } = useParams();

  const handleTitleChange = (event) => {
    setDocumentTitle(event.target.value);
  };

  const buttonStyle = {
    marginLeft: "8px",
    padding: "2px 8px",
    color: "white",
    boxSizing: "border-box",
    backgroundColor: "rgb(35, 76, 199)",
    border: "0.5px solid black",
    borderRadius: "8%",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#1976D2",
    },
  };

  const handleShareClick = () => {
    const documentURL = window.location.origin + `/documents/${id}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(documentURL)
        .then(() => {
          setShowSuccess(true);
        })
        .catch((error) => {
          console.error("Failed to copy:", error);
        });
    } else {
      prompt("Copy the document link below:", documentURL);
    }
  };

  const handleCloseSuccess = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSuccess(false);
  };

  const handleDownloadClick = () => {
    alert("Downloded");
  };

  // const convertDocumentToFormat = async (format, documentId) => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:3002/documents/${documentId}`
  //     );
  //     const { content } = await response.json();

  //     let convertedDocument = null;

  //     if (format === "pdf") {
  //       // Perform PDF conversion using a library or service
  //       // For example, using html-pdf library
  //       const pdfContent = `<html><body>${content}</body></html>`;
  //       // Replace this with the actual logic to convert HTML to PDF
  //       // Example: const pdfData = await convertHtmlToPdf(pdfContent);
  //       // convertedDocument = new Blob([pdfData], { type: "application/pdf" });
  //     } else if (format === "docx") {
  //       // Perform DOCX conversion using a library or service
  //       // For example, using docx library
  //       // Replace this with the actual logic to convert content to DOCX format
  //       // Example: const docxData = await convertToDocx(content);
  //       // convertedDocument = new Blob([docxData], {
  //       //   type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //       // });
  //     } else if (format === "txt") {
  //       // Perform TXT conversion using a library or service
  //       // For example, simply create a Blob with text content
  //       convertedDocument = new Blob([content], { type: "text/plain" });
  //     }

  //     return convertedDocument;
  //   } catch (error) {
  //     throw new Error(
  //       `Error fetching or converting document: ${error.message}`
  //     );
  //   }
  // };

  // const handleDownloadClick = async () => {
  //   const format = prompt("Enter the document format (pdf, txt, docx, etc.):");

  //   if (format) {
  //     try {
  //       const documentId = id; // Replace with the actual document ID
  //       const result = await convertDocumentToFormat(format, documentId);

  //       const downloadLink = document.createElement("a");
  //       downloadLink.href = URL.createObjectURL(result);
  //       downloadLink.download = `document.${format}`;
  //       downloadLink.click();
  //     } catch (error) {
  //       console.error("Error while converting:", error);
  //       // Handle error (e.g., show an error message)
  //     }
  //   }
  // };

  return (
    <div className="appbar">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <img src="/docs.svg" />
        </IconButton>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          <input
            type="text"
            value={documentTitle}
            onChange={handleTitleChange}
            style={{
              border: "none",
              outline: "none",
              fontSize: "inherit",
              fontWeight: "inherit",
              backgroundColor: "transparent",
            }}
          />
        </Typography>
        <IconButton style={buttonStyle} onClick={handleShareClick}>
          Share
        </IconButton>
        <IconButton style={buttonStyle} onClick={handleDownloadClick}>
          Download
        </IconButton>
      </Toolbar>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Adjust position
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </div>
  );
}
