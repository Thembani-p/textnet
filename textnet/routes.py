

import os
import json
from flask import render_template, make_response, request, Blueprint, Response, \
                     redirect, send_from_directory, jsonify, url_for, flash
from flask_paginate import Pagination, get_page_parameter
# import rpy2.robjects as robjects
# from rpy2.robjects import pandas2ri
# pandas2ri.activate()

# get textnet functions
from textnet import app
from textnet.models import Project, Projects
from textnet.utils import read_file
from textnet.text import tokeniser, tag_sentences
from textnet.graphs import new_graph, to_networkx, graph_options, \
                            merge_candidates, merge_nodes, gen_graph
from textnet.forms import CreateTextnet

routes_blueprint = Blueprint('routes', __name__,)

PAGE_NUMBER = 10

@routes_blueprint.route("/", methods=['POST','GET'])
def index():
    # TODO:
    # pre-process project names and turn them into folders*
    # consider project structures
    # differentiate between private and public projects

    # should go to a splash that shows the different projects*

    # textNet index*
    # graph builder(pre_token_list, window)*
    # tokeniser*
    # tagger*
    # sum graphs
    # graph viz*

    # if there is a name and text goto viz
    # otherwise back to form
    # print(request.method)
    form = CreateTextnet(request.form)
    print(form.validate_on_submit(), request.method)
    if form.validate_on_submit() and request.method == 'POST':
        # there should be no puntuation in the title
        # spaces will be replaced by underscores

        # wtforms
        if form.filter.data == 'all':
            filter = None
        else:
            filter = form.filter.data

        # strip punctuation for safer urls
        graph_name = form.name.data.translate(str.maketrans('', '', string.punctuation))
        graph_name = graph_name.strip()
        print("project name: \t {} \n".format(graph_name))

        # create graph
        graph = new_graph(form.textline.data, form.window.data, graph_name, filter)
        print("graph")

        # save original text
        project = Project(graph_name)
        project.write(form.textline.data, project.original)
        print("full text")

        # save graph text
        project.write(graph, project.full)
        print("full graph")

        # save download version (graphml)
        graphi = to_networkx(graph)
        # save_igraph(graphi,graph_name)
        project.write(graphi, project.graphml)
        print("full graphml")

        meta = {
            'name': graph_name,
            'type': 'public',
            'window': form.window.data,
            'filter': form.filter.data
        }

        project.write(meta, project.meta)
        print("write project meta")

        return redirect(url_for('routes.graph_options_view',graph_name=graph_name))
    else:
        return render_template("index.html", form=form)

@routes_blueprint.route("/acknowledgements")
def acknowledgements():
    return render_template("acknowledgements.html")

@routes_blueprint.route("/tutorial")
def tutorial():
    return render_template("tutorial.html")

@routes_blueprint.route("/options/<string:graph_name>")
def graph_options_view(graph_name):

    # this is where the graph should be redirected to after upload
    # this page will provide an overview of the graph
    #   number of nodes and edges*
    #   count of different part of speech*
    #   merge candidates and form to merge nodes*
    #   option to continue to view limited version of graph (say upto 2500 nodes)*
    #       without query capability this would require saving a filtered
    #       visualisation version of the graph*
    #   option to download graph in graphml format*
    #   other options like community detection etc
    #   project meta
    #       project owner
    #       window
    #       filter
    #       type

    try:
        project = Project(graph_name)
        print("project")
        meta = project.read(project.meta)
        print("meta", meta)

        return render_template(
            "options.html",
            meta=meta,
            project_name=graph_name,
            graph_options=graph_options(graph_name)
        )
    except:
        flash("Something went wrong. Project {} might not exist, maybe create one?".format(graph_name.strip()), 'danger')
        return redirect(url_for('routes.index'))

@routes_blueprint.route("/merge/<string:graph_name>", methods=['POST','GET'])
def merge_view(graph_name):
    """
        the merge table can only change if the graph changes for the project
            if there is form data that means the merge table has already been
            created. The merge table only needs to be computed once then saved.

            therefore project will be locked

    """
    # create merge table or pull the existing one
    try:
        project = Project(graph_name)
        graph = project.read(project.full) # if this fails the project doesn't exist
        if not graph:
            flash("Project {} doesn't exists maybe create one?".format(graph_name.strip()), 'danger')
            return redirect(url_for('routes.index'))

        merge_table = merge_candidates(graph_name)
        form_data = project.read(project.merge_form)
        # form_data = pull_merge_form_data(graph_name)

        print('form data',form_data)

        if request.method == 'POST':
            # store the form output
            # save_merge_form_data(request.form,graph_name)
            project.write(request.form, project.merge_form)

            # merge the nodes and store merged graph
            merge_nodes(graph_name)

            return render_template("merge.html", merge_table=merge_table, project_name=graph_name, data = request.form)
        elif form_data:
            print('form data',True)
            return render_template("merge.html", merge_table=merge_table, project_name=graph_name, data = form_data)
        else:
            # this provides the accept/reject form for merging nodes
            return render_template("merge.html", merge_table=merge_table, project_name=graph_name)
    except:
        flash("""Something went wrong with {}.
                 Please email us at thembani.p21@googlemail.com and we'll have a look""".format(graph_name.strip()), 'danger')
        return redirect(url_for('routes.index'))

@routes_blueprint.route("/visualisation/<string:graph_name>", methods=['GET','POST'])
def visualisation(graph_name):
    # accept graph and visualise it
    # select colors
    # upper degree filter*
    # graph_name = request.args['graph_name']
    return render_template("viz.html", graph_name=graph_name)

@routes_blueprint.route("/files/<string:graph_name>/<string:filename>", methods=['GET'])
def get_files(graph_name, filename):
    # accept graph and visualise it
    project = Project(graph_name)
    if project.gcs:
        return json.dumps(project.read(project.viz)) # provides very limited functionality. Could actually be used singularly
    else:
        return read_file(os.path.join(graph_name, filename))

@routes_blueprint.route("/projects", defaults={'type': None})
@routes_blueprint.route("/projects/<string:type>")
def projects(type):
    search = False
    q = request.args.get('q')
    if q:
        search = True

    page = request.args.get(get_page_parameter(), type=int, default=1)

    # should come from models
    # projects_folders = os.listdir('files')

    # projects = []
    # for i in projects_folders:
    #     project = Project(i)
    #     print(project.meta.uri)
    #     if os.path.exists(project.meta.uri):
    #         projects.append(project.read(project.meta))

    # projects = [Project(i).read(Project(i).meta) for i in projects_folders if Project(i).exists(Project(i).meta.uri)]
    projects = Projects()
    project_list = projects.get_metas()
    print("project_list", project_list)

    if type != None:
        project_list = projects.filter_projects(type)

    pagination = Pagination(
        page=page,
        total=len(project_list),
        search=search,
        per_page_parameter=PAGE_NUMBER,
        record_name='projects'
    )
    # print(pagination)

    start = (page-1)*PAGE_NUMBER
    end = (page)*PAGE_NUMBER

    return render_template("projects.html", projects=project_list[start:end], pagination=pagination)

@routes_blueprint.route("/tokeniser", methods=['POST'])
def basic_tokeniser():
    # basic tokeniser
    tokens = tokeniser(request.json["text"])

    return json.dumps({'tokens':tokens})

@routes_blueprint.route("/tagger", methods=['POST'])
def basic_tagger():
    # chunked POS tagger
    tokens,tagged = tag_sentences(request.json["text"])

    # {'tokens':tokens, 'tagged':tagged}

    return json.dumps({'tokens':tokens,'tagged':tagged})

@routes_blueprint.route("/graph/<int:window>", methods=['GET','POST'])
def graph(window):
    # from tokeniser recieve list of words
    # also recieve as integer

    # create edge for all words within window
    # create nodes with 'size': degree and random x, y values

    # return json node object
    graph = gen_graph(request.json["tokens"],request.json["tagged"],window)
    return json.dumps(graph)
