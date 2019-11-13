const MAXRESULT = 1000000
var target = 'http://115.146.93.15';


//we want to generate a unique user ID per each chrome extension installed


function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    console.log("THIS USER'S TOKEN IS: ", hex);
    return hex;
}


function getHistory(){
    //here we call chrome.history.search
    //we make its callback function update our html page
    console.log("Getting History");

    $("#generateHistoryButton").replaceWith('<button id="generateHistoryButtonLoading" class="btn btn-partisan mt-2" type="button" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span></button>');

    let seconds = 1000 * 60 * 60 * 24 * 7 * 365;
    let oneYearAgo = (new Date).getTime() - seconds;

    chrome.history.search({
        
        'text': '',
        'maxResults': MAXRESULT,
        'startTime': oneYearAgo,
        },
        function(result){
            //console.log(result);
            list = parseHistory(result);
            sendURL(list);
    });
    

}

function parseHistory(result){
    var output_obj = {};
    output_obj.urls = []
    for(var i = 0; i < result.length; i++){
        let str = result[i].title + " - " + result[i].url;
        let url_full_regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        let url_full = new RegExp(url_full_regex);
        let newstr = str.match(url_full);
        try{
            newstr = str.match(url_full)[0];
        }
        catch{
            //pass
        }

        out_str = parseURL(newstr).hostname;
        output_obj.urls.push(out_str);
    }
    output_obj.ID = id;
    //console.log("ID is: ", output_obj.ID);
    var out = JSON.stringify(output_obj);
    //this line below generates all browsing history
    //document.body.appendChild(document.createTextNode(out));
    return out;
}

function parseURL(url) {
    //https://www.abeautifulsite.net/parsing-urls-in-javascript
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

function sendURL(jsonfile){
    var request = new XMLHttpRequest();

    request.open("POST", target.concat('/receive'), true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    console.log("Sending");
    //we need to catch any internal server errors here

    request.send(jsonfile);
    
    if((request.status == 500 || request.status == 502) && request.readyState == 4){
        console.log("err")
        publishResults("Sorry, we're unable to reach the server. Try again later");
    
    }
    else{
        request.onload = function(){
            
            //this.responseText = parseFloat(this.responseText).toFixed(2);
            console.log("WE GOT A RESPONSE:", this.responseText);
            publishResults(parseFloat(this.responseText).toFixed(2));
            $("#generateHistoryButtonLoading").replaceWith('<button type="button" class="btn btn-partisan mt-2" id="generateHistoryButton">Generate History</button>');
        }
    }

}


//This section runs the main body.

let id = null;

//TODO: Fix Async Issue

async function generateID(){
    //TODO: CHeck this actually works on other computers
    console.log("id start");
    let generateID = null;
    chrome.storage.sync.get('userid', async function(items) {
        var userid = items.userid;
        if ( typeof userid === 'undefined' || userid === null ) {
            //continue
            userid = getRandomToken();
            chrome.storage.sync.set({userid: userid}, function() {
                //useToken(userid);
                console.log("creating new Browser ID: ", userid);
            });
        } 
        //TODO: CREATE A CASE TO CHECK ID ON SERVERSIDE
        else {
            console.log("browser ID existing: ", userid);
        }
        generateID = userid;
    });
    console.log("generate ID is: ", generateID);
    return generateID;

}

async function generateEmail(){
    let email = null
    chrome.identity.getProfileUserInfo(async function(val){
        email = val.email;
        console.log("email is ",email);
    });
    return email;
}



document.addEventListener('DOMContentLoaded', function () {
    console.log("starting it");
    //generateHomeScreen();
    
    id = generateEmail();
    if( typeof id === 'undefined' || id === null ){
        id = generateID();
        console.log("id is ", id);
    }

    //console.log(typeof(id));
    //console.log(id);
    
    
    //let retrieved = getHistory();

});
//We attach our custom listeners here

//document.getElementById("generateHistoryButton").addEventListener("click", getHistory());
$(document).ready(function () {
    //generates our history
    $(document).on('click', '#generateHistoryButton', getHistory);
  });




//The following code deals with dynamic webpage generation

function publishResults(response){
    //document.body.appendChild(document.createTextNode("This is your result"));
    //document.body.appendChild(document.createTextNode(response));

    //d3.select('body').append('h2').text("This is your result");
    //d3.select('body').append('p').text(response);
    
    $('#fillerDiv').remove();
    if($('#PartisanScoreTitle').length){
        $('#PartisanScoreTitle').replaceWith("<div id='PartisanScoreTitle' class='row partisan-text rounded mt-5 justify-content-center'><h3>Your Partisan Score</h3></row>");
        $('#PartisanScoreValue').replaceWith("<div id='PartisanScoreValue' class='row partisan-text partisan-results rounded mt-2 justify-content-center animated fadeIn'>"+response+"</row>");

    }
    else{
        $('#insertHere').append("<div id='PartisanScoreTitle' class='row partisan-text rounded mt-5 justify-content-center'><h3>Your Partisan Score</h3></row>");
        $('#insertHere').append("<div id='PartisanScoreValue' class='row partisan-text partisan-results rounded mt-2 justify-content-center animated fadeIn'>"+response+"</row>");
    }
}

function generateHomeScreen(){
    d3.select('body').append('h1').text("Partisan Calculator");

    d3.select('body').append('input');


}
