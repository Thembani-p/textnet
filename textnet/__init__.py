

from flask import Flask


app = Flask(__name__)
app.secret_key = 'itIsWhatIam,No?'
data_path = "input/"






from textnet.routes import routes_blueprint


app.register_blueprint(routes_blueprint)
