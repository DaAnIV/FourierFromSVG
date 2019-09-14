import cmath
import sys
from flask import Blueprint, render_template, request, jsonify, current_app
from scipy import integrate
import numpy as np
import matplotlib.pyplot as plt
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms.fields import SubmitField, IntegerField
from svgpathtools import svg2paths
from svg2paths_ext import svg_file2paths

fourier_blueprint = Blueprint('fourier', __name__)


class FourierForm(FlaskForm):
    svg_file = FileField(u"SVG to plot", validators=[
        FileRequired(),
        FileAllowed(['svg'], 'svgs only!')
    ])
    canvas_width = IntegerField(u"The canvas width to plot on")
    canvas_height = IntegerField(u"The canvas height to plot on")
    number_of_circles = IntegerField(u"How many circles to draw")
    submit = SubmitField("Plot")


@fourier_blueprint.route("/")
def fourier_index():
    return render_template('fourier.html', form=FourierForm())


@fourier_blueprint.route('/fourier/get_constants', methods=['PUT', 'POST'])
def get_fourier_constants_post():
    form = FourierForm()
    if form.validate_on_submit():
        f = form.svg_file.data
        number_of_circles = form.number_of_circles.data
        canvas_width = form.canvas_width.data
        canvas_height = form.canvas_height.data
        current_app.logger.debug('Calculating fourier constants for %s with %d circles', f.filename, number_of_circles)
        fourier_constants = calculate_fourier_for_svg(f, number_of_circles, canvas_width, canvas_height)
        return jsonify(convert_fourier_constants_for_js(fourier_constants))
    return jsonify(data=form.errors)


def convert_fourier_constants_for_js(constants):
    result = []
    for constant in constants:
        result.append(convert_fourier_constant_for_js(constant))
    return result


def convert_fourier_constant_for_js(constant):
    radius, angle = cmath.polar(constant['C'])
    return {
        's': constant['speed'],
        'r': radius,
        'a': angle
    }


def calculate_fourier_for_svg_path(svg_path, count):
    paths, _ = svg2paths(svg_path)
    return calculate_fourier_for_path(paths[0], count, 600, 600)


def calculate_fourier_for_svg(svg_file, count, canvas_width, canvas_height):
    paths, _ = svg_file2paths(svg_file)
    return calculate_fourier_for_path(paths[0], count, canvas_width, canvas_height)


def complex_integrate(func, *args):
    result = integrate.fixed_quad(func, 0, 1, n=500, args=args)[0]
    return result


def scale_svg(path, x, y):
    orig_bbox = path.bbox()
    path = path.translated(-(orig_bbox[0] - 20) - (orig_bbox[2] - 20) * 1j)
    y_diff = orig_bbox[3] - orig_bbox[2]
    x_diff = orig_bbox[1] - orig_bbox[0]
    scale_factor = min(x / x_diff, y / y_diff)
    scaled = path.scaled(scale_factor, scale_factor)
    return scaled


def calculate_fourier_for_path(path, count, canvas_width, canvas_height):
    path = scale_svg(path, canvas_width, canvas_height)
    _get_path_point = np.vectorize(lambda x: path.point(x))

    def _func(x, n):
        return np.exp(-n * 2 * np.pi * x * 1j) * _get_path_point(x)

    result = [{'speed': 0, 'C': complex_integrate(_func, 0)}]
    for i in range(1, count):
        result.append({'speed': i, 'C': complex_integrate(_func, i)})
        result.append({'speed': -i, 'C': complex_integrate(_func, -i)})
    return result


def plot_svg_path(svg):
    paths, _ = svg2paths(svg)

    def _func(x):
        return paths[0].point(x)

    vct = np.vectorize(_func)
    line = np.linspace(0, 1, num=5000)
    cnums = vct(line)
    X = [x.real for x in cnums]
    Y = [x.imag for x in cnums]
    # plt.scatter(X,Y, color='black')
    plt.plot(line, X)
    plt.plot(line, Y)
    plt.show()


if __name__ == "__main__":
    # plot_svg_path(sys.argv[1])
    print(convert_fourier_constants_for_js(
        calculate_fourier_for_svg_path(sys.argv[1], int(sys.argv[2]))))
