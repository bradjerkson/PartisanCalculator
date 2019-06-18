const MAXRESULT = 1000000
/*
Modules used

anchorme - for detecting URLs in a string

*/

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
            counts = countHistory(list);
            
    });

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

        /*
        document.body.appendChild(document.createElement('br'));
        document.body.appendChild(document.createTextNode(out_str.hostname));
        document.body.appendChild(document.createElement('br'));
        */
    }
    
    var out = JSON.stringify(output_obj);
    document.body.appendChild(document.createTextNode(out));
    return output_obj;
}


function countHistory(results){
    list = [];
    var dict = new Object();
    for(var i = 0; i < results.length; i++){
        if (results[i] in dict){
            dict[results[i]] += 1;
        }
        else{
            dict[results[i]] = 1;
        }

    }

    console.log(dict);
    return dict;
}



console.log("starting it")



document.addEventListener('DOMContentLoaded', function () {
    console.log("dabadee")
    let retrieved = getHistory();

    
});