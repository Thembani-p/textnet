

# ------------------------------------------------------------------------------
# laod packages
# ------------------------------------------------------------------------------
import os
from .utils import *
from flask_wtf import Form, FlaskForm
from wtforms.widgets import TextArea
from wtforms import TextField, PasswordField, DecimalField, SelectField, TextAreaField
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms.validators import Required, DataRequired, Email, Length, EqualTo
from .models import *


# ------------------------------------------------------------------------------
# functions
# ------------------------------------------------------------------------------
# def pull_merge_form_data(project_name):
#     filename = merge_file_name(project_name)
#
#     return pickle_if_exists(filename)
#
# def save_merge_form_data(object,project_name):
#     filename = merge_file_name(project_name)
#
#     write_pickle_data(object,filename)

# project/user/forms.py





class CreateTextnet(Form):
    name = TextField('name', validators=[DataRequired(), Length(min=6, max=25)])
    window = SelectField(
        'window',
        choices=[(str(i), str(i)) for i in range(5,100,5)],
        validators=[DataRequired()]
    )
    # window = TextField('window', validators=[DataRequired(), Length(min=1, max=3)])
    filter = SelectField(
        'filter',
        choices=[('all', 'all'), ('nnp', 'proper nouns')],
        validators=[DataRequired(), Length(min=1, max=3)]
    )
    # filter = TextField('filter', validators=[DataRequired(), Length(min=3, max=3)])
    textline = TextAreaField(
        'textline',
        widget=TextArea(),
        validators=[DataRequired(), Length(min=50)]
    )
    # textline = TextField('textline', validators=[DataRequired(), Length(min=50)])

    def validate(self):
        initial_validation = super(CreateTextnet, self).validate()
        if not initial_validation:
            return False

        project = Project(self.name.data.strip())
        try:
            graph = project.read(project.full)
            return False
        except:
            self.name.errors.append("Project already exists :(")
            return True

# class RegisterForm(Form):
#     email = TextField(
#         'email',
#         validators=[DataRequired(), Email(message=None), Length(min=6, max=40)])
#     password = PasswordField(
#         'password',
#         validators=[DataRequired(), Length(min=6, max=25)]
#     )
#     confirm = PasswordField(
#         'Repeat password',
#         validators=[
#             DataRequired(),
#             EqualTo('password', message='Passwords must match.')
#         ]
#     )
#
#     def validate(self):
#         initial_validation = super(RegisterForm, self).validate()
#         if not initial_validation:
#             return False
#         user = User.query.filter_by(email=self.email.data).first()
#         if user:
#             self.email.errors.append("Email already registered")
#             return False
#         return True
