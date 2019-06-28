from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

#Only handles GET requests. Effectively a read-only API.


@app.route("/")
def default():
    return "API Server: connection successful"




@app.route("/receive", methods=['GET','POST'])
def receive():
    req_data = request.get_json(force=True)
    print(format(req_data))
    return str(type(req_data))

if __name__ == "__main__":
    app.run(host="0.0.0.0")

