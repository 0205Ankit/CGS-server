import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { authorize, uploadFile } from "../utils.mjs";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const uplaod = multer({ storage: storage });

router.post("/", uplaod.single("pdf"), async (req, res) => {
  try {
    // validate the input
    let { email } = req.body;
    let uploadedFileId = null;
    const pdf = req.file;

    authorize().then(async (authClient) => {
      const uploadedFile = await uploadFile(authClient, pdf);
      uploadedFileId = uploadedFile.data.id;

      if (!uploadedFileId) {
        return res.status(500).send({
          status: "error",
          error: "Unable to upload file",
        });
      }

      const collections = await db.listCollections().toArray();
      const saved_pdfs_collection_exists = collections.some(
        (collection) => collection.name === "saved_pdfs"
      );

      if (!saved_pdfs_collection_exists) {
        await db.createCollection("saved_pdfs");
      }

      await db.collection("saved_pdfs").insertOne({
        _id: new ObjectId(),
        pdfUrl: `https://drive.google.com/file/d/${uploadedFileId}/view`,
        email: email,
      });

      res.status(200).send({
        status: "success",
        fileUrl: `https://drive.google.com/file/d/${uploadedFileId}/view`,
      });
    });
  } catch (err) {
    console.log(err);
    res
      .send({
        status: "error",
        error: err,
      })
      .status(500);
  }
});

router.get("/", async (req, res) => {
  try {
    const certificates = await db.collection("saved_pdfs").find({}).toArray();
    res.status(200).send({
      status: "success",
      certificates,
    });
  } catch (err) {
    console.log(err);
    res
      .send({
        status: "error",
        error: err,
      })
      .status(500);
  }
});

export default router;
