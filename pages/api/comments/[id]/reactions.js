import db from "../../../../Firebase/Firebase-admin";

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === "POST") {
    const { commentId, reaction, userId = "anonymous" } = req.body;
    
    try {
      const commentRef = db.collection("blogComments").doc(id).collection("comments").doc(commentId);
      const commentDoc = await commentRef.get();
      
      if (!commentDoc.exists) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const commentData = commentDoc.data();
      const reactions = commentData.reactions || { like: 0, love: 0, celebrate: 0 };
      const userReactions = commentData.userReactions || {};

      // Toggle reaction
      if (userReactions[userId] === reaction) {
        // Remove reaction
        reactions[reaction] = Math.max(0, reactions[reaction] - 1);
        delete userReactions[userId];
      } else {
        // Remove previous reaction if exists
        if (userReactions[userId]) {
          reactions[userReactions[userId]] = Math.max(0, reactions[userReactions[userId]] - 1);
        }
        // Add new reaction
        reactions[reaction] = reactions[reaction] + 1;
        userReactions[userId] = reaction;
      }

      await commentRef.update({
        reactions,
        userReactions
      });
      
      const updatedDoc = await commentRef.get();
      return res.status(200).json({ comment: updatedDoc.data() });
    } catch (error) {
      console.error("Error handling reaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
