import db from "../../../Firebase/Firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: "Blog ID is required" });
  }

  try {
    const viewsRef = db.collection("blogViews").doc(id);
    
    if (req.method === "POST") {
      // Increment view count using proper FieldValue import
      await viewsRef.set({
        views: FieldValue.increment(1),
        lastUpdated: FieldValue.serverTimestamp()
      }, { merge: true });
      
      // Get updated count
      const doc = await viewsRef.get();
      const views = doc.exists ? doc.data().views : 1;
      
      return res.status(200).json({ views });
    }

    if (req.method === "GET") {
      // Get view count
      const doc = await viewsRef.get();
      const views = doc.exists ? doc.data().views : 0;
      
      return res.status(200).json({ views });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
