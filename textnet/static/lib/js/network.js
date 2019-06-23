// Add a method to the graph model that returns an
          // object with every neighbors of a node inside:
		  DegreeData = [];
          DegreeSort = [];
		  
		  
          sigma.classes.graph.addMethod('neighbors', function(nodeId) {
            var k,
                neighbors = {},
                index = this.allNeighborsIndex[nodeId] || {};
        
            for (k in index)
              neighbors[k] = this.nodesIndex[k];
        
            return neighbors;
          });
          
          var categories = {},
          positions = [
            'top-right',
            'top-left',
            'bottom-left',
            'bottom-right'
          ], colors = [
            '#965E04',
            '#C89435',
            '#F7A456',
            '#AFCF8A',
            '#7B39DE',
            '#B095C0',
            '#D24556',
            '#93C2FA',
            '#9DB09E',
            '#F8C821'
          ];
          
          function array_flip( trans, diff)
          {
              var key, tmp_ar = {};
              if (diff) 
              {
                var i = 1;
                for ( key1 in trans )
                {
                    tmp_ar[key1] = i;
                    i++;
                }			
              }
              for ( key in trans )
              {
                if ( trans.hasOwnProperty( key ) )
                {
                    //console.log(trans[key]);
                    // this function does not array flip, this array is already flipped
                    switch(key)
                    {
                        case 'positive': tmp_ar[key] = 4;
                        break;
                        case 'negative': tmp_ar[key] = 3;
                        break;
                        case 'stopword': tmp_ar[key] = 2;
                        break;
                        case 'regular': tmp_ar[key] = 1;
                        break;
                        default: tmp_ar[key] = key;
                    }
                }
              }		
              return tmp_ar;
          }
          
          /**
         * This is an example on how to use sigma filters plugin on a real-world graph.
         */
          var filter;
          /**
           * DOM utility functions
           */
          var _ = {
            $: function (id) {
                return document.getElementById(id);
            },
            
            $$: function (id) {
                return document.getElementsByClassName(id);
            },
            
            all: function (selectors) {
              return document.querySelectorAll(selectors);
            },
            removeClass: function(selectors, cssClass) {
              var nodes = document.querySelectorAll(selectors);
              var l = nodes.length;
              for ( i = 0 ; i < l; i++ ) {
                var el = nodes[i];
                // Bootstrap compatibility
                el.className = el.className.replace(cssClass, '');
              }
            },
            addClass: function (selectors, cssClass) {
              var nodes = document.querySelectorAll(selectors);
              var l = nodes.length;
              for ( i = 0 ; i < l; i++ ) {
                var el = nodes[i];
                // Bootstrap compatibility
                if (-1 == el.className.indexOf(cssClass)) {
                  el.className += ' ' + cssClass;
                }
              }
            },
            show: function (selectors) {
              this.removeClass(selectors, 'hidden');
            },
            hide: function (selectors) {
              this.addClass(selectors, 'hidden');
            },
            toggle: function (selectors, cssClass) {
              var cssClass = cssClass || "hidden";
              var nodes = document.querySelectorAll(selectors);
              var l = nodes.length;
              for ( i = 0 ; i < l; i++ ) {
                var el = nodes[i];
                //el.style.display = (el.style.display != 'none' ? 'none' : '' );
                // Bootstrap compatibility
                if (-1 !== el.className.indexOf(cssClass)) {
                  el.className = el.className.replace(cssClass, '');
                } else {
                  el.className += ' ' + cssClass;
                }
              }
            }
          };
          function updatePane (graph, filter) {
            // get max degree
            var maxDegree = 0,
                categories = {};
            // read nodes
            graph.nodes().forEach(function(n) {
              maxDegree = Math.max(maxDegree, graph.degree(n.id)/2);
              categories[n.attributes.acategory] = true;
            }) /////////////////////////////////////////////////
            // min degree
            _.$('min-degree').max = maxDegree;
            _.$('max-degree-value').textContent = maxDegree;
            
            // reset button
            /*
            _.$('reset-btn').addEventListener("click", function(e) {
              _.$('min-degree').value = 0;
              _.$('min-degree-val').textContent = '0';
              //_.$('node-category').selectedIndex = 0;
              //filter.undo().apply();
              //_.$('dump').textContent = '';
              //_.hide('#dump');
              
              // undo filters
              graph.nodes().forEach(function(node) {			  
                      
                  //node.filter.minDegree = s.graph.degree(node.id)/2 >= options.minDegreeVal;
                  
                  node.filter.minDegree = false;
                  node.filter.category = false;
                  
                  if(node.filter.minDegree == true) node.hidden = true;
                  else if(node.filter.category == null || node.filter.category == false) node.hidden = false;
                  
                  console.log(node.hidden);
              
              });
              
              */
              
              //s.refresh();
              
            //});
            // export button
            
            _.$('export-btn').addEventListener("click", function(e) {
              var chain = filter.serialize();
              // chain
              console.log(graph);
              _.$('dump').textContent = JSON.stringify({nodes: graph.nodes(), edges: graph.edges()});
              _.show('#dump');
            });
          }
        
          sigma.parsers.gexf(
            SigmaResource,
            {
                renderer: {
                container: document.getElementById('sigma-container'),
                type: 'canvas'
              },
              settings: {
                edgeColor: 'default',
                defaultEdgeColor: '#ccc',
                animationsTime: 5000,
                drawLabels: true,
                scalingMode: 'outside',
                batchEdgesDrawing: true,
                hideEdgesOnMove: true,
                sideMargin: 1,
                // glyph settings
                labelThreshold: 0	,
                glyphLineWidth: 8,
                glyphStrokeIfText: true,
                glyphTextThreshold: 0,
                glyphThreshold: 0,
                // hold settings
                borderSize: 5,
                outerBorderSize: 3,
                defaultNodeBorderColor: '#fff',
                defaultNodeOuterBorderColor: 'rgb(236, 81, 72)',
                nodeHaloColor: 'rgba(236, 81, 72, 0.2)',
                nodeHaloSize: 50
              }
            },
            function(s) {
              // We first need to save the original colors of our
              // nodes and edges, like this:
                  s.graph.nodes().forEach(function(n) {
                  categories[n.attributes.acategory] = true;
                })
              cats = array_flip(categories,true);
              console.log(cats);
              s.graph.nodes().forEach(function(n) {
                n.originalColor = colors[cats[n.attributes.acategory]*2];
                n.color = n.originalColor;
                n.originalLabel = n.label;
                n.label = "";
                //n.attributes = [];
                n.glyphs = [{
                      position: positions[Math.floor(Math.random() * 4)],
                      // Style 1:
                      fillColor: '#fff',
                      strokeColor: n.color,
                      strokeIfText: false,
                      // Style 2:
                      // textColor: '#fff',
                      // fillColor: c,
                      // strokeColor: '#fff',
                      // strokeIfText: true,
                      content: n.label
                    }];
                // create degree object for plotly
                
                if(DegreeData[n.attributes.acategory] == null) DegreeData[n.attributes.acategory] = [];
                DegreeData[n.attributes.acategory].push(s.graph.degree(n.id)/2);
                
                // quick sort of nodes
                // if !isset([1]) create it and add it
                // if it is then check if new value is greater or smaller
                // if greater push current value down 
                // else add current value below value which is is less than 
                
                sorted = {};
				sorted.label = n.originalLabel;
				sorted.degree = s.graph.degree(n.id)/2;
				sorted.category = n.attributes.acategory;
				sorted.position = 0;				
				
				if(DegreeSort[sorted.category] == null)
				{
					DegreeSort[sorted.category] = [];
					DegreeSort[sorted.category].push(sorted)
				} else DegreeSort[sorted.category].push(sorted);			
								
			  });
			  
			  // sort node data with degrees and category
			  for(key in categories) {
				  DegreeSort[key].sort(function(a,b) {
					 return b.degree - a.degree; 
				  });
			  }
              
             // a little plotyly :(
             console.log(DegreeData);
             console.log(DegreeSort);
             console.log(DegreeSort.slice(0,10));
             
             // console.log(DegreeData);
             //  console.log(g.nodes[1]);
              s.graph.edges().forEach(function(e) {
                e.originalColor = e.color;
              });
        
              // When a node is clicked, we check for each node
              // if it is a neighbor of the clicked one. If not,
              // we set its color as grey, and else, it takes its
              // original color.
              // We do the same for the edges, and we only keep
              // edges that have both extremities colored.
              s.bind('clickNode', function(e) {
                var nodeId = e.data.node.id,
                    toKeep = s.graph.neighbors(nodeId);
                toKeep[nodeId] = e.data.node;
        
                s.graph.nodes().forEach(function(n) {
                  if (toKeep[n.id])
                  {
                      n.color = n.originalColor;
                      n.label = n.originalLabel;
                  }
                  else
                  {
                      n.color = '#ddd';
                      n.label = "";
                  }
                });
        
                s.graph.edges().forEach(function(e) {
                  if (toKeep[e.source] && toKeep[e.target])
                    e.color = '#ccc';
                    //e.originalColor;
                  else
                    e.color = '#eee';
                });
        
                // Since the data has been modified, we need to
                // call the refresh method to make the colors
                // update effective.
                s.refresh();
                
                
              });
        
              // When the stage is clicked, we just color each
              // node and edge with its original color.
              // var s2 = s;
              _.$('canvas-btn').addEventListener('click', function(e) {
                s.graph.nodes().forEach(function(n) {
                  n.color = n.originalColor;
                  //n.label = n.originalLabel;
                });
        
                s.graph.edges().forEach(function(e) {
                  e.color = e.originalColor;
                });
        
                // Same as in the previous event:
                s.refresh();
              });
              
              // reset button
            
            _.$('reset-btn').addEventListener("click", function(e) {
                _.$('min-degree').value = 0;
                _.$('min-degree-val').textContent = '0';
                //_.$('node-category').selectedIndex = 0;
                //filter.undo().apply();
                //_.$('dump').textContent = '';
                //_.hide('#dump');
                
                //_.$('node-category').removeAttr('checked');
                var checkedCats = _.$$('node-category');
                
                for(var J = checkedCats.length - 1; J >= 0; --J){
                    checkedCats[J].checked = false;
                }
                //_.$$('node-category').attr('checked',false);
                
                //document.getElementByClassName('node-category').checked = false
                
                // undo filters
                s.graph.nodes().forEach(function(node) {			  
                        
                    //node.filter.minDegree = s.graph.degree(node.id)/2 >= options.minDegreeVal;
                    
                    if('filter' in node)
                    {
                        // just incase things are not defined
                        if('minDegree' in node.filter) node.filter.minDegree = 'false';
                        if('category' in node.filter) node.filter.category = 'false';
                        
                        if(node.filter.minDegree == 'true') node.hidden = true;
                        else if(node.filter.category == null || node.filter.category == 'false') node.hidden = false;
                    }
                
                });
                
                
                s.refresh();
              });
              
              
              
              /*
              
              function full_refresh(s)
              {
                 s.graph.nodes().forEach(function(n) {
                  n.color = n.originalColor;
                  n.label = n.originalLabel;
                });
        
                s.graph.edges().forEach(function(e) {
                  e.color = e.originalColor;
                });
        
                // Same as in the previous event:
                s.refresh();
     
              }
              
             */
              
              // Configure the ForceAtlas2 algorithm:
              var fa = sigma.layouts.configForceAtlas2(s, {
                worker: true,
                autoStop: true,
                background: true,
                scaleRatio: 30,
                gravity: 3,
                easing: 'cubicInOut'
              });
              // Bind the events:
              fa.bind('start stop', function(e) {
                console.log(e.type);
                document.getElementById('layout-notification').style.visibility = '';
                if (e.type == 'start') {
                  document.getElementById('layout-notification').style.visibility = 'visible';
                }
                categoriesUpdate();
              });
              // Start the ForceAtlas2 algorithm:
              sigma.layouts.startForceAtlas2();
              
              /* var myRenderer = s.renderers[0];
                myRenderer.glyphs();
                myRenderer.bind('render', function(e) {
                  myRenderer.glyphs();
                }); */
            
                // redefine acategories
                  console.log(s.graph.nodes[1]);
                  
                  
                  
                  
            
             // Initialize the Filter API
              filter = sigma.plugins.filter(s);
              updatePane(s.graph, filter);
              function applyMinDegreeFilter(e) {
                var v = e.target.value;
                _.$('min-degree-val').textContent = v;
                
                /*
                filter
                  .undo('min-degree')
                  .nodesBy(
                    function(n, options) {
                      return this.graph.degree(n.id)/2 >= options.minDegreeVal;
                    },
                    {
                      minDegreeVal: +v
                    },
                    'min-degree'
                  )
                  .apply();
                  */
                  s.graph.nodes().forEach(function(node) {			  
                      
                      //node.filter.minDegree = s.graph.degree(node.id)/2 >= options.minDegreeVal;
                      
                      status = s.graph.degree(node.id)/2 < v;
                      
                      if(node.filter != null) node.filter.minDegree  = status.toString(); 
                      else node.filter = {'minDegree' : status.toString()};
                      
                      //console.log(node.filter.minDegree);
                      //console.log(node.filter.minDegree == 'true');
                      
                      if(node.filter.minDegree == 'true') node.hidden = true;
                      else if(node.filter.category == null || node.filter.category == 'false') node.hidden = false;
                      
                      //console.log(node.hidden);
                  
                  });
                  
                  s.refresh();
                  
              }
              
              function applyCategoryFilter(e) {
                  //alert(this.value);
                  //alert(JSON.stringify(e));
                var c = this.value;
                categories[c] = e.isTrusted;
                //var filterLink = filter.undo(c);
                
                //alert(JSON.stringify(e));
                
                // of the ones that are true create vector of trues
                // return this vector
                
                s.graph.nodes().forEach(function(node) {
                  
                 
                  
                  if(node.attributes.acategory == c)
                  {
                      //console.log(node.hidden);
                      
                      //debugger;
                      
                      //if(node.hidden == "false") status = true; 
                      
                      //console.log(node.hidden)
                      //if(node.hidden == "true")  status = false;
                      
                      if(node.hidden == true)
                      {
                          //console.log(node.hidden == "true")
                          //delete node.hidden;
                          status = 'false';
                          //console.log(node.hidden);
                          
                      } else {
                          //console.log(node.hidden == "true")
                          status = 'true'; 			   
                          //console.log(node.hidden)
                      }
                      
                      if(node.filter != null) node.filter.category  = status; 
                      else node.filter = {'category' : status};
                      
                      //node.hidden = status;
                      //console.log(node.hidden);
                      
                     if(node.filter.category == 'true') node.hidden = true;
                     else if(node.filter.minDegree == null || node.filter.minDegree == 'false') node.hidden = false;
                  }
                  
                  //console.log(node.hidden);
                });
                
                s.refresh();
                
                /*
                // binary filter
                for(var i = 0; i < categories.length; i++)
                {
                    // category hider toggle 
                    filterLink
                      .nodesBy(
                      function(n, options) {
                        return !c.length || n.attributes[options.property] == c;
                      },
                      {
                        property: 'acategory'
                      },
                      c
                      //'node-category'
                    )
                }
                
                filterLink.apply();
                
                
                filter
                  .undo(c)
                  .nodesBy(
                    function(n, options) {
                      return !c.length || (n.attributes[options.property] == c && n.attributes[options.property] != 'node-category');
                    },
                    {
                      property: 'acategory'
                    },
                    c
                    //'node-category'
                  )
                  .apply();
                  */
                  
                  
                  
                  
              }
              
              _.$('min-degree').addEventListener("input", applyMinDegreeFilter);  // for Chrome and FF
              _.$('min-degree').addEventListener("change", applyMinDegreeFilter); // for IE10+, that sucks
              
              
              // node category
              var nodecategoryElt = _.$('categories');
              Object.keys(categories).forEach(function(c) {
              /*
              var optionElt = document.createElement("option");
              optionElt.text = c;
              nodecategoryElt.add(optionElt);
              */
              
              
              var checkbox = document.createElement('input');
              checkbox.type = "checkbox";
              checkbox.name = c;
              checkbox.value = c;
              checkbox.className = "node-category";
              
              
              var label = document.createElement('label')
              label.htmlFor = "node-category";
              label.appendChild(document.createTextNode(c));
              
              nodecategoryElt.appendChild(checkbox);
              nodecategoryElt.appendChild(label);
              nodecategoryElt.appendChild(document.createElement("br"));
              
              
              });
              
              function categoriesUpdate()
              {
                  var nodeCategories = _.$$('node-category');
                  for (var i = 0; i < nodeCategories.length; i++) 
                  {
                      nodeCategories[i].addEventListener("click", applyCategoryFilter);
                  }
              }
              
            }
          );