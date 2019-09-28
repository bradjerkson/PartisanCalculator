import sys
from flask import Flask, render_template, request, jsonify

from analysis import PartisanModel

app = Flask(__name__)

#Only handles GET requests. Effectively a read-only API.


@app.route("/")
def default():
    return "API Server: connection successful"


@app.route("/receive", methods=['GET','POST'])
def receive():
    print("starting")
    req_data = request.get_json(force=True)
    #print(req_data['id'])
    if req_data == None:
        return "nothing requested!"
    else:
        model = PartisanModel("newsmedia.csv", req_data)
        model.run()
        return str(model.score)
    

if __name__ == "__main__":
    app.run(host="0.0.0.0")

