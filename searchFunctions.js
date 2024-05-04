
import accessToken from "./app.js";

let dataFound = true; //flag to check whether there is data coming from the fetch requests.
let resultTitle = document.querySelector(".result-title");

export async function fetchRequest(result, url, accessToken, {signal} = {}){ //for API calls that return less than 200 values.
    let dataUrl;
    let data;
    //This comma is not a mistake; some gw2 api endpoints are buggy with multiple endpoints and do not
    //Yield the last result unless there is another element after it. The comma imitates this to some extent.
    //However, this causes problems for fetch results that return a single element since the comma causes an error.
    //that is why if the result length is just 1, the comma is removed.
    if(result.length >= 1){dataUrl = `${url}${result},?access_token=${accessToken}`}
    else{dataUrl = `${url}${result}?access_token=${accessToken}`}
    try{                                                        
        let response = await fetch(dataUrl, {signal});          
        if (response.ok) {                                      
            data = await response.json();                       
            dataFound = true;                                   
            } else {
            dataFound = false;
            throw new Error("There was a problem with the query.");
            }
    }catch (err){
        console.log(err);
    }
    return data;
}


//SEPARATE FUNCTIONS FOR INDIVIDUAL SEARCHPARAMETERS.


/* account/bank */
export const handleAccountBank = async (result, key, value, {signal} = {}) => {
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back later");
    } else {
        let itemIds = [];
        for (let i = 0; i < result.length; i++) {  
            const item = result[i];                 
            if (item !== null) {
                var {id} = item;
                if (itemIds.includes(id)) { //GW2 api wont return multiple results for same item ids, so I am making a separate api call; and adding them individually as a key value pair
                    await fetch(`https://api.guildwars2.com/v2/items/${id}`, {signal})
                        .then((data) => data.json())
                        .then((_item) => {
                        const {icon, name} = _item;
                        key.push(`<a class="inline-block" href=${icon} target="_blank"><img src=${icon} alt="item icon" height="30px" width="30px"></a>`)
                        value.push(name );
                    })
                }
                itemIds.push(id);
            }else{ //if the item is null, that is, there are no items in that specific bank slot;
                key.push(`<span eight="30px" width="30px"> X </span>`);
                value.push("This slot is empty.")
            }
        }
        let response = await fetchRequest(itemIds,"https://api.guildwars2.com/v2/items?ids=", accessToken, {signal})

        for (let i = 0; i < response.length; i++) {
            const {icon, name} = response[i];
            key.push(`<a class="inline-block" href=${icon} target="_blank"><img src=${icon} alt="mini icon" height="30px" width="30px"></a>`)
            value.push(name);
        }
        resultTitle.innerText = "These items are currently in your bank."
    }
    return {key, value}
}


/* account/minis */
export const handleAccountMinis = async (result, key, value, {signal} = {}) => {
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back later");
    } else {
        let response = await fetchRequest(result, "https://api.guildwars2.com/v2/minis?ids=", accessToken, {signal})
    
        for (let i = 0; i < response.length; i++) {
            const element = response[i];
            const {icon, name} = element //deconstruct them into values you want to pass as key and value pairs to be sent to the dom
            key.push(`<a class="inline-block" href=${icon} target="_blank"><img src=${icon}  alt="mini icon" height="30px" width="30px"></a>`);
            value.push(name);
        }
        if (dataFound) {resultTitle.innerText = "Here are the minis you have unlocked"}
    }
    return {key, value};
}


/* account/dyes */
export const handleAccountDyes = async (result, key, value, {signal} = {}) => {
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back later");
    } else {
        let response = await fetchRequest(result, "https://api.guildwars2.com/v2/colors?ids=", accessToken, {signal})
        
        let dyeIds = [];
        for (let i = 0; i < response.length; i++) {
            const element = response[i];
            let {name, categories, item} = element;//unfortunately some dye's do not have item property, which return undefined. 
            dyeIds.push(item);
            key.push(`<span>${categories}</span> `);
            value.push(name);
        }
        let dyeData = await fetchRequest(dyeIds,"https://api.guildwars2.com/v2/items?ids=", accessToken, {signal});
        console.log(dyeData);
        let dyeIcon = dyeData.map((data) => ` - <img class="inline-block" class="dye-icon" src=${data.icon} heigh="30" width="30">`);

        //add dyeicons to each matching key;
        for(let i = 0; i < key.length; i++){value[i] += dyeIcon[i] ? dyeIcon[i] : " - Image not found "}

        if (dataFound) {resultTitle.innerText = "Your unlocked dyes are:"}
    }
    return {key, value}
} 


/* account/inventory */
export const handleAccountInventory = async (result, key, value, {signal} = {}) => {
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back later");
    } else {
        for (let i = 0; i < result.length; i++) {
            const element = result[i];
            const {id} = element;
            value.push(id);
            console.log(element);
        }

        let response = await fetchRequest(value, "https://api.guildwars2.com/v2/items?ids=", accessToken, {signal})
    
        value = [];
        
        for (let i = 0; i < response.length; i++) {
            const element = response[i];
            if (element.description) {
                let {icon, name, description} = element;        
                key.push([`<a  href=${icon} target="_blank"><img class="inline-block m-auto" src=${icon} alt="mini icon" height="30px" width="30px"></a> <br/> <p>${description}</p>`]);
                value.push(name);                    
            } else {
                let {icon, name} = element;
                let {description} = element.details;
                key.push([`<a href=${icon} target="_blank"><img class="inline-block m-auto" src=${icon} alt="mini icon" height="30px" width="30px"></a> <br/> <p>${description}</p>`]);
                value.push(name);
            }
        }
        if (dataFound) {resultTitle.innerText = "These items are currently in your shared inventory."}
    }
    return {key, value}
}


/* account/emotes */
export const handleAccountEmotes = async (result, key, value) =>{
    
    let searchButton = document.querySelector(".search-button");
    let cancelButton = document.querySelector(".cancel-button");
    if (result.length > 0) {
        value = Object.values(result);
        resultTitle.innerText = "You have unlocked the following emotes."
    } else {
        resultTitle.innerText = "You have not unlocked any special emotes." //I need to reset button classes here as well, since this fetch returns dataFound to be true
        cancelButton.classList.add("hidden");                               //even when the result array is empty.
        searchButton.classList.remove("hidden");                            
    }     
    return {key, value}
}


/* account/achievements */
export const handleAccountAchievements = async (result, key, value, {signal} = {}) =>{
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back later");
    } else {
        let arr = [];
        for (let i = 0; i < result.length; i++) {
            const element = result[i];
            const{id} = element;
            arr.push(id);
        }

        let response = await fetchRequest(arr, "https://api.guildwars2.com/v2/achievements?ids=", accessToken, {signal})
    
        for (let i = 0; i < response.length; i++) {
            const element = response[i];
            const{description, name, requirement} = element;
            key.push(`${name} <br> ${description}`);
            value.push(requirement);
        }
        if (dataFound) {resultTitle.innerText = "Here are the achievements you have completed."}
    }
    return {key, value}
}


/* account/buildstorage */
export const handleAccountBuildstorage = async (result, key, value, {signal} = {}) =>{
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back later");
    } else {
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
            key.push(`${[name, profession]}<br><p><span class="font-bold">
                                Traits lines:</span>${specNames}</p><p><span class="font-bold">Traits:</span> ${traitNames.join(", ")}<p>`);
        }
        for (let i = 0; i < skillsArray.length; i++) {
            const element = skillsArray[i];
            const {heal, utilities, elite} = element;
            //I HAVE TO FETCH MANUALLY HERE BECAUSE OF GW2 API REFUSES TO WORK PROPERLY WITHOUT A COMMA AT THE END SOMETIMES
            //THE SAME CODE WILL YIELD 3 VALUES INSTEAD OF 4 WITHOUT THE COMMA BEFORE ?access_token
            const req = await fetch(`https://api.guildwars2.com/v2/skills?ids=${[heal, utilities, elite].flat()},?access_token=${accessToken}`, {signal})
            let response = await req.json();
            let skills = response.map((skill) => {
                return [`<div class="flex justify-between items-center w-2/6 m-auto"><img src=${skill.icon} height="30px" width="30px"><p>${skill.name}</p></div>`];
            }); //ENGINER MORTAR ELITE KIT SEEMS BUGGED? IT DOESNT SHOW UP WHEREAS EVERY OTHER ENGINEER ELITE SEEMS OK
            value.push(skills.join(""))
        }                   
        dataFound = false; //I want to call generatePageNumbers and makepages manually for this endpoint

        resultTitle.innerText = "Here are your builds saved in your build storage"
    }
    return {key, value}
}

export const handleAccountWallet = async (result, key, value, {signal} ={}) => {
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back later");
    } else {
        let arr = [];
        let currencyValue = [];
        for (let i = 0; i < result.length; i++){
            const {id, value} =  result[i];
            arr.push(id);
            currencyValue.push(value);
        }
        let response = await fetchRequest(arr, "https://api.guildwars2.com/v2/currencies?ids=", accessToken, {signal})
        for (let i = 0; i < response.length; i++) {
            const {name, description, icon} = response[i];
            key.push(`${name} <img src=${icon} height="30px" width="30px" class="inline"> <b>${currencyValue[i]}</b>`)
            value.push(`${description}`)
        }
    }
    return {key,value}
}

export const handleAccountLegendaryArmory = async (result, key, value, {signal} = {}) =>{
    if (result.length === 0) {
        key.push("Nothing to see here");
        value.push("Come back when you craft some legendary items");
    } else {
        let itemArr = [];
        let countArr = []
        for (let i = 0; i < result.length; i++) {
            const {id, count} = result[i];
            itemArr.push(id);
            countArr.push(count);
        }
        console.log(itemArr, countArr);
        let response = await fetchRequest(itemArr, "https://api.guildwars2.com/v2/items?ids=", accessToken, {signal})
        console.log(response);
        for(let i = 0; i < response.length; i++){
            key.push(response[i].name)
            value.push(`<img src=${response[i].icon} height="30px" width="30px" class="inline"> <span class="ml-2"><b>x${countArr[i]}</b></span>`)
        }
    }
    return {key, value}
}

