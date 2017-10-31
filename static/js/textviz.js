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

//_.$('info-box').length()


var maxDegree = 0,
  categories = {};

  //   special categories
var special_cats_map = [{"idx": "45", "name": "Eskom"},
  {"idx": "6", "name": "Gupta"},
  {"idx": "50", "name": "Public Protector"},
  {"idx": "12", "name": "Zuma"},
  {"idx": "29", "name": "Brian Molefe"},
  {"idx": "67", "name": "Banks"},
  {"idx": "38", "name": "Mining"},
  {"idx": "5", "name": "Public Enterprises"},
  {"idx": "83", "name": "Environmental Department"}
],
  special_cats = [];
  for(i in special_cats_map) special_cats[special_cats_map[i].idx] = special_cats_map[i].name

sigma.classes.graph.addMethod('neighbors', function(nodeId) {
   var k,
       neighbors = {},
       index = this.allNeighborsIndex[nodeId] || {};

   for (k in index)
     neighbors[k] = this.nodesIndex[k];

   return neighbors;
 });

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
   return tmp_ar;
 }

  sigma.parsers.json(SigmaResource, {
    container: 'container',
    settings: {
			defaultEdgeColor: '#ccc',
			animationsTime: 5000,
			drawLabels: true,
			scalingMode: 'outside',
			batchEdgesDrawing: true,
			hideEdgesOnMove: false,
			sideMargin: 1,
      maxEdgeSize: 20,
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
			nodeHaloColor: 'rgba(160, 160, 160, 0.5)', //236, 81, 72
			nodeHaloSize: 50,
      minNodeSize: 1,
      maxNodeSize: 25,
      defaultEdgeType: 'curvedArrow'
    }
  },
  function(s) {
    s.graph.nodes().forEach(function(n) {
      n.originalColor = n.color;
      //n.originalLabel = n.label; // label or name
      n.originalLabel = n.label;
      n.label = "";
      //n.attributes = [];
      //s.refresh();
    });

    s.graph.nodes().forEach(function(n) {
      categories[n.postag] = true; // n.attributes.modularity_class
    });

    cats = array_flip(categories,true);

    for ( key in cats )
    {
      cats[key] = 0;
    }

    // count size of each mod class
    s.graph.nodes().forEach(function(n) {
      cats[n.postag] += 1;
    });

    console.log((cats));

    var cat_objects = [];
    for(key in cats)
    {
      add_cat = {"name": key, "size": cats[key]};
      cat_objects.push(add_cat);
    }

    cat_objects.sort(function(a,b){
      if(a.size > b.size) return -1;
      if(a.size < b.size) return 1;
      return 0; // sort in descending order
    });

    //alert(JSON.stringify(Object.keys(cat_objects)));

    // canvas button
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

    // select all button
    _.$('select-all-btn').addEventListener("click", function(e) {
        var checkedCats = _.$$('node-category');

        for(var J = checkedCats.length - 1; J >= 0; --J){
          checkedCats[J].checked = true;
        }

        status = 'true';

        // undo filters
  			s.graph.nodes().forEach(function(node) {

  				//node.filter.minDegree = s.graph.degree(node.id)/2 >= options.minDegreeVal;

          if(node.filter != null) node.filter.postag  = status;
          else node.filter = {'postag' : status}; //modularity_class

          if(node.filter.postag == null || node.filter.postag == 'true') node.hidden = true;
  			});
  			s.refresh();
      });

    // reset button

    _.$('reset-btn').addEventListener("click", function(e) {

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
					if('postag' in node.filter) node.filter.postag = 'false';

					if(node.filter.minDegree == 'true') node.hidden = true;
					else if(node.filter.postag == 'false') node.hidden = false;
				}

			});


			s.refresh();
		  });

    s.graph.edges().forEach(function(e) {
      e.originalColor = e.color;
      // e.color = '#fefefe' //eee
      //n.attributes = [];
      //s.refresh();
    });



    s.bind('clickNode', function(e) {
      // filter nodes
      var nodeId = e.data.node.id,
        toKeep = s.graph.neighbors(nodeId);

        /*
        //This creates degree 2 ego network
        toKeep2 = toKeep;

        // how does one store the neighbours of neighbours?
        // neighbors returns [n.id -> object] pairs
        moreNeighbours = [];
        for(i in toKeep)
        {
          // get neighbors of neighbors
          moreNeighbours = s.graph.neighbors(i);

          // remove duplicates
          for(j in moreNeighbours) toKeep2[j] = moreNeighbours[j]
        }

        //for(i in moreNeighbours) for(j in moreNeighbours[i]) toKeep[j] = moreNeighbours[i][j];
        */

      // check its working
      //console.log(toKeep2);
      // add up the new neightbors
      //toKeep = toKeep2;
      toKeep[nodeId] = e.data.node;

      //alert(JSON.stringify(toKeep));

      s.graph.nodes().forEach(function(n) {
			  if (toKeep[n.id])
			  {
				  n.color = n.originalColor;
				  n.label = n.originalLabel;
			  }
			  else
			  {
				  n.color = '#ddd'; //ddd //fdfdfd
				  n.label = "";
			  }
			});

			s.graph.edges().forEach(function(e) {
			  if (toKeep[e.source] && toKeep[e.target])
				e.color = e.originalColor;
				//e.originalColor;
			  else
				e.color = '#eee'; // eee //fefefe
			});

      if (-1 !== _.$('instructions-continue-btn').className.indexOf("hide")) {
        _.$('instructions-continue-btn').className = _.$('instructions-continue-btn').className.replace("hide", '');
      }


			// Since the data has been modified, we need to
			// call the refresh method to make the colors
			// update effective.
			s.refresh();



      // create side bar
      // _.$('info-box').display = "box"; // find way to show info box on first click ~
      var node_name = _.$('node-name');
      node_name.textContent = toKeep[nodeId].label;

      var node_class = _.$('node-group');
      if(special_cats[toKeep[nodeId].postag]) node_class.textContent = "Group "+toKeep[nodeId].postag+" ("+special_cats[toKeep[nodeId].postag]+")";
      else node_class.textContent = "Group "+toKeep[nodeId].postag;

      var node_neighbours = _.$('node-neighbours');
      node_neighbours.textContent = "" // blank content
      //alert(JSON.stringify(toKeep));
      i = 0
      for( node in toKeep)
      {
        if(i < 20)
        {
          node_neighbours.appendChild(document.createTextNode(toKeep[node].label));
          node_neighbours.appendChild(document.createElement("br"));
        } else break;

        i++;
      }

    });

    // modularity_class

    function applyCategoryFilter(e) {
    var c = this.value;
    categories[c] = e.isTrusted;

    s.graph.nodes().forEach(function(node) {

      if(node.postag == c)
      {
        if(node.hidden == true)
        {
          status = 'false';
        } else {
          status = 'true';
        }

        if(node.filter != null) node.filter.postag  = status;
        else node.filter = {'postag' : status}; //modularity_class

        if(node.filter.postag == 'true') node.hidden = true;
        else if(node.filter.minDegree == null || node.filter.minDegree == 'false') node.hidden = false;
      }
    });

    s.refresh();
  }


    // node category
    var nodecategoryElt = _.$('categories');
    Object.keys(cat_objects).forEach(function(c) {

    /*
    var optionElt = document.createElement("option");
    optionElt.text = c;
    nodecategoryElt.add(optionElt);
    */

    var div = document.createElement('div');
    div.className = "checkbox checkbox-info";

    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = cat_objects[c].name;
    checkbox.name = cat_objects[c].name;
    checkbox.value = cat_objects[c].name;
    checkbox.className = "node-category";

    var label = document.createElement('label')
    label.htmlFor = cat_objects[c].name;
    // name certain categories
    if(special_cats[cat_objects[c].name]) cat_name = cat_objects[c].name + " ("+ special_cats[cat_objects[c].name] +")";
    else cat_name = cat_objects[c].name;
    label.appendChild(document.createTextNode(cat_name));

    div.appendChild(checkbox);
    div.appendChild(label);
    nodecategoryElt.appendChild(div);
    //nodecategoryElt.appendChild(document.createElement("br"));

    });

    function categoriesUpdate()
    {
      var nodeCategories = _.$$('node-category');
      for (var i = 0; i < nodeCategories.length; i++)
      {
        nodeCategories[i].addEventListener("click", applyCategoryFilter);
      }
      s.refresh();
    }

    categoriesUpdate();

    function updatePane (graph, filter) {
      // get max degree
      var maxDegree = 0,
          minDegree = 0,
          categories = {};
      // read nodes
      graph.nodes().forEach(function(n) {
        maxDegree = Math.max(maxDegree, graph.degree(n.id)/2);
        //categories[n.attributes.acategory] = true;
      }) /////////////////////////////////////////////////
      // min degree
      _.$('min-degree').max = maxDegree;
      _.$('max-degree-value').textContent = maxDegree;

      // max degree
      _.$('max-degree').max = maxDegree;
      _.$('min-degree-value').textContent = maxDegree;
      _.$('max-degree').value = maxDegree;
      _.$('max-degree-val').textContent  = maxDegree;

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

      //_.$('export-btn').addEventListener("click", function(e) {
        //var chain = filter.serialize();
        // chain
        //console.log(graph);
        //_.$('dump').textContent = JSON.stringify({nodes: graph.nodes(), edges: graph.edges()});
        //_.show('#dump');

  // redirect via js

  //window.location = SigmaResource;

  //'data:application/octet-stream;charset-utf-8;localhost/pdf/'+SigmaResource;

    //  });
    }

    filter = sigma.plugins.filter(s);
    updatePane(s.graph, filter);

    // min degree filter
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
            else if(node.filter.maxDegree == 'true') node.hidden = true;
            else if(node.filter.postag != 'true') node.hidden = false;

            //console.log(node.hidden);

        });

        s.refresh();

    }

    // min degree filter
    function applyMaxDegreeFilter(e) {
      var v = e.target.value;
      _.$('max-degree-val').textContent = v;

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

            status = s.graph.degree(node.id)/2 > v;

            if(node.filter != null) node.filter.maxDegree  = status.toString();
            else node.filter = {'maxDegree' : status.toString()};

            //console.log(node.filter.minDegree);
            //console.log(node.filter.minDegree == 'true');

            if(node.filter.maxDegree == 'true') node.hidden = true;
            else if(node.filter.minDegree == 'true') node.hidden = true;
            else if(node.filter.postag != 'true') node.hidden = false;

            //console.log(node.hidden);

        });

        s.refresh();

    }

    _.$('min-degree').addEventListener("input", applyMinDegreeFilter);  // for Chrome and FF
    _.$('min-degree').addEventListener("change", applyMinDegreeFilter); // for IE10+, that sucks

    _.$('max-degree').addEventListener("input", applyMaxDegreeFilter);  // for Chrome and FF
    _.$('max-degree').addEventListener("change", applyMaxDegreeFilter); // for IE10+, that sucks


    // instrucitons
    _.$('instructions-continue-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('instructions').className.indexOf("hide")) {
        _.$('instructions').className = _.$('instructions').className.replace("hide", '');
        _.$('info-box').className = "hide";
      } else {
        _.$('instructions').className += ' ' + "hide";
        _.$('info-box').className = _.$('info-box').className.replace("hide", '');;
      }
		});

    _.$('instructions-back-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('instructions').className.indexOf("hide")) {
        _.$('instructions').className = _.$('instructions').className.replace("hide", '');
        _.$('info-box').className = "hide";
      } else {
        _.$('instructions').className += ' ' + "hide";
        _.$('info-box').className = _.$('info-box').className.replace("hide", '');;
      }
		});

    _.$('instructions-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('info').className.indexOf("hide")) {
        _.$('info').className = _.$('info').className.replace("hide", '');

      } else {
        _.$('info').className += ' ' + "hide";

      }
		});

    _.$('control-pane-continue-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('isolate').className.indexOf("hide")) {
        _.$('isolate').className = _.$('isolate').className.replace("hide", '');
          _.$('community').className = " hide";
      } else {
        _.$('isolate').className += ' ' + "hide";
        _.$('community').className = _.$('community').className.replace("hide", '');;
      }
    });

    _.$('control-pane-back-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('isolate').className.indexOf("hide")) {
        _.$('isolate').className = _.$('isolate').className.replace("hide", '');
          _.$('community').className = " hide";
      } else {
        _.$('isolate').className += ' ' + "hide";
        _.$('community').className = _.$('community').className.replace("hide", '');;
      }
    });

    _.$('control-pane-pos-back-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('isolate').className.indexOf("hide")) {
        _.$('isolate').className = _.$('isolate').className.replace("hide", '');
          _.$('degree-filter').className = " hide";
      } else {
        _.$('isolate').className += ' ' + "hide";
        _.$('degree-filter').className = _.$('degree-filter').className.replace("hide", '');;
      }
    });

    _.$('control-pane-degree-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('degree-filter').className.indexOf("hide")) {

        _.$('degree-filter').className = _.$('degree-filter').className.replace("hide", '');
          _.$('community').className = " hide";
      } else {

        _.$('degree-filter').className += ' ' + "hide";
        _.$('community').className = _.$('community').className.replace("hide", '');;
      }
    });

    _.$('control-pane-pos-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('degree-filter').className.indexOf("hide")) {

        _.$('degree-filter').className = _.$('degree-filter').className.replace("hide", '');
          _.$('community').className = " hide";
      } else {

        _.$('degree-filter').className += ' ' + "hide";
        _.$('community').className = _.$('community').className.replace("hide", '');;
      }
    });

    _.$('control-pane-btn').addEventListener("click", function(e) {

      if (-1 !== _.$('control-pane').className.indexOf("hide")) {
        _.$('control-pane').className = _.$('control-pane').className.replace("hide", '');
      } else {
        _.$('control-pane').className += ' ' + "hide";
      }
    });

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

      categoriesUpdate();
    });
    // Start the ForceAtlas2 algorithm:
    sigma.layouts.startForceAtlas2();



  });
