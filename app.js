const endpointArray = [
    "account",
    "account/bank",
    "account/achievements",
    "account/buildstorage",
    "account/dailycrafting",
    "account/dungeons",
    "account/dyes",
    "account/emotes",
    "account/finishers",
    "account/gliders",
    "account/home/cats",
    "account/home/nodes",
    "account/inventory",
    "account/jadebots",
    "account/legendaryarmory",
    "account/luck",
    "account/mailcarriers",
    "account/mapchests",
    "account/masteries",
    "account/mastery/points",
    "account/materials",
    "account/minis",
    "account/mounts/skins",
    "account/mounts/types",
    "account/novelties",
    "account/outfits",
    "account/progression",
    "account/pvp/heroes",
    "account/raids",
    "account/recipes",
    "account/skiffs",
    "account/skins",
    "account/titles",
    "account/wallet",
    "account/worldbosses",
    "characters",
    "characters/:id/backstory", //:id => My%20Character%20Name
    "characters/:id/buildtabs",
    "characters/:id/core",
    "characters/:id/crafting",
    "characters/:id/equipment",
    "characters/:id/heropoints",
    "characters/:id/inventory",
    "characters/:id/quests",
    "characters/:id/recipes",
    "characters/:id/sab",
    "characters/:id/skills",
    "characters/:id/specializations",
    "characters/:id/training",
    "commerce",
    "commerce/delivery",
    "coomerce/transactions",
    "createsubtoken",
    "guild/:id/log", //guild id's can be found under /account/ endpoint
    "guild/:id/members",
    "guild/:id/ranks",
    "guild/:id/stash",
    "guild/:id/storage",
    "guild/:id/teams",
    "guild/:id/trasury",
    "guild/:id/upgrades",
    "pvp/games",
    "pvp/standings",
    "pvp/stats",
    "tokeninfo"
];

/*---PAGINATION---*/
let resultsDiv = document.querySelector(".results");
let pagination = document.querySelector(".pagination");
let currentPage = 1;
let itemsPerPage = 10;

//create pages to be displayed each time on a certain page
const makePages = async (data, wrapper, pageNum, perPage) => {

    wrapper.innerHTML = "";
    pageNum --;
    let startPos = pageNum * perPage;
    let endPos =  startPos + perPage;
    let dataShown =  data.slice(startPos,endPos);
    console.log(dataShown);

    for (let i = 0; i < dataShown.length; i++){
        let key = dataShown[i][0]
        let value = dataShown[i][1]
        let div = document.createElement("div");
        div.innerHTML = `<p>${key} : ${value}</p>`;
        wrapper.appendChild(div);
    }
    if (dataShown.length === 0) {
        resultsDiv.innerHTML = `<p> NOTHING TO SHOW HERE </p>`;
    }
    document.querySelector(".results").innerHTML += `-------------====== END OF RESULTS ========------------------`
}

const paginate = async (data, wrapper, perPage) => {
    wrapper.innerHTML = "";
    let pageCount = Math.ceil(data.length / perPage);
    for(let i = 1; i < pageCount; i++){
        let buttons = await makeButtons(data, i);
        wrapper.appendChild(buttons);
    }
}

//create page buttons
const makeButtons = async (data, page) => {
    currentPage = 1; //current page is always 1 to start with
    let button = document.createElement("button");
    button.innerText = page;

    if (currentPage === page) {
        button.classList.add("active");
    } 

        button.addEventListener("click", () =>{
            currentPage = page;
            let activeButton = document.querySelector(".active");

            if(!button.classList.contains("active")){
                activeButton.classList.remove("active");
                button.classList.add("active");
                makePages(data, resultsDiv, page, itemsPerPage);
            }
        })

    return button;
}


//Create options to be selected using the endpointArray
for (let i = 0; i < endpointArray.length; i++) {
    const element = endpointArray[i];
    let optionEle = document.createElement("option");
    optionEle.innerText = element;
    optionEle.classList.add(element);
    document.querySelector("select").appendChild(optionEle);
}

let selectedParam = document.querySelector("select").value; //declare an initial value, this can change later
// API CALL
const fetchData = async (key, searchParam) => {

    try{
        let apiEndPoint= `https://api.guildwars2.com/v2/${selectedParam}?access_token=${key}`;
        if(!key){
            document.querySelector(".info").innerText = "Please use a valid API key.";
        } else {
            resultsDiv.innerHTML = "Fetching your data"
            let response = await fetch(apiEndPoint);
            let result = await response.json();
            await parseData(key, searchParam, result); 
            
            if(response.status === 503){ //if an endpoint is unavailable throw an error
             throw new Error("This API endpoint is not available at the moment")
            }

            if(response.status === 403) { //if the api permission is not good enough for the search parameter in question
                throw new Error("Your API permissions are not enough for this query.")
            }
        }
    } catch(err){
        document.querySelector(".info").innerText = err;
        console.log("There was an error", err);
    }
}


const parseData = async (key, searchParam, result) => {

    let keys = []
    let values = [] 
    let resultEntries = Object.entries(result);
    
    resultsDiv.innerHTML = `Here is your ${searchParam} info: <br> <br>`


    // possible solution for different parameter requirements -- not decided yet
    switch (searchParam) {
        // case "account/bank":
        //`https://api.guildwars2.com/v2/items/${id}?access_token=${key}
            // break;
        // case "account/minis":
        //https://api.guildwars2.com/v2/minis/${id}?access_token=${key}
            // break;
        // case "account/dyes":
            // let dyeUrl = `https://api.guildwars2.com/v2/colors/${searchParam}?access_token=${key}`
            // break;
        case "account/inventory":
            console.log(resultEntries);
            break;
        default:
                await makePages(resultEntries, resultsDiv, currentPage, itemsPerPage);
                await paginate(resultEntries, pagination, itemsPerPage);
            break;
    }
    return [keys, values];
}


const selectData = async (searchParam) => { //changing the parameter to be searched
    try{
        selectedParam = searchParam;    
    } catch (err){
        console.log("There was an error", err);
    }
}

// Search for different parameters using the selections
let searchButton = document.querySelector(".search-button");
searchButton.addEventListener("click", () => {               
    if (!accessToken) {
        document.querySelector(".info").innerText = "Please save your API key"
    } else {
        let searchParam = document.querySelector("select").value;
        document.querySelector(".info").innerText = "";
        selectData(searchParam).catch(()=>{
            document.querySelector(".info").innerText = "There was something wrong. Refresh";
        });
        fetchData(accessToken, searchParam).catch(() =>{
            document.querySelector(".info").innerText = "There was something wrong. Refresh";
        });
    }
});

let accessToken = localStorage.getItem("accessToken") //access the token locally if it's been used before, initially it's null.
if(localStorage.length !== 0){
    document.querySelector(".info").innerText = `You are already logged in with ${accessToken.slice(1,15)}...
                                                You can change this API by saving another.
                                                You can use the search function.`;
}

let saveButton = document.querySelector(".save-button");
let apiKey = document.querySelector(".api-value");

//Save the api key so that you can make API calls with it
apiKey.addEventListener("keypress", (event) =>{ //enable the user to hit enter to send their api key
    if(event.key === "Enter"){
        accessToken = apiKey.value;
        localStorage.setItem("accessToken", accessToken); //add the key locally
        apiKey.value = "";
        document.querySelector(".info").innerText = "Your API key is saved";
        fetchData(accessToken).catch(err =>{
            document.querySelector(".info").innerText = err;
        });
        };
    })

saveButton.addEventListener("click", () => {
    accessToken = apiKey.value;
    apiKey.value = "";
    localStorage.setItem("accessToken", accessToken);
    document.querySelector(".info").innerText = "Your API key is saved";
    fetchData(accessToken).catch(err =>{
        document.querySelector(".info").innerText = "There was a problem";
        console.log(err);
    });
})

