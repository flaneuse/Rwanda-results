
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 * responsiveness code based on http://blog.apps.npr.org/2014/05/19/responsive-charts.html
 */
  var scrollVis = function() {

// RESPONSIVENESS ---------------------------------------------------------------
// Define graphic aspect ratio.
// Based on iPad w/ 2/3 of max width taken up by vis., 2/3 of max height taken up by vis.: 1024 x 768 --> perserve aspect ratio of iPad
  var graphic_aspect_width = 4;
  var graphic_aspect_height = 5;
  var padding_right = 10;

// window function to get the size of the outermost parent
  var graphic = d3.select("#graphic");

// Get size of graphic and sidebar
  var graphicSize = graphic.node().getBoundingClientRect();
  var sidebarSize = d3.select("#sections").node().getBoundingClientRect();

  w = graphicSize.width - sidebarSize.width - padding_right;

  // constants to define the size
  // and margins of the vis area, based on the outer vars.
  var margin = { top: 50, right: 125, bottom: 25, left: 35 };
  var width = w - margin.left - margin.right;
  var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;
// end RESPONSIVENESS (plus call in 'display') ---------------------------------------------------------------

// CONSTANTS -------------------------------------------------------------------
  var numSlides = 9;
  var radius_bc = 7; // radius of breadcrumbs
  var spacing_bc = 25; // spacing between breadcrumbs, in pixels.

  var radius = 5;

  var tDefault = 600; // standard transition timing in ms

  var colorPalette = ['#5254a3','#ad494a','#e7ba52']; // Vega category20b

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

// INITIALIZE SELECTORS
  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var imgG = null;
  var plotG = null;
  var g = null;

  // breadcrumbs (dots on side of the page to indicate where in the scrolly story.)
  var breadcrumbs = null;

  // -- SCALES --
          // define scales (# pixels for each axis)
        /* D3.js VERSION 3
        */
        var x = d3.scale.linear()
             .range([0, width]);

       var y = d3.scale.linear()
            .range([height, 0]);

       var z = d3.scale.ordinal()
        .range(colorPalette)

        var xAxis = d3.svg.axis()
             .scale(x)
            //  .tickFormat(d3.time.format("%Y"))
             .orient("top")
             .ticks(5);

        var yAxis = d3.svg.axis()
             .scale(y)
             .orient("left")
             .innerTickSize(width);

// line generator
        var line = d3.svg.line() // d3.line for v4
              .x(function(d) { return x(d.year); })
              .y(function(d) { return y(d.tfr); });

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

/* CHART: where draw visualization ---------------------------------------------
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
   var chart = function(selection) {
     selection.each(function(rawData) {

       // create svg and give it a width and height
       svg = d3.select(this).selectAll("svg").data([rawData]);

       svg.enter()
        .append("svg")
        .append("g")
        .attr("id", "plots");

       svg.attr("width", width + margin.left + margin.right);
       svg.attr("height", height + margin.top + margin.bottom);

       // this group element will be used to contain all
       // other elements.
       plotG = svg.select("#plots")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // create group for images
        // this group element will be used to contain all
        // big image elements (mostly maps; could also be used for static visualizations).
        svg.append("g")
          .attr("id", "imgs");

       imgG = svg.select("#imgs")

       tfr = plotG.append("g").attr("id", "tfr")


// Data processing
data = rawData.filter(function(d) {return d.variable == "Total"});

// convert to numbers
data.forEach(function(d) {
    d.tfr = +d.tfr;
    d.year = +d.year;
});


  //  var cities = data.map(function(id) {
  //    return {
  //      id: id,
  //      values: data.map(function(d) {
  //        return {year: d.year, tfr: d[id]};
  //      })
  //    };
  //  });
   //
  //  console.log(cities)

// BREADCRUMBS ------------------------------------------------------------
var breadcrumbs = Array(numSlides).fill(0)
breadcrumbs[0] = 1 // Set the initial page to 1.

// Embed the breadcrumbs at the far right side of the svg object
dx_bc = width + margin.left + margin.right;
dy_bc = (height + margin.top + margin.bottom)/2 - (breadcrumbs.length/2) * spacing_bc;
svg = d3.select("svg");

// Translate to the edge of the svg
svg.append("g").attr("id", "breadcrumbs")
  .attr("transform", "translate(" + dx_bc + "," + dy_bc + ")");


// Append circle markers to create the breadcrumbs
br = svg.selectAll("#breadcrumbs");

  br.selectAll("circle")
     .data(breadcrumbs)
     .enter().append("circle")
     .attr("id", function(d,i) {return i})
     .attr("cy", function(d,i) {return i * spacing_bc;})
     .attr("cx", -radius_bc)
     .attr("r",  radius_bc)
     .style("stroke-width", 0.25)
     .style("stroke", "#333")
     .style("fill", "")
     .style("fill-opacity", function(d) {return d * 0.5 + 0.1;});

 // DOMAINS -------------------------------------------------------------------------
 // set the domain (data range) of data

   x.domain([d3.min(data, function(element) { return element.year; }),
             d3.max(data, function(element) { return element.year; })]);
   y.domain([0, d3.max(data, function(element) { return element.tfr; })]);
   z.domain(data.map(function(element) {return element.country}));


// EVENT: on clicking breadcrumb, change the page. -----------------------------
br.selectAll("circle").on("click", function(d,i) {
  selectedFrame = this.id;

  updateBreadcrumbs(selectedFrame);
  activateFunctions[selectedFrame]();
});
// end of BREADCRUMBS (+ update function) ------------------------------------------------------------




// Call the function to set up the svg objects
       setupVis(data);

// Set up the functions to edit the sections.
       setupSections();

     });
   };



/* SETUP VIS -------------------------------------------------------------------
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function(data) {

    // MAP: map
   imgG.append("image")
       .attr("class", "rw-map")
       .attr("id", "popdensity")
       .attr("xlink:href", function(d) {return "/img/intro/afr5.png"})
       .attr("width", "100%")
       .attr("height", "100%")
       .style("opacity", 1);

    // draw the axes
  tfr.append("g")
    .call(xAxis)
        .attr("class", "x axis")
        .attr("id", "tfr-x")
        .attr("transform", "translate(0," + -margin.top/2 + ")")
        .style("opacity", 1);

  tfr.append("g")
    .call(yAxis)
        .attr("class","y axis")
        .attr("id", "tfr-y")
        .style("opacity", 1);


  // add connector lines
  tfr.append("path")
    .datum(data)
        .attr("id", "tfr-line")
        .attr("fill", "none")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .style("stroke", function(d) { return z(d.country);})
        .style("opacity", 1);

    // CIRCLES: TFR over time
    tfr.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("id", "tfr-circles")
        .attr("class", "dot")
        .attr("r", radius)
        .attr("cx", function(d) {return x(d.year);})
        .attr("cy", function(d) {return y(d.tfr);})
        .style("fill", function(d) {return z(d.country);})
        .style("opacity", 0.5);

  // TEXT: Country label
      tfr.selectAll("#tfr-annot")
          .data(data.filter(function(d) {return d.mostrecent == true;}))
        .enter().append("text")
          .attr("id", "tfr-annot")
          .attr("class", "annot")
          .text(function(d) {return d.country})
          .attr("x", width)
          .attr("dx", 20)
          .attr("y", function(d) {return y(d.tfr);})
          // .attr("dy", "0.4em")
          .attr("fill", function(d) {return z(d.country);})
          .style("opacity", 1);

  // TEXT: TFR at final value
      tfr.selectAll("#val-annot")
          .data(data.filter(function(d) {return d.mostrecent == true | d.leastrecent == true;}))
        .enter().append("text")
          .attr("id", "val-annot")
          .attr("class", "annot")
          .text(function(d) {return d.tfr})
          .attr("x", function(d) {return x(d.year);})
          .attr("dy", -20)
          .attr("y", function(d) {return y(d.tfr);})
          .attr("fill", function(d) {return z(d.country);})
          .style("opacity", 1);

          // TEXT: source
      tfr.append("text")
            .attr("id", "source")
            .attr("class", "source")
            .text("Source: Demographic and Health Surveys")
            .attr("x", 0)
            .attr("y", height)
            .style("opacity", 1);


  };
// end of SETUP VIS ------------------------------------------------------------

/* SETUP SECTIONS --------------------------------------------------------------
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = show1;
    activateFunctions[1] = show2;
    // activateFunctions[2] = show3;
    // activateFunctions[3] = show4;
    // activateFunctions[4] = show5;
    // activateFunctions[5] = show6;
    // activateFunctions[6] = show7;
    // activateFunctions[7] = show8;
    // activateFunctions[8] = show9;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 9; i++) {
      updateFunctions[i] = function() {};
    }
  };
// end of SETUP SECTIONS -------------------------------------------------------


// ACTIVATE FUNCTIONS ----------------------------------------------------------
  function show1() {
    // -- TURN OFF PREVIOUS --
        // NA

    // -- TURN OFF NEXT --
    tfrOff();

    // -- TURN ON CURRENT --
    imgG.selectAll("#popdensity")
      .transition()
      .duration(tDefault)
      .style("opacity", 1);

  }

  function show2() {

// -- TURN OFF PREVIOUS --
    imgG.selectAll("#popdensity")
      .transition()
        .duration(0)
        .style("opacity", 0);

// -- TURN OFF NEXT --

// -- TURN ON CURRENT --
  tfrOn(tDefault);


  }
// end of ACTIVATE FUNCTIONS ---------------------------------------------------


// HELPER FUNCTIONS ------------------------------------------------------------
function updateBreadcrumbs(idx) {
  br.selectAll("circle")
     .style("fill-opacity", function(d,i) {return i==idx ? 0.6:0.1;});
}

function tfrOn(tDefault) {
  plotG.selectAll("#tfr")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);
}

function tfrOff() {
  plotG.selectAll("#tfr")
    .transition()
      .duration(0)
      .style("opacity", 0);

}
// end HELPER FUNCTIONS --------------------------------------------------------

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
      updateBreadcrumbs(i);
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // Clear out any previously drawn graphics.
  var $vis = $("#vis");
  $vis.empty();

  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// Add event listener: on resize, redraw the figure
window.addEventListener("resize", display)

// load data and display
d3.csv("/data/tfr.csv", display);
