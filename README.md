
## Guild Wars 2 API made with Vanilla JavaScript

[Run the code](#run-the-code)<br>
[Updates](#updates)<br>
[Known bugs](#known-bugs)<br>
[Todos](#to-dos)<br>
[Functional endpoints](#functional-endpoints)<br>

  
<strong>Initial idea</strong>💡 <br>

I am a Guild Wars 2 player, and I essentially wanted to mimic the fundamentals of <a  href=https://gw2efficiency.com/> Guild Wars 2 Efficiency </a> at the most basic level.I wanted to be able to save an API key and return valuable information, albeit without as much detail as GW2 efficiency.


<strong> What the code does </strong> <br>

Here I am fetching Guild Wars 2's API taking in a value from the user which is then used as an access key.

The user can then select whatever endpoint they want to use and see information about their account.

I have used the authenticated endpoint as listed at <a  href="https://wiki.guildwars2.com/wiki/API:API_key"> Guild Wars 2 Wiki's API page</a>, there are others, which I might add later.

This is simply for fetch API practices without worrying about the front-end design. The core features are going to be selecting an api endpoint from a dropdown list and being able to make searches. There is essentially no HTML elements that display any information, and no pages. It is a dynamic page in which the elements change based on the selection of the user. I have implemented pagination again to practice it more.

<br>

# Run the code
```
1- Clone the repository.
2- Run the server locally (e.g. Live Server on VSCode)
3- Get an API key from https://account.arena.net/ , give it the desired permissions (the results will be affected)
4- Save your api key and use the search options!
```
  
# Updates

Created searchFunctions.js and moved the search functions from app.js to thin it out a little. I also commented out the unimplemented search parameters for simplicity for the time being.

<hr> 
OLD UPDATES

Account/wallet param is now functional.
Changed styling to Tailwind CSS to learn it. I have been playing around with it; even though it is somewhat difficult with javascript generated content, but it works very well regardless.


<hr>
I have made some major updates on how the data fetching works. Initially, the way I made fetches were in huge chunks; doing every fetch request that was necessary to display the information to the dom at once. Even if the user didn't go to the second page, the second page fetches were already frontloaded. This was incredibly slow, especially for achievements parameter, which can possibly have thousands of return values. As such, I changed the fetch logic to work with the page buttons. There is one initial fetch that is made for a search param that essentially calculates how many pages there must be, and does the fetch request for the first page. However, other fetch requests (for item name, description, icon and so forth), for other pages are not called until that specific page is clicked on. I then store these values in an array, so when the user goes back and forth to the pages he had already loaded, there won't be other fetch requests and they wil be loaded locally. This array is reset each time a new searchparameter is used.Lastly, added a table to display the results.


Added an abort controller to be able to cancel a search, stopping the fetch request, and make a new one, with the help of a cancel button that appears when a fetch request is going on. It does not look elegant, since I have numerous fetch requests going on. yet it works. Maybe I can work on it in the future, yet right now the functionality is there, and that's the most important thing.
<br>
Refactored the code blocks inside the switch statement into their own functions. This is how I will implement the future fetch requests.
<br>
Handled some errors when the user entered an invalid API key.


I realised I was being incredibly inefficient by passing keys and values separately to functions; so instead I passed keys and values to data; and then deconstructed data where it was needed. This meant that I could also pass other values into data and use them if I wanted to. So I changed all individual key/value variables to be stored in a data variable as arrays. I also removed the switch statement into its own function, as it was doing another task. Essentially, the initial fetchData is getting the first set of results which are a bunch of IDs that belong to skills or items or so forth. And handleSearchParam() function handles these IDs appropriately as each searchParam require different handling.


-Added account/achievements and account/buildstorage <br>
-Added new pagination with previous and next buttons; and only a middle button that shows the current & max page values. Also added an inactive class to change the style to show that there are no more pages. <br>

-Increased (re)usability by making two external functions: 1) fetchRequest(), which was three lines of code used multiple times so I externalised it; it is essentially a simple API fetch. 2) makeNestedArrays(),to make multiple api calls in succession and storing them in an array, for when the data from the account info was more than I could get with a single api call due to api limits. <br>

-Refactored the switch statements to be much more readable and fewer lines of code. <br>
-Fixed a bug where saving a new API key would give unexpected results when an option other than "account" was selected. <br>

-Removed unnecessary functions/variables <br>
-Added "account/dyes" functionality. <br>
-Fixed a bug in which if the last page of a section did not have max items, its button would not be created. <br>
-Made the front-end more presentable.

  

# Known bug(s)

-An endpoint with /:id/ won't work, I have not yet implemented the feature. <br>
<s>-Some results return objects within them that need deconstructing. Some are also null (e.g. in bank storage, which could use some other form of handling)</s> This is fixed in account/bank

  

# To-do(s)
-add a function to recall the fetch if loading takes too long?
-rewrite buildstorage to display only one build template at a time? maybe <br>
<s>-Revisit styling?</s> Swapped over to Tailwind, will update as I go. <br>
-add more information as key-value pairs to be displayed for specific endpoints (how many items are in the bank, shared inventory and so forth?) <br>
<s>-Maybe use a table instead of grids for results?</s> <br>
-Fix other endpoints (bank, materials etc.). <br>
<s>-Change it so that not all data is fetched immediately; data should be fetched and saved when user flips through pages? Make the initial fetch request and get the length of the result; then call pagination and makePage; only then call each fetch request as the user clicks next button? Save the results that have already been fetched so they don't have to be fetched each time the page is visited after the initial request.</s> <br>
-Maybe add a way to add multiple API's and switch between them? (unsure) <br>
-Other pages? More detailed information in a given endpoint? <br>

  

# Functional endpoints:

-account; <br>
-account/bank; <br>
-account/achievements; <br>
-accounts/buildstorage;<br>
-account/dyes; <br>
-account/emotes <br>
-account/inventory<br>
-account/minis; <br>
-account/wallet <br>
-characters <br>
-tokeninfo <br>