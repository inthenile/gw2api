
## Guild Wars 2 API made with Vanilla JavaScript

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

  
# Updates

Added an abort controller to be able to cancel a search, stopping the fetch request, and make a new one, with the help of a cancel button that appears when a fetch request is going on. It does not look elegant, since I have numerous fetch requests going on. yet it works. Maybe I can work on it in the future, yet right now the functionality is there, and that's the most important thing.
<br>
Refactored the code blocks inside the switch statement into their own functions. This is how I will implement the future fetch requests.
<br>
Handled some errors when the user entered an invalid API key.

<hr>

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

-Finish reefactoring the switch statements into their own functions.
-Fix other endpoints (bank, materials etc.).
-Maybe add a way to add multiple API's and switch between them? (unsure)
-Other pages? More detailed information in a given endpoints?
-Revisit styling

  

# Functional endpoints:

-account; <br>
-account/bank; <br>
-account/achievements; <br>
-accounts/buildstorage;<br>
-account/dyes; <br>
-account/emotes <br>
-account/inventory<br>
-account/minis; <br>
-tokeninfo <br>