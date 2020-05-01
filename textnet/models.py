

# ------------------------------------------------------------------------------
# load packages
# ------------------------------------------------------------------------------
import os
import json
import pickle
import igraph
import networkx as nx
from .utils import *
import os
from google.cloud import storage
import urllib.request

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


# its not clear how a graphml file can be writted to cloud storage
# its also not clear how a pickle is written to cloud storage
# https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/codelabs/flex_and_vision/main.py
# key id: baaba1c89e122af096e4157bf724ae939c4a1ee2
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = 'textnet-212812-baaba1c89e12.json'
CLOUD_STORAGE_BUCKET = 'textnet'






class Projects:

    def __init__(self, gcs_folder='textnet-graphs'):

        self.gcs = False
        if 'GCS' in list(os.environ.keys()):
            self.gcs = True
        self.gcs_path = gcs_folder
        self.project_path = 'files'

        if self.gcs:
            print("gcs")
            client = storage.Client()
            self.bucket = client.get_bucket(CLOUD_STORAGE_BUCKET)

        self.meta_paths = self.get_meta_paths(self.gcs_path)
        self.projects = self.get_projects()
        self.metas = self.get_metas()

    def get_projects(self, gcs_folder="textnet-graphs"):
            return [i.split("/")[1] for i in self.meta_paths]

    def get_meta_paths(self, gcs_folder="textnet-graphs"):
        if self.gcs:
            objects = self.bucket.list_blobs(prefix=gcs_folder, delimiter=".graphml")
            return list(set([i.name for i in objects if i.name.endswith("_meta.json")]))
        else:
            metas = []
            for dirpath, dirname, filenames in os.walk(self.project_path):
                metas += [os.path.join(dirpath, file) for file in filenames if file.endswith("_meta.json")]

            return metas

    def get_metas(self):
        return [self.read_json(i) for i in self.meta_paths]

    def filter_projects(self, type):
        types = [i['type'] for i in self.metas]

        if type != None and type in types:
            return [i for i in self.metas if i['type'] == type]
        else:
            # return no metas on poor query
             return []

    def read_json(self, filename):
        if self.gcs:
            blob = self.bucket.blob(filename)
            file = json.loads(blob.download_as_string().decode('utf-8'))
        else:
            file = self.read_json_file(filename)

        return file

    def read_json_file(self, filename):
        if self.exists(filename):
            with open(filename, 'r') as datafile:
                return json.load(datafile)
        else:
            return False

    def exists(self, filename):
        # in this class files always exist by the time they are read.
        return file_exists(filename)


class Project:

    def __init__(self, graph_name, gcs_folder='textnet-graphs'):

        self.graph_name = graph_name
        self.gcs = False
        if 'GCS' in list(os.environ.keys()):
            self.gcs = True
        self.gcs_path = os.path.join(gcs_folder, graph_name)

        if self.gcs:
            print("gcs")
            client = storage.Client()
            self.bucket = client.get_bucket(CLOUD_STORAGE_BUCKET)

        self.project_path = os.path.join('files',graph_name)
        # self.existing = os.path.isdir(self.project_path)

        self.viz_name = ljoin([graph_name,'viz'],'_')
        self.meta_name = ljoin([graph_name,'meta'],'_')
        self.form_name = ljoin([graph_name,'form'],'_')
        self.merge_name = ljoin([graph_name,'merge'],'_')
        self.merged_name = ljoin([graph_name,'merged'],'_')

        Object = lambda **kwargs: type("Object", (), kwargs)

        # it would be better to generate this programatically somehow
        # objects
        #   uri | toggled on gcs
        #   local
        #   gcs
        #   ext

        self.original = Object(
            uri = project_file(self.graph_name, ext='txt', prefix=self.project_path),
            gcs = project_file(self.graph_name, ext='txt', prefix=self.gcs_path),
            ext = 'txt')

        self.meta = Object(
            uri = project_file(self.meta_name, ext='json', prefix=self.project_path),
            gcs = project_file(self.meta_name, ext='json', prefix=self.gcs_path),
            ext = 'json')

        self.full = Object(
            uri = project_file(self.graph_name, ext='json', prefix=self.project_path),
            gcs = project_file(self.graph_name, ext='json', prefix=self.gcs_path),
            ext = 'json')

        self.viz = Object(
            uri = project_file(self.viz_name, ext='json', prefix=self.project_path),
            gcs = project_file(self.viz_name, ext='json', prefix=self.gcs_path),
            ext = 'json')

        self.graphml = Object(
            uri = project_file(self.graph_name, ext='graphml', prefix=self.project_path),
            gcs = project_file(self.graph_name, ext='graphml', prefix=self.gcs_path),
            ext = 'graphml')

        self.merge_form = Object(
            uri = project_file(self.form_name, ext='json', prefix=self.project_path),
            gcs = project_file(self.form_name, ext='json', prefix=self.gcs_path),
            ext = 'json')

        self.merge = Object(
            uri = project_file(self.merge_name, ext='json', prefix=self.project_path),
            gcs = project_file(self.merge_name, ext='json', prefix=self.gcs_path),
            ext = 'json')

        self.merged = Object(
            uri = project_file(self.merged_name, ext='json', prefix=self.project_path),
            gcs = project_file(self.merged_name, ext='json', prefix=self.gcs_path),
            ext = 'json')

    # def write(self, object, model):
    #     """"Takes Project.object with uri and gcs attributes and writes them to file then uploads to gcs."""
    #
    #     # create project folder if it doesn't exist
    #     if not os.path.isdir(self.project_path):
    #         os.makedirs(self.project_path)
    #
    #     if model.ext == 'txt':
    #         self.write_text_file(object, model.uri)
    #     elif model.ext == 'json':
    #         self.write_json_file(object, model.uri)
    #     elif model.ext == 'graphml':
    #         self.write_igraph(object, model.uri)
    #
    #     if self.gcs:
    #         self.upload(model)

    def write(self, object, model):
        """"Takes Project.object with uri and gcs attributes and writes them to file then uploads to gcs."""

        if self.gcs:

            blob = self.bucket.blob(model.gcs)
            # list of mime types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
            if model.ext == 'txt':
                blob.upload_from_string(object, content_type='text/plain')
            elif model.ext == 'json':
                blob.upload_from_string(json.dumps(object), content_type='application/json')
            elif model.ext == 'graphml':
                blob.upload_from_string(self.create_graphml(object), content_type='text/plain')

        else:
            # create project folder if it doesn't exist
            if not os.path.isdir(self.project_path):
                os.makedirs(self.project_path)

            if model.ext == 'txt':
                self.write_text_file(object, model.uri)
            elif model.ext == 'json':
                self.write_json_file(object, model.uri)
            elif model.ext == 'graphml':
                self.write_igraph(object, model.uri)

    def read(self, model):
        if self.gcs:
            blob = self.bucket.blob(model.gcs)

            try:
                if model.ext == 'txt':
                    file = blob.download_as_string().decode('utf-8')
                elif model.ext == 'json':
                    file = json.loads(blob.download_as_string().decode('utf-8'))
            except:
                # raises google.cloud.exceptions.NotFound
                return False
        else:
            if model.ext == 'txt':
                file = self.read_txt_file(model.uri)
            elif model.ext == 'json':
                file = self.read_json_file(model.uri)

        return file

    def upload(self, model):
        blob = self.bucket.blob(model.gcs)
        blob.upload_from_filename(model.uri)
        # blob.make_public()

    def gcs_write(self, object, filename):
        blob = self.bucket.blob(filename)
        blob.upload_from_string(object)
        blob.make_public()

    def gcs_read(self, filename):
        data = urllib.request.urlopen(filename)
        return ''.join(data.split('\n'))

    def write_json_file(self, object,filename):
        with open(filename, 'w') as datafile:
            json.dump(object, datafile)

    def write_text_file(self, object, filename):
        with open(filename, 'w') as datafile:
            datafile.write(object)

    def write_igraph(self, object, filename):
        """"Write graphml with igraph."""
        object.write_graphml(filename)

    def create_graphml(self, object):
        """"Write graphml with networkx."""
        graphml = '\n'.join(nx.generate_graphml(object))
        return graphml


    def read_json_file(self, filename):
        if self.exists(filename):
            with open(filename, 'r') as datafile:
                return json.load(datafile)
        else:
            return False

    def read_text_file(self, filename):
        if self.exists(filename):
            with open(filename, 'r') as datafile:
                return datafile.read()
        else:
            return False


    def exists(self, filename):
        # needs to consider GCS
        return file_exists(filename)

# towards storage
# source_uri = os.path.join('gs://', CLOUD_STORAGE_BUCKET, storage_path)
# public_url = os.path.join('https://storage.googleapis.com', CLOUD_STORAGE_BUCKET, storage_path)

# review projects / files
# blobs = bucket.list_blobs(prefix="textnet-graphs", delimiter=".graphml")


## Example
# import igraph
# from textnet.models import Project
# from textnet.graphs import to_igraph
#
# exxon = Project("Exxon")
# exxon_graph = exxon.read(exxon.viz)
# exxon_igraph = to_igraph(exxon_graph)
# exxon_xgraph = to_networkx(exxon_graph)


# s='\n'.join(nx.generate_graphml(exxon_xgraph))
#
# graph_dest = io.StringIO()
# exxon_igraph.write_graphml(graph_dest)
# Segmentation fault (core dumped)

# Example 2
# from textnet.graphs import Project
# testing = Project("testing")
# meta = {
#              'name': "testing",
#              'type': 'public',
#              'window': 25,
#              'filter': "nnp"
#          }
# testing.write(meta, testing.meta)

#
# from textnet.models import Projects
# projects = Projects()
# projects.get_projects()
#
# projects.gcs = False
# projects.meta_paths = projects.get_meta_paths(projects.gcs_path)
# projects.projects = projects.get_projects()
# projects.metas = projects.get_metas()
