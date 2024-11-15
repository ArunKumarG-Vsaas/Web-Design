const newsContainer = document.getElementById('newsContainer');
const paginatorContainer = document.getElementById('paginatorContainer');
const spinner = document.getElementById('spinner');
const body = document.getElementById('body');
const searchBox = document.getElementById('searchKey')
let currentPageNews = [];
window.onload = getNews(1);


/**
 * 
 * @param {integer} pageNumber 
 * 
 * @function:
 *      Call the API to get the news from the pageNumber
 */
async function getNews(pageNumber) {
    try{
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
        startSpinner();
        const apiUrl = `http://127.0.0.1:8000/news/specific-page/max_page_count=1/max_news_count=10/page_number=${pageNumber}`;
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();
        
        if(data && data.status == 200){
            currentPageNews = data.data;
            buildNewsHtml(data.data);

             // Build Paginator HTML and set to paginator container
             paginatorContainer.innerHTML = buildPaginatorHtml(pageNumber);
        }
        else{
            // Need to be handled
        }
        stopSpinner();
        
    }
    catch(e){
        console.error(e);
    }
}

/**
 * 
 * @param {array} newsArr
 * 
 * @function:
 *      Loop through the news array and build the HTML and set to newsContainer 
 */
function buildNewsHtml(newsArr){
    try{
        let newsHTML = '';
        if(newsArr && newsArr.length){
            newsArr.forEach(news => {
                // Read the values and build html
                let html = `
                    <div class="news" onClick="openNews('${news['url']}')">
                                <div class="left">
                                    <div class="from">
                                        <div class="logo">
                                            <img src="${news['from']['profile_img']}" alt="">
                                        </div>
                                        <div class="channel">${news['from']['name']}</div>
                                    </div>
                                    <div class="title">${news['title']}</div>
                                    <div class="text">${news['text']}</div>
                                    <div class="date">${news['date']}</div>
                                </div>
                                <div class="right">
                                    <div class="news-img">
                                        <img src="${news['image']}" alt="">
                                    </div>
                                </div>
                            </div>
                    `;
                
                // Concatenate with newsHTML
                newsHTML += html;
            })

            
            // Set the HTML to newsContainer
            newsContainer.innerHTML = newsHTML;
        }
    }
    catch(e){
        console.error(e);
    }

}

/**
 * @param {intarger} currentPage 
 * @returns string
 * 
 * @function:
 *      Generate the paginator HTML with onClick, which calls getNews with pageNumber
 */

function buildPaginatorHtml(currentPage){
    try{
        let paginatorHTML = '';
        for(let i=1;i<=10;i++){
            if(i == currentPage){
                paginatorHTML +=  `<span onClick="getNews(${i})" class="active" id="page${i}">${i}</span>`
            }
            else{
                 paginatorHTML += `<span onClick="getNews(${i})" id="page${i}">${i}</span>`
            }
        }
        return paginatorHTML;
    }
    catch(e){
        console.log(e);
    }
}


// Functionalities
function startSpinner(){
    spinner.style.display = "block";
    console.log(spinner);
    body.classList.add('start-spinner');
}

function stopSpinner(){
    spinner.style.display = "none";
    body.classList.remove('start-spinner');
}

function openNews(url){
    window.location.href = url;
}


function filterNews(){
    let searchKey = searchBox.value;
    if(searchKey && searchKey.length){
        const filteredNews = currentPageNews.filter(news => news['title'].toLowerCase().includes(searchKey.toLowerCase()));
        buildNewsHtml(filteredNews)
    }
    else{
        buildNewsHtml(currentPageNews);
    }
}
