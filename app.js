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
let itemsPerPage = 20;

//create pages to be displayed each time on a certain page
const makePages = async (data, wrapper, pageNum, perPage) => {
    wrapper.innerHTML = "";
    pageNum --;
    let startPos = pageNum * perPage;
    let endPos =  startPos + perPage;
    let dataShown =  data.slice(startPos, endPos);
    if(data === null) {
        
    }
    if(typeof data[0][0] === "string"){ //if the first element in the array is string, it must be a key-value pair; simply send it to the DOM 
        for (let i = 0; i < dataShown.length; i++){ 
            let key = dataShown[i][0]
            let value = dataShown[i][1]
            let div = document.createElement("div");
            div.innerHTML = `<p><span style="font-weight: bold">${key}</span> : ${value}</p>`;
            wrapper.appendChild(div);
        }    
    } else if(typeof data[0][0] === "object" || data !== undefined) { //if it is an object, it's likely that its a nested array; deconstruct it and then reflect it to the DOM.

        let newDataArray = data.flat(); //flatten them into a single array
        dataShown = newDataArray.slice(startPos, endPos)
        for (let i = 0; i < dataShown.length; i++) {
            let data = dataShown[i];
            let div = document.createElement("div");
            div.innerHTML = `<p>${data.categories} : <span style="font-weight:bold">${data.name}</span></p>`
            wrapper.appendChild(div);
        }
    }
}

const paginate = async (data, wrapper, perPage) => {
    wrapper.innerHTML = "";

    let pageCount = 0;
    if(data === null || data.length === 0 || data === undefined){ //if results are empty, there is nothing to paginate, but I need to reset the previous pages
        resultsDiv.innerHTML = `<p> NOTHING TO SHOW HERE </p>`;
    }else if(typeof data[0][0] !== "object"){
        pageCount = Math.ceil(data.length / perPage);           //This is problematic with returned data values that contain nested arrays, which, when deconstructe
                                                                    //return much more elements than their nested array length; that's why I need to check the typeof 
                                                                    //the data as well to determine whether its a nested array or not. Then I can flatten the nested arrays
                                                                    //to get their actual length and calculate page numbers thus
    } else if(typeof data[0][0] === "object"){ 

        let flattenedData = data.flat();
        pageCount = Math.ceil(flattenedData.length / perPage);
    }                                                                    
    
    for(let i = 0; i < pageCount; i++){
        let buttons = await makeButtons(data, i+1);
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

// API CALL
const fetchData = async (key, searchParam) => {

    try{
        let apiEndPoint= `https://api.guildwars2.com/v2/${searchParam}?access_token=${key}`;
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

    let resultEntries = Object.entries(result);
    let resultValues = Object.values(result);
    resultsDiv.innerHTML = `<p>Here is your ${searchParam} info:</p>`

    // possible solution for different parameter requirements -- not decided yet
    switch (searchParam) {
        // case "account/bank":
        //`https://api.guildwars2.com/v2/items/${id}?access_token=${key}
            // break;
        // case "account/minis":
        // https://api.guildwars2.com/v2/minis?ids=${resultValues}?access_token=${key}
        //     break;
            
        case "account/dyes":
                let dyes = [];
                if(resultValues.length < 200){      //this api end point is limited to 200 calls in one go
                    try{
                        let dyeUrl = `https://api.guildwars2.com/v2/colors?ids=${resultValues}?access_token=${key}`
                        let response = await fetch(dyeUrl);
                        let data = await response.json();
                        await makePages(data, resultsDiv, currentPage, itemsPerPage);
                        await paginate(data, pagination, itemsPerPage); 
                    } catch (err) {
                        console.log(err);
                    }
                } else { //if the API key has more values than 200 we run this and then remove them from the original list
                    let dyeData = [];
                    while (resultValues.length > 0) {         
                    dyes.push(resultValues.slice(0, 200))
                    resultValues.splice(0,199);
                } //now we can make separate api fetch calls limiting each call to 200 with the new nested arrays inside dyes
                for (let i = 0; i < dyes.length; i++) { 
                    const dyeUrl = `https://api.guildwars2.com/v2/colors?ids=${dyes[i]}?access_token=${key}`;
                    try{
                        let response = await fetch(dyeUrl)
                    if (response.ok) {
                        let data = await response.json();
                        dyeData.push(data);
                        await makePages(dyeData, resultsDiv, currentPage, itemsPerPage);
                        await paginate(dyeData, pagination, itemsPerPage);
                    } else {
                        throw new Error("There was a problem with the query. Try again.")
                    }
                    } catch (err) {
                        document.querySelector(".info").innerText = err;
                    }
                }
                }
            break;
        case "account/inventory":
            console.log(resultEntries);
        break;
        default: 
            if (resultEntries.length === 0 || resultEntries === null || resultEntries === undefined) {  //if the results are empty, I don't want to make any pages
                await paginate(resultEntries, pagination, itemsPerPage);                                //and I want to reset old pages
            }else {
                await makePages(resultEntries, resultsDiv, currentPage, itemsPerPage); 
                await paginate(resultEntries, pagination, itemsPerPage);
            }
        break;
    }
}


// Search for different parameters using the selections
let searchButton = document.querySelector(".search-button");
searchButton.addEventListener("click", () => {               
    if (!accessToken) {
        document.querySelector(".info").innerText = "Please save your API key"
    } else {
        searchParam = document.querySelector("select").value;
        document.querySelector(".info").innerText = "";
        fetchData(accessToken, searchParam).catch(() =>{
            document.querySelector(".info").innerText = "There was something wrong. Refresh";
        });
    }
});

let accessToken = localStorage.getItem("accessToken") //access the token locally if it's been used before, initially it's null.
if(accessToken.length !== 0){
    document.querySelector(".info").innerHTML = `<p>You are already logged in with ${accessToken.slice(1,15)}...</p>
                                                <p>You can change this API by saving another.</p>
                                                <p>You can use the search function.</p>`;
}

let saveButton = document.querySelector(".save-button");
let apiKey = document.querySelector(".api-value");
let searchParam = "account"; // initial value for searchParam
//Save the api key so that you can make API calls with it
apiKey.addEventListener("keypress", (event) =>{ //enable the user to hit enter to send their api key
    if(event.key === "Enter"){
        accessToken = apiKey.value;
        localStorage.setItem("accessToken", accessToken); //add the key locally
        apiKey.value = "";
        document.querySelector(".info").innerText = "Your API key is saved";
        fetchData(accessToken, searchParam).catch(err =>{
            document.querySelector(".info").innerText = err;
        });
        };
    })

saveButton.addEventListener("click", () => {
    accessToken = apiKey.value;
    apiKey.value = "";
    localStorage.setItem("accessToken", accessToken);
    document.querySelector(".info").innerText = "Your API key is saved";
    fetchData(accessToken, searchParam).catch(err =>{
        document.querySelector(".info").innerText = "There was a problem";
        console.log(err);
    });
})

