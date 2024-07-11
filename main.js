const API_KEY = "8a9ddcadd13540dfa904bc787da325aa";
const API_URL =
  "https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines";

let newsList = [];
let url = new URL(`${API_URL}?country=us&apiKey=${API_KEY}`);
const menus = document.querySelectorAll(".menus button, .side-menu-list");
menus.forEach((menu) =>
  menu.addEventListener("click", (event) => getNewsByCategory(event))
);

// 페이지네이션 기본 값 설정
let totalResults = 0;
let page = 1;
const pageSize = 10;
const groupSize = 5;

const getNews = async () => {
  try {
    url.searchParams.set("page", page); // 페이지네이션을 위한 파라미터 값을 추가한 후 url을 호출(fetch(url)) 해야함.
    url.searchParams.set("pageSize", pageSize);

    const response = await fetch(url);
    const data = await response.json();
    if (response.status === 200) {
      if (data.articles.length != 0) {
        newsList = data.articles;
        totalResults = data.totalResults;
        render();
        paginationRender();
      } else {
        throw new Error("No result for this search");
      }
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    errorRender(error.message);
  }
};

const getLatestNews = async () => {
  url = new URL(`${API_URL}?country=us&apiKey=${API_KEY}`);
  getNews();
};
getLatestNews();

// 버튼에 클릭이벤트 주기
// 카테고리별 뉴스 가져오기
const getNewsByCategory = async (event) => {
  const category = event.target.textContent.toLowerCase();
  url = new URL(`${API_URL}?country=us&category=${category}&apiKey=${API_KEY}`);
  getNews();
};

const getNewsByKeyword = async () => {
  const keyword = document.getElementById("search-input").value;
  url = new URL(`${API_URL}?country=us&q=${keyword}&apiKey=${API_KEY}`);
  page = 1; // 검색 후 페이지 1로 설정
  getNews();
};

document
  .querySelector(".search-button")
  .addEventListener("click", getNewsByKeyword);

const render = () => {
  console.log(newsList);
  const newsHTML = newsList
    .map((news) => {
      const newsTitle =
        news.title === "[Removed]" ? "삭제된 기사 입니다." : news.title;
      const newsDescription =
        news.description === "" ||
        news.description === null ||
        news.description === "[Removed]"
          ? "내용없음"
          : news.description.length > 200
          ? `${news.description.slice(0, 200)}...`
          : news.description;
      const newsImage =
        news.urlToImage != null
          ? `${news.urlToImage}`
          : "src/image-not-available.png";
      const newsSource =
        news.source.name === null || news.source.name === "[Removed]"
          ? "no source"
          : news.source.name;
      const newsPublishedAt = moment(news.publishedAt).startOf("day").fromNow();
      const newsUrl =
        news.url === "https://removed.com"
          ? "https://www.nytimes.com/"
          : news.url;

      return `
    <a href="${newsUrl}" target="_blank" class="news-a-tag">
     <div class="row news">
      <div class="col-lg-4">
        <img class="news-img-size" src="${
          news.urlToImage ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU"
        }" />
      </div>
      <div class="col-lg-8">
       <h2>${newsTitle}</h2>
       <p>${newsDescription}</p>
       <div>${newsSource} * ${newsPublishedAt}</div>
      </div>
     </div>
    </a>`;
    })
    .join(""); // 배열에 있는 , 지우기 위해 .join 사용

  document.getElementById("news-board").innerHTML = newsHTML;

  document.querySelectorAll(".news-img-size").forEach((item) => {
    item.addEventListener("error", function () {
      this.src = "src/image-not-available.png";
    });
  });
};

const errorRender = (errorMessage) => {
  const errorHTML = `
  <div class="alert alert-secondary" role="alert">
    ${errorMessage}
  </div>`;

  document.getElementById("news-board").innerHTML = errorHTML;
};

const enterkey = () => {
  if (window.event.keyCode == 13) {
    getNewsByKeyword();
  }
};

document.querySelector("#search-input").addEventListener("keyup", enterkey);

const openSearchBox = () => {
  let searchArea = document.getElementById("search-box");
  if (searchArea.style.display === "none") {
    searchArea.style.display = "inline";
  } else {
    searchArea.style.display = "none";
  }
};
document.querySelector(".search-icon").addEventListener("click", openSearchBox);

// 사이드 메뉴
const openNav = () => {
  document.getElementById("mySidenav").style.width = "250px";
};
document.querySelector(".hamburger-icon").addEventListener("click", openNav);

const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
};
document.querySelector(".closebtn").addEventListener("click", closeNav);

// 페이지네이션
// totalResult(전체 결과 수), page(현재 페이지), pageSize(한번에 보여주는 페이지 사이즈), groupSize(한 페이지에 몇개 그룹으로 보여줄 수) => 내가 초기화 해줘야 할 값
// 위를 통해 totalPages(총 페이지 수), pageGroup(현재 페이지가 속한 그룹), lastPage(현재 페이지의 마지막 페이지), firstPage(현재 페이지의 첫번째 페이지)를 계산할 수 있음
const paginationRender = () => {
  let paginationHTML = "";
  const totalPages = Math.ceil(totalResults / pageSize);
  const pageGroup = Math.ceil(page / groupSize);
  let lastPage = pageGroup * groupSize;
  if (lastPage > totalPages) {
    lastPage = totalPages;
  }
  let firstPage =
    lastPage - (groupSize - 1) <= 0 ? 1 : lastPage - (groupSize - 1);
  if (firstPage >= groupSize + 1) {
    paginationHTML = `<li class="page-item ${
      page === 1 ? "disabled" : ""
    }"><a class="page-link" pageNum="${1}" href="#">&lt&lt</a></li>
    <li class="page-item ${
      page === 1 ? "disabled" : ""
    }"><a class="page-link" pageNum="${page - 1}" href="#">&lt</a></li>`;
  }

  if (lastPage > totalPages) {
    lastPage = totalPages;
  }

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `<li class="page-item ${
      i === page ? "active" : ""
    }" ><a class="page-link" pageNum="${i}" href="#">${i}</a></li>`;
  }
  if (lastPage < totalPages)
    paginationHTML += `<li class="page-item ${
      page === totalPages ? "disabled" : ""
    }"><a class="page-link" pageNum="${page + 1}" href="#">&gt</a></li>
  <li class="page-item ${
    page === totalPages ? "disabled" : ""
  }"><a class="page-link" pageNum="${totalPages}" href="#">&gt&gt</a></li>`;

  document.querySelector(".pagination").innerHTML = paginationHTML;

  document.querySelectorAll(".page-item").forEach((item) => {
    item.addEventListener("click", moveToPage);
  });
};

const moveToPage = (event) => {
  const pageNum = parseInt(event.target.getAttribute("pageNum")); // parseInt 문자열을 정수로 변환하는 역할.
  // 현재페이지가 계산한 페이지 수 범위 안(1 ~ Math.ceil(totalResults / pageSize)) 일때 랜더 해야함.
  if (pageNum > 0 && pageNum <= Math.ceil(totalResults / pageSize)) {
    page = pageNum;
    paginationRender();
    getNews();
  }
};
