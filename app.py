# -*- coding: utf-8 -*-


#
from flask import Flask, render_template, make_response, request, Response, \
                     redirect, send_from_directory, jsonify, url_for, flash
# import rpy2.robjects as robjects
# from rpy2.robjects import pandas2ri
# pandas2ri.activate()

# get textnet functions
from textnet.utils import *
from textnet.text import *
from textnet.graphs import *
from textnet.forms import *

app = Flask(__name__)
app.secret_key = 'itIsWhatIam,No?'
data_path = "input/"

@app.route("/", methods=['GET','POST'])
def index():
    # TODO:
    # pre-process project names and turn them into folders
    # consider project structures
    # differentiate between private and public projects

    # should go to a splash that shows the different projects

    # textNet index*
    # graph builder(pre_token_list, window)*
    # tokeniser*
    # tagger*
    # sum graphs
    # graph viz*

    # if there is a name and text goto viz
    # otherwise back to form
    # print(request.method)

    if request.method == 'POST':
        # there should be no puntuation in the title
        # spaces will be replaced by underscores

        # wtforms
        if (len(request.form['name'].strip()) > 1) and  (len(request.form['textline'].strip()) > 1):

            try:
                graph = read_json_file(request.form['name'].strip())

                print('graph exists', len(graph))
                print('\n')

                # insert flash for project already existing
                flash('Project already exists :(', 'danger')
                return render_template("index.html", data = request.form)

            except:
                if request.form['filter'] == 'all':
                    filter = None
                else:
                    filter = request.form['filter']

                graph_name = new_graph(request.form["textline"],request.form["window"], request.form['name'], filter)

                return redirect(url_for('graph_options_view',graph_name=graph_name))

        else:
            # print(request.form)
            # request.form['window'] = int(request.form['window'])
            return render_template("index.html", data = request.form)
    else:
        return render_template("index.html")

@app.route("/acknowledgements", methods=['GET','POST'])
def acknowledgements():
    return render_template("acknowledgements.html")

@app.route("/tutorial", methods=['GET','POST'])
def tutorial():
    return render_template("tutorial.html")

@app.route("/options/<string:graph_name>")
def graph_options_view(graph_name):

    # this is where the graph should be redirected to after upload
    # this page will provide an overview of the graph
    #   number of nodes and edges*
    #   count of different part of speech*
    #   merge candidates and form to merge nodes
    #   option to continue to view limited version of graph (say upto 2500 nodes)*
    #       without query capability this would require saving a filtered
    #       visualisation version of the graph
    #   option to download graph in graphml format
    #   other options like community detection etc

    try:
        graph = read_json_file(graph_name.strip())

        return render_template("options.html", graph_options=graph_options(graph_name), project_name=graph_name)
    except:
        flash("Project {} doesn't exists maybe create one?".format(graph_name.strip()), 'danger')
        return redirect(url_for('index'))

@app.route("/merge/<string:graph_name>", methods=['POST','GET'])
def merge_view(graph_name):
    """
        the merge table can only change if the graph changes for the project
            if there is form data that means the merge table has already been
            created. The merge table only needs to be computed once then saved.

            therefore project will be locked

    """
    # create merge table or pull the existing one

    merge_table = merge_candidates(graph_name)
    form_data = pull_merge_form_data(graph_name)

    print('form data',form_data)

    if request.method == 'POST':
        # store the form output
        save_merge_form_data(request.form,graph_name)

        # merge the nodes and store merged graph
        merge_nodes(graph_name)

        return render_template("merge.html", merge_table=merge_table, project_name=graph_name, data = request.form)
    elif form_data:
        print('form data',True)
        return render_template("merge.html", merge_table=merge_table, project_name=graph_name, data = form_data)
    else:
        # this provides the accept/reject form for merging nodes
        return render_template("merge.html", merge_table=merge_table, project_name=graph_name)

@app.route("/visualisation/<string:graph_name>", methods=['GET','POST'])
def visualisation(graph_name):
    # accept graph and visualise it
    # select colors
    # upper degree filter*
    # graph_name = request.args['graph_name']
    return render_template("viz.html", graph_name=graph_name)

@app.route("/files/<string:filename>", methods=['GET'])
def get_files(filename):
    # accept graph and visualise it
    return read_file(filename)

@app.route("/tokeniser", methods=['POST'])
def basic_tokeniser():
    # basic tokeniser
    tokens = tokeniser(request.json["text"])

    return json.dumps({'tokens':tokens})

@app.route("/tagger", methods=['POST'])
def basic_tagger():
    # chunked POS tagger
    tagged = tag_sentences(request.json["text"])

    # {'tokens':tokens, 'tagged':tagged}

    return json.dumps({'tokens':tagged[0],'tagged':tagged[1]})

@app.route("/graph/<int:window>", methods=['GET','POST'])
def graph(window):
    # from tokeniser recieve list of words
    # also recieve as integer

    # create edge for all words within window
    # create nodes with 'size': degree and random x, y values

    # return json node object
    graph = gen_graph(request.json["tokens"],request.json["tagged"],window)
    return json.dumps(graph)


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8500,debug=True)
