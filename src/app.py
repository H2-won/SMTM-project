from flask import *

app = Flask(__name__, instance_relative_config=True)

@app.route('/')
def index():
       return render_template('index.html')

@app.route('/main')
def main():
       return render_template('main.html')

### 실행
if __name__ == '__main__':
	app.run(host='0.0.0.0', debug=True, port='5000')