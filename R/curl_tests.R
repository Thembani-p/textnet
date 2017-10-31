

# this page tests the TextNet API's
# specifically tokeniser, tagger and graph
require(curl)
require(httr)
require(rjson)




curl -i -H "Content-Type: application/json" -X POST -d '{"text":"The area of study known as the history of mathematics is primarily an investigation into the origin of discoveries in mathematics and, to a lesser extent, an investigation into the mathematical methods and notation of the past. Before the modern age and the worldwide spread of knowledge, written examples of new mathematical developments have come to light only in a few locales. The most ancient mathematical texts available are Plimpton 322"}' http://localhost:7500/tokeniser


respString <- "The area of study known as the history of mathematics is primarily an investigation into the origin of discoveries in mathematics and, to a lesser extent, an investigation into the mathematical methods and notation of the past. Before the modern age and the worldwide spread of knowledge, written examples of new mathematical developments have come to light only in a few locales. The most ancient mathematical texts available are Plimpton 322"

response <- POST("http://localhost:7500/tokeniser", body = list(text=respString), encode = "json")

newString <- fromJSON(rawToChar(response$content))

response3 <- POST("http://localhost:7500/tagger", body = newString, encode = "json")

tagged <- fromJSON(rawToChar(response3$content))

response2 <- POST("http://localhost:7500/graph/5", body = newString, encode = "json")

graph <- fromJSON(rawToChar(response2$content))

response4 <- POST("http://localhost:7500/graph/2", body = tagged, encode = "json")

graph <- fromJSON(rawToChar(response4$content))

edge_list <- t(sapply(graph$edges,function(x) as.character(x[1:2])))

edge_list <- edge_list[edge_list[,1] %in% unlist(sapply(graph$nodes,function(x) if(x$tag=="NN" || x$tag=="NNS") x$name)),]

edge_list <- edge_list[edge_list[,2] %in% unlist(sapply(graph$nodes,function(x) if(x$tag=="NN" || x$tag=="NNS") x$name)),]

require(igraph)

igraph.graph <- graph_from_edgelist(edge_list, directed = TRUE)

long.col <- c('#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928')

tagged.graph <- t(sapply(graph$nodes, function(x) c(x$name,x$tag)))

dimnames(tagged.graph) <- list(tagged.graph[,1],c("word","tag"))

tagged.graph[V(igraph.graph)$name,]

plot(igraph.graph,vertex.size = degree(igraph.graph), vertex.color = long.col[as.factor(tagged.graph[V(igraph.graph)$name,"tag"])],edge.arrow.size=0)


