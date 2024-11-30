import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaLaptop, FaTwitter } from "react-icons/fa";
import { getAllTopics } from "../Lib/Data";

export const getStaticProps = () => {
  const allTopics = getAllTopics();
  return {
    props: {
      topics: allTopics,
    },
  };
};

function about({ topics }) {
  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900">
      <Navbar topics={topics} />
      <div className="max-w-2xl pt-20 pb-32 px-6 text-center mx-auto">
        <div className="h-64 w-full justify-center flex">
          <img src="/about.png" className="h-64" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-700 py-4 dark:text-gray-200">
          Hi,{" "}
          <span className="bg-indigo-400 text-white rounded px-1 dark:bg-indigo-500">
            I’m Ayan
          </span>{" "}
          . Nice to meet you.
        </h2>
        <p className="text-gray-600 mt-4 dark:text-indigo-200">
          I am a final-year undergrad at IIIT Allahabad pursuing a Bachelor of Technology in Information Technology. I am highly interested in algorithmic problem-solving and have a firm grasp in data structures and algorithms. In my one year of experience of practicing competitive programming, I have climbed up to the Specialist at Codeforces ( Solved Over More than 600 problems ) and a 4🌟 at Codechef.
          I am Web Development enthusiast and have made quite a few Projects in React Js and Firebase. I am currently learning more about MongoDB, Express, React, Node.
        </p>

        <div className="text-center pt-8">
          <button className="bg-indigo-500 px-3 py-1 font-semibold text-white inline-flex items-center space-x-2 rounded dark:bg-indigo-600">
            <FaLaptop />
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://technoayan.vercel.app/"
            >
              See My Works
            </a>
          </button>

          <button className="bg-indigo-500 px-3 py-1 font-semibold text-white inline-flex items-center space-x-2 rounded ml-3 dark:bg-indigo-600">
            <FaTwitter />
            <a
              className="twitter-follow-button"
              rel="noopener noreferrer"
              target="_blank"
              href="https://twitter.com/technoayan7"
            >
              Follow Me
            </a>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default about;
