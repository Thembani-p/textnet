

require(tm)
require(slam)
require(igraph)





# create merge table
mergeTablePathLength <- function(graph,graph.obj){
  graph.nnp <- sapply(graph$nodes, function(x) if(x$postag=="NNP" || x$postag=="NNPS") x)
  graph.nnp <- graph.nnp[-which(sapply(graph.nnp,is.null))]
 
  
  dtm <- DocumentTermMatrix(Corpus(VectorSource(sapply(graph$nodes, function(x) x$label))))
  mm  <- matprod_simple_triplet_matrix(dtm>0, t(dtm)>0)
  
  print(dtm)
  print(length(graph.nnp))
  
  labels <- 1:length(graph$nodes)
  names(labels) <- sapply(graph$nodes, function(x) x$label)
  
  
  
  # merging algorithm
  #  for each node 
  #   split node to words
  #   compare current node to all nodes
  #   if there is overlap between nodes 
  #    remove smaller node
  #    update all edges to refer to new node
  
  merged.nodes <- sapply(1:length(graph$nodes), function(r,nodes,dtm,mm,labels){
    
    # number of words in this node
    print(r)
    num.words <- sum(as.vector(dtm[r,]))
    
    
    
    if((num.words > 0) && (nodes[[r]]$postag %in% c('NNP','NNPS') )){
      # this nodes comparisons
      comp.words <- as.vector(mm[r,])/num.words
      
      # checks
      #  ensure the overlap is not internal 
      merge.idx <- (1:length(comp.words))[comp.words == 1] 
      merge.idx[merge.idx!=r]
      
      if(length(merge.idx) > 0){
        # ensure the overlap is to a larger word node
        merge.word.idx <- as.vector(rollup(dtm[merge.idx,],2,FUN=sum)) > num.words
        
        # ensure overlap is for proper nouns
        merge.postag.idx <- sapply(nodes[merge.idx], function(x) x$postag) %in% c('NNP','NNPS')
        
        # get size for tie breaking 
        # merge.size <- sapply(nodes[merge.idx], function(x) x$size) 
        # use the path length for the tie breaker
        merge.size <- sapply(nodes[merge.idx], function(x,y){
          print(c(x$label,y$label))
          path.length <- shortest_paths(graph.obj,x$label,y$label)
          length(path.lenth$vpath[[1]])
        } ,nodes[[r]])
        
        to.merge <- apply(cbind(greater.words=merge.word.idx,proper.nouns=merge.postag.idx)>0,1,all)
        
        merge.details <- cbind(idx=merge.idx,greater.words=merge.word.idx,proper.nouns=merge.postag.idx,size=merge.size)
        
        if(sum(to.merge)){
          
          # sort by node size to select merge candidate or sort in reverse for path length
          
          names(merge.size) <- merge.idx
          # merge.to.idx <- as.numeric(names(sort(merge.size[to.merge],decreasing=T)[1]))
          merge.to.idx <- as.numeric(names(sort(merge.size[to.merge],decreasing=F)[1]))
          
          list(merge.to.idx   = merge.to.idx, 
               merge.from.idx = r,
               merge.details  = merge.details, 
               current.node   = nodes[[r]]$label, 
               next.node      = nodes[[merge.to.idx]]$label )
        }
      } 
    }
  },graph$nodes,dtm,mm,labels)
  
  merged.nodes <- merged.nodes[-which(sapply(merged.nodes,is.null))]
  
  #merge.table <- t(sapply(merged.nodes, function(x) c(current=x$current.node,candidate=x$next.node)))
  merge.table.path.length <- t(sapply(merged.nodes, function(x) c(current=x$current.node,candidate=x$next.node)))
  
  merge.table.path.length
}

# merge graph
mergeGraph <- function(hos.json.merge,merge.table.edited){
  
  names(merge.table.edited) <- c('current','candidate','accept')
  
  # for each pair of nodes in merge table 
  #  if accept 
  #    identify current node
  #      delete current
  #    identify current edges
  #      rename current edge 
  
  hos.json.labels <- 1:length(hos.json.merge$nodes) # | 3221 | Celestial - 3171
  names(hos.json.labels) <- sapply(hos.json.merge$nodes, function(x) x$label)
  
  edge.table <- t(sapply(hos.json.merge$edges,function(x) x ))
  
  for(i in apply(merge.table.edited,1,function(x) list(x))){
    print("_______________________________")
    
    candidate <- i[[1]]['candidate']
    current   <- i[[1]]['current']
    accept    <- i[[1]]['accept']
    
    print(accept)
    
    # if accept 
    if(accept == "Y"){
      
      print(current)
      
      print(hos.json.merge$nodes[[hos.json.labels[current]]])
      
      # identify current node and delete
      if(length(hos.json.merge$nodes[[hos.json.labels[current]]]) > 0){
        hos.json.merge$nodes[[hos.json.labels[current]]] <- "none"
      }
      
      # identify current edges
      #  target edges
      target <- (1:nrow(edge.table))[unlist(edge.table[,'target']) == current]
      
      print("target edges")
      print(length(hos.json.merge$edges[target]))
      for(j in target){
        hos.json.merge$edges[[j]]['target'] <- candidate
      }
      
      #  source edges
      source <- (1:nrow(edge.table))[unlist(edge.table[,'source']) == current]
      
      print("source edges")
      print(length(hos.json.merge$edges[source]))
      for(j in source){
        hos.json.merge$edges[[j]]['source'] <- candidate
      }
    }
    
    print("_______________________________")
  }
  
  print(length(hos.json.merge$nodes)) # | 3221
  
  hos.json.merge$nodes <- hos.json.merge$nodes[-which(sapply(hos.json.merge$nodes,function(x) all(x=='none')))]
  
  hos.json.merge
}

# convert json to igraph
jsonToiGraph <- function(graph.json){
  
  labels <- 1:length(graph.json$nodes)
  names(labels) <- sapply(graph.json$nodes,function(x) x$label)
  
  edge.list <- cbind(sapply(graph.json$edges,function(x) c(x$source)),
                     sapply(graph.json$edges,function(x) c(x$target))
  )
  
  # print(head(edge.list))
  # print(edge.list[1,])
  # print(nrow(edge.list))
  
  all.edges <- unique(unlist(c(unlist(edge.list[,1]),unlist(edge.list[,2]))))
  
  # print(length(all.edges))
  # print(length(graph.json$nodes))
  
  graph.json$nodes <- graph.json$nodes[names(labels)%in%all.edges]
  
  # print(length(graph.json$nodes))
  
  
  # print(nrow(na.omit(cbind(labels[edge.list[,1]],labels[edge.list[,2]]))))
  hod.graph <- graph_from_edgelist(na.omit(cbind(labels[edge.list[,1]],labels[edge.list[,2]])))
  
  
  print(head(sapply(graph.json$nodes,function(x) x$postag)))
  print(head(sapply(graph.json$edges,function(x) x$weight)))
  
  print(length(sapply(graph.json$nodes,function(x) x$label)))
  print(length(V(hod.graph)))
  
  V(hod.graph)$name <- sapply(graph.json$nodes,function(x) x$label)
  
  hod.graph <- set_vertex_attr(hod.graph,"label",  value = sapply(graph.json$nodes,function(x) x$label))
  hod.graph <- set_vertex_attr(hod.graph,"postag", value = sapply(graph.json$nodes,function(x) x$postag))
  hod.graph <- set_vertex_attr(hod.graph,"size",   value = sapply(graph.json$nodes,function(x) x$size))
  hod.graph <- set_vertex_attr(hod.graph,"color",  value = sapply(graph.json$nodes,function(x) x$color))
  
  # print("edit edges")
  
  # print(length(E(hod.graph)))
  
  # print(attr(na.omit(edge.list), "na.action"))
  
  edge.weights <- sapply(graph.json$edges,function(x) x$weight)
  
  og.edge.list <- na.omit(cbind(labels[edge.list[,1]],labels[edge.list[,2]]))
  
  if(!is.null(attr(na.omit(og.edge.list), "na.action"))) edge.weights <- edge.weights[-attr(og.edge.list, "na.action")]
  
  hod.graph <- set_edge_attr(hod.graph,"weight", value = edge.weights)
  hod.graph
}
