const MAXRESULT = 1000000

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
            parseHistory(result)

    });

}

function parseHistory(result){
    var list = [];
    for(var i = 0; i < result.length; i++){
        //str = result[i];
        let str = result[i].title + " - " + result[i].url;
        //console.log(str);

        let url_full_regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        let url_full = new RegExp(url_full_regex);

        //let url_regex = /(https|http):\/\/(www)?([A-Za-z]*\.|\.)([A-Za-z]*\.|[A-Za-z]*\/)([A-Za-z]*\/)?(com\.au\/?)?/;
        //let url = new RegExp(url_regex);

        let newstr = str.match(url_full);

        /*
        var newstr2 = ""
        try{
            newstr2 = newstr[0]
            let tld = /\w+\.\w+$/
            //newstr2 = newstr2.match(tld)
        }
        catch(err){
            //nuffin
        }
        //let reg = /\w+\.\w+$/;
        //let regstr = newstr.match(reg);
        */
      /*
        Holy grail of regex
        (https|http):\/\/(www)?([A-Za-z]*\.|\.)([A-Za-z]*\.|[A-Za-z]*\/)([A-Za-z]*\/)?(com\.au\/?)?
        */


        document.body.appendChild(document.createElement('br'));
        document.body.appendChild(document.createTextNode(newstr));
        document.body.appendChild(document.createElement('br'));
       /* */
    }
}






console.log("starting it")



document.addEventListener('DOMContentLoaded', function () {
    console.log("dabadee")
    let retrieved = getHistory();

    
});