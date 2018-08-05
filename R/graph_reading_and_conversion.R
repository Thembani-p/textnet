

require(rjson)
require(igraph)

hos.json <- fromJSON(readLines('files/hos_test.json'))
hos.json <- fromJSON(readLines('files/hos chunked2.json'))

labels <- 1:length(hos.json$nodes)

names(labels) <- sapply(hos.json$nodes,function(x) x$label)


edge.list <- t(sapply(hos.json$edges,function(x) c(x$source, x$target)))
head(edge.list)

hod.graph <- graph_from_edgelist(na.omit(cbind(labels[edge.list[,1]],labels[edge.list[,2]])))


# $id
# [1] "PENGUIN"
# 
# $label
# [1] "PENGUIN"
# 
# $size
# [1] 122
# 
# $postag
# [1] "NNP"
# 
# $color
# [1] "#b2df8a"
# 
# $x
# [1] 99
# 
# $y
# [1] 47


head(sapply(hos.json$nodes,function(x) x$postag))
head(sapply(hos.json$edges,function(x) x$weight))

V(hod.graph)$name <- sapply(hos.json$nodes,function(x) x$label)

hod.graph <- set_vertex_attr(hod.graph,"label", value = sapply(hos.json$nodes,function(x) x$label))
hod.graph <- set_vertex_attr(hod.graph,"postag", value = sapply(hos.json$nodes,function(x) x$postag))
hod.graph <- set_vertex_attr(hod.graph,"size", value = sapply(hos.json$nodes,function(x) x$size))
hod.graph <- set_vertex_attr(hod.graph,"color", value = sapply(hos.json$nodes,function(x) x$color))


hod.graph <- set_edge_attr(hod.graph,"weight", value = sapply(hos.json$edges,function(x) x$weight)[-attr(nel, "na.action")])

write_graph(hod.graph, file='files/hos_chunked2.graphml', format = c("graphml"))

plot(hod.graph)


require(rjson)
require(igraph)

hos.json <- fromJSON(readLines('files/hos_test.json'))
hos.json <- fromJSON(readLines('files/hos chunked2.json'))

createGraphFromJSON <- function(path.to.json){
  # import json
  hos.json <- fromJSON(readLines(path.to.json))
    
  # set labels and edge list
  labels        <- 1:length(hos.json$nodes)
  names(labels) <- sapply(hos.json$nodes,function(x) x$label)
  edge.list     <- t(sapply(hos.json$edges,function(x) c(x$source, x$target)))
  
  
  # create graph 
  hod.graph <- graph_from_edgelist(na.omit(cbind(labels[edge.list[,1]],labels[edge.list[,2]])))
  
  # update attributes
  # set names
  V(hod.graph)$name <- sapply(hos.json$nodes,function(x) x$label)
  
  hod.graph <- set_vertex_attr(hod.graph,"label", value = sapply(hos.json$nodes,function(x) x$label))
  hod.graph <- set_vertex_attr(hod.graph,"postag", value = sapply(hos.json$nodes,function(x) x$postag))
  hod.graph <- set_vertex_attr(hod.graph,"size", value = sapply(hos.json$nodes,function(x) x$size))
  hod.graph <- set_vertex_attr(hod.graph,"color", value = sapply(hos.json$nodes,function(x) x$color))
  
  # set edge weights
  hod.graph <- set_edge_attr(hod.graph,"weight", value = sapply(hos.json$edges,function(x) x$weight)[-attr(nel, "na.action")])
  
  return(hod.graph)
}



