
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 * responsiveness code based on http://blog.apps.npr.org/2014/05/19/responsive-charts.html
 */
var scrollVis = function() {

// Define graphic aspect ratio.
// Based on iPad w/ 2/3 of max width taken up by vis., 2/3 of max height taken up by vis.: 1024 x 768 --> perserve aspect ratio of iPad

// var $graphic = $('#graphic');
// var graphic_data;
var graphic_aspect_width = 4;
var graphic_aspect_height = 3;
var padding_right = 10;
// var mobile_threshold = 500;


// window function to get the size of the outermost parent
var graphic = d3.select("#graphic");

var graphicSize = graphic.node().getBoundingClientRect();
var sidebarSize = d3.select("#sections").node().getBoundingClientRect();

w = graphicSize.width - sidebarSize.width - padding_right;
  // constants to define the size
  // and margins of the vis area, based on the outer vars.
var margin = { top: 10, right: 25, bottom: 25, left: 35 };
var width = w - margin.left - margin.right;
var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

console.log(width)
console.log(height)

var numSlides = 9;
var radius_bc = 7; // radius of breadcrumbs
var spacing_bc = 25; // spacing between breadcrumbs, in pixels.

  // constant
  words = ["awesome", "clever", "nice", "helpful", "useful", "a javacript master",
"a nerd", "a coding ninja", "an innovator" , "a relationship manager", "a thought leader",
"a pioneer", "an enabler", "a co-creator", "a matrix-er", "a disruptor", "bending the curve",
"a yuge value add", "an accelerator", "a cross-pollinator", "a global solution"];

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;


  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // breadcrumbs (dots on side of the page to indicate where in the scrolly story.)
  var breadcrumbs = null;

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
   var chart = function(selection) {
     selection.each(function(words) {
       // create svg and give it a width and height
       svg = d3.select(this).selectAll("svg").data([words]);
       svg.enter().append("svg").append("g");

       svg.attr("width", width + margin.left + margin.right);
       svg.attr("height", height + margin.top + margin.bottom);

       // this group element will be used to contain all
       // other elements.
       g = svg.select("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// BREADCRUMBS

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

// EVENT: on clicking breadcrumb, change the page. -----------------------------
br.selectAll("circle").on("click", function(d,i) {
  selectedFrame = this.id;

  updateBreadcrumbs(selectedFrame);
  activateFunctions[selectedFrame]();


});

// Call the function to set up the svg objects
       setupVis(words);

// Set up the functions to edit the sections.
       setupSections();

     });
   };



  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function() {
    g.append("rect")
      .attr("class", "rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", height)
      .attr("width", width)
      .attr("fill", "slateblue")
      .style("opacity", 1);



      g.append("text")
        .attr("class", "title openvis-title")
        .attr("x", width/2)
        .attr("y", height/2)
        .style("font-size", 36)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words))
        .style("opacity", 1);

        svg.append("text")
          .attr("class", "pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = show1;
    activateFunctions[1] = show2;
    activateFunctions[2] = show3;
    activateFunctions[3] = show4;
    activateFunctions[4] = show5;
    activateFunctions[5] = show6;
    activateFunctions[6] = show7;
    activateFunctions[7] = show8;
    activateFunctions[8] = show9;

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

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */


  function show1() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

  function show2() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

  function show3() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }


  function show4() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

  function show5() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

  function show6() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

  function show7() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

  function show8() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

  function show9() {
    svg.selectAll(".rect")
      .transition()
      .duration(600)
      .attr("fill", randomColor());

    svg.selectAll(".title")
        .transition()
        .duration(600)
        .attr("fill", randomColor())
        .text("Baboyma is " + randomWord(words));


    svg.selectAll(".pgNum")
          .attr("x", width)
          .attr("y", height)
          .style("font-size", 10)
          .attr("fill", "white")
          .text(activeIndex)
          .style("opacity", 1);
  }

function randomColor() {
  r = Math.random()*255;
  g = Math.random()*255;
  b = Math.random()*255;

  color = d3.rgb(r,g,b);

  return(color);
}

function updateBreadcrumbs(idx) {
  br.selectAll("circle")
     .style("fill-opacity", function(d,i) {return i==idx ? 0.6:0.1;});
}

function randomWord(words) {
  var rand = words[Math.floor(Math.random() * words.length)];
  return(rand);
}

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
d3.tsv("", display);
