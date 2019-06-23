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

      if ( tmp_ar.hasOwnProperty( key ) )
      {
          // this function does not array flip, this array is already flipped
          if(key.length == 1) continue

          switch(key)
          {
              case 'positive': tmp_ar[key] = 4; //4
              break;
              case 'negative': tmp_ar[key] = 2; //3
              break;
              case 'stopword': tmp_ar[key] = 6; //2
              break;
              case 'regular': tmp_ar[key] = 0; //1
              break;
              case 'city': tmp_ar[key] = 10; // -
                          break;
              case 'country': tmp_ar[key] = 9; // -
              break;
              default: tmp_ar[key] = key;
          }
      }
    }

    return tmp_ar;
}


function arrayObjectSlice(arrayObject, start, end)
{
  result = [];
  result.push(arrayObject[start]);

  for(i = start+1; i < Math.min(end, arrayObject.length); i ++);
  {
    result = result.push(arrayObject[i]);
  }

  return result;
}

function draw(data,yax, xax) {

  /*
    D3.js setup code
  */

  //"use strict";
  var margin = 50,
      width  = 450 - margin,
      height = 340 - margin;

  var svg = d3.select(".statistics")
    .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
    .append('g')
      .attr('class','chart');

  /*
    Dimple.js Chart construction code
  */

  var myChart = new dimple.chart(svg, data);
  var x = myChart.addCategoryAxis("x", xax);
  var y =  myChart.addMeasureAxis("y", yax.toLowerCase());
  y.showGridlines = true;
  y.tickFormat = ',.2f';

  svg.append("text")
   .attr("x", myChart._xPixels() + myChart._widthPixels() / 2)
   .attr("y", myChart._yPixels() - 20)
   .style("text-anchor", "middle")
   .style("font-family", "sans-serif")
   .style("font-weight", "bold")
   .text("Graph "+yax);


  myChart.addSeries(null, dimple.plot.line);
  myChart.addSeries(null, dimple.plot.scatter);
  myChart.draw();
};

function drawNodeGraphs(data,yax, xax) {

  /*
    D3.js setup code
  */

  //"use strict";
  var margin = 50,
      width = 1000 - margin,
      height = 450 - margin;

  //d3.select(".wrapper").append("span").text("Graph "+yax);

  var svg = d3.select(".statistics")
    .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
    .append('g')
        .attr('class','chart');

  /*
    Dimple.js Chart construction code
  */


  var myChart = new dimple.chart(svg, data);
  var x = myChart.addCategoryAxis("x", xax);
  var y =  myChart.addMeasureAxis("y", yax.toLowerCase());
  var z =  myChart.addMeasureAxis("z", yax.toLowerCase());

  y.showGridlines = true;
  y.tickFormat = ',.2f';

  svg.append("text")
   .attr("x", myChart._xPixels() + myChart._widthPixels() / 2)
   .attr("y", myChart._yPixels() - 20)
   .style("text-anchor", "middle")
   .style("font-family", "sans-serif")
   .style("font-weight", "bold")
   .text("Largest Words by Degree in Each Category");

  myChart.addSeries(["category"], dimple.plot.line);
  myChart.addSeries(["label","category"], dimple.plot.bubble);
  //myChart.addSeries(["label","category"], dimple.plot.scatter);

  // colors
  colors = [
  "#3498db", "#2980b9", // blue
      "#e74c3c", "#c0392b", // red
      "#2ecc71", "#27ae60", // green
      "#9b59b6", "#8e44ad", // purple
      "#e67e22", "#d35400", // orange
      "#f1c40f", "#f39c12", // yellow
      "#1abc9c", "#16a085", // turquoise
      "#95a5a6", "#7f8c8d", // gray
  ];

  catss = array_flip(dimple.getUniqueValues(data, "category"),true);

  console.log("cats");
  console.log(catss);

  // color assignments
  myChart.assignColor("regular",colors[1],colors[1],0.5); // 0
  myChart.assignColor("negative",colors[3],colors[3],0.5); // 2
  myChart.assignColor("positive",colors[5],colors[5],0.5); // 4
  myChart.assignColor("stopword",colors[7],colors[7],0.5); //6
  myChart.assignColor("country",colors[10]); // 9
  myChart.assignColor("city",colors[11],colors[11],0.5); // 10


  /*
   case 'positive': tmp_ar[key] = 4; //4
  break;
  case 'negative': tmp_ar[key] = 2; //3
  break;
  case 'stopword': tmp_ar[key] = 6; //2
  break;
  case 'regular': tmp_ar[key] = 0; //1
  break;
  case 'city': tmp_ar[key] = 10; // -
  break;
  case 'country': tmp_ar[key] = 9; // -
  break;
  default: tmp_ar[key] = key;
  */

  //
  myLegend = myChart.addLegend(width-10, 20, 60, 100, "left");
  myChart.draw();

  myChart.legends = [];

  // Get a unique list of Owner values to use when filtering
  var filterValues = dimple.getUniqueValues(data, "category");
  // Get all the rectangles from our now orphaned legend
  myLegend.shapes.selectAll("rect")
  // Add a click event to each rectangle
  .on("click", function (e) {
    // This indicates whether the item is already visible or not
    var hide = false;
    var newFilters = [];
    // If the filters contain the clicked shape hide it
    filterValues.forEach(function (f) {
    if (f === e.aggField.slice(-1)[0]) {
      hide = true;
    } else {
      newFilters.push(f);
    }
    });
    // Hide the shape or show it
    if (hide) {
    d3.select(this).style("opacity", 0.2);
    } else {
    newFilters.push(e.aggField.slice(-1)[0]);
    d3.select(this).style("opacity", 0.8);
    }
    // Update the filters
    filterValues = newFilters;
    // Filter the data
    myChart.data = dimple.filterData(data, "category", filterValues);
    // Passing a duration parameter makes the chart animate. Without
    // it there is no transition
    myChart.draw();
  });
};
