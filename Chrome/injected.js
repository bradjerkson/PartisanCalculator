console.log("injected.js start");


function interceptData() {
    var xhrOverrideScript = document.createElement('script');
    xhrOverrideScript.type = 'text/javascript';
    xhrOverrideScript.innerHTML = `
    (function() {
      var XHR = XMLHttpRequest.prototype;
      var send = XHR.send;
      var open = XHR.open;
      XHR.open = function(method, url) {
          this.url = url; // the request url
          return open.apply(this, arguments);
      }
      XHR.send = function() {
          this.addEventListener('load', function() {
              if (this.url.includes('<url-you-want-to-intercept>')) {
                  var dataDOMElement = document.createElement('div');
                  dataDOMElement.id = '__interceptedData';
                  dataDOMElement.innerText = this.response;
                  dataDOMElement.style.height = 0;
                  dataDOMElement.style.overflow = 'hidden';
                  document.body.appendChild(dataDOMElement);
              }               
          });
          return send.apply(this, arguments);
      };
    })();
    `
    document.head.prepend(xhrOverrideScript);
  }
  function checkForDOM() {
    if (document.body && document.head) {
      interceptData();
    } else {
      requestIdleCallback(checkForDOM);
    }
  }
  requestIdleCallback(checkForDOM);

  function scrapeData() {
    var responseContainingEle = document.getElementById('__interceptedData');
    if (responseContainingEle) {
        console.log("injected response");
        console.slog(response);
        var response = JSON.parse(responseContainingEle.innerHTML);
    } else {
        requestIdleCallback(scrapeData);
    }
}
requestIdleCallback(scrapeData); 


/*
var currentTab;
var version = "1.0";

chrome.tabs.query( //get current Tab
    {
        currentWindow: true,
        active: true
    },
    function(tabArray) {
        currentTab = tabArray[0];
        chrome.debugger.attach({ //debug at current tab
            tabId: currentTab.id
        }, version, onAttach.bind(null, currentTab.id));
    }
)


function onAttach(tabId) {

    chrome.debugger.sendCommand({ //first enable the Network
        tabId: tabId
    }, "Network.enable");

    chrome.debugger.onEvent.addListener(allEventHandler);

}

function allEventHandler(debuggeeId, message, params) {

    if (currentTab.id != debuggeeId.tabId) {
        return;
    }

    if (message == "Network.responseReceived") { //response return 
        chrome.debugger.sendCommand({
            tabId: debuggeeId.tabId
        }, "Network.getResponseBody", {
            "requestId": params.requestId
        }, function(response) {
            // you get the response body here!
            // you can close the debugger tips by:
            chrome.debugger.detach(debuggeeId);
        });
    }

}*/