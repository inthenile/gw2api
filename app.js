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
let resultTitle = document.querySelector(".result-title");
let resultsDiv = document.querySelector(".results");
let pagination = document.querySelector(".pagination");
let fetchInfo = document.querySelector(".fetch-info")
let currentPage = 0;
let itemsPerPage = 10;
let maxPage = 1; //initial value; changes dynamically

//create pages to be displayed each time on a certain page
let title = document.querySelector(".title");
let key = [];
let value = [];

const makePages = async (wrapper, pageNum, perPage, key, value) => {
    fetchInfo.innerText = "";
    wrapper.innerText = "";
    let startPos = pageNum * perPage;
    let endPos =  startPos + perPage;
    if (key) {
        var keysShown =  key.slice(startPos, endPos);
    }
    let valuesShown = value.slice(startPos, endPos)
    
    let pageNumButton = document.querySelector(".page-number");
    let prevButton = document.querySelector(".prev-button");
    let nextButton = document.querySelector(".next-button");

    if(pageNumButton){
        pageNumButton.innerText = `${pageNum+1} of ${maxPage}`;
    }

    //Change highlighting of buttons depending on whether there are no more pages left
    pageNum+1 === maxPage ? nextButton.classList.add("inactive") : nextButton.classList.remove("inactive");
    pageNum+1 === 1 ? prevButton.classList.add("inactive") : prevButton.classList.remove("inactive");

    //if there are key-value pairs, display them 
    if(value){
    for (let i = 0; i < valuesShown.length; i++) {
        if (keysShown) {
            key = keysShown[i]    
        }
            value = valuesShown[i];
            let div = document.createElement("div");
            //Whether there is keys to the values or not, You show up index numbers for the items or the keys themselves
            div.innerHTML = `${!key?(startPos+i+1)+"-" : ""} ${key ? key  : ""} <p style="font-weight: bold">${value}</p>`;
            wrapper.appendChild(div);
        }
    }
}

const paginate = async (data, wrapper, perPage, key, value) => {
    wrapper.innerHTML = "";
    if(data === null || data.length === 0 || data === undefined){   
        fetchInfo.innerHTML = `<p> NOTHING TO SHOW HERE </p>`;
    }else if(typeof data[0][0] !== "object" || typeof data[0]!=="object"){
        maxPage = Math.ceil(data.length / perPage);                 //This is problematic with returned data values that contain nested arrays, which, when deconstructe
                                                                    //return much more elements than their nested array length; that's why I need to check the typeof 
                                                                    //the data as well to determine whether its a nested array or not. Then I can flatten the nested arrays
                                                                    //to get their actual length and calculate page numbers thus
    } else if(typeof data[0][0] === "object" || typeof data[0]==="object"){ 
        let flattenedData = data.flat();
        maxPage = Math.ceil(flattenedData.length / perPage);
    }                                                                    
    
    for(let i = 0; i < 3; i++){
        let buttons = await makeButtons(maxPage, key, value)
        wrapper.appendChild(buttons[i])
    }
}

//create page buttons
const makeButtons = async (maxPage, key, value) => { 
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
            makePages(resultsDiv, currentPage, itemsPerPage, key, value);
        } 
    })

    prevButton.addEventListener("click", () => {
        if(currentPage !== 0){
            currentPage--;
            makePages(resultsDiv, currentPage,itemsPerPage, key, value);       
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

// API CALL
const fetchData = async (searchParam, accessToken) => {
    resultTitle.innerText = "";
    title.innerText= `${searchParam}`;
    currentPage = 0;
    try{
        let apiEndPoint= `https://api.guildwars2.com/v2/${searchParam}?access_token=${accessToken}`;
        if(!accessToken){
            document.querySelector(".info").innerText = "Please use a valid API key.";
        } else {
            let response = await fetch(apiEndPoint);
            let result = await response.json();
            data=[];
            key = [];//emptying these values before filling them up with new data
            value = [];

            //NEED TO PASS AN ARRAY OF IDS AS THE FIRST ARGUMENT
            switch (searchParam) { //these switch statements can be used to return key and value pairs as desired.
                case "account/bank":
                    for (let i = 0; i < result.length; i++) {  //THIS FOR LOOP IS USED MORE OR LESS IN THE SAME MANNER FOR MOST ENDPOINTS
                        const item = result[i];                //MIGHT TURN IT INTO A FUNCTION 
                        if (item !== null) {
                            var {id} = item;
                            value.push(id);
                        }
                    }
                    if(value.length < 200){      //all api end points are limited to 200 
                        data = await fetchRequest(value,"https://api.guildwars2.com/v2/items?ids=", accessToken)
                    } else {
                        data = await makeNestedArray(value,"https://api.guildwars2.com/v2/items?ids=", accessToken);  
                    }
                    
                    value.length = 0;
                    for (let i = 0; i < data.length; i++) {
                        const {icon, name} = data[i];
                        key.push(`<a href=${icon} target="_blank"><img src=${icon}  alt="mini icon" height="30px" width="30px"></a>`)
                        value.push(name);
                    }
                    resultTitle.innerText = "These items are currently in your bank."

                break;

                case "account/minis":
                    if(result.length < 200){     
                        data = await fetchRequest(result, "https://api.guildwars2.com/v2/minis?ids=", accessToken)
                    } else {
                        data = await makeNestedArray(result,"https://api.guildwars2.com/v2/minis?ids=", accessToken); 
                    }
                    console.log(data.length);
                    for (let i = 0; i < data.length; i++) {
                        const element = data[i];
                        const {icon, name} = element //deconstruct them into values you want to pass as key and value pairs to be sent to the dom
                        key.push(`<a href=${icon} target="_blank"><img src=${icon}  alt="mini icon" height="30px" width="30px"></a>`);
                        value.push(name) 
                    }
                    resultTitle.innerText = "Here are the minis you have unlocked"
                break;

                case "account/dyes":
                    if(result.length < 200){  
                        data = await fetchRequest(result, "https://api.guildwars2.com/v2/colors?ids=", accessToken)
                    } else { 
                        data = await makeNestedArray(result,"https://api.guildwars2.com/v2/colors?ids=", accessToken);
                    }
                    for (let i = 0; i < data.length; i++) {
                        const element = data[i];
                        const {name, categories} = element;
                        key.push(categories);
                        value.push(name);
                    }
                    resultTitle.innerText = "Your unlocked dyes are:"
                break;

                case "account/inventory":
                    console.log(result);
                    for (let i = 0; i < result.length; i++) {
                        const element = result[i];
                        const {id} = element;
                        value.push(id);
                        console.log(element);
                    }
                    if(result.length < 200){      
                        data = await fetchRequest(value, "https://api.guildwars2.com/v2/items?ids=", accessToken)
                    } else { //if the API key has more values than 200 we run this and then remove them from the original list
                        data = await makeNestedArray(value,"https://api.guildwars2.com/v2/items?ids=", accessToken);        
                    }
                    value = [];
                    
                    for (let i = 0; i < data.length; i++) {
                        const element = data[i];
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
                    resultTitle.innerText = "These items are currently in your shared inventory."
                    }
                break;
                case "account/emotes":
                        value = Object.values(result);                            
                        resultTitle.innerText = "You have unlocked the following emotes."
                    break;
                case "account/achievements":
                    resultTitle.innerText = "This might take a while depending on the number of achievements you have completed."
                    for (let i = 0; i < result.length; i++) {
                        const element = result[i];
                        const{id} = element;
                        value.push(id);
                    }
                    if (result.length < 200) {
                        data = await fetchRequest(value, "https://api.guildwars2.com/v2/achievements?ids=", accessToken)
                    } else {
                        data = await makeNestedArray(value, "https://api.guildwars2.com/v2/achievements?ids=", accessToken)
                    }
                    value = [];
                    console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        const element = data[i];
                        const{description, name, requirement} = element;
                        key.push(`${name} <br> ${description}`);
                        value.push(requirement);
                    }
                    resultTitle.innerText = "Here are the achievements you have completed."
                    break;
                  
                case "account/buildstorage":
                    let skillsArray = []; //store skills found in the builds
                    for (let i =1;  i <= result.length; i++) { //buildstorage endpoints start at 1
                        let response = await fetchRequest(i, `https://api.guildwars2.com/v2/account/buildstorage/`, accessToken);
                        let {name, profession,specializations, skills} = response;
                        skillsArray.push(skills);
                        let specs = specializations.map((trait) => {
                            return trait.id;
                        })
                        let traits = specializations.map((trait) =>{
                            return trait.traits;
                        })

                        let fetchRes = await fetch(`https://api.guildwars2.com/v2/specializations?ids=${specs}`);
                        let fetchData = await fetchRes.json();
                        let specNames = await fetchData.map((spec) =>{
                            return spec.name;
                        })
                        console.log(specNames);
                        
                        let fetchRes2 = await fetch(`https://api.guildwars2.com/v2/traits?ids=${traits}`);
                        let fetchData2 = await fetchRes2.json();
                        let traitNames = await fetchData2.map((trait) =>{
                            return trait.name;
                        })
                        console.log(traitNames);
                        key.push(`${[name, profession]}<br><p>Traits lines:${specNames}</p><br><p>Traits:${traitNames}<p>`);
                    }
                    for (let i = 0; i < skillsArray.length; i++) {
                        const element = skillsArray[i];
                        console.log(element);
                        const {heal, utilities, elite} = element;
                        //I HAVE TO FETCH MANUALLY HERE BECAUSE OF GW2 API REFUSES TO WORK PROPERLY WITHOUT A COMMA AT THE END SOMETIMES
                        //THE SAME CODE WILL YIELD 3 VALUES INSTEAD OF 4 WITHOUT THE COMMA BEFORE ?access_token
                        let response = await fetch(`https://api.guildwars2.com/v2/skills?ids=${[heal, utilities, elite].flat()},?access_token=${accessToken}`)
                        data = await response.json();
                        const skills = data.map((skill) => {
                            return [`<div class="buildstorage"><img src=${skill.icon} height="30px" width="30px"><p>${[skill.name].join("")}</p></div>`];
                        }); //ENGINER MORTAR ELITE KIT SEEMS BUGGED? IT DOESNT SHOW UP WHEREAS EVERY OTHER ENGINEER ELITE SEEMS OK
                        value.push(skills)
                    }                   
                    dataFound = false; //I want to call paginate and makepages manually for this endpoint
                    await paginate(skillsArray, pagination, itemsPerPage, key);
                    await makePages(resultsDiv, currentPage, itemsPerPage, key, value);
                    resultTitle.innerText = "Here are your builds saved in your build storage"
                    break;

                default: 
                    data = Object.entries(result);
                    key= Object.keys(result);
                    value = Object.values(result);
                    break;
            }

            //using dataFound as a matching value to check whether the fetch was successful or not. If so, we can make pages and paginate, using the data we fetched
            if (dataFound) {
                if (value.length === 0 || data === null || data === undefined) {        //if the results are empty, I don't want to make any pages
                    await paginate(value, pagination, itemsPerPage, key, value);        //and I want to reset old pages
                }else {
                    await paginate(value, pagination, itemsPerPage, key, value);
                    await makePages(resultsDiv, currentPage, itemsPerPage, key, value); 
                }   
            }

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

let dataFound = true;
/*Function that makes multiple api calls in succession for when the data is too much (more than 200) for a single api call.*/
//result values must be an array of ids
async function makeNestedArray(result, url, accessToken) {
    let dataArray = [];
    let nestedDataArray = [];
    while (result.length > 0) {         
        nestedDataArray.push(result.slice(0, 200))
        result.splice(0,199);
    }
    for (let i = 0; i < nestedDataArray.length; i++) { 
        const dataUrl = `${url}${nestedDataArray[i]}?access_token=${accessToken}`;
        console.log(dataUrl);

        try{
            let response = await fetch(dataUrl)
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
//SOME VALUES ARE GOING MISSING
async function fetchRequest(result, url, accessToken){ //for API calls that return less than 200 values.
    let dataUrl = `${url}${result}?access_token=${accessToken}`;
     //This comma is not a mistake; some gw2 api endpoints are buggy with multiple endpoints and do not 
    try{                                                        //Yield the last result unless there is another element after it. The comma imitates this to some extent.
        let response = await fetch(dataUrl);                    //However, this causes problems for fetch results that return a single element since the comma causes an error.
        if (response.ok) {                                      //That is why I check result length first, and if it's a single value, I remove the comma.
            data = await response.json();                       //However, this causes problems for fetch results that return a single element since the comma causes an error.
            dataFound = true;                                   //That is why I re-run the fetch with the comma added if there is an issue without it.
        } else {
            console.log("trying again");
            dataUrl = `${url}${result},?access_token=${accessToken}`;
            try{
            let response = await fetch(dataUrl);                    
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

// Search for different parameters using the selections
let searchButton = document.querySelector(".search-button");
searchButton.addEventListener("click", () => {               
    if (!accessToken) {
        document.querySelector(".info").innerText = "Please save your API key"
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
        fetchData("account", accessToken).catch(err =>{
            document.querySelector(".info").innerText = err;
        });
        };
    })

saveButton.addEventListener("click", () => {
    accessToken = apiKey.value;
    apiKey.value = "";
    localStorage.setItem("accessToken", accessToken);
    document.querySelector(".info").innerText = "Your API key is saved";
    fetchData("account", accessToken).catch(err =>{
        document.querySelector(".info").innerText = "There was a problem";
        console.log(err);
    });
})

