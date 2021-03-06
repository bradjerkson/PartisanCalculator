const MAXRESULT = 1000000
//Our server
var target = 'http://115.146.93.15';
var id = null;
const errorNoData = `<div class="partisan-results"><div class="partisan-text partisan-error-text">Unfortunately, we have insufficient data! Ensure data collection is enabled in Settings, and keep on expanding your browsing history!</div></div>`

//we want to generate a unique user ID per each chrome extension installed
let stopRecording = false;
console.log("Starting setting for recording: ", localStorage.getItem("stopRecording"));

//Part of our mechanism to store/retrieve options data
function retrieveToggleSettings(){
  $('#checkbox-stoprecording').replaceWith(`<input id="checkbox-stoprecording" type="checkbox" checked data-toggle="toggle" data-size="sm" >`)
}

//Utility function to generate our MTurk string for reward redemption.
//Helps give MTurk workers who complete tasks a memorable code, for easy cross-checking
function returnRandomAnimalName(){
  //https://github.com/boennemann/animals
  animals = ['aardvark', 'albatross', 'alligator', 'alpaca', 'ant', 'anteater', 'antelope', 'ape', 'armadillo', 'baboon', 'badger', 'barracuda', 'bat', 'bear', 'beaver', 'bee', 'bison', 'boar', 'buffalo', 'butterfly', 'camel', 'capybara', 'caribou', 'cassowary', 'cat', 'caterpillar', 'cattle', 'chamois', 'cheetah', 'chicken', 'chimpanzee', 'chinchilla', 'chough', 'clam', 'cobra', 'cockroach', 'cod', 'cormorant', 'coyote', 'crab', 'crane', 'crocodile', 'crow', 'curlew', 'deer', 'dinosaur', 'dog', 'dogfish', 'dolphin', 'donkey', 'dotterel', 'dove', 'dragonfly', 'duck', 'dugong', 'dunlin', 'eagle', 'echidna', 'eel', 'eland', 'elephant', 'elephant-seal', 'elk', 'emu', 'falcon', 'ferret', 'finch', 'fish', 'flamingo', 'fly', 'fox', 'frog', 'gaur', 'gazelle', 'gerbil', 'giant-panda', 'giraffe', 'gnat', 'gnu', 'goat', 'goose', 'goldfinch', 'goldfish', 'gorilla', 'goshawk', 'grasshopper', 'grouse', 'guanaco', 'guinea-fowl', 'guinea-pig', 'gull', 'hamster', 'hare', 'hawk', 'hedgehog', 'heron', 'herring', 'hippopotamus', 'hornet', 'horse', 'human', 'hummingbird', 'hyena', 'ibex', 'ibis', 'jackal', 'jaguar', 'jay', 'jellyfish', 'kangaroo', 'kingfisher', 'koala', 'komodo-dragon', 'kookabura', 'kouprey', 'kudu', 'lapwing', 'lark', 'lemur', 'leopard', 'lion', 'llama', 'lobster', 'locust', 'loris', 'louse', 'lyrebird', 'magpie', 'mallard', 'manatee', 'mandrill', 'mantis', 'marten', 'meerkat', 'mink', 'mole', 'mongoose', 'monkey', 'moose', 'mouse', 'mosquito', 'mule', 'narwhal', 'newt', 'nightingale', 'octopus', 'okapi', 'opossum', 'oryx', 'ostrich', 'otter', 'owl', 'ox', 'oyster', 'panther', 'parrot', 'partridge', 'peafowl', 'pelican', 'penguin', 'pheasant', 'pig', 'pigeon', 'polar-bear', 'pony', 'porcupine', 'porpoise', 'prairie-dog', 'quail', 'quelea', 'quetzal', 'rabbit', 'raccoon', 'rail', 'ram', 'rat', 'raven', 'red-deer', 'red-panda', 'reindeer', 'rhinoceros', 'rook', 'salamander', 'salmon', 'sand-dollar', 'sandpiper', 'sardine', 'scorpion', 'sea-lion', 'sea-urchin', 'seahorse', 'seal', 'shark', 'sheep', 'shrew', 'skunk', 'snail', 'snake', 'sparrow', 'spider', 'spoonbill', 'squid', 'squirrel', 'starling', 'stingray', 'stinkbug', 'stork', 'swallow', 'swan', 'tapir', 'tarsier', 'termite', 'tiger', 'toad', 'trout', 'turkey', 'turtle', 'vicuña', 'viper', 'vulture', 'wallaby', 'walrus', 'wasp', 'water-buffalo', 'weasel', 'whale', 'wolf', 'wolverine', 'wombat', 'woodcock', 'woodpecker', 'worm', 'wren', 'yak', 'zebra']

  return animals[Math.floor(Math.random()*animals.length)]
}

//This creates the unique user ID
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

//Stores unique ID locally in Browser Cache
function generateID(){
  let generateID = null;
  if (localStorage.getItem("userid") === null){
      userid = getRandomToken();
      userid = `${returnRandomAnimalName()}-${userid}`;
      localStorage.setItem("userid", userid);
  }
  else{
    userid = localStorage.getItem("userid");
  }
  console.log("userid is: ", userid);
  return userid;
}

//This appears on first launch, users need to accept T&Cs to use the app
function consentAndTCs(){
  console.log("starting TCs");
  if (localStorage.getItem("acceptedTCs") === null){
    $('#termsConditionsNewUserModal').modal('show');
  }
}

//This also appears on first launch, users need to select from a dropdown list,
//predicting where they are out of one of 7 alignment options, ranging from
// extreme left to extreme right
function predictScore(){
  if (localStorage.getItem("acceptedTCs") === null && localStorage.getItem("predictScore") === null){
    let a = $("#selfScoreFormControlSelect").val();
    console.log("declared self score:", a);
    localStorage.setItem("acceptedTCs", "True");
    localStorage.setItem("predictScore", a);

  }

}


//This generates the last year of browsing history
//It will proceed to send it to the server, unless 'stop recording' is enabled
function getHistory(id){
    //here we call chrome.history.search
    //we make its callback function update our html page
    console.log("Getting History");

    $("#generateHistoryButton").replaceWith('<button id="generateHistoryButtonLoading" class="btn btn-partisan mt-2" type="button" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span></button>');

    //Here we create the "Subjective Ground Truth" prompt, and T&Cs prompt.


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
            if(stopRecording){
              retrieveLastResults();
            }
            else{
              sendURL(list, id);
            }
    });
}

//This is so the user can see their most recent recorded results, if they
//don't want to share their current data.
function retrieveLastResults(){
  if (localStorage.getItem("latestResults") === null || (localStorage.getItem("latestResults") === "Sorry, your browsing history has insufficient data. Keep on browsing!")){
    //const errorNoData = `<div class="partisan-results"><div class="partisan-text partisan-error-text">Unfortunately, we have insufficient data! Ensure data collection is enabled in Settings, and keep on browsing!</div></div>`
    $('#insertHere').append(errorNoData);
  }
  else{
    responseText = localStorage.getItem("latestResults");
    console.log("WE GOT A RESPONSE:", responseText);
    publishResults(responseText);
    $("#generateHistoryButtonLoading").replaceWith('<button type="button" class="btn btn-partisan mt-2" id="generateHistoryButton">Generate History</button>');
  }
}

//this is used to parse URLs in the browsing history, and only retain their
//top level domain URL. A JSON string is prepared for sending to the server.
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
    output_obj.consent = localStorage.getItem("acceptedTCs");
    output_obj.selfscore = localStorage.getItem("predictScore");

    var out = JSON.stringify(output_obj);
    //this line below generates all browsing history
    //document.body.appendChild(document.createTextNode(out));
    return out;
}

//A method inspired by the link below
//Allows one to pipe in a URL, and then filter aspects of the URL as required
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

//Sends the JSON file to the server, and awaits for a response - to send onwards
//to the next function, or otherwise handle any errors.
function sendURL(jsonfile, id){
    var request = new XMLHttpRequest();

    request.open("POST", target.concat('/receive'), true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    console.log("Sending");
    //we need to catch any internal server errors here
    //refactor as fetch API
    console.log(jsonfile);
    request.send(jsonfile);
    function XHRErrorHandler(event){
        console.log("Error");
    }

    request.onload = function(){
        console.log("WE GOT A RESPONSE:", this.responseText);
        let temp = parseFloat(this.responseText).toFixed(2);
        localStorage.setItem("latestResults", this.responseText);
        // We need to accomodate for JSON, we now have score and top 3!


        if( (this.responseText === null) || (this.responseText === "Sorry, your browsing history has insufficient data. Keep on browsing!")){

          $('#insertHere').append(errorNoData);
        }
        else{
          const response = JSON.parse(this.responseText);
          publishResults(response);
        }
        $("#generateHistoryButtonLoading").replaceWith('<button type="button" class="btn btn-partisan mt-2" id="generateHistoryButton">Generate History</button>');
    }
}

//The following code deals with dynamic webpage generation
function publishResults(jsonResponse){
    //console.log(response);
    //TODO: Catch an internal server error response here
    //const jsonResponse = JSON.parse(response);
    console.log(jsonResponse);
    console.log(jsonResponse["topthree"]);
    console.log(jsonResponse["topthreeveracity"]);
    //console.log(jsonResponse["history"]);

    //Enable tooltips
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

    var alignment = partisanScoreToAlignment(jsonResponse["score"]);
    var content_veracity = jsonResponse["topthreeveracity"];
    var historyList = parseHistoryJSON(jsonResponse["history"]);
    var neighbours = jsonResponse["neighbours"];

    console.log(historyList);

    var i;
    var topThree = "";
    for (i = 0; i < 3; i++) {
        topThree = topThree + "<a href='#' data-toggle='tooltip' title='Content Reliability: " + content_veracity[i] + "' >" + jsonResponse['topthree'][i] + "</a><br>"
    }

    //The carousel code below corrensponds to the main results data presented to the user
    const carouselInfoButton = '<button class="btn btn-partisan btn-primary mt-2" data-toggle="modal" display=none data-target="#partisanScoreInfoModal">Info</button>'

    const carouselCode = `<div id="PartisanCarouselResults" class="carousel slide" data-ride="carousel" data-interval="false">
      <div class="carousel-inner">
        <a class="carousel-control-prev align-top" href="#PartisanCarouselResults" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next align-top" href="#PartisanCarouselResults" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
        <div class="carousel-item active text-center">
          <div id='PartisanScoreTitle1' class='row partisan-text rounded mt-5 justify-content-center'><h3>Your Partisan Alignment</h3></row></div>
          <div id='PartisanScoreValue1' class='row partisan-text align-middle partisan-results rounded mt-2 justify-content-center animated fadeIn'><div id="PartisanScoreValueOutput1" class="my-auto"><div class="fade-in">${alignment}</div></div></row></div>
          ${carouselInfoButton}

        </div>
        <div class="carousel-item text-center">
          <div id='PartisanScoreTitle2' class='row partisan-text rounded mt-5 justify-content-center'><h3>Your Top Three News Sites</h3></row></div>
          <div id='PartisanScoreValue2' class='row partisan-text align-middle partisan-results rounded mt-2 justify-content-center animated fadeIn'><div class="my-auto">${topThree}</div></row></div>

          ${carouselInfoButton}
        </div>
        <div class="carousel-item text-center">
          <div id='PartisanScoreTitle3' class='row partisan-text rounded mt-5 justify-content-center'><h3>Your Partisan Score Over Time</h3></row></div>
          <div id='PartisanScoreValue3' class='row partisan-text align-middle partisan-results rounded mt-2 justify-content-center animated fadeIn'><div id="partisanscaleresult" class="my-auto"></div></row></div>

          ${carouselInfoButton}
        </div>
        <div class="carousel-item text-center">
          <div id='PartisanScoreTitle3' class='row partisan-text rounded mt-5 justify-content-center'><h3>What Similar Users Are Viewing</h3></row></div>
          <div id='PartisanScoreValue3' class='row partisan-text align-middle partisan-results rounded mt-2 justify-content-center animated fadeIn'><div id="partisanNeighbours" class="my-auto row"></div></row></div>

          ${carouselInfoButton}
        </div>
      </div>

  </div>`

    $('#fillerDiv').remove();
    if($('#PartisanCarouselResults').length){
        $('#PartisanCarouselResults').replaceWith(carouselCode);
    }
    else{
        $('#insertHere').append(carouselCode);
    }

    //this section generates the MTurk code which participants of the study
    //will enter into MTurk to redeem their reward.
    let partisanNavMTurk = ""
    if(stopRecording){
      partisanNavMTurk = `<div class="column" id="PartisanNavMTurk"> Data Collection Disabled for 24 Hours </div>`
    }
    else{
      partisanNavMTurk = `<div class="column" id="PartisanNavMTurk"> MTurk ID: ${userid} </div>`
    }
    $('#PartisanNavMTurk').replaceWith(partisanNavMTurk);
    generatePartisanScaleResult(jsonResponse["score"].toFixed(2));

    //Ensure we have adequate history here
    if(historyList.length > 3){
      generatePartisanHistoryLinePlot(historyList);
    }
    else{
      $('#partisanscaleresult').append("Sorry, your browsing history has insufficient data. Keep on browsing for a longer period!");
    }

    //If user has no immediate neighbours in terms of political alignment,
    //generate error message.
    if(neighbours.length > 2){
      generatePartisanNeighbours(neighbours);
    }
    else{
      $('#partisanscaleresult').append("Sorry, your browsing history has insufficient data. Keep on browsing for a longer period!");
    }



}

//We extract the response JSON from the server into separate variables
function parseHistoryJSON(history){
  let summaryHistory = [];
  // y/x = a => x = y/a
  maxEntries = 5;
  allEntries = history.length;
  equidistance = Math.floor(allEntries/maxEntries);
  console.log(maxEntries, allEntries, equidistance);

  for (i = 0; i < allEntries; i++){
    if(i%equidistance == 0){
      currDate = history[i]['date'].split(" ").slice(0,3).join("/");
      currScore = history[i]['score'];
      currTopThree = history[i]['topthree'];
      //currResult = `${currDate} ${currScore.toFixed(4)} ${currTopThree} <br>`
      //summaryHistory.push(currResult);

      //let formatDate = d3.timeFormat("%d/%m/%Y");
      let formatDate = d3.timeParse("%d/%m/%Y");

      console.log(currDate, currScore, formatDate(currDate));
      summaryHistory.push({date: formatDate(currDate), value: currScore});
    }
  }

  return summaryHistory;
}


//We map the partisan variable to its closest political class
function partisanScoreToAlignment(partisanValue){
  var whole = Math.round(partisanValue);

  var dict = {
    '3': "Far Right",
    '2': "Right",
    '1': "Right-Centre",
    '0': "Centrist",
    '-1': "Left-Centre",
    '-2': "Left",
    '-3': "Far Left"
  };

  if(whole >= 3){
    return "Far Right";
  }
  else if (whole <= -3){
    return "Far Left";
  }
  else{
    return dict[String(whole)]
  }
}

//We generate the user's political alignment trends over time
function generatePartisanHistoryLinePlot(dataset){
  console.log(dataset[0].date);

  let margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = 420 - margin.left - margin.right,
    height = 110 - margin.top - margin.bottom;

  let n = dataset.length;

  let x = d3.scaleTime()
      .domain(d3.extent(dataset, function(d) { return d.date; }))
      .range([ 0, width ]);

  let svg = d3.select("#partisanscaleresult").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  let y = d3.scaleLinear()
      .domain([d3.min(dataset, function(d) { return +d.value; }), d3.max(dataset, function(d) { return +d.value; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y).ticks(6));



  let line = d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) });



  //dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } });


  svg.append("path")
    .datum(dataset) // 10. Binds data to the line
    .attr("class", "line") // Assign a class for styling
    .attr("d", line); // 11. Calls the line generator

  svg.selectAll(".dot")
      .data(dataset)
    .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d, i) { return x(i) })
      .attr("cy", function(d) { return y(d.value) })
      .attr("r", 5)
        .on("mouseover", function(a, b, c) {
    			console.log(a)
          this.attr('class', 'focus')
  		})
        .on("mouseout", function() {  })

}

//We generate the user's neighbours
function generatePartisanNeighbours(neighbours){
  console.log("neighbours", neighbours);


  for (i = 0; i < neighbours.length-1; i++){

    html = `<div class="neighboursCol col-sm style="height: 8rem;">
              <div id="neighbour${i}" style="width: 12rem;">
                <h6>Neighbour #${i+1}</h6>
                <a href='#' data-toggle='tooltip' title='Content Reliability:${neighbours[i].topthreeveracity[0]}'>${neighbours[i].topthree[0]}</a><br>
                <a href='#' data-toggle='tooltip' title='Content Reliability:${neighbours[i].topthreeveracity[1]}'>${neighbours[i].topthree[1]}</a><br>
                <a href='#' data-toggle='tooltip' title='Content Reliability:${neighbours[i].topthreeveracity[2]}'>${neighbours[i].topthree[2]}</a><br>
              </div>
            </div>
            `

    $('#partisanNeighbours').append(html);
  }

/*
  html = `<div class="neighboursCol col-sm">
            <div id="neighbour${i}" class="card" style="width: 9rem; ">
              <div class="card-header">
                Neighbour ${i}
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><a href='#' data-toggle='tooltip' title='Content Reliability:${neighbours[i].topthreeveracity[0]}'>${neighbours[i].topthree[0]}</a></li>
                <li class="list-group-item"><a href='#' data-toggle='tooltip' title='Content Reliability:${neighbours[i].topthreeveracity[1]}'>${neighbours[i].topthree[1]}</a></li>
                <li class="list-group-item"><a href='#' data-toggle='tooltip' title='Content Reliability:${neighbours[i].topthreeveracity[2]}'>${neighbours[i].topthree[2]}</a></li>
              </ul>
            </div>
          </div>
        `
*/
}


//Conducts the generation of of the graph visualisation
//TODO: Alignment seems to be slightly skewed on X axis
function generatePartisanScaleResult(partisanvalue){
  let width = 400,
      height = 100;

  let data = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];


  // Append SVG
  let svg = d3.select("#PartisanScoreValueOutput1")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("display", "block")
              .attr("margin", "auto")
              .attr("align", "center")


  // Create scale
  let scale = d3.scaleLinear()
                .domain([-5,5])
                .range([0, width-100]);

  console.log("creating partisan scale");
  console.log(scale(partisanvalue));

  let bar1 = svg.append("rect")
        .attr("fill", "blue")
        .attr("x", 600)
        .attr("y", 0)
        .attr("height", 30)
        .attr("width", 2)

  // Add scales to axis
  let x_axis = d3.axisBottom()
                 .scale(scale)
                 .tickValues(data);

  //Append group and insert axis
  svg.append("g")
     .call(x_axis);

  //animation to land the bar on your score
  bar1
    .transition()
    .attr("x",scale(partisanvalue))
    .duration(4000)
    .ease(d3.easeElastic);
  d3.select("g").style('transform', 'translate(10%,10%)')
}




$(window).on('load', function(){
  consentAndTCs();
});

//Things to execute upon the document fully loading
$(document).ready(function () {



    id = generateID();

    $('#userSelfScoreModalConsentButton').on('click', function(event){
      event.preventDefault();
      predictScore();

    });

    //Generates our previous settings
    if(localStorage.getItem("stopRecording") == "true"){
      console.log("retrieving toggle settings");
      stopRecording = true;
      retrieveToggleSettings();
    }

    /*
    This section below acts as a listener for whenever the stopRecording
    toggle is flicked. */
    $(function(){
      $('#checkbox-stoprecording').change(function() {
        if (stopRecording == false){
          stopRecording = true;
        }
        else{
          stopRecording = false;
        }
        console.log("updating setting to :", stopRecording);
        localStorage.setItem("stopRecording", stopRecording);

      });
    });

    /*
    This section below generates the opt-out link with unique user ID */
    $('#optOutLink').replaceWith(`<a title="Contact us at jbf@student.unimelb.edu.au to opt out" target="_top" href=mailto:jbf@student.unimelb.edu.au?subject=User%20Opt%20Out%20Request&body=${id}%20requesting%20to%20withdraw%20from%20survey>Opt out of the survey</a>`)


    $(document).on('click', '#generateHistoryButton', function(){
      getHistory(id);
    });
  });
