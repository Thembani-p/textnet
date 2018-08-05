

# ------------------------------------------------------------------------------
# load packages
# ------------------------------------------------------------------------------
import json
import pickle
import os.path










# ------------------------------------------------------------------------------
# functions
# ------------------------------------------------------------------------------
# ------------------------------------------------------------------------------
# helpers
# ------------------------------------------------------------------------------
def ljoin(name_list,delimiter='/'):
    return delimiter.join(name_list)

def project_file(filename,ext='json',prefix='files'):
    filename = ljoin([filename,ext],'.')
    filename = ljoin([prefix,filename])

    return filename

def file_exists(filename):
    return os.path.exists(filename)

def f_if_exists(filename,f,file=True):
    if file:
        return f(filename)
    else:
        return True

# ------------------------------------------------------------------------------
# data exchange
# ------------------------------------------------------------------------------
def read_file(filename):
    with open('files/' + filename,'r',encoding="utf-8") as datafile:
        return datafile.read()

def write_pickle_data(object,filename):
    filename = project_file(filename,ext='pickle')
    with open(filename, 'wb') as datafile:
        pickle.dump(object, datafile)

def read_pickle_data(filename):
    filename = project_file(filename,ext='pickle')
    with open(filename, 'rb') as datafile:
        return pickle.load(datafile)

def write_json_file(object,filename):
    filename = project_file(filename)
    with open(filename, 'w') as datafile:
        json.dump(object, datafile)

def read_json_file(filename):
    filename = project_file(filename)
    with open(filename, 'r') as datafile:
        return json.load(datafile)

def file_if_exists(filename,file=True):
    return f_if_exists(filename,read_file,file=file)

def pickle_if_exists(filename,project=True,file=True):
    full_path = project_file(filename,ext='pickle')
    existing = file_exists(full_path)
    if existing:
        return f_if_exists(filename,read_pickle_data,file=file)
    else:
        return existing

def json_if_exists(filename,project=True,file=True):
    full_path = project_file(filename,ext='json')
    existing = file_exists(full_path)
    if existing:
        return f_if_exists(filename,read_json_file,file=file)
    else:
        return existing


# ------------------------------------------------------------------------------
# special utilities
# ------------------------------------------------------------------------------
def merge_file_name(project_name):
    # should produce files/project_name_merge.pickle
    filename = ljoin([project_name,'merge'],'_')

    return filename
