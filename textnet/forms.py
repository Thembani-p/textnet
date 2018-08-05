

# ------------------------------------------------------------------------------
# laod packages
# ------------------------------------------------------------------------------
import os
from .utils import *



# ------------------------------------------------------------------------------
# functions
# ------------------------------------------------------------------------------
def pull_merge_form_data(project_name):
    filename = merge_file_name(project_name)

    return pickle_if_exists(filename)

def save_merge_form_data(object,project_name):
    filename = merge_file_name(project_name)

    write_pickle_data(object,filename)
