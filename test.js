function getHistory(){
    //here we call chrome.history.search
    //we make its callback function update our html page

    let seconds = 1000 * 60 * 60 * 24 * 7 * 365;
    let oneYearAgo = (new Date).getTime() - seconds;

    chrome.history.search({
        
        'text': '',
        'maxResults':1000000,
        'startTime': oneYearAgo,
        },
        function(result){
            console.log(result);

    });

}

console.log("starting it")



document.addEventListener('DOMContentLoaded', function () {
    console.log("dabadee")
    getHistory();
});