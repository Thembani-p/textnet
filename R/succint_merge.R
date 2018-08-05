

# original merge 
graph.json <- fromJSON(readLines('files/hos chunked2.json'))

igraph.graph <- jsonToiGraph(graph.json)

graph.merge.table <- mergeTablePathLength(graph.json,igraph.graph)

merge.table.path.length==graph.merge.table

# how does one find context around the candidate and current?



# merge on stanford graph with nltk ner
st.graph.json <- fromJSON(readLines('files/stanfordNerPosFull.json'))

sink('files/stanfordNerPosFull.json')
cat(toJSON(st.graph.json))
sink()

st.igraph.graph <- jsonToiGraph(st.graph.json)

write_graph(st.igraph.graph, file='files/stanfordNerPosFull.graphml', format = c("graphml"))

st.graph.merge.table <- mergeTablePathLength(st.graph.json,st.igraph.graph)

write.csv(st.graph.merge.table,file='files/merge_table_path_length_stanford.csv')
