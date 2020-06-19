import sys
from flask import Flask, render_template, request, jsonify

from analysis import PartisanModel
from partisanDB import PartisanDB

app = Flask(__name__)

#Only handles GET requests. Effectively a read-only API.
#We route the JSON code sent from the client into analysis.py

@app.route("/")
def default():
    return "API Server: connection successful"


@app.route("/receive", methods=['GET','POST'])
def receive():
    print("starting")
    req_data = request.get_json(force=True)
    print(req_data['ID'])
    print(req_data['consent'])
    print(req_data['selfscore'])
    if req_data == None:
        return "nothing requested!"
    else:
        """
        This takes the newsmedia.csv training dataset, as well as
        the user's browsing history.
        """
        model = PartisanModel("newsmedia.csv", req_data)
        model.run()
        if(model.score is not None):
            db = PartisanDB()
            hist_json = model.history.to_json(orient='index')
            neighbours = db.get_neighbours(req_data['ID'], model.score)
            db.add_document(req_data['ID'],req_data['consent'],req_data['selfscore'], hist_json, model.score, model.top_three, model.top_three_veracity, neighbours)
            
            filtered_history = db.filter_history_user(req_data['ID'])

            #filtered_history = db.filter_history_user("eagle-848c27680ceeb864b34c0952b60187b5c84bcb392efefdcbdd8225c7ca9ccf")
            print(filtered_history)
            returnVal = "{"+ "\"score\""+":" + str(model.score) + ",\"topthree\":"  + str(model.top_three) + ",\"topthreeveracity\":" + str(model.top_three_veracity) + ",\"neighbours\":" + str(neighbours)
            returnVal = returnVal + ",\"history\":["
            for entry in filtered_history:
                returnVal = returnVal + entry + ","
            returnVal = returnVal.rstrip(",")
            returnVal = returnVal + "]}"
            return returnVal.replace("'", "\"")
        else:
            return "Sorry, your browsing history has insufficient data. Keep on browsing!"




if __name__ == "__main__":
    app.run(host="0.0.0.0")
