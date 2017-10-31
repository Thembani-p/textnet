# -*- coding: utf-8 -*-

import pandas as pd
# from shapely.geometry import Point, shape
import numpy as np
#
from flask import Flask, render_template, make_response, request, Response, redirect, send_from_directory, jsonify, url_for
from collections import Counter
# import rpy2.robjects as robjects
# from rpy2.robjects import pandas2ri
# pandas2ri.activate()

import nltk
import json
import random

# data_path = './input/'

# curl -i -H "Content-Type: application/json" -X POST -d '{"text":"The area of study known as the history of mathematics is primarily an investigation into the origin of discoveries in mathematics and, to a lesser extent, an investigation into the mathematical methods and notation of the past. Before the modern age and the worldwide spread of knowledge, written examples of new mathematical developments have come to light only in a few locales. The most ancient mathematical texts available are Plimpton 322"}' http://localhost:7500/tokeniser

def add_edges(tokenised_text,i,k,edges):
    num_range = [i,k]
    num_range.sort()
    for j in range(num_range[0],num_range[1]):
        if(tokenised_text[i] != tokenised_text[j]):
            if((tokenised_text[i] in edges) and (tokenised_text[j] in edges[tokenised_text[i]])):
                edges[tokenised_text[i]][tokenised_text[j]] += 1
            elif(tokenised_text[i] in edges):
                edges[tokenised_text[i]][tokenised_text[j]] = 1
            else:
                edges[tokenised_text[i]] = {}
                edges[tokenised_text[i]][tokenised_text[j]] = 1
    return edges

def gen_graph(tokens,tagged,window):
    # toggle tags
    edges = {}
    window = int(window)
    tokenised_text = tokens

    term_freq = Counter(tokenised_text)
    unique_words = term_freq.keys()

    # for each word add previous and next tokens
    for i in range(len(unique_words)):
        upper_limit = min(len(tokenised_text)-1,i+window)
        lower_limit = max(0,i-window)
        if(i != lower_limit):
            edges = add_edges(tokenised_text,i,lower_limit,edges)
        if(i != upper_limit):
            edges = add_edges(tokenised_text,i,upper_limit,edges)

    flat_nodes = []
    edge_list = []
    id = 1
    for i in edges:
        for j in edges[i]:
            edge_list.append({"id": str(id),"source": i, "target": j, "weight": edges[i][j]})
            flat_nodes.append(i)
            flat_nodes.append(j)
            id += 1

    nodes_count = Counter(flat_nodes)
    nodes = []
    color = {"C": '#a6cee3',"J": '#1f78b4',"N": '#b2df8a',"R": '#33a02c',"U": '#fb9a99',"V": '#e31a1c',"T": '#fdbf6f',"B": '#ff7f00',"D": '#cab2d6',"I": '#6a3d9a',"Z": '#ffff99',".": "#BFCFFE"}
    # color = {"C": "#b35806", "J": "#e08214", "N": "#fdb863", "R": "#fee0b6", "U": "#f7f7f7", "V": "#d8daeb", "T": "#b2abd2", "B": "#8073ac", "D": "#342788", "I": "#DDDDDD", "Z": "#E11188", ".": "#BFCFFE"}

    for idx,elem in enumerate(nodes_count):
        this_tag = tagged[elem][0].upper()
        if(this_tag in color):
            this_color = color[this_tag]
        else:
            this_color = "#333333"
        nodes.append({"id":elem, "label":elem, "size":nodes_count[elem], "postag":tagged[elem], "color": this_color,"x":random.randint(1,100), "y":random.randint(1,100)})


    graph = {'nodes':nodes, 'edges':edge_list}

    return graph

app = Flask(__name__)

data_path = "input/"

@app.route("/", methods=['GET','POST'])
def index():
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
        if (len(request.form['name'].strip()) > 1) and  (len(request.form['textline'].strip()) > 1):
            ##########################################
            # tokenise
            tokens = nltk.word_tokenize(request.form["textline"])

            ##########################################
            # tag
            tagged = nltk.pos_tag(tokens)


            tokens = [elem[0] for elem in tagged]
            tagged = {elem[0]:elem[1] for elem in tagged}

            ##########################################
            # create graph
            graph = gen_graph(tokens,tagged,request.form["window"])

            with open('files/'+request.form['name'].strip()+'.json', 'w') as outfile:
                json.dump(graph, outfile)

            return redirect(url_for('visualisation',graph_name=request.form['name'].strip()+'.json'))
        else:
            print(request.form)
            # request.form['window'] = int(request.form['window'])
            return render_template("index.html", data = request.form)
    else:
        return render_template("index.html")

@app.route("/visualisation", methods=['GET','POST'])
def visualisation():
    # accept graph and visualise it
    # select colors
    # upper degree filter*
    graph_name = request.args['graph_name']
    return render_template("viz.html", graph_name=graph_name)

@app.route("/files/<string:filename>", methods=['GET'])
def get_files(filename):
    # accept graph and visualise it
    with open('files/' + filename,'r',encoding="utf-8") as content_file:
        return content_file.read()

@app.route("/tokeniser", methods=['POST'])
def basic_tokeniser():
    # basic tokeniser
    tokens = nltk.word_tokenize(request.json["text"])
    return json.dumps({'tokens':tokens})

@app.route("/tagger", methods=['POST'])
def basic_tagger():
    # taggs tokenised list
    tagged = nltk.pos_tag(request.json["tokens"])


    tokens = [elem[0] for elem in tagged]
    tagged = {elem[0]:elem[1] for elem in tagged}

    return json.dumps({'tokens':tokens, 'tagged':tagged})

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
    app.run(host='0.0.0.0',port=7500,debug=True)
