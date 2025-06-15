import db from "../../../Firebase/Firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: "Blog ID is required" });
  }

  try {
    const commentsRef = db.collection("blogComments").doc(id).collection("comments");

    if (req.method === "GET") {
      const snapshot = await commentsRef.orderBy("timestamp", "desc").get();
      const comments = [];
      
      snapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });

      return res.status(200).json({ comments });
    }

    if (req.method === "POST") {
      const { name, email, message, parentId = null } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required" });
      }

      const newComment = {
        name,
        email: email || "",
        message,
        parentId,
        timestamp: FieldValue.serverTimestamp(),
        reactions: { like: 0, love: 0, celebrate: 0 },
        userReactions: {}
      };

      const docRef = await commentsRef.add(newComment);
      const doc = await docRef.get();
      
      return res.status(201).json({ 
        comment: {
          id: doc.id,
          ...doc.data(),
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
