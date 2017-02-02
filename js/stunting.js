
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // RESPONSIVENESS ---------------------------------------------------------------
  // Define graphic aspect ratio.
  // Based on iPad w/ 2/3 of max width taken up by vis., 2/3 of max height taken up by vis.: 1024 x 768 --> perserve aspect ratio of iPad
  var graphic_aspect_width = 4;
  var graphic_aspect_height = 3;
  var padding_right = 10;

  // window function to get the size of the outermost parent
  var graphic = d3.select("#graphic");

  // Get size of graphic and sidebar
  var graphicSize = graphic.node().getBoundingClientRect();
  var sidebarSize = d3.select("#sections").node().getBoundingClientRect();

  w = graphicSize.width - sidebarSize.width - padding_right;

    // constants to define the size
    // and margins of the vis area, based on the outer vars.
  var margin = { top: 40, right: 75, bottom: 15, left: 250 };
  var width = w - margin.left - margin.right;
  var height = Math.ceil((w * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

  var numSlides = 9;
  var radius_bc = 7; // radius of breadcrumbs
  var spacing_bc = 25; // spacing between breadcrumbs, in pixels.
  // end RESPONSIVENESS (plus call in 'display') ---------------------------------------------------------------


  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;


  // div used for initial text
  var intro = null;

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  // imgG used for showing images (e.g. not translated)
  // plotG used for standard plots
  var imgG = null;
  var plotG = null;

// -- INTERACTION COUNTERS --
  var ciClick = 0;
  var allowCI = false;

  // -- DEFINE CONSTANTS --

  // radius of dots in pixels.
       var radius = 10;

  // color palette
  var colorPalette = colorbrewer.Spectral[11];


  // -- SCALES --
    // define scales (# pixels for each axis)
  /* D3.js VERSION 3
  */
  var x = d3.scale.linear()
       .range([0, width]);

  var y = d3.scale.ordinal()
       .rangeBands([0, height], 0.2, 0);

  var z = d3.scale.linear()
  // .range(colorPalette)
    .range(colorbrewer.Spectral[11])
    .interpolate(d3.interpolateHcl)
       .domain([0.57, .48]);

  var xAxis = d3.svg.axis()
       .scale(x)
       .orient("top")
       .ticks(5, "%")
       .innerTickSize(height);

  var yAxis = d3.svg.axis()
       .scale(y)
       .orient("left");

// // gridlines
//   function make_x_gridlines() {
//          return d3.axis.orient("bottom").x
//          .ticks(5)
//        }

/* D3.js v. 4
  // color palette of dots
        var colorPalette = d3.interpolateSpectral;

       var x = d3.scaleLinear() // D3.js v.4
            .range([0, width]);

       var y = d3.scaleBand() // Port d3.scale.ordinal to .scaleBand; rangeBands to range w/ paddingInner arg.
            .range([0, height])
            .paddingInner(0.2);

      var z = d3.scaleSequential(colorPalette);

  // define look of axis
       var xAxis = d3.axisBottom()
            .scale(x)
            .ticks(5, "%");

       var yAxis = d3.axisLeft()
           .scale(y);

  // gridlines in x axis function
           function make_x_gridlines() {
             return d3.axisBottom(x)
             .ticks(5)
           }
*/

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
**/
  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll("svg")
      .data([rawData])
        .enter().append("svg")

  // create group for images
      svg.append("g")
        .attr("id", "imgs");

// create group for plots
      svg.append("g")
        .attr("id", "plots");

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);


      // this group element will be used to contain all
      // big image elements (mostly maps; could also be used for static visualizations).
      imgG = svg.select("#imgs")

      // this group element will be used to contain all
      // plotting elements.
      plotG = svg.select("#plots")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

         function updateBreadcrumbs(idx) {
           br.selectAll("circle")
              .style("fill-opacity", function(d,i) {return i==idx ? 0.6:0.1;});
         }

    // EVENT: on clicking breadcrumb, change the page. -----------------------------
    br.selectAll("circle").on("click", function(d,i) {
      selectedFrame = this.id;

      updateBreadcrumbs(selectedFrame);
      activateFunctions[selectedFrame]();
    });
    // end of BREADCRUMBS ------------------------------------------------------------

// -- INTERACTION SELECTORS --
  beansWheat = d3.select("body").select("#beans-wheat");



// update all domains based on data.
// set the domain (data range) of data
// ! Note: should make more extendable by looking for the max in _either_ avg2010 or avg2014.

          x.domain([0, d3.max(rawData, function(element) { return element.avg2010; })]);

          y.domain(rawData.map(function(element) {return element.livelihood_zone}));

          // z.domain([d3.max(rawData, function(element) { return element.avg; }), 0]);

      // -- MILD DATA PROCESSING --
      // filter out just the livelihood zone names.
      lz = rawData.filter(function(d) {return d.livelihood_zone;});

      natlData = rawData.filter(function(d, i) {return i == 0}) // just get one, not loads.


      setupVis(rawData, lz, natlData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   *
   * NOTE: don't be tempted to group the elements together. Makes selection for transitions more complicated than needs to be.
   */
  setupVis = function(data, lz, natlData) {
    // Common chart elements

    // x-axis
    plotG.append("g")
         .call(xAxis)
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .style("opacity", 0); // ! Change to 0

    // y-axis
    plotG.append("g")
         .call(yAxis)
         .attr("class", "y axis")
         .style("opacity", 0);

    // x-axis title
    plotG.append("text")
          .attr("class", "x label")
          .attr("x", 0)
          .attr("y", -20)
          .text("percent of stunted children under 5 (2010)")
          .style("opacity", 0);

    // images (lz icons)
     var imgs = plotG.selectAll("image")
        .data(lz)
     .enter().append("image")
        .attr("class", "lz-icons")
         .attr("xlink:href", function(d) {return "/img/" +  d.livelihood_zone + ".png"})
         .attr("x", d3.max(data, function(element) { return x(element.avg2010 * 1.03); }))
         .attr("y", function(d) {return y(d.livelihood_zone)})
        //  .attr("height", y.bandwidth())
         .attr("height", 33) // NOTE: hard code temporarily
         .style("opacity", 0);


// FRAME 0: initial settings
        //  plotG.append("text")
        //    .attr("class", "title rwanda-title")
        //    .attr("x", width / 2)
        //    .attr("y", height / 3)
        //    .text("");
         //
        //  plotG.append("text")
        //    .attr("class", "sub-title rwanda-title")
        //    .attr("x", width / 2)
        //    .attr("y", (height / 3) + (height / 5) )
        //    .text("");

         plotG.selectAll(".rwanda-title")
           .style("opacity", 0);

// LINE: Natl. avg line (2010/2014)
   plotG.selectAll("#natlAll")
       .data(natlData)
     .enter().append("line")
       .attr("class", "natl")
       .attr("id", "natlAll")
       .attr("y1", 0)
       .attr("y2", height)
       .attr("x1", function(d) {return x(d.natl2010)})
       .attr("x2", function(d) {return x(d.natl2010)})
       .style("opacity", 0);

// LINE: natl. avg. 2010
    plotG.selectAll("#natl2010")
           .data(natlData)
         .enter().append("line")
           .attr("class", "natl")
           .attr("id", "natl2010")
           .attr("y1", 0)
           .attr("y2", height)
           .attr("x1", function(d) {return x(d.natl2010)})
           .attr("x2", function(d) {return x(d.natl2010)})
           .style("stroke-dasharray", ("5, 10"))
           .style("opacity", 0);

  // LINE: Change 2010 --> 2014
     var lineChange = plotG.selectAll(".change")
           .data(data)
       .enter().append("line")
           .attr("class", "change")
           .attr("y1", function(d) {return y(d.livelihood_zone)})
           .attr("y2", function(d) {return y(d.livelihood_zone)})
          //  .attr("y1", function(d) {return y(d.livelihood_zone) + y.bandwidth()/2})
          //  .attr("y2", function(d) {return y(d.livelihood_zone) + y.bandwidth()/2})
           .attr("x1", function(d) {return x(d.avg2010)})
           .attr("x2", function(d) {return x(d.avg2014)})
           .style("opacity", 0);

   // TEXT: national annotation
   plotG.selectAll("#natl-annot")
         .data(natlData)
       .enter().append("text")
         .attr("class", "natl-annot")
          .attr("id", "natl-annot")
         .attr("x", function(d) {return x(d.natl2010)})
         .attr("y", 40) // NOTE: hard coding for now.
         // .attr("y", y.bandwidth())
         .attr("dx", -10)
         .text(function(d) {return "national average: " + d3.format(".0%")(d.natl2010)})
         .style("opacity", 0);

// TEXT: national annotation 2010
         plotG.selectAll("#natl-annot2010")
               .data(natlData)
             .enter().append("text")
               .attr("class", "natl-annot")
               .attr("id", "natl-annot2010")
               .attr("x", function(d) {return x(d.natl2010)})
               .attr("y", 480) // NOTE: hard coding for now.
               // .attr("y", y.bandwidth())
               .attr("dx", 10)
               .text(function(d) {return "2010: " + d3.format(".0%")(d.natl2010)})
               .style("opacity", 0)
               .style("fill", function(d) {return z(d.natl2010)});

// MAP: map
           imgG.append("image")
             .attr("class", "rw-map")
             .attr("id", "choro2010")
             .attr("xlink:href", function(d) {return "/img/stunting/dhs2010_choro_lab.png"})
             .attr("width", "100%")
             .attr("height", "100%")
             .style("opacity", 0);

// MAP: regression coefs, 2010
      imgG.append("image")
        .attr("class", "rw-map")
        .attr("id", "regr2010")
        .attr("xlink:href", function(d) {return "/img/stunting/stuntingRegr2010.png"})
        .attr("x", 0)
        .attr("width", "45%")
        .attr("height", "100%")
        .style("opacity", 0);

        imgG.append("image")
          .attr("class", "rw-map")
          .attr("id", "regr2014")
          .attr("x", (width + margin.left + margin.right)/2)
          .attr("xlink:href", function(d) {return "/img/stunting/stuntingRegr2014.png"})
          .attr("width", "45%")
          .attr("height", "100%")
          .style("opacity", 0);

// TEXT: CI button
plotG.append("text")
  // .attr("class", "button")
  .attr("id", "ciText")
  .attr("x", width)
  .attr("y",  height + margin.bottom)
  .text("show 95% confidence interval")
  .style("opacity", 0);

ciButton = plotG.select("#ciText");

// LINE: Confidence INTERVALS
var ci2010 = plotG.selectAll(".ci #y2010")
  .data(data)
.enter().append("line")
  .attr("class", "ci")
  .attr("id", "y2010")
  .attr("y1", function(d) {return y(d.livelihood_zone)})
  .attr("y2", function(d) {return y(d.livelihood_zone)})
//  .attr("y1", function(d) {return y(d.livelihood_zone) + y.bandwidth()/2})
//  .attr("y2", function(d) {return y(d.livelihood_zone) + y.bandwidth()/2})
  .attr("x1", function(d) {return x(d.lb2010)})
  .attr("x2", function(d) {return x(d.ub2010)})
  .style("opacity", 0);

  var ci2014 = plotG.selectAll(".ci #y2014")
    .data(data)
  .enter().append("line")
    .attr("class", "ci")
    .attr("id", "y2014")
    .attr("y1", function(d) {return y(d.livelihood_zone)})
    .attr("y2", function(d) {return y(d.livelihood_zone)})
  //  .attr("y1", function(d) {return y(d.livelihood_zone) + y.bandwidth()/2})
  //  .attr("y2", function(d) {return y(d.livelihood_zone) + y.bandwidth()/2})
    .attr("x1", function(d) {return x(d.lb2014)})
    .attr("x2", function(d) {return x(d.ub2014)})
    .style("opacity", 0);

   // DOTS: Dot mask to underlie 2010 data when opacity is changed.
                 var dotMask2010 = plotG.selectAll(".dotMask")
                      .data(data)
                   .enter().append("circle")
                      .attr("class", "dot dotMask")
                      .attr("cx", function(d) {return x(d.avg2010)})
                      .attr("cy", function(d) {return y(d.livelihood_zone)})
                      // .attr("cy", function(d) {return y(d.livelihood_zone)+y.bandwidth()/2})
                      .attr("r", radius) // Calc equal area.
                      .style("fill", "white")
                      .style("stroke", "white")
                      .style("opacity", 0);

// DOTS: 2010 data
          var dotGroup2010 = plotG.selectAll(".dot.dot2010")
                        .data(data)
                      .enter().append("circle")
                        .attr("class", "dot dot2010")
                        .attr("cx", function(d) {return x(d.avg2010)})
                        .attr("cy", function(d) {return y(d.livelihood_zone)})
                        // .attr("cy", function(d) {return y(d.livelihood_zone)+y.bandwidth()/2})
                        .attr("r", radius)
                        .style("fill", function(d) {return z(d.avg2010)})
                        .style("stroke-opacity", 0)
                        .style("fill-opacity", 0);

          // DOTS: Initial national average, 2010.  To be changed to 2014.
              var dotGroup = plotG.selectAll("dot dotMain")
                   .data(data)
                .enter().append("circle")
                    .attr("class", "dot dotMain")
                   .attr("cx", function(d) {return x(d.natl2010)})
                   .attr("cy", height/2)
                   .attr("r", Math.sqrt(Math.pow(radius, 2)*13)) // Calc equal area.
                   .style("fill", function(d) {return z(d.natl2010)})
                   .style("opacity", 0);

  // value label for nat'l avg.
    var natlLabel = plotG.selectAll(".natl-value")
      .data(natlData)
    .enter().append("text")
      .attr("class", "natl-value")
      .attr("x", function(d) {return x(d.natl2010)})
      .attr("y", height/2)
      .attr("dy", 10) // 1/2 of font size, so more centered.
      .text(function(d) {return d3.format(".0%")(d.natl2010)})
      .style("opacity", 0);

// FRAME 2: Annotations
// labels
      var pctLab = plotG.selectAll(".val-labels")
          .data(data)
          .enter().append("text")
            .attr("class", "val-labels")
            .filter(function(d, i) {return i == 0 | i == 12;})
            .attr("x", function(d) {return x(d.avg2010)})
            .attr("dx", -radius*2)
            .attr("y", function(d) {return y(d.livelihood_zone)})
            // .attr("y", function(d) {return y(d.livelihood_zone)+y.bandwidth()/2})
            // .attr("dy", y.bandwidth()/4)
            .text(function(d) {return d3.format(".0%")(d.avg2010)})
            .style("opacity", 0)




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
    activateFunctions[0] = showInit;
    activateFunctions[1] = showNatl2010;
    activateFunctions[2] = showLZ2010;
    activateFunctions[3] = showMap;
    activateFunctions[4] = showChange;
    activateFunctions[5] = showChange2;
    activateFunctions[6] = showRegrMap;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 7; i++) {
      updateFunctions[i] = function() {};
    }
    // If using any updateFunctions, call it here.
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

  /**
   * -- FRAME 0 --
   * showInit - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showInit() {
    // previous (null)

    // subsequent: hide natl avg. graph
    plotG.selectAll(".dot.dotMain")
      .transition()
      .duration(0)
      .style("opacity", 0);

      hideX();

    plotG.selectAll(".natl-value")
              .transition()
              .duration(0)
              .style("opacity", 0);



    // show current
    plotG.selectAll(".rwanda-title")
      .transition()
      .duration(600)
      .style("opacity", 1.0);
  }

  /**
   * -- FRAME 1 --
   * showNatl2010 - show the nat'l avg. in 2010
   *
   * hides: intro title
   * hides: transition nat'l --> LZ.
   * shows: nat'l avg.
   *
   */
  function showNatl2010() {
    // previous
    plotG.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .style("opacity", 0);


    // current: make nat'l avg. appear.
    showX();

    plotG.selectAll(".dot.dotMain")
      .transition()
      .duration(600)
      .style("opacity", 1.0)
      // recode the cx, cy, r, fill to reverse transition if needed.
      .attr("cx", function(d) {return x(d.natl2010)})
      .attr("cy", height/2)
      .attr("r", Math.sqrt(Math.pow(radius, 2)*13)) // Calc equal area.
      .style("fill", function(d) {return z(d.natl2010)});

    plotG.selectAll(".natl-value")
        .transition()
        .duration(600)
        .style("opacity", 1);

    // hide subsequent: remove y axis
    hideY();

    hideLZ();

    hideAvg();

    hideValues();

    hideCIbutton();

  }


  /**
   * FRAME 2
   * showLZ2010 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showLZ2010() {
    // previous
    plotG.selectAll(".natl-value")
      .transition()
      .duration(0)
      .style("opacity", 0);

    // current: divide into LZ.
    showX();
    showY(1000, 1000);

    showLZ(1000, 1000);

    showAvg();

    showCIbutton();

    plotG.selectAll(".dot.dotMain")
      .transition()
        .duration(350)
        .attr("r", radius)
        .attr("cy", function(d) {return y(d.livelihood_zone)})
        .attr("transform","translate(0,0)")
  .transition()
    .delay(600)
    .duration(1500)
        .attr("cx", function(d) {return x(d.avg2010)})
        .style("fill", function(d) {return z(d.avg2010)});

    plotG.selectAll(".val-labels")
        .transition()
        .delay(2500)
        .duration(600)
        .style("opacity", 1.0)


    ciButton.on("click", function(d){
      if(allowCI){ // ciButton is exposed
        if(ciClick % 2) { // If pressed once, turn on.  If pressed again, turn off.
          hideCI();

          ciButton.text("show 95% confidence interval");
      } else{
        showCI();

        ciButton.text("hide 95% confidence interval");
      }
      // update click counter
        ciClick++;
    }
    });

    beansWheat.on("mouseover", function(d){
      plotG.selectAll('circle')
      .transition()
      .duration(500)
          .style("opacity", 0.3)
        .filter(function(d) {return d.livelihood_zone == 'Northern Highland Beans and Wheat'})
           .attr("r", radius*1.25)
           .style("opacity", 1);


           plotG.selectAll("g.y > g.tick")
           .transition()
           .duration(500)
               .style("opacity", 0.3)
             .filter(function(d) {return d == 'Northern Highland Beans and Wheat'})
                .style("opacity", 1);

          plotG.selectAll('.lz-icons')
                .transition()
                .duration(500)
                    .style("opacity", 0.3)
                  .filter(function(d) {return d.livelihood_zone == 'Northern Highland Beans and Wheat'})
                     .style("opacity", 1);
    });

    beansWheat.on("mouseout", function(d){
      plotG.selectAll('circle')
           .transition()
           .duration(500)
           .style("opacity", 1)
           .attr("r", radius);

           plotG.selectAll("g.y > g.tick")
           .transition()
           .duration(500)
           .style("opacity", 1);

          plotG.selectAll('.lz-icons')
                .transition()
                .duration(500)
                     .style("opacity", 1);
    })

        // subsequent
        imgG.selectAll("#choro2010")
          .transition()
          .duration(0)
          .style("opacity", 0);
  }

  /**
   * showMap - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showMap() {
    //  -- previous -- and -- subsequent --
    hideX();
    hideY();
    hideLZ();
    hideAvg();
    hideValues();
    hideCI();
    hideCIbutton();


    imgG.selectAll("#choro2010")
      .transition()
      .duration(600)
      .style("opacity", 1);

    plotG.selectAll(".dot.dotMain")
        .transition()
        .duration(600)
        .attr("cx", function(d) {return d.imgX;})
        .attr("cy", function(d) {return d.imgY;})
        .style("fill", function(d) {return z(d.avg2010)})
        .attr("transform","translate(-105,-40)")
        .transition()
        // .delay(600)
        .delay(function(d, i) {return i*100 + 600;})
        .duration(1000)
        .style("opacity", 0);

// -- subsequent --


// remove duplicate avg line
plotG.selectAll("#natl2010")
  .transition()
  .duration(0)
  .style("opacity", 0);

  // change avg. label
  plotG.selectAll("#natl-annot2010")
  .transition()
  .duration(0)
    .style("opacity", 0);

  hideAvg();

  // reanimate dots

  // change avg. line
  plotG.selectAll("#natlAll")
    .style("opacity", 0)
    .attr("x1", function(d) {return x(d.natl2010);})
    .attr("x2", function(d) {return x(d.natl2010);});

    // change avg. label
    plotG.selectAll("#natl-annot")
      .text(function(d) {return "national average: " + d3.format(".0%")(d.natl2010)})
        .style("font-size", "16px")
        .style("fill", "#555")
        .attr("x", function(d) {return x(d.natl2010);});

  }


  /**
   * showChange-- animate natl change 2010-->2014
   *
   */
  function showChange() {
    // -- previous --
    imgG.selectAll("#choro2010")
      .transition()
      .duration(600)
      .style("opacity", 0);


// -- current: dot plot reappear, fade map --
// change title
plotG.selectAll(".x.label")
  .text("percent of stunted children under 5")


showX();
showY(600, 0);
showLZ(600, 0);
showCIbutton();

// Show the average lines
plotG.selectAll("#natl2010")
  .transition()
  .duration(600)
  .style("opacity", 1);

  // change avg. label
  plotG.selectAll("#natl-annot2010")
  .transition()
  .duration(600)
    .style("opacity", 1)
    .style("font-size", "28px")
    .style("fill", function(d) {return z(d.natl2010)});

showAvg();

// reappear dots
plotG.selectAll(".dot.dotMain")
    .transition()
    .duration(600)
    .style("opacity", 1)
    .transition()
    .duration(600)
    .attr("cy", function(d) {return y(d.livelihood_zone)})
    .attr("transform","translate(0,0)")
    .style("fill", function(d) {return z(d.avg2010)})
    .attr("cx", function(d) {return x(d.avg2010)});

// add 2010/2014 annotation

// change avg. line
plotG.selectAll("#natlAll")
  .style("opacity", 1)
  .attr("x1", function(d) {return x(d.natl2010);})
  .attr("x2", function(d) {return x(d.natl2010);})
    .transition()
    .delay(1500)
  .duration(1500)
  .attr("x1", function(d) {return x(d.natl2014);})
  .attr("x2", function(d) {return x(d.natl2014);});

  // change avg. label
  plotG.selectAll("#natl-annot")
    .text(function(d) {return "2014: " + d3.format(".0%")(d.natl2014)})
      .style("font-size", "28px")
    .transition()
    .delay(1500)
  .duration(1500)
      .style("fill", function(d) {return z(d.natl2014)})
      .attr("x", function(d) {return x(d.natl2014);});

// -- subsequent --
// previous
// remove dot mask
plotG.selectAll(".dotMask")
  .transition()
  .duration(0)
  .style("opacity", 0);

// remove 2010 data
plotG.selectAll(".dot.dot2010")
  .transition()
  .duration(0)
  .style("fill-opacity", 0)
  .style("stroke-opacity", 0);

  // remove change line
  plotG.selectAll(".change")
    .transition()
    .duration(0)
    .style("opacity", 0);


  }

  /**
   * showChange2-- animate natl change 2010-->2014
   * Part 2: animate LZ changes.
   *
   */
  function showChange2() {
    // -- CURRENT --
    showX();
    showY();
    showLZ();
    showAvg();
    showCIbutton();

    // add in the dots to protect the opacity changes
    plotG.selectAll(".dotMask")
      .style("opacity", 1);

    // add in the dummy dots
    plotG.selectAll(".dot.dot2010")
      .style("fill-opacity", 1)
      .style("stroke-opacity", 1)
      .transition()
        .duration(5000)
        .style("fill-opacity", 0.2);


    // change the normal dots to 2014 data.
    plotG.selectAll(".dot.dotMain")
    .transition()
      // .delay(function(d,i) {return i*100;})
      .duration(4000)
      .attr("cx", function(d) {return x(d.avg2014)})
      .style("fill", function(d) {return z(d.avg2014)});

    // Change the avg. labels to not be so prominent.
    // change avg. label
    plotG.selectAll(".natl-annot")
        .style("font-size", "16px")
        .style("fill", "#555");


// add 2010/2014 change data
      plotG.selectAll(".change")
              .transition()
              .duration(1000)
              .style("opacity", 1);

  // -- SUBSEQUENT -- (for reversing)
  imgG.selectAll("#regr2010")
    .transition()
    .duration(0)
    .style("opacity", 0);

  imgG.selectAll("#regr2014")
      .transition()
      .duration(0)
      .style("opacity", 0);
  }


function showRegrMap() {
  // -- PREVIOUS --
  hideX();
  hideY();
  hideLZ();
  hideAvg();
  hideValues();
  hideCI();
  hideCIbutton();

    plotG.selectAll(".dot")
    .transition()
    .duration(0)
    .style("fill-opacity", 0)
    .style("stroke-opacity", 0);

  plotG.selectAll(".natl")
  .transition()
  .duration(0)
  .style("opacity", 0);

  plotG.selectAll(".change")
  .transition()
  .duration(0)
  .style("opacity", 0);

  plotG.selectAll(".natl-annot")
  .transition()
  .duration(0)
  .style("opacity", 0);

  // -- CURRENT --
  imgG.selectAll("#regr2010")
    .transition()
    .duration(600)
    .style("opacity", 1);

  imgG.selectAll("#regr2014")
      .transition()
      .delay(300)
      .duration(1600)
      .style("opacity", 1);

  // -- SUBSEQUENT -- (for reversing)
}

  /**
   * HELPER FUNCTIONS
   */
// -- X-AXIS --
function showX() {
  plotG.selectAll(".x.axis")
      .transition()
      .duration(600)
      .style("opacity", 1);

  plotG.selectAll(".x.label")
          .transition()
          .duration(600)
          .style("opacity", 1);
}

function hideX() {
  plotG.selectAll(".x.axis")
      .transition()
      .duration(0)
      .style("opacity", 0);

  plotG.selectAll(".x.label")
          .transition()
          .duration(0)
          .style("opacity", 0);
}

// -- Y-AXIS --
function showY(tDuration, tDelay){
  plotG.selectAll(".y.axis")
    .transition()
    .duration(tDuration)
    .delay(tDelay)
    .style("opacity", 1.0);
}

function hideY() {
  plotG.selectAll(".y.axis")
    .transition()
    .duration(0)
    .style("opacity", 0);
}

// -- LIVELIHOOD ZONE MAPS --
   function showLZ(tDuration, tDelay) {
     plotG.selectAll(".lz-icons")
         .transition()
         .duration(tDuration)
         .delay(tDelay)
         .style("opacity", 1);
   }

  function hideLZ() {
        plotG.selectAll(".lz-icons")
            .transition()
            .duration(600)
            .style("opacity", 0);
      }
  // -- NATL AVG LINE --
  function showAvg() {
    plotG.selectAll("#natlAll")
    .transition()
    .duration(600)
    .style("opacity", 1)

    plotG.selectAll("#natl-annot")
    .transition()
    .duration(600)
    .style("opacity", 1)
  }

  function hideAvg() {
    plotG.selectAll("#natlAll")
    .transition()
    .duration(0)
    .style("opacity", 0)

    plotG.selectAll("#natl-annot")
    .transition()
    .duration(0)
    .style("opacity", 0)
  };

  // -- PCT LABELS --
  function hideValues() {
    plotG.selectAll(".val-labels")
    .transition()
    .duration(0)
    .style("opacity", 0)
};

// -- CONFIDENCE INTERVALS --
function showCI() {
  plotG.selectAll(".ci")
  .transition()
  .duration(600)
  .style("opacity", 0.25)
};

function hideCI() {
  plotG.selectAll(".ci")
  .transition()
  .duration(0)
  .style("opacity", 0)
};

// button
function showCIbutton(){
  ciButton
    .classed("button", true)
    .transition()
    .duration(0)
    .style("opacity", 1);

  allowCI = true;
}

function hideCIbutton(){
  ciButton
  .classed("button", false)
    .transition()
    .duration(0)
    .style("opacity", 0);

  allowCI = false;
}

  /**
  * TRANSITION VARIABLES
  **/
  var basicTransit = d3.transition()
    .delay(1000)
    .duration(4000);

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */



  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */



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
d3.csv("data/stunting.csv", display);
