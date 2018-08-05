



hos.nodes.nnp <- sapply(hos.json$nodes, function(x) if(x$postag=="NNP" || x$postag=="NNPS") x)

# hos.nodes.nnp <- hos.nodes.nnp[sapply(hos.nodes.nnp, length) > 0]
hod.graph

path.lenth <- shortest_paths(hod.graph,"Quantum","Henry Cavendish")


require(tm)
require(slam)

dtm.hos <- DocumentTermMatrix(Corpus(VectorSource(sapply(hos.json$nodes, function(x) x$label))))
mm.hos <- matprod_simple_triplet_matrix(dtm.hos>0, t(dtm.hos)>0)

hos.json.labels <- 1:length(hos.json$nodes)
names(hos.json.labels) <- sapply(hos.json$nodes, function(x) x$label)



# merging algorithm
#  for each node 
#   split node to words
#   compare current node to all nodes
#   if there is overlap between nodes 
#    remove smaller node
#    update all edges to refer to new node

merged.nodes <- sapply(1:length(hos.json$nodes), function(r,nodes,dtm,mm,labels){
  
  # number of words in this node
  num.words <- sum(as.vector(dtm[r,]))
  
  print(r)
  
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
      
      # ensure overlap is for proper nound
      merge.postag.idx <- sapply(nodes[merge.idx], function(x) x$postag) %in% c('NNP','NNPS')
      
      # get size for tie breaking 
      # merge.size <- sapply(nodes[merge.idx], function(x) x$size) 
      # use the path length for the tie breaker
      merge.size <- sapply(nodes[merge.idx], function(x,y){
        path.length <- shortest_paths(hod.graph,x$label,y$label)
        length(path.lenth$vpath[[1]])
      } ,nodes[[r]])
      
      to.merge <- apply(cbind(greater.words=merge.word.idx,proper.nouns=merge.postag.idx)>0,1,all)
      
      merge.details <- cbind(idx=merge.idx,greater.words=merge.word.idx,proper.nouns=merge.postag.idx,size=merge.size)
      
      if(sum(to.merge)){
        
        # sort by node size to select merge candidate or sort in reverse for path length
        
        names(merge.size) <- merge.idx
        # merge.to.idx <- as.numeric(names(sort(merge.size[to.merge],decreasing=T)[1]))
        merge.to.idx <- as.numeric(names(sort(merge.size[to.merge],decreasing=F)[1]))
        
        list(merge.to.idx = merge.to.idx, merge.from.idx = r,merge.details=merge.details, current.node=nodes[[r]]$label, next.node=nodes[[merge.to.idx]]$label )
      }
    } 
  }
},hos.json$nodes,dtm.hos,mm.hos,hos.json.labels)

merged.nodes <- merged.nodes[-which(sapply(merged.nodes,is.null))]

#merge.table <- t(sapply(merged.nodes, function(x) c(current=x$current.node,candidate=x$next.node)))
merge.table.path.length <- t(sapply(merged.nodes, function(x) c(current=x$current.node,candidate=x$next.node)))

write.csv(merge.table,file='files/merge_table.csv')
write.csv(merge.table.path.length,file='files/merge_table_path_length.csv')

(unlist(sapply(strsplit(names(hos.json.labels)," "),intersect,"animals"))>0)





# ------------------------------------------
# merge nodes from merge table
# ------------------------------------------

merge.table.edited <- read.csv('files/merge_table_edited.csv')

names(merge.table.edited) <- c('current','candidate','accept')

head(merge.table.edited)

# for each pair of nodes in merge table 
#  if accept 
#    identify current node
#      delete current
#    identify current edges
#      rename current edge 

hos.json.merge <- hos.json

hos.json.labels <- 1:length(hos.json.merge$nodes) # | 3221 | Celestial - 3171
names(hos.json.labels) <- sapply(hos.json.merge$nodes, function(x) x$label)

edge.table <- t(sapply(hos.json.merge$edges,function(x)x))

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

print(length(hos.json.merge$nodes)) # | 3130


# check merge
edge.table <- t(sapply(hos.json.merge$edges,function(x)x))
head(edge.table[edge.table[,'target']=='Elizabeth',])


edge.table.df <- as.matrix(data.frame(rbind(edge.table[,c('source','target')],c(NA,NA))))

attr(na.omit(matrix(rep(NA,20),10,2)),'na.action')

edge.table.na <- na.omit(edge.table.df)

# ------------------------------------------
# convert to graphml
# ------------------------------------------
require(igraph)
merged.igraph <- jsonToiGraph(hos.json.merge)
write_graph(merged.igraph, file='files/hos_chunked2_merged.graphml', format = c("graphml"))







# ------------------------------------------

