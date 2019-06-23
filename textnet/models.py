

# ------------------------------------------------------------------------------
# load packages
# ------------------------------------------------------------------------------
import os
import json
import pickle
import igraph
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
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = 'kaggler-9e1f3c5af539.json'
CLOUD_STORAGE_BUCKET = 'kaggler-236517'



class Project:

    def __init__(self, graph_name):

        self.graph_name = graph_name
        self.gcs = False
        if 'GCS' in list(os.environ.keys()):
            self.gcs = os.environ["GCS"]
        self.gcs_path = os.path.join('textnet-graphs', graph_name)

        if self.gcs:
            client = storage.Client()
            self.bucket = client.get_bucket(CLOUD_STORAGE_BUCKET)

        self.project_path = os.path.join('files',graph_name)
        # self.existing = os.path.isdir(self.project_path)

        self.viz_name = ljoin([graph_name,'viz'],'_')
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

    def write(self, object, model):

        # create project folder if it doesn't exist
        if not os.path.isdir(self.project_path):
            os.makedirs(self.project_path)

        if model.ext == 'txt':
            self.write_text_file(object, model.uri)
        elif model.ext == 'json':
            self.write_json_file(object, model.uri)
        elif model.ext == 'graphml':
            self.write_igraph(object, model.uri)

        if self.gcs:
            self.upload(model)


    def upload(self, model):
        blob = self.bucket.blob(model.gcs)
        blob.upload_from_filename(model.uri)
        blob.make_public()

    def gcs_write(self, object, filename):
        blob = self.bucket.blob(filename)
        blob.upload_from_string(object)
        blob.make_public()

    def gcs_read(self, filename):
        data = urllib.request.urlopen(filename)
        return ''.join(data.split('\n'))

    def read(self, model):

        if model.ext == 'txt':
            file = self.read_txt_file(model.uri)
        elif model.ext == 'json':
            file = self.read_json_file(model.uri)

        return file

    def write_json_file(self, object,filename):
        with open(filename, 'w') as datafile:
            json.dump(object, datafile)

    def write_text_file(self, object, filename):
        with open(filename, 'w') as datafile:
            datafile.write(object)

    def write_igraph(self, object, filename):
        object.write_graphml(filename)

    def read_json_file(self, filename):
        with open(filename, 'r') as datafile:
            return json.load(datafile)

    def read_text_file(self, filename):
        with open(filename, 'r') as datafile:
            return datafile.read()

# towards storage
# source_uri = os.path.join('gs://', CLOUD_STORAGE_BUCKET, storage_path)
# public_url = os.path.join('https://storage.googleapis.com', CLOUD_STORAGE_BUCKET, storage_path)

# review projects / files
# blobs = bucket.list_blobs(prefix="textnet-graphs", delimiter=".graphml")
