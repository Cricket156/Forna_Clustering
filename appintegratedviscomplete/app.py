#!flask/bin/python

# used a lot of this tutorial for my application
# http://blog.miguelgrinberg.com/post/designing-a-restful-api-with-python-and-flask

import os
import subprocess
import json
# import test.py
from flask import Flask, jsonify, make_response, request, abort

app = Flask(__name__, static_folder='.')

# post method to update database, request json requests data
# this is the one we need to integrate knockout.js
# requests json containing parameter
# curl -H "Content-Type: application/json" -X POST -d '{"Parameter":"friction"}' http://localhost:5000/input
@app.route('/input', methods=['POST'])
def get_parameter():
    parameterlist = []
    arg = ''
    if not request.json:
        abort(400, "Missing a json in the request")
    app.logger.info(request.json)
    parameter = request.json
    jsonobject = json.loads(parameter)
    for i in jsonobject:
        parameterlist.append(i['Parameter']['Parameter'])
        arg = " ".join(parameterlist)
    cmd = "python ./vis.py -l " + arg
    result = subprocess.call(cmd, shell=True)
    return jsonify('done'), 201

@app.route('/')
# pylint: disable=W0612
def index():
    return app.send_static_file('userinterface.html')

@app.route('/<file>')
# pylint: disable=W0612
def static_root(file):
    return app.send_static_file(file)

@app.route('/js/<path:path>')
# pylint: disable=W0612
def static_js(path):
    return app.send_static_file(os.path.join('js', path))

@app.route('/resultsclustering/<path:path>')
# pylint: disable=W0612
def static_clu(path):
    return app.send_static_file(os.path.join('resultsclustering', path))


@app.route('/css/<path:path>')
# pylint: disable=W0612
def static_css(path):
    return app.send_static_file(os.path.join('css', path))


if __name__ == '__main__':
    app.run(debug=True)
