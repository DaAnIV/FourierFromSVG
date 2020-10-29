from flask import Flask, render_template
from flask_appconfig import AppConfig

from fourier import fourier_blueprint
from flask_bootstrap import Bootstrap
from os import walk, path


def create_app(configfile=None):
    flask_app = Flask(__name__)
    AppConfig(flask_app, configfile)  # Flask-Appconfig is not necessary, but
                                # highly recommend =)
                                # https://github.com/mbr/flask-appconfig
    Bootstrap(flask_app)

    # in a real app, these should be configured through Flask-Appconfig
    flask_app.config['SECRET_KEY'] = 'devkey'
    flask_app.config['RECAPTCHA_PUBLIC_KEY'] = \
        '6Lfol9cSAAAAADAkodaYl9wvQCwBMr3qGR_PPHcw'

    flask_app.register_blueprint(fourier_blueprint)

    return flask_app


app = create_app()

extra_dirs = ['templates', 'static']
extra_files = extra_dirs[:]
for extra_dir in extra_dirs:
    for dirname, dirs, files in walk(extra_dir):
        for filename in files:
            filename = path.join(dirname, filename)
            if path.isfile(filename):
                extra_files.append(filename)

if __name__ == '__main__':
    app.run(host= '0.0.0.0',debug=True, extra_files=extra_files)
