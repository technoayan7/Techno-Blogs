import fs from "fs";
import path from "path";

const viewsFile = path.resolve(process.cwd(), "views.json");

function readViews() {
  try {
    if (!fs.existsSync(viewsFile)) return {};
    const data = fs.readFileSync(viewsFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading views file:", error);
    return {};
  }
}

function writeViews(data) {
  try {
    fs.writeFileSync(viewsFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing views file:", error);
  }
}

export default function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: "Blog ID is required" });
  }

  let views = readViews();

  if (req.method === "POST") {
    // Increment view count
    views[id] = (views[id] || 0) + 1;
    writeViews(views);
    return res.status(200).json({ views: views[id] });
  }

  if (req.method === "GET") {
    // Get view count
    return res.status(200).json({ views: views[id] || 0 });
  }

  res.status(405).json({ error: "Method not allowed" });
}
