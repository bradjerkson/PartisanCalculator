from flask import Flask, render_template, request, jsonify



import pandas
import sys, getopt

app = Flask(__name__)

#Only handles GET requests. Effectively a read-only API.


@app.route('/')
def default():
    return "CouchDB API Server: connection successful"


@app.route('/receive', methods=['GET', 'POST'])
def receive(uuid):
    content = request.get_json()
    print(content)
    return uuid

if __name__ == "__main__":
    app.run(host="0.0.0.0")