/*
function(doc){
  if(doc.userid = "4d15a220f7671654c5f9b63197850edd6e5b14863bc7daa52c6c6fb1e9cd012" ){
    emit(doc.userid, doc);
  }
}
*/
{
  "views":{
    "all": {
        "map": "function(doc){ if(doc.userid = '4d15a220f7671654c5f9b63197850edd6e5b14863bc7daa52c6c6fb1e9cd012' ){emit(doc.userid, doc);}}",
    }
  }
}
