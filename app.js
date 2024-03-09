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


/*Important variables*/ 
let resultTitle = document.querySelector(".result-title");
let resultsDiv = document.querySelector(".results");
let pagination = document.querySelector(".pagination");
let fetchInfo = document.querySelector(".fetch-info")
let currentPage = 0;
let itemsPerPage = 10;
let maxPage = 1; //initial value; changes dynamically


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
        searchParam = document.querySelector("select").value;
        document.querySelector(".info").innerText = "";
        resultsDiv.innerText = "";
        fetchInfo.innerText = "Fetching your data";
        fetchData(searchParam, accessToken).catch(() =>{
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
        resultsDiv.innerText = "";
        console.log("aborted!");
});


let accessToken = localStorage.getItem("accessToken") //access the token locally if it's been used before, initially it's null.
if(accessToken){
    document.querySelector(".info").innerHTML = `<p>You are already logged in with ${accessToken.slice(1,15)}...</p>
                                                <p>You can change this API by saving another.</p>
                                                <p>You can use the search function.</p>`;
}

let saveButton = document.querySelector(".save-button");
let apiKey = document.querySelector(".api-value");
let searchParam = "account"; // initial value for searchParam
//Save the api key so that you can make API calls with it

const saveApiKey = () =>{
    try {
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
        } catch (err) {
            console.log(err);
        }
}

saveApiKey();


/*---PAGINATION---*/
const makePages = async (wrapper, pageNum, perPage, data) => {
    fetchInfo.innerText = "";
    wrapper.innerText = "";
    let startPos = pageNum * perPage;
    let endPos =  startPos + perPage;
    
    //data[0] represents keys, data[1] represents values. Can also pass other parameters as arrays in the next indices, for example count or description can be passed as 
    //arrays into data and be found in data[2] and be reflected onto the DOM etc.
    let dataArray = []

    for (let i = 0; i < data.length; i++) {
        dataArray[i] = data[i].slice(startPos, endPos);
    }
    //if there are key-value pairs, display them 
    for (let i = 0; i < dataArray[1].length; i++) {
            key = dataArray[0][i]    
            value = dataArray[1][i];
            let extra;
            dataArray[2] ? extra = dataArray[2][i] : "";
            let div = document.createElement("div");
            //Whether there is keys to the values or not, You show up index numbers for the items or the keys themselves
            div.innerHTML = `${!key?(startPos+i+1)+"-" : ""} ${key ? key  : ""} <p style="font-weight: bold">${value}</p> ${extra ? extra : ""}`;
            wrapper.appendChild(div);
        }
          
    let pageNumButton = document.querySelector(".page-number");
    let prevButton = document.querySelector(".prev-button");
    let nextButton = document.querySelector(".next-button");

    if(pageNumButton){
        pageNumButton.innerText = `${pageNum+1} of ${maxPage}`;
    }

    //Change highlighting of buttons depending on whether there are no more pages left
    pageNum+1 === maxPage ? nextButton.classList.add("inactive") : nextButton.classList.remove("inactive");
    pageNum+1 === 1 ? prevButton.classList.add("inactive") : prevButton.classList.remove("inactive");


    searchButton.classList.remove("hidden"); //disables the option to cancel the query once the page is loaded
    cancelButton.classList.add("hidden");

}

const paginate = async (data, wrapper, perPage) => {
    wrapper.innerHTML = "";
    if(data === null || data.flat().length === 0 || data === undefined){   
        fetchInfo.innerHTML = `<p> NOTHING TO SHOW HERE </p>`;
    }else{
        maxPage = Math.ceil(data[1].length / perPage);
    }                             
    
    for(let i = 0; i < 3; i++){
        let buttons = await makeButtons(maxPage, data)
        wrapper.appendChild(buttons[i])
    }
}

//create page buttons
const makeButtons = async (maxPage, data) => { 
    let prevButton = document.createElement("button");        
    prevButton.classList.add("prev-button")
    let nextButton = document.createElement("button");
    nextButton.classList.add("next-button")
    prevButton.innerText = "<";
    nextButton.innerHTML = ">";
    let button = document.createElement("button");
    button.classList.add("page-number");
    button.innerText = `${currentPage+1} of ${maxPage}`;

    nextButton.addEventListener("click", () =>{
        if(currentPage+1 < maxPage){
            currentPage++;        
            makePages(resultsDiv, currentPage, itemsPerPage, data);
        } 
    })

    prevButton.addEventListener("click", () => {
        if(currentPage !== 0){
            currentPage--;
            makePages(resultsDiv, currentPage,itemsPerPage, data);       
        }
    }) 
    return [prevButton, button, nextButton];
}

//Create options to be selected using the endpointArray
for (let i = 0; i < endpointArray.length; i++) {
    const element = endpointArray[i];
    let optionEle = document.createElement("option");
    optionEle.innerText = element;
    optionEle.classList.add(element);
    document.querySelector("select").appendChild(optionEle);
}

//This function is called for the initial API calls. The results of which are generally IDs of items or skills and so forth. In order to retrieve the actual information of those IDs
//Secondary API calls must be made to the specific API endpoints, and the results for those must be handled individually. Those secondary API calls take place in handleSearchParam();

const fetchData = async (searchParam, accessToken) => {
    controller = new AbortController(); //each time we search for something, we also create a controller to be
    const signal = controller.signal;   //able to stop the search
    pagination.innerHTML = "";   //reset the buttons as well as the previous results when a new fetch request starts
    resultTitle.innerText = "";
    title.innerText= `${searchParam}`;
    currentPage = 0;
    try{
        let apiEndPoint= `https://api.guildwars2.com/v2/${searchParam}?access_token=${accessToken}`;
        if(!accessToken){
            document.querySelector(".info").innerText = "Please use a valid API key.";
            cancelButton.classList.add("hidden");
            searchButton.classList.remove("hidden");
        } else {
            let response = await fetch(apiEndPoint, {signal});
            console.log(response);
            if(response.status === 503){ //if an endpoint is unavailable throw an error
                throw new Error("This API endpoint is not available at the moment")
               }
   
            if(response.status === 403) { //if the api permission is not good enough for the search parameter in question
                throw new Error("Your API permissions are not enough for this query.")
            }
            if(response.status === 401) { //IF Api key is invalid
                throw {name: "wrong-api", message: "Your API key is INVALID. Enter a new API key."}
            }

            let result = await response.json();
            console.log(result);
            let data = await handleSearchParam(result, searchParam, {signal});

            //using dataFound as a matching value to check whether the fetch was successful or not. If so, we can make pages and paginate, using the data we fetched
            if (dataFound) {
                if (data[1].length === 0 || data === null || data === undefined) {        //if the results are empty, I don't want to make any pages
                    await paginate(data, pagination, itemsPerPage);                       //and I want to reset old pages
                }else {
                    await paginate(data, pagination, itemsPerPage);
                    await makePages(resultsDiv, currentPage, itemsPerPage, data); 
                }   
            }

        }
    } catch(err){
        if (err.name === "AbortError") {
            fetchInfo.innerText = "You cancelled your search.";

        } if (err.name === "wrong-api") {
            fetchInfo.innerText = err.message;
            
        } if (err.name === "ReferenceError"){ //reference error seems to come up when I abort fetch request in the middle of it?
            fetchInfo.innerText = "The search was interrupted.";
        } else {
        console.log(err);
        }
        
    }
}

let dataFound = true; //flag to check whether there is data coming from the fetch requests.
/*Function that makes multiple api calls in succession for when the data is too much (more than 200) for a single api call.*/
//result values must be an array of ids
async function makeNestedArray(result, url, accessToken, {signal} = {}) {
    let dataArray = [];
    let nestedDataArray = [];
    while (result.length > 0) {         
        nestedDataArray.push(result.slice(0, 200))
        result.splice(0,199);
    }
    for (let i = 0; i < nestedDataArray.length; i++) { 
        const dataUrl = `${url}${nestedDataArray[i]}?access_token=${accessToken}`;
        try{
            let response = await fetch(dataUrl, {signal})
        if (response.ok) {
            let data = await response.json();
            dataFound = true;
            dataArray.push(data);
        } else {
            dataFound = false;
            throw new Error("There was a problem with the query.")
        }
        } catch (err) {
            document.querySelector(".info").innerText = err;
            console.log(err);
        }
    }
    return dataArray.flat(); //return the nested arrays as a single array
}

async function fetchRequest(result, url, accessToken, {signal} = {}){ //for API calls that return less than 200 values.
    let dataUrl = `${url}${result}?access_token=${accessToken}`;
     //This comma is not a mistake; some gw2 api endpoints are buggy with multiple endpoints and do not 
    try{                                                        //Yield the last result unless there is another element after it. The comma imitates this to some extent.
        let response = await fetch(dataUrl, {signal});                    //However, this causes problems for fetch results that return a single element since the comma causes an error.
        if (response.ok) {                                      //That is why I check result length first, and if it's a single value, I remove the comma.
            data = await response.json();                       //However, this causes problems for fetch results that return a single element since the comma causes an error.
            dataFound = true;                                   //That is why I re-run the fetch with the comma added if there is an issue without it.
        } else {
            dataUrl = `${url}${result},?access_token=${accessToken}`;
            try{
            let response = await fetch(dataUrl, {signal});                    
            if (response.ok) {                                      
                data = await response.json();
                dataFound = true;
            } else {
            dataFound = false;
            throw new Error("There was a problem with the query.");
            }
        } catch (err) {
            console.log(err);
        }
    }
    }catch (err){
        console.log(err);
    }
    return data;
}


//SEPARATE FUNCTIONS FOR INDIVIDUAL SEARCHPARAMETERS.
/* account/bank */
const handleAccountBank = async (result, key, value, {signal} = {}) => {
    for (let i = 0; i < result.length; i++) {  //THIS FOR LOOP IS USED MORE OR LESS IN THE SAME MANNER FOR MOST ENDPOINTS
        const item = result[i];                //MIGHT TURN IT INTO A FUNCTION 
        if (item !== null) {
            var {id} = item;
            value.push(id);
        }
    }
    if(value.length < 200){      //all api end points are limited to 200 
        response = await fetchRequest(value,"https://api.guildwars2.com/v2/items?ids=", accessToken, {signal})
    } else {
        response = await makeNestedArray(value,"https://api.guildwars2.com/v2/items?ids=", accessToken, {signal});  
    }
    
    value.length = 0;
    for (let i = 0; i < response.length; i++) {
        const {icon, name} = response[i];
        key.push(`<a href=${icon} target="_blank"><img src=${icon}  alt="mini icon" height="30px" width="30px"></a>`)
        value.push(name);
    }
    resultTitle.innerText = "These items are currently in your bank."
    return [key, value]
}

/* account/minis */
const handleAccountMinis = async (result, key, value, {signal} = {}) => {
    if(result.length < 200){     
        response = await fetchRequest(result, "https://api.guildwars2.com/v2/minis?ids=", accessToken, {signal})
    } else {
        response = await makeNestedArray(result,"https://api.guildwars2.com/v2/minis?ids=", accessToken, {signal}); 
    }
    for (let i = 0; i < response.length; i++) {
        const element = response[i];
        const {icon, name} = element //deconstruct them into values you want to pass as key and value pairs to be sent to the dom
        key.push(`<a href=${icon} target="_blank"><img src=${icon}  alt="mini icon" height="30px" width="30px"></a>`);
        value.push(name);
    }
    if (dataFound) {
        resultTitle.innerText = "Here are the minis you have unlocked"
    }
    return [key, value];
}

/* account/dyes */
const handleAccountDyes = async (result, key, value, {signal} = {}) => {
    if(result.length < 200){  
        response = await fetchRequest(result, "https://api.guildwars2.com/v2/colors?ids=", accessToken, {signal})
    } else { 
        response = await makeNestedArray(result,"https://api.guildwars2.com/v2/colors?ids=", accessToken, {signal});
    }
    let dyeIds = [];
    for (let i = 0; i < response.length; i++) {
        const element = response[i];
        let {name, categories, item} = element;//unfortunately some dye's do not have item property, which return undefined. That is why currently not all elements have a corresponding icon
        dyeIds.push(item);
        key.push(`<div>${categories}</div>`);
        value.push(name);
    }
    let dyeData = await makeNestedArray(dyeIds,"https://api.guildwars2.com/v2/items?ids=", accessToken, {signal});
    let dyeIcon = dyeData.map((data) => `<img class="dye-icon" src=${data.icon} heigh="30" width="30">`);
    data=[key,value, dyeIcon]
    if (dataFound) {
        resultTitle.innerText = "Your unlocked dyes are:"
    }

    return [key, value, dyeIcon]
} 

/* account/inventory */
const handleAccountInventory = async (result, key, value, {signal} = {}) => {
    for (let i = 0; i < result.length; i++) {
        const element = result[i];
        const {id} = element;
        value.push(id);
        console.log(element);
    }
    if(result.length < 200){      
        response = await fetchRequest(value, "https://api.guildwars2.com/v2/items?ids=", accessToken, {signal})
    } else { //if the API key has more values than 200 we run this and then remove them from the original list
        response = await makeNestedArray(value,"https://api.guildwars2.com/v2/items?ids=", accessToken, {signal});        
    }
    value = [];
    
    for (let i = 0; i < response.length; i++) {
        const element = response[i];
        if (element.description) {
            let {icon, name, description} = element;        
            key.push([`<a href=${icon} target="_blank"><img src=${icon} alt="mini icon" height="30px" width="30px"></a> <br/> <p>${description}</p>`]);
            value.push(name);                    
        } else {
            let {icon, name} = element;
            let {description} = element.details;
            key.push([`<a href=${icon} target="_blank"><img src=${icon} alt="mini icon" height="30px" width="30px"></a> <br/> <p>${description}</p>`]);
            value.push(name);
        }
    }
    if (dataFound) {
        resultTitle.innerText = "These items are currently in your shared inventory."
    }
    return [key, value]
}

/* account/emotes */
const handleAccountEmotes = async (result, key, value) =>{
    if (result.length > 0) {
        value = Object.values(result);
        resultTitle.innerText = "You have unlocked the following emotes."
    } else {
        resultTitle.innerText = "You have not unlocked any special emotes." //I need to reset button classes here as well, since this fetch returns dataFound to be true
        cancelButton.classList.add("hidden");                               //even when the result array is empty.
        searchButton.classList.remove("hidden");                            
    }     
    return [value]
}
/* account/achievements */
const handleAccountAchievements = async (result, key, value, {signal} = {}) =>{
    resultTitle.innerText = "This might take a while depending on the number of achievements you have completed."
    let arr = [];
    for (let i = 0; i < result.length; i++) {
        const element = result[i];
        const{id} = element;
        arr.push(id);
    }

    if (result.length < 200) {
        response = await fetchRequest(arr, "https://api.guildwars2.com/v2/achievements?ids=", accessToken, {signal})
    } else {
        response = await makeNestedArray(arr, "https://api.guildwars2.com/v2/achievements?ids=", accessToken, {signal})
    }

    for (let i = 0; i < response.length; i++) {
        const element = response[i];
        const{description, name, requirement} = element;
        key.push(`${name} <br> ${description}`);
        value.push(requirement);
    }
    if (dataFound) {
        resultTitle.innerText = "Here are the achievements you have completed."       
    }
    return [key, value]
}
/* account/buildstorage */
const handleAccountBuildstorage = async (result, key, value, {signal} = {}) =>{
    let skillsArray = []; //store skills found in the builds
    for (let i =1;  i <= result.length; i++) { //buildstorage endpoints start at 1
        let response = await fetchRequest(i, `https://api.guildwars2.com/v2/account/buildstorage/`, accessToken, {signal});
        let {name, profession,specializations, skills} = response;
        skillsArray.push(skills);
        let specs = specializations.map((trait) => {
            return trait.id;
        })
        let traits = specializations.map((trait) =>{
            return trait.traits;
        })

        let fetchRes = await fetch(`https://api.guildwars2.com/v2/specializations?ids=${specs}`, {signal});
        let fetchData = await fetchRes.json();
        let specNames = await fetchData.map((spec) =>{
            return spec.name;
        })
        
        let fetchRes2 = await fetch(`https://api.guildwars2.com/v2/traits?ids=${traits}`, {signal});
        let fetchData2 = await fetchRes2.json();
        let traitNames = await fetchData2.map((trait) =>{
            return trait.name;
        })
        key.push(`${[name, profession]}<br><p>Traits lines:${specNames}</p><br><p>Traits:${traitNames}<p>`);
    }
    for (let i = 0; i < skillsArray.length; i++) {
        const element = skillsArray[i];
        const {heal, utilities, elite} = element;
        //I HAVE TO FETCH MANUALLY HERE BECAUSE OF GW2 API REFUSES TO WORK PROPERLY WITHOUT A COMMA AT THE END SOMETIMES
        //THE SAME CODE WILL YIELD 3 VALUES INSTEAD OF 4 WITHOUT THE COMMA BEFORE ?access_token
        let response = await fetch(`https://api.guildwars2.com/v2/skills?ids=${[heal, utilities, elite].flat()},?access_token=${accessToken}`, {signal})
        response = await response.json();
        const skills = response.map((skill) => {
            return [`<div class="buildstorage"><img src=${skill.icon} height="30px" width="30px"><p>${[skill.name].join("")}</p></div>`];
        }); //ENGINER MORTAR ELITE KIT SEEMS BUGGED? IT DOESNT SHOW UP WHEREAS EVERY OTHER ENGINEER ELITE SEEMS OK
        value.push(skills)
    }                   
    dataFound = false; //I want to call paginate and makepages manually for this endpoint
    data = [key, value];
    console.log(data);
    await paginate(data, pagination, itemsPerPage);
    await makePages(resultsDiv, currentPage, itemsPerPage, data);
    resultTitle.innerText = "Here are your builds saved in your build storage"
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
                await handleAccountBuildstorage(result, key, value, {signal});
            break;

            default: 
                key= Object.keys(result);
                value = Object.values(result);
                break;
        }
        if(data.length <= 2){   //Here I check if one of the searchParam switch cases added another array into data. If there are 3 or more arrays, I don't overwrite it. 
            data = [key, value] //Otherwise, I provide a default value here.
        }
        return data;
}