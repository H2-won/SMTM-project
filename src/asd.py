from flask import Flask, request, jsonify
import sqlite3
from db import selectAll

app = Flask(__name__)


@app.route('/rapper', methods=['POST'])
def rapperName():
    asd = selectAll()
    print(asd)


if __name__ == "__main__":
    app.run(debug=True)
