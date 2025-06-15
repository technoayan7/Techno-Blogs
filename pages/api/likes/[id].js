import db from "../../../Firebase/Firebase-admin";
const requestIp = require("request-ip");
const bcrypt = require("bcryptjs");

export default async (req, res) => {
  const { id } = req.query;
  const blogId = String(id); // Convert to string

  if (!blogId || blogId === 'undefined' || blogId === 'null') {
    return res.status(400).json({ error: "Blog ID is required" });
  }

  try {
    let hasUserLiked = false;
    let totalLikes = 0;
    const clientIp = requestIp.getClientIp(req);
    const likeRef = db.collection("posts").doc(blogId).collection("likes");

    const snapshot = await likeRef.get();
    snapshot.forEach((doc) => {
      if (bcrypt.compareSync(clientIp, doc.data().userIp)) {
        hasUserLiked = true;
      }
      totalLikes++;
    });

    res.status(200).json({ hasUserLiked: hasUserLiked, totalLikes: totalLikes });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
