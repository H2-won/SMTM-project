from flask import *
import json
from db import selectAll, selectAlls

app = Flask(__name__, instance_relative_config=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/main')
def main():
    return render_template('main.html')


@app.route('/rapper', methods=['POST'])
def rapper():
    t = selectAlls()
    print(t)
    name = request.get_json()
    for n in t:
        if (n['name'] == name['name']):
            return jsonify(n['description'])
    return 'hi'


# 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port='5000')
