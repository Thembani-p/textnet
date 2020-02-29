
# TODO: save original file and add edit option
# ------------------------------------------------------------------------------
# laod packages
# ------------------------------------------------------------------------------
import random
import igraph as ig
import numpy as np
import pandas as pd
from collections import Counter
import os.path
from .text import *
from .utils import *
from .forms import *
from .models import Project, Projects
# data_path = './input/'

# curl -i -H "Content-Type: application/json" -X POST -d '{"text":"The area of study known as the history of mathematics is primarily an investigation into the origin of discoveries in mathematics and, to a lesser extent, an investigation into the mathematical methods and notation of the past. Before the modern age and the worldwide spread of knowledge, written examples of new mathematical developments have come to light only in a few locales. The most ancient mathematical texts available are Plimpton 322"}' http://localhost:7500/tokeniser





# ------------------------------------------------------------------------------
# functions
# ------------------------------------------------------------------------------
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
    for i in range(len(tokenised_text)):
        upper_limit = min(len(tokenised_text)-1,i+window)
        lower_limit = max(0,i-window)
        if(i != lower_limit):
            edges = add_edges(tokenised_text,i,lower_limit,edges)
        if(i != upper_limit):
            edges = add_edges(tokenised_text,i,upper_limit,edges)
    # print('edges',edges)
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
    color = {"C": '#a6cee3',
            "J": '#1f78b4',
            "N": '#b2df8a',
            "R": '#33a02c',
            "U": '#fb9a99',
            "V": '#e31a1c',
            "T": '#fdbf6f',
            "B": '#ff7f00',
            "D": '#cab2d6',
            "I": '#6a3d9a',
            "Z": '#ffff99',
            ".": "#BFCFFE"}

    """
    color = {"C": "#b35806",
             "J": "#e08214",
             "N": "#fdb863",
             "R": "#fee0b6",
             "U": "#f7f7f7",
             "V": "#d8daeb",
             "T": "#b2abd2",
             "B": "#8073ac",
             "D": "#342788",
             "I": "#DDDDDD",
             "Z": "#E11188",
             ".": "#BFCFFE"}
    """

    for idx,elem in enumerate(nodes_count):
        this_tag = tagged[elem][0].upper()
        if(this_tag in color):
            this_color = color[this_tag]
        else:
            this_color = "#333333"

        nodes.append({"id":elem,
                        "label":elem,
                        "size":nodes_count[elem],
                        "postag":tagged[elem],
                        "color": this_color,
                        "x":random.randint(1,100),
                        "y":random.randint(1,100)}
                        )


    graph = {'nodes':nodes, 'edges':edge_list}

    return graph

def new_graph(text,window,name,filter):
    # tag
    tokens, tagged = tag_sentences(text, filter=filter)

    # create graph
    return gen_graph(tokens, tagged, window)


def viz_graph(graph,limit=2500):

    """
        creates a version of the graph with fewer nodes
    """

    if len(graph['nodes']) > limit:
        nodes_df = pd.DataFrame(graph['nodes'])

        # find top nodes
        top_nodes_df = nodes_df.sort_values('size',ascending=False).iloc[0:limit]
        top_nodes = json.loads(top_nodes_df.to_json(orient='records'))

        # find accompanying edges
        edges_df = pd.DataFrame(graph['edges'])



        keep_source_edges = edges_df['source'].isin(top_nodes_df['label'])
        keep_target_edges = edges_df['target'].isin(top_nodes_df['label'])
        both_idx = keep_source_edges&keep_target_edges

        print('Viz Remove Edges')
        # print(edges_df.loc[~both_idx])

        new_edges_df = edges_df.loc[both_idx]
        new_edges_df = new_edges_df.reset_index()
        new_edges_df['id'] = new_edges_df.index
        new_edges_df['id'] = new_edges_df['id'].astype(str)
        del new_edges_df['index']

        top_edges = json.loads(new_edges_df.to_json(orient='records'))

        viz_graph = {'nodes': top_nodes,'edges': top_edges}
    else:
        viz_graph =  graph

    return viz_graph

def graph_options(graph_name):
    # runs on /options/graph_name
    project = Project(graph_name)

    graph_stats = {}

    # get graph
    # graph = read_text_file(graph_name)
    graph = project.read(project.full)
    print("Progress: \t full graph \n")

    node_count = len(graph['nodes'])
    edge_count = len(graph['edges'])

    postag_count = pd.DataFrame(graph['nodes'])['postag'].value_counts().to_json()

    graph_stats['Full Graph'] = {}
    graph_stats['Full Graph']['Node Count'] = node_count
    graph_stats['Full Graph']['Edge Count'] = edge_count
    graph_stats['Full Graph']['Postag Count'] = postag_count
    print("Progress: \t full graph stats \n")

    # get or create limited graph
    # viz_name = ljoin([graph_name,'viz'],'_')
    limited_graph = project.read(project.viz) # returns false if the file does not exist

    if not limited_graph:
        limited_graph = viz_graph(graph,1000)
        # write_text_file(limited_graph,viz_name)
        project.write(limited_graph, project.viz)

    graph_stats['Limited Graph'] = {}
    graph_stats['Limited Graph']['Node Count'] = len(limited_graph['nodes'])
    graph_stats['Limited Graph']['Edge Count'] = len(limited_graph['edges'])
    print("Progress: \t limited graph stats \n")

    # Write an igraph graph to a JSON file for use with Sigma.js
    # https://gist.github.com/jboynyc/11dcd73b84f8da02490e6654d5c07700

    # get merged graph
    # merged_name = ljoin([graph_name,'merged'],'_')
    merged_graph = project.read(project.merged)
    if merged_graph:
        # merged_graph = read_text_file(merged_name)
        graph_stats['Merged Graph'] = {}
        graph_stats['Merged Graph']['Node Count'] = len(merged_graph['nodes'])
        graph_stats['Merged Graph']['Edge Count'] = len(merged_graph['edges'])
    print("Progress: \t limited graph stats \n")


    return graph_stats

def to_igraph(graph):

    graphi = ig.Graph()

    # create edge list
    edge_list = [(i['source'],i['target']) for i in graph['edges']]
    node_list = [i['label'] for i in graph['nodes']]

    # create graph from edge list
    graphi.add_vertices(node_list)
    graphi.add_edges(edge_list)

    # add node attributes
    #   label, size, postag, colour
    graphi.vs['label'] = node_list
    graphi.vs['size'] = [i['size'] for i in graph['nodes']]
    graphi.vs['postag'] = [i['postag'] for i in graph['nodes']]
    graphi.vs['color'] = [i['color'] for i in graph['nodes']]
    # add edge attributes
    #   weight

    return graphi

def to_networkx(graph):
    import networkx as nx
    graphx = nx.Graph()
    # create edge list
    edge_list = [(i['source'],i['target']) for i in graph['edges']]
    node_dict = {i['label']:i for i in graph['nodes']}
    # create graph from edge list
    graphx.add_nodes_from(node_dict)
    graphx.add_edges_from(edge_list)
    return graphx

# def save_igraph(graphi,project_name):
#     # print(graphi)
#     graphi.write_graphml(os.path.join('files','.'.join([project_name,'graphml'])))
#     return True

def create_merge_table(graph,graph_dict):
    # TODO:
    # Kepler merge is failing

    words = [node['label'] for node in graph_dict['nodes']] #
    dtm = document_term_matrix(words) # node term matrix
    mm = dtm.dot(dtm.T) # all term overlap

    # for each node | check if propper nouns
    # check for term overlap with other nodes
    # ignore nodes with the same word count
    # provide shortest path merge candidate

    all_candidates = {}
    for idx, node in enumerate(graph_dict['nodes']):
        if node['postag'] in ('NNP','NNPS'):

            term_comparison = mm.iloc[idx]/dtm.iloc[idx].sum() >= 1
            # print(term_comparison)
            candidate_keys = list(term_comparison.index[list(term_comparison)])

            candidates = {}
            for candidate_key in candidate_keys:
                # print(candidate_key)

                not_current_label = (words[candidate_key] not in node['label'])
                is_nnp = (graph_dict['nodes'][candidate_key]['postag'] in ('NNP','NNPS'))

                if not_current_label and is_nnp:
                    candidate = graph_dict['nodes'][candidate_key]['label']
                    path_length = graph.shortest_paths(node['label'],candidate)

                    candidates[candidate] = path_length[0][0]
                # sort candidates
                # candidates

            if len(candidate_keys) and len(candidates) > 0:
                all_candidates[node['label']] = candidates

    return all_candidates

def merge_candidates(graph_name):
    """
        create or read and return the merge table
    """
    project = Project(graph_name)


    # merge_filename = merge_file_name(graph_name)
    # json_filename = project_file(merge_filename,ext='json')

    # print(json_filename)

    if not file_exists(project.merge.uri):
        print('running new merge table')
        # graph_dict = read_text_file(graph_name)
        graph_dict = project.read(project.full)

        # graphi = to_networkx(graph_dict)
        graphi = to_igraph(graph_dict) # requires shortest pth which is available in igraph

        merge_table = create_merge_table(graphi, graph_dict)

        # write_text_file(merge_table, merge_filename)
        project.write(merge_table, project.merge)

    else:
        # print('pulling old merge table')
        # print(merge_filename)
        # merge_table = json_if_exists(merge_filename)
        merge_table = project.read(project.merge)
        # print('merge table',merge_table)
    print("merge table complete")
    return merge_table

def merge_nodes(graph_name):
    # for each pair of nodes in merge table
    #  if accept
    #    identify current node
    #      delete current
    #    identify current edges
    #      rename current edge
    project = Project(graph_name)

    # accept_table = pull_merge_form_data(graph_name)
    accept_table = project.read(project.merge_form)
    # graph = read_text_file(graph_name)
    graph = project.read(project.full)

    for node_label in accept_table:
        # print(node_label, accept_table[node_label])
        if accept_table[node_label] != 'None':

            # delete node from graph
            # super inefficient but effective
            for idx,node in enumerate(graph['nodes']):
                if node['label'] == node_label:
                    # print('Delete', node)
                    del graph['nodes'][idx]

            # print(len(graph['nodes']),len(node_names),len(node_idx))

            # rename edges
            for idx,edge in enumerate(graph['edges']):
                if edge['target'] == node_label:
                    # print('Edge Delete',graph['edges'][idx]['target'])
                    graph['edges'][idx]['target'] = accept_table[node_label]

                if edge['source'] == node_label:
                    # print('Edge Delete',graph['edges'][idx]['source'])
                    graph['edges'][idx]['source'] = accept_table[node_label]


    # write_text_file(graph, ljoin([graph_name,'merged'],'_
    project.write(graph, project.merged)
    graphi = to_networkx(graph)
    # save_igraph(graphi,graph_name)
    project.write(graphi, project.graphml)

    # get or create limited graph
    # viz_name = ljoin([graph_name,'viz'],'_')
    limited_graph = viz_graph(graph,1000)
    # write_text_file(limited_graph,viz_name)
    project.write(limited_graph, project.viz)
