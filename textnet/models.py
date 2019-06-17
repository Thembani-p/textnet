

# ------------------------------------------------------------------------------
# load packages
# ------------------------------------------------------------------------------
import os
import json
import pickle
import igraph
from .utils import *






# ------------------------------------------------------------------------------
# classes
# ------------------------------------------------------------------------------

# - Project
#   - methods
#     - read
#     - write
#   - uris
#     - text (txt)
#     - full (json)
#     - graphml (graphml)
#     - viz (json)
#     - merge_pickle (pickle)
#     - merged (json)


class Project:

    def __init__(self, graph_name):

        self.graph_name = graph_name
        self.project_path = os.path.join('files',graph_name)
        self.existing = os.path.isdir(self.project_path)

        self.viz_name = ljoin([graph_name,'viz'],'_')
        self.merge_name = ljoin([graph_name,'merge'],'_')
        self.merged_name = ljoin([graph_name,'merged'],'_')

        Object = lambda **kwargs: type("Object", (), kwargs)

        # self.uri = Object(
        #     full = project_file(graph_name, ext='json', prefix=self.project_path),
        #     viz = project_file(self.viz_name,ext='json',prefix=self.project_path),
        #     graphml = project_file(graph_name, ext='graphml', prefix=self.project_path),
        #     merge_pickle = project_file(self.merged_name, ext='pickle', prefix=self.project_path),
        #     merged = project_file(self.merged_name, ext='json', prefix=self.project_path)
        # )

        self.full = Object(
            uri = project_file(self.graph_name, ext='json', prefix=self.project_path),
            ext = 'json')

        self.viz = Object(
            uri = project_file(self.viz_name, ext='json', prefix=self.project_path),
            ext = 'json')

        self.graphml = Object(
            uri = project_file(self.graph_name, ext='graphml', prefix=self.project_path),
            ext = 'graphml')

        self.merge_pickle = Object(
            uri = project_file(self.merged_name, ext='pickle', prefix=self.project_path),
            ext = 'pickle')

        self.merge = Object(
            uri = project_file(self.merge_name, ext='json', prefix=self.project_path),
            ext = 'json')

        self.merged = Object(
            uri = project_file(self.merged_name, ext='json', prefix=self.project_path),
            ext = 'json')

    def write(self, object, model):

        # create project folder if it doesn't exist
        if not self.existing:
            os.makedirs(self.project_path)

        if model.ext == 'json':
            file = self.write_json_file(object, model.uri)
        elif model.ext == 'pickle':
            file = self.write_pickle_data(object, model.uri)
        elif model.ext == 'graphml':
            file = self.write_igraph(object, model.uri)

        return file

    def read(self, model):

        if model.ext == 'json':
            file = self.read_json_file(model.uri)
        elif model.ext == 'pickle':
            file = self.read_pickle_data(model.uri)
        # elif model.ext == 'graphml':
        #     file = save_igraph(object, model.uri)

        return file

    def write_json_file(self, object,filename):
        with open(filename, 'w') as datafile:
            json.dump(object, datafile)

    def write_pickle_data(self, object,filename):
        with open(filename, 'wb') as datafile:
            pickle.dump(object, datafile)

    def write_igraph(self, object, filename):
        object.write_graphml(filename)

    def read_pickle_data(self, filename):
        with open(filename, 'rb') as datafile:
            return pickle.load(datafile)

    def read_json_file(self, filename):
        with open(filename, 'r') as datafile:
            return json.load(datafile)
