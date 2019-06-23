# -*- coding: utf-8 -*-


#
import os
from flask_script import Manager

from textnet import app


manager = Manager(app)







if __name__ == '__main__':
    manager.run(host='0.0.0.0',port=8500,debug=True)
