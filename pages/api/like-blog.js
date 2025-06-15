import db from "../../Firebase/Firebase-admin";
const requestIp = require("request-ip");
const bcrypt = require("bcryptjs");

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      const clientIp = requestIp.getClientIp(req);
      const pid = req.body.id;

      if (!pid) {
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
        // Add like
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(clientIp, salt);
        await likeRef.add({ 
          userIp: hash,
          timestamp: db.FieldValue.serverTimestamp()
        });
      } else {
        // Remove like
        await likeRef.doc(docId).delete();
      }
      
      res.status(200).json({ message: "Successful" });
    } catch (error) {
      console.error("Error handling like:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
