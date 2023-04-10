const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const movies = []
let filteredMovies = [];
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");


function renderMovieList(data) {
  let rawHTML = ''
  data.forEach( item => {
  //title, image  
  rawHTML += `
  <div class="col-sm-3">
  <div class="mb-2">
    <div class="card" style="width: 18rem;">
    <img src="${
      POSTER_URL + item.image
    }" class="card-img-top" alt="Movie Poster">
    <div class="card-body">
      <h5 class="card-title">${item.title}</h5>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
      item.id
    }">More</button>  
    <button class="btn btn-info btn-add-favorite" data-id="${
      item.id
    }">+</button>  
  </div>
</div>
      </div>
    </div>
    `;
    })
    dataPanel.innerHTML = rawHTML
  }
  
  function renderPaginator(amount) {
    //計算總頁數
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
    //製作 template
    let rawHTML = "";

    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }
    //放回 HTML
    paginator.innerHTML = rawHTML;
  }

  function getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies

    //計算起始 index
    const startIndex = (page - 1) * MOVIES_PER_PAGE;
    //回傳切割後的新陣列
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  }

  function addToFavorite(id) {
    // function isMovieIDMatched(movie) {
    //   return movie.id === id
    // }

    // 回傳左邊或右邊其中一個是true的
    // JSON.parse可將資料變成JS的物件
    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
    const movie = movies.find((movie) => movie.id === id);
    
    if (list.some((movie) => movie.id === id)) {
      return alert("此電影已經在收藏清單中！");
    }

    list.push(movie)
    console.log(list)
    //把JS的資料變成字串
    // const jsonString  = JSON.stringify(list)
    // console.log("json string", jsonString);
    // console.log('json object', JSON.parse(jsonString))
    localStorage.setItem("favoriteMovies", JSON.stringify(list));
  }

  dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
      showMovieModal(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite')) {
      addToFavorite(Number(event.target.dataset.id))
    }
  })
  
  paginator.addEventListener("click", function onPaginatorClicked(event) {
    //如果被點擊的不是 a 標籤，結束
    if (event.target.tagName !== "A") return;

    //透過 dataset 取得被點擊的頁數
    const page = Number(event.target.dataset.page);
    //更新畫面
    renderMovieList(getMoviesByPage(page));
  });

  function showMovieModal(id) {
    const modalTitle = document.querySelector("#movie-modal-title")
    const modalDate = document.querySelector("#movie-modal-date")
    const modalDescription = document.querySelector("#movie-modal-description")
    const modalImage = document.querySelector("#movie-modal-image")

    axios.get(INDEX_URL + id).then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = `Release date: ${data.release_date}`
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
  }



  //...
  //監聽表單提交事件
  searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
    //取消預設事件
    event.preventDefault();
    //取得關鍵字
    const keyword = searchInput.value.trim().toLowerCase()
    //儲存符合篩選條件的項目
    //錯誤處理，輸入無效字串
    // if (!keyword.length) {
    //   return alert ('請輸入有效字串')
    // }

    // 條件篩選 (常用函示: map, filter. reduce)
    filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(keyword)
    );

    //錯誤處理，無符合搜尋的結果
    if(filteredMovies.length === 0) {
      return alert('Cannot find movies with keyword: ' + keyword)
    }

    // 使用迴圈法
    // for (const movie of movies) {
    //   if(movie.title.toLowerCase.includes(keyword)) {
    //     filterMovies.push(movie)
    //   }
    // }

    // 重新輸出至畫面
    renderPaginator(filteredMovies.length)
    renderMovieList(getMoviesByPage(1));
  });

  axios
    .get(INDEX_URL)
    .then((response) => {
      movies.push(...response.data.results);
      renderPaginator(movies.length); //新增這裡
      renderMovieList(getMoviesByPage(1));
    })
    .catch((err) => console.log(err));
  