## Guild Wars 2 API

Here I am fetching Guild Wars 2's API taking in a value from the user which is then used as an access key.
The user can then select whatever endpoint they want to use and see information about their account.
I have used the authenticated endpoint as listed at <a href="https://wiki.guildwars2.com/wiki/API:API_key"> Guild Wars 2 Wiki's API page</a>, there are others, which I might add later.

I did not make any front end design for this; this is simply for fetch API practices without worrying about the design, at least not initially.

The core features are going to be selecting an api endpoint from a dropdown list and being able to make searches. I am implementing pagination again to practice it more.
<br>
Updates: <br>

<strong>
-Added new pagination with previous and next buttons; and only a middle button that shows the current & max page values. Also added an inactive class to change the style to show that there are no more pages. <br>
-Increased (re)usability by making two external functions: 1) fetchRequest(), which was three lines of code used multiple times so I externalised it; it is essentially a simple API fetch. 2) makeNestedArrays(),to make multiple api calls in succession and storing them in an array, for when the data from the account info was more than I could get with a single api call due to api limits. <br>
-Refactored the switch statements to be much more readable and fewer lines of code. <br>

</strong>
-Fixed a bug where saving a new API key would give unexpected results when an option other than "account" was selected. <br>
-Removed unnecessary functions/variables <br>
-Added "account/dyes" functionality. <br>
-Fixed a bug in which if the last page of a section did not have max items, its button would not be created. <br>
-Made the front-end more presentable.

### Known bug(s)
-An endpoint with /:id/ won't work, I have not yet implemented the feature. <br>
<s>-Some results return objects within them that need deconstructing. Some are also null (e.g. in bank storage, which could use some other form of handling)</s> This is fixed in account/bank

### To-do(s)
-Fix other endpoints (bank, materials etc.).
-Maybe add a way to add multiple API's and switch between them? (unsure)

### Functional endpoints:
-account; <br>
-account/bank; <br>
-account/dyes; <br>
-account/emotes <br>
-account/inventory<br>
-account/minis; <br>
-tokeninfo <br>