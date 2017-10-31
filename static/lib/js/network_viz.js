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
    ], colors = [
    "#3498db", "#2980b9", // blue
    "#e74c3c", "#c0392b", // red
    "#2ecc71", "#27ae60", // green
    "#9b59b6", "#8e44ad", // purple
    "#e67e22", "#d35400", // orange
    "#f1c40f", "#f39c12", // yellow
    "#1abc9c", "#16a085", // turquoise
    "#95a5a6", "#7f8c8d", // gray
    ];

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

  // export button
  _.$('export-btn').addEventListener("click", function(e) {

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
    animationsTime: 150,
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

  cats = array_flip(categories,true); // array flip creates colour chart...

  for(key in categories)
  {
   switch(key)
   {

   }
  }

  console.log(cats);
  s.graph.nodes().forEach(function(n) {
    n.originalColor = colors[cats[n.attributes.acategory]+1]; //*2-1
    n.color = n.originalColor;
    n.originalLabel = n.label;
    n.label = "";
    n.opacity = 0.5;
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

  // a little dimple :(
  var DrawDegree = [];

  for(key in categories) {

    var interim = DegreeSort[key].slice(0,10);

    for(i = 0; i < interim.length; i++)
    {
      interim[i].position = i+1;
    }

    DrawDegree = DrawDegree.concat(interim);
  }

  console.log(DrawDegree);

  drawNodeGraphs(DrawDegree,"Degree","position");

  // store in php var ? // can't // asynchronous

  // a little plotyly :(
  var degreely = [];

  for(key in categories) {
     xdata = {
       x: DegreeData[key],
       name: key,
       type: 'histogram',
       autobinx: false,
       opacity: 0.65,
       xbins: {
        start: 0,
        end: Math.max.apply(Math,DegreeData[key]),
        size: 10
       },
       marker: {
        color: colors[cats[key]+1]
       }
     };
     degreely.push(xdata);
  }

  console.log(degreely);

  var layout = {
    title: 'Degree Distribution by Category',
    xaxis: {title: 'Degree'},
    yaxis: {title: 'Count'},
    barmode: 'stack',
    bargap: 0.05//,
    //bargroupgap: 0.3
  };

  Plotly.newPlot('histogram', degreely, layout);

  // degreely -

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

      var checkedCats = _.$$('node-category');

      for(var J = checkedCats.length - 1; J >= 0; --J){
          checkedCats[J].checked = false;
      }
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

  // redefine acategories
  console.log(s.graph.nodes[1]);

  // Initialize the Filter API
  filter = sigma.plugins.filter(s);
  updatePane(s.graph, filter);
  function applyMinDegreeFilter(e) {
    var v = e.target.value;
    _.$('min-degree-val').textContent = v;

    s.graph.nodes().forEach(function(node) {

        status = s.graph.degree(node.id)/2 < v;

        if(node.filter != null) node.filter.minDegree  = status.toString();
        else node.filter = {'minDegree' : status.toString()};


        if(node.filter.minDegree == 'true') node.hidden = true;
        else if(node.filter.category == null || node.filter.category == 'false') node.hidden = false;
    });
    s.refresh();
  }

  function applyCategoryFilter(e) {
      var c = this.value;
      categories[c] = e.isTrusted;

      s.graph.nodes().forEach(function(node) {

        if(node.attributes.acategory == c)
        {
            if(node.hidden == true) status = 'false'; else status = 'true';

            if(node.filter != null) node.filter.category  = status;
            else node.filter = {'category' : status};

            if(node.filter.category == 'true') node.hidden = true;
            else if(node.filter.minDegree == null || node.filter.minDegree == 'false') node.hidden = false;
        }
      });
      s.refresh();
  }

  _.$('min-degree').addEventListener("input", applyMinDegreeFilter);  // for Chrome and FF
  _.$('min-degree').addEventListener("change", applyMinDegreeFilter); // for IE10+, that sucks

  // node category
  var nodecategoryElt = _.$('categories');
  Object.keys(categories).forEach(function(c) {

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
