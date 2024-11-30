import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const dir = path.join(process.cwd(), "_content");

export const getAllBlogPosts = () => {
  const allFiles = fs.readdirSync(dir);
  const allBlogs = allFiles.map((file) => {
    const filePath = path.join(dir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const readTime = readingTime(content);
    return { data, content, readTime };
  });

  // Sort blog posts by 'Id' in descending order
  const sortedBlogs = allBlogs.sort((a, b) => b.data.Id - a.data.Id);

  return sortedBlogs;
};

export const getAllTopics = () => {
  const allFiles = fs.readdirSync(dir);
  const allTopics = allFiles.map((file) => {
    const filePath = path.join(dir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    return data.Topic;
  });

  const filteredTopics = new Set(allTopics);
  return [...filteredTopics];
};
