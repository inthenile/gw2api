import { 
    handleAccountBank,
    handleAccountMinis,
    handleAccountDyes,
    handleAccountInventory,
    handleAccountEmotes,
    handleAccountAchievements,
    handleAccountBuildstorage,
    handleAccountWallet
 } from "/searchFunctions.js";
const endpointArray = [
    "account",
    "account/bank",
    "account/achievements",
    "account/buildstorage",
    // "account/dailycrafting",
    // "account/dungeons",
    "account/dyes",
    "account/emotes",
    // "account/finishers",
    // "account/gliders",
    // "account/home/cats",
    // "account/home/nodes",
    "account/inventory",
    // "account/jadebots",
    // "account/legendaryarmory",
    // "account/luck",
    // "account/mailcarriers",
    // "account/mapchests",
    // "account/masteries",
    // "account/mastery/points",
    // "account/materials",
    "account/minis",
    // "account/mounts/skins",
    // "account/mounts/types",
    // "account/novelties",
    // "account/outfits",
    // "account/progression",
    // "account/pvp/heroes",
    // "account/raids",
    // "account/recipes",
    // "account/skiffs",
    // "account/skins",
    "account/titles",
    "account/wallet",
    // "account/worldbosses",
    "characters",
    // "characters/:id/backstory", //:id => My%20Character%20Name
    // "characters/:id/buildtabs",
    // "characters/:id/core",
    // "characters/:id/crafting",
    // "characters/:id/equipment",
    // "characters/:id/heropoints",
    // "characters/:id/inventory",
    // "characters/:id/quests",
    // "characters/:id/recipes",
    // "characters/:id/sab",
    // "characters/:id/skills",
    // "characters/:id/specializations",
    // "characters/:id/training",
    // "commerce",
    // "commerce/delivery",
    // "coomerce/transactions",
    // "createsubtoken",
    // "guild/:id/log", //guild id's can be found under /account/ endpoint
    // "guild/:id/members",
    // "guild/:id/ranks",
    // "guild/:id/stash",
    // "guild/:id/storage",
    // "guild/:id/teams",
    // "guild/:id/trasury",
    // "guild/:id/upgrades",
    // "pvp/games",
    // "pvp/standings",
    // "pvp/stats",
    "tokeninfo"
];

//Create options to be selected using the endpointArray
for (let i = 0; i < endpointArray.length; i++) {
    const element = endpointArray[i];
    let optionEle = document.createElement("option");
    optionEle.innerText = element;
    optionEle.classList.add(element);
    document.querySelector("select").appendChild(optionEle);
}

/*Important variables*/ 
let resultTitle = document.querySelector(".result-title");
let resultsTable = document.querySelector(".results-table");
let pagination = document.querySelector(".pagination");
let fetchInfo = document.querySelector(".fetch-info")
let currentPage = 0;
let itemsPerPage = 10;
let maxPage = 1; //initial value; changes dynamically
let dataFound = true; //flag to check whether there is data coming from the fetch requests.

//create pages to be displayed each time on a certain page
let title = document.querySelector(".title");

// Search for different parameters using the selections
let searchButton = document.querySelector(".search-button");
let cancelButton = document.querySelector(".cancel-button");
let controller; //for aborting fetch requests;

//SAVING API KEY AND BUTTON LOGIC
searchButton.addEventListener("click", () => {              
    if (!accessToken) {
        document.querySelector(".info").innerText = "Please save your API key"
        cancelButton.classList.toggle("hidden");
        searchButton.classList.toggle("hidden");
    } else {
        currentPage = 0;
        document.querySelector(".loading").classList.add("hidden")
        pagination.classList.remove("hidden");
        searchParam = document.querySelector("select").value;
        document.querySelector(".info").innerText = "";
        fetchInfo.innerText = "Fetching your data";
        initialDataFetch(searchParam, accessToken).catch(() =>{
            document.querySelector(".info").innerText = "There was something wrong. Refresh";
        });
    }
});

cancelButton.addEventListener("click", () => {
        //CANCEL QUERY
        controller?.abort("Search was cancelled")
        dataFound = false;
        fetchInfo.innerText = "";
        resultTitle.innerText = "";
        title.innerText = "";
        resultsTable.innerText = "";
        console.log("aborted!");
});


let accessToken = localStorage.getItem("accessToken") //access the token locally if it's been used before, initially it's null.
let saveButton = document.querySelector(".save-button");
let apiKey = document.querySelector(".api-value");
let searchParam = "account"; // initial value for searchParam
//Save the api key so that you can make API calls with it

const saveApiKey = () =>{
    if(accessToken){
        document.querySelector(".info").innerHTML = `<p>You are already logged in with ${accessToken.slice(1,15)}...</p>
                                                    <p>You can change this API by saving another.</p>
                                                    <p class="font-bold">You can now use the search function.</p>`;
    }
    
    apiKey.addEventListener("keypress", (event) =>{ //enable the user to hit enter to send their api key
    if(event.key === "Enter"){
        if (apiKey.value.length > 0) {
            accessToken = apiKey.value;
            apiKey.value = "";    
            localStorage.setItem("accessToken", accessToken); //add the key locally
            document.querySelector(".info").innerText = `Your API key is saved. => ${accessToken} `;
        } else {
            document.querySelector(".info").innerText = "API key cannot be empty.";
        }
    }});
    
    saveButton.addEventListener("click", () => {
        if (apiKey.value.length > 0) {
            accessToken = apiKey.value;
            apiKey.value = "";
            localStorage.setItem("accessToken", accessToken);
            document.querySelector(".info").innerText = `Your API key is saved. => ${accessToken} `;
        } else {
            document.querySelector(".info").innerText = "API key cannot be empty.";
        }
    })
}
saveApiKey();

/*---PAGINATION ---*/

//Divide chunks of data into small pieces of content that will be shown on the page
const divideData = async (pageNum, perPage, data) => {
    let dataList = [];
    let startPos = pageNum * perPage;
    let endPos =  startPos + perPage;
    //this doesnt work for account and token info since they return objects
    if (Array.isArray(data)) {dataList = (data.slice(startPos,endPos))}
    //so I have to do a little bit of a detour
    else{
        let dataObj = {key: [], value:[]}
        let keyPlaceholder = [];
        let valuePlaceholder = [];
        const keys= Object.keys(data);
        const values = Object.values(data);
        for (let i = 0; i < values.length; i++) {
            const key = keys[i];
            const value= values[i];   
            keyPlaceholder.push(key);
            valuePlaceholder.push(value);
        }     
        dataObj.key = keyPlaceholder.slice(startPos, endPos)
        dataObj.value = valuePlaceholder.slice(startPos, endPos)
        return dataObj;
    }
    return dataList;
}


let loadedData = []; //load the fetched data here. It consists of arrays that are indexed by the page number+1 they appear on. So, the 0 indexed array appears on page 1 and so forth.
const makePages = async (dataList, currentPage) => {

    fetchInfo.innerText = "";
    const {key, value} = dataList;
    let result = [];
    for (let i = 0; i < value.length; i++) { //I use value length since sometimes I don't include keys, but values are always there.
        //some basic display styling
        //essentially, if there are no key values, display index values multiplied by the page they are on; so it continues; if there are key values, display key values.
        //the first tertiary check also makes sure you still display the index numbeers even if there are key values.
        result.push(`<tr class="even:bg-gray-300 mt=2"><td class="text-s"> ${key[i] !==undefined ? `${i + (currentPage*10) + 1 } - ` : ""} ${key[i] !== undefined ?  key[i] : i + (currentPage*10) + 1 } -  ${value[i]} </td></tr>`);
    }
    await checkButtonAvailability(maxPage, currentPage); //check whether there are more buttons to go back or forth
    document.querySelector(".table-head").classList.remove("hidden");
    resultsTable.innerHTML = result.join("");

}

const generatePageNumbers = async (data, wrapper, perPage) => {
    wrapper.innerHTML = "";
    if(data === null || data.length === 0 || data === undefined){fetchInfo.innerHTML = `<p> NOTHING TO SHOW HERE </p>`}

    //when the result is only one object with values in it; turn the object into
    if (data.length === undefined) {maxPage = Math.ceil(Object.keys(data).length / perPage)}

    else{maxPage = Math.ceil(data.length / perPage)}                 
    
    if(data.length !== 0){
        for(let i = 0; i < 3; i++){
            let buttons = await makeButtons(maxPage, data)
            wrapper.appendChild(buttons[i])
        }
    }
}

const handleLoadedData = async (currentPage) => {
    let data = loadedData[currentPage];
    const {key, value}= data;    
    let result = [];
    for (let i = 0; i < key.length; i++) {
        result.push(`<tr class="even:bg-gray-300 mt=2"><td> ${key[i] !==undefined ? `${i + (currentPage*10) + 1 } - ` : ""} ${key[i] !== undefined ?  key[i] : i + (currentPage*10) + 1 } -  ${value[i]} </td></tr>`);
    }
    resultsTable.innerHTML = result.join("");
    await checkButtonAvailability(maxPage, currentPage); //check whether there are more buttons to go back or forth
}


//disable the end buttons
const checkButtonAvailability = async (maxPage, pageNum) =>{
    if(maxPage > 0){
        let pageNumButton = document.querySelector(".page-number");
        let prevButton = document.querySelector(".prev-button");
        let nextButton = document.querySelector(".next-button");
        if(pageNumButton){
            pageNumButton.innerText = `${pageNum+1} of ${maxPage}`
        };
        //Change highlighting of buttons depending on whether there are no more pages left
        pageNum+1 === maxPage ? nextButton.setAttribute("disabled", true) : nextButton.removeAttribute("disabled");
        pageNum+1 === 1 ? prevButton.setAttribute("disabled", true) : prevButton.removeAttribute("disabled");
        
        searchButton.classList.remove("hidden"); //disables the option to cancel the query once the page is loaded
        cancelButton.classList.add("hidden");
    } 
}

//buttons make fetch requests
const buttonFetchRequest = async (currentPage, data, searchParam, {signal} = {}) =>{

    if(currentPage >= loadedData.length){
        pagination.classList.toggle("hidden")
        document.querySelector(".loading").classList.toggle("hidden")
        const dividedData = await divideData(currentPage, itemsPerPage, data); 
        const dataResult = await handleSearchParam(dividedData, searchParam, {signal});
        await makePages(dataResult, currentPage)
        pagination.classList.toggle("hidden")
        document.querySelector(".loading").classList.toggle("hidden")
    } else { //if the current page is less than loaded data length, the page must be already in the loadeddata; so don't make a new fetch request
        await handleLoadedData(currentPage); 
    }
}

//create page buttons
const makeButtons = async (maxPage, data) => { 
    let prevButton = document.createElement("button");     
    prevButton.className = `prev-button rounded-lg  mr-2 m-auto mt-2 text-xs w-100 h-8 w-8 p-1 w-24 
                            text-white bg-orange-300 enabled:hover:bg-orange-500 disabled:bg-orange-100`;   
    let nextButton = document.createElement("button");
    nextButton.className = `next-button rounded-lg ml-2 m-auto mt-2 text-xs w-100 h-8 p-1 w-8 
                            text-white bg-orange-300 enabled:hover:bg-orange-500 disabled:bg-orange-100`;
    prevButton.innerText = "<";
    nextButton.innerHTML = ">";
    let button = document.createElement("button");
    button.classList.add("page-number");
    button.innerText = `${currentPage+1} of ${maxPage}`;

    //next button sends a fetch request, prevbutton should read from the loadedData array;
    nextButton.addEventListener("click", async () => {
        if(currentPage + 1 < maxPage){
            currentPage++;
            await buttonFetchRequest(currentPage, data, searchParam);
        }
    })
    prevButton.addEventListener("click", async () =>{
        if(currentPage !== 0){
            currentPage--;
            await buttonFetchRequest(currentPage, data, searchParam);
        }
    })
    return [prevButton, button, nextButton];
}

//This function is called for the initial API calls. The results of which are generally IDs of items or skills and so forth. In order to retrieve the actual information of those IDs
//Secondary API calls must be made to the specific API endpoints, and the results for those must be handled individually. Those secondary API calls take place in handleSearchParam();

const initialDataFetch = async (searchParam, accessToken) => {
    document.querySelector(".table-head").classList.add("hidden");
    loadedData = [] //reset loaded data each time a new seach is made with a different searchParam;
    controller = new AbortController(); //each time we search for something, we also create a controller to be
    const signal = controller.signal;   //able to stop the search
    pagination.innerHTML = "";   //reset the buttons as well as the previous results when a new fetch request starts
    resultTitle.innerText = "";
    resultsTable.innerHTML = "";
    title.innerText= `${searchParam}`;
    currentPage = 0; //reset page when a new request is made

    try{
        let apiEndPoint= `https://api.guildwars2.com/v2/${searchParam}?access_token=${accessToken}`;
        if(!accessToken){
            document.querySelector(".info").innerText = "Please use a valid API key.";
            cancelButton.classList.add("hidden");
            searchButton.classList.remove("hidden");
        } else {
            let response = await fetch(apiEndPoint, {signal});
            //if an endpoint is unavailable throw an error
            if(response.status === 503){throw new Error("This API endpoint is not available at the moment")}
            //if the api permission is not good enough for the search parameter in question
            if(response.status === 403) {throw new Error("Your API permissions are not enough for this query.")}
            //IF Api key is invalid
            if(response.status === 401) {throw {name: "wrong-api", message: "Your API key is INVALID. Enter a new API key."}}
            let result = await response.json();
            const dividedData = await divideData(currentPage, itemsPerPage, result); 
            const dataResult = await handleSearchParam(dividedData, searchParam, {signal});
            await generatePageNumbers(result, pagination, itemsPerPage);
            await makePages(dataResult, currentPage)
        }
    } catch(err){
        cancelButton.classList.add("hidden");
        searchButton.classList.remove("hidden");
        pagination.innerHTML = "";
        if (err.name === "AbortError") {fetchInfo.innerText = "You cancelled your search."}
        if (err.name === "wrong-api") {fetchInfo.innerText = err.message} 
        //reference error seems to come up when I abort fetch request in the middle of it?
        if (err.name === "ReferenceError"){ console.log(err),fetchInfo.innerText = "The search was interrupted."}
        else {console.log(err);fetchInfo.innerText = "There was an error"}
    }
}

//API CALLS: secondary API calls. Result is the result from the initial API call.
const handleSearchParam = async (result, searchParam, {signal} = {}) =>{
    let key = [];
    let value = [];
    let data = [key, value];

        switch (searchParam) { 

            case "account/bank":
                data = await handleAccountBank(result, key, value, {signal});
            break;

            case "account/minis":
                data = await handleAccountMinis(result, key, value,{signal});
            break;

            case "account/dyes":
                data = await handleAccountDyes(result, key, value,{signal});
            break;

            case "account/inventory":
                data = await handleAccountInventory(result, key, value, {signal});
            break;

            case "account/emotes":
                data = await handleAccountEmotes(result, key, value, {signal});
            break;

            case "account/achievements":
                data = await handleAccountAchievements(result, key, value,{signal});   
            break;
                
            case "account/buildstorage": //this function deals with the data in itself, and does not reutrn anything
                data = await handleAccountBuildstorage(result, key, value, {signal});
            break;
            case "account/wallet":
                data = await handleAccountWallet(result, key, value, {signal})
            break;
            case "characters":
                result.forEach(character => {value.push(character)});
                return {key, value};
            default: 
                data = result;
                break;
        }
        //only save data if the data is new. store the items that appeared on the page as an array consisting 2 arrays, first keys, second values.
        if(loadedData.length <= currentPage){loadedData.push(data)}

        return data;
}

export default accessToken;