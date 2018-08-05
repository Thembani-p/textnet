
# def merge_nodes(graph_name):
#     accept_table = pull_merge_form_data(graph_name)
#     graph = read_json_file(graph_name)
#     node_names = np.asarray([i['label'] for i in graph['nodes']])
#     node_idx = np.asarray([idx for idx,i in enumerate(graph['nodes'])])
#     edge_idx = np.asarray([idx for idx,i in enumerate(graph['edges'])])
#     target_idx = np.asarray([i['source'] for i in graph['edges']])
#     source_idx = np.asarray([i['target'] for i in graph['edges']])
#
#     for node_label in accept_table:
#         print(node_label, accept_table[node_label])
#         if accept_table[node_label] != 'None':
#
#             # delete node from graph
#             remove_idx = node_names != node_label
#             node_position = int(node_idx[node_names == node_label])
#             print('Index',node_position)
#             print('Delete', graph['nodes'][node_position])
#             for node in graph['nodes']
#             del graph['nodes'][node_position]
#             node_names = node_names[remove_idx]
#             node_idx = node_idx[remove_idx]



def merge_nodes(graph_name):
    # for each pair of nodes in merge table
    #  if accept
    #    identify current node
    #      delete current
    #    identify current edges
    #      rename current edge

    accept_table = pull_merge_form_data(graph_name)
    graph = read_json_file(graph_name)
    node_names = np.asarray([i['label'] for i in graph['nodes']])
    node_idx = np.asarray([idx for idx,i in enumerate(graph['nodes'])])
    edge_idx = np.asarray([idx for idx,i in enumerate(graph['edges'])])
    target_idx = np.asarray([i['source'] for i in graph['edges']])
    source_idx = np.asarray([i['target'] for i in graph['edges']])

    for node_label in accept_table:
        print(node_label, accept_table[node_label])
        if accept_table[node_label] != 'None':

            # delete node from graph
            # super inefficient but effective
            for idx,node in enumerate(graph['nodes']):
                if node['label'] == node_label:
                    print('Delete', node)
                    del graph['nodes'][idx]

            print(len(graph['nodes']),len(node_names),len(node_idx))

            # rename edges
            target_positions = edge_idx[target_idx == node_label]
            for edge_id in target_positions:
                graph['edges'][edge_id]['target'] = accept_table[node_label]
                print('Edge Delete','from',node_label,'to',graph['edges'][edge_id]['target'])

            source_positions = edge_idx[target_idx == node_label]
            for edge_id in source_positions:
                graph['edges'][edge_id]['source'] = accept_table[node_label]
                print('Edge Delete','from',node_label,'to',graph['edges'][edge_id]['source'])

    write_json_file(graph, ljoin([graph_name,'merged'],'_'))

    # get or create limited graph
    viz_name = ljoin([graph_name,'viz'],'_')
    limited_graph = viz_graph(graph,1000)
    write_json_file(limited_graph,viz_name)
