import db from "../../Firebase/Firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
const requestIp = require("request-ip");
const bcrypt = require("bcryptjs");

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      const clientIp = requestIp.getClientIp(req);
      const pid = String(req.body.id); // Convert to string

      if (!pid || pid === 'undefined' || pid === 'null') {
        return res.status(400).json({ error: "Blog ID is required" });
      }

      const likeRef = db.collection("posts").doc(pid).collection("likes");

      const snapshot = await likeRef.get();
      let isFound = false;
      let docId;
      
      snapshot.forEach((doc) => {
        if (bcrypt.compareSync(clientIp, doc.data().userIp)) {
          isFound = true;
          docId = doc.id;
        }
      });

      if (!isFound) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(clientIp, salt);
        await likeRef.add({ 
          userIp: hash,
          timestamp: FieldValue.serverTimestamp()
        });
      } else {
        await likeRef.doc(docId).delete();
      }
      
      res.status(200).json({ message: "Successful" });
    } catch (error) {
      console.error("Error handling like:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
