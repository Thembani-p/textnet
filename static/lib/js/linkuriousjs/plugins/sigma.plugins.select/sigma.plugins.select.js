;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize package:
  sigma.utils.pkg('sigma.plugins');

  /**
   * Sigma Select
   * =============================
   *
   * @author Sébastien Heymann <seb@linkurio.us> (Linkurious)
   * @version 0.3
   */

  var _instance = {},
      _body = null,
      _nodeReference = null,
      _spacebar = false,
      _doubleClickingNodes = false;

  /**
   * Utility function to make the difference between two arrays.
   * See https://github.com/lodash/lodash/blob/master/lodash.js#L1627
   *
   * @param  {array} array  The array to inspect.
   * @param  {array} values The values to exclude.
   * @return {array}        Returns the new array of filtered values.
   */
  function difference(array, values) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    var index = -1,
        result = [],
        valuesLength = values.length;

    outer:
    while (++index < length) {
      var value = array[index];

      if (value === value) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === value) {
            continue outer;
          }
        }
        result.push(value);
      }
      else if (values.indexOf(value) < 0) {
        result.push(value);
      }
    }
    return result;
  }

  function keyDown(event) {
    _spacebar = event.which === 32;
    _body.removeEventListener('keydown', keyDown, false);
    _body.addEventListener('keyup', keyUp, false);
  }

  function keyUp(event) {
    _spacebar = false;
    _body.addEventListener('keydown', keyDown, false);
    _body.removeEventListener('keyup', keyUp, false);
  }


  /**
   * Select Object
   * ------------------
   *
   * @param  {sigma}                     s The related sigma instance.
   * @param  {sigma.plugins.activeState} a The activeState plugin instance.
   */
  function Select(s, a) {
    var dragCount = 0,
        dragListener = null,
        kbd = null;

    _body = _body || document.getElementsByTagName('body')[0];

    if(sigma.plugins.dragNodes) {
      s.renderers[0].container.lastChild.addEventListener('mousedown', nodeMouseDown);
    }


    /**
     * This fuction handles the node click event. The clicked nodes are activated.
     * All active nodes are deactivated if one of the active nodes is clicked.
     * The double-clicked nodes are activated.
     * If the Spacebar key is hold, it adds the nodes to the list of active
     * nodes instead of clearing the list. It clears the list of active edges. It
     * prevent nodes to be selected while dragging.
     *
     * @param {event} The event.
     */
    this.clickNodesHandler = function(event) {
      // Prevent nodes to be selected while dragging:
      if (dragCount > 1) return;

      var targets = event.data.node.map(function(n) {
        return n.id;
      });
      var actives = a.nodes().map(function(n) {
        return n.id;
      });
      var newTargets = difference(targets, actives);

      a.dropEdges();

      if (_spacebar) {
        var existingTargets = difference(targets, newTargets);
        a.dropNodes(existingTargets);
      }
      else {
        if (actives.length > 1) {
          a.addNodes(targets);
        }

        if(a.nodes().length && sigma.plugins.dragNodes) {
          if(_nodeReference === a.nodes()[0].id) {
            if(newTargets.length) {
              a.dropNodes();
              _nodeReference = null;
            }
            else {
              setTimeout(function() {
                if (!_doubleClickingNodes) {
                  a.dropNodes();
                  _nodeReference = null;
                  s.refresh({skipIndexation: true});
                }
              }, s.settings('doubleClickTimeout'));
            }
          } else {
            _nodeReference = a.nodes()[0].id;
          }
        }
      }

      a.addNodes(newTargets);
      s.refresh({skipIndexation: true});
    };

    /**
     * Handle the flag 'doubleClickingNodes'.
     * Warning: sigma fires 'doubleClickNodes' before 'clickNodes'.
     */
    this.doubleClickNodesHandler = function(event) {
      _doubleClickingNodes = true;

      setTimeout(function() {
        _doubleClickingNodes = false;
      }, 100 + s.settings('doubleClickTimeout'));
    };

    /**
     * This fuction handles the edge click event. The clicked edges are activated.
     * The clicked active edges are deactivated.
     * If the Spacebar key is hold, it adds the edges to the list of active
     * edges instead of clearing the list. It clears the list of active nodes. It
     * prevent edges to be selected while dragging.
     *
     * @param {event} The event.
     */
    this.clickEdgesHandler = function(event) {
      // Prevent edges to be selected while dragging:
      if (dragCount) return;

      var targets = event.data.edge.map(function(e) {
        return e.id;
      });
      var actives = a.edges().map(function(e) {
        return e.id;
      });
      var newTargets = difference(targets, actives);

      a.dropNodes();

      if (_spacebar) {
        var existingTargets = difference(targets, newTargets);
        a.dropEdges(existingTargets);
      }
      else {
        a.dropEdges();
        if (actives.length > 1) {
          a.addEdges(targets);
        }
      }

      a.addEdges(newTargets);
      s.refresh({skipIndexation: true});
    };

    /**
     * This function handles the 'drag' event.
     */
    this.dragHandler = function() {
      dragCount++;
    };

    /**
     * This function handles the 'drop' event.
     */
    this.dropHandler = function() {
      setTimeout(function() {
        dragCount = 0;
      }, 1);
    };

    // Select all nodes or deselect them if all nodes are active
    function spaceA() {
      a.dropEdges();

      if (a.nodes().length === s.graph.nodes().length) {
        a.dropNodes();
      }
      else {
        a.addNodes();
      }
      s.refresh({skipIndexation: true});
    }

    function nodeMouseMove() {
      if(a.nodes().length && _nodeReference === null) {
        _nodeReference = a.nodes()[0].id;
      }
    }

    function nodeMouseDown() {
      s.renderers[0].container.lastChild.addEventListener('mousemove', nodeMouseMove);
    }

    // Deselect all nodes and edges
    function spaceU() {
      a.dropEdges();
      a.dropNodes();
      s.refresh({skipIndexation: true});
    }

    // Drop selected nodes and edges
    function spaceDel() {
      s.graph.dropNodes(a.nodes().map(function(n) { return n.id; }));
      s.graph.dropEdges(a.edges().map(function(e) { return e.id; }));
      s.refresh();
    }

    // Select neighbors of selected nodes
    function spaceE() {
      a.addNeighbors();
      s.refresh({skipIndexation: true});
    }

    // Select isolated nodes (i.e. of degree 0)
    function spaceI() {
      a.dropEdges();
      a.setNodesBy(function(n) {
        return s.graph.degree(n.id) === 0;
      });
      s.refresh({skipIndexation: true});
    }

    // Select leaf nodes (i.e. nodes with 1 adjacent node)
    function spaceL() {
      a.dropEdges();
      a.setNodesBy(function(n) {
        return s.graph.adjacentNodes(n.id).length === 1;
      });
      s.refresh({skipIndexation: true});
    }

    s.bind('clickNodes', this.clickNodesHandler);
    s.bind('doubleClickNodes', this.doubleClickNodesHandler);
    s.bind('clickEdges', this.clickEdgesHandler);

    /**
     * Bind the dragNodes plugin to handle drag events.
     * @param  {sigma.plugins.dragNodes} dragNodes The dragNodes plugin instance.
     */
    this.bindDragNodes = function(dragNodes) {
      if (!dragNodes) throw new Error('Missing argument: "dragNodes"');

      dragListener = dragNodes;
      dragListener.bind('drag', this.dragHandler);
      dragListener.bind('drop', this.dropHandler);
      return this;
    }

    this.unbindDragNodes = function() {
      if (dragListener) {
        dragListener.unbind('drag', this.dragHandler);
        dragListener.unbind('drop', this.dropHandler);
        dragCount = 0;
        dragListener = null;
      }
      return this;
    };

    _body.addEventListener('keydown', keyDown, false);

    /**
     * Bind the dragNodes plugin to handle keybiard events.
     * @param  {sigma.plugins.keyboard} keyboard The keyboard plugin instance.
     */
    this.bindKeyboard = function(keyboard) {
      if (!keyboard) throw new Error('Missing argument: "keyboard"');

      kbd = keyboard;
      kbd.bind('32+65 18+32+65', spaceA);
      kbd.bind('32+85 18+32+85', spaceU);
      kbd.bind('32+46 18+32+46', spaceDel);
      kbd.bind('32+69 18+32+69', spaceE);
      kbd.bind('32+73 18+32+73', spaceI);
      kbd.bind('32+76 18+32+76', spaceL);
      return this;
    }

    this.unbindKeyboard = function() {
      if (kbd) {
        kbd.unbind('32+65 18+32+65', spaceA);
        kbd.unbind('32+85 18+32+85', spaceU);
        kbd.unbind('32+46 18+32+46', spaceDel);
        kbd.unbind('32+69 18+32+69', spaceE);
        kbd.unbind('32+73 18+32+73', spaceI);
        kbd.unbind('32+76 18+32+76', spaceL);
        kbd = null;
      }
      return this;
    }
  }

  /**
   * Interface
   * ------------------
   */

  /**
   * This plugin enables the activation of nodes and edges by clicking on them
   * (i.e. selection). Multiple nodes or edges may be activated by holding the
   * Ctrl or Meta key while clicking on them (i.e. multi selection).
   *
   * @param  {sigma}                     s The related sigma instance.
   * @param  {sigma.plugins.activeState} a The activeState plugin instance.
   */
  sigma.plugins.select = function(s, a) {
    // Create object if undefined
    if (!_instance[s.id]) {
      _instance[s.id] = new Select(s, a);

      s.bind('kill', function() {
        sigma.plugins.killSelect(s);
      });
    }

    return _instance[s.id];
  };

  /**
   *  This function kills the select instance.
   *
   * @param  {sigma} s The related sigma instance.
   */
  sigma.plugins.killSelect = function(s) {
    if (_instance[s.id] instanceof Select) {
      s.unbind('clickNodes', _instance[s.id].clickNodesHandler);
      s.unbind('doubleClickNodes', _instance[s.id].doubleClickNodesHandler);
      s.unbind('clickEdges', _instance[s.id].clickEdgesHandler);

      _instance[s.id].unbindKeyboard();
      _instance[s.id].unbindDragNodes();

      delete _instance[s.id];
    }

    if (!_instance.length && _body) {
      _body.removeEventListener('keydown', keyDown, false);
      _body.removeEventListener('keyup', keyUp, false);
      _body = null;
    }
  };

}).call(this);
