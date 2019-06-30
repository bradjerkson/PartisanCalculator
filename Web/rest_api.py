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
    req_data = request.get_json(force=True)
    if req_data == None:
        return "nothing requested!"
    else:
        print(format(req_data))
        model = PartisanModel("newsmedia.csv", req_data)
        model.run()
        return str(model.score)

if __name__ == "__main__":
    app.run(host="0.0.0.0")

