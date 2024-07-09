// const API_KEY =

let news = [];

const getLatestNews = async () => {
  const url = new URL("https://js-newtimes.netlify.app//top-headlines");
  const response = await fetch(url);
  const data = await response.json();
  news = data.articles;
  console.log("test", news);
};

getLatestNews();
