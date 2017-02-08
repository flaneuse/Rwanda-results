
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
  var graphic_aspect_height = 4;
  var padding_right = 20; // for breadcrumbs
  var padding_bottom = 5;
  var padding_top = 60;

// window function to get the size of the outermost parent
  var graphic = d3.select("#graphic");

// Get size of graphic and sidebar
  var graphicSize = graphic.node().getBoundingClientRect();
  var sidebarSize = d3.select("#sections").node().getBoundingClientRect();

  maxW = graphicSize.width - sidebarSize.width - padding_right;
  maxH = $(window).height() - padding_top - padding_bottom;

  // constants to define the size
  // and margins of the vis area, based on the outer vars.

  var margin = { top: 5, right: 5, bottom: 5, left: 5 };
  var width = maxW - margin.left - margin.right;
  var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

  // check height is within window
  if(height > maxH) {
    height = maxH;
  }

  // Specific margins for each of the different windows
  var margins = {
    map:      { top: 0, right: 15, bottom: 0, left: 0 },
    tfr:      { top: 50, right: 125, bottom: 25, left: 35 },
    mcu:      { top: 75, right: 75, bottom: 25, left: 235 },
    religDot: { top: 75, right: 125, bottom: 25, left: 35 },
    religBar: { top: 125, right: 75, bottom: 125, left: 35 }
  };

  var dims = {
    map:      { w: width - margins.map.right - margins.map.left,
                h: height - margins.map.top - margins.map.bottom},
    tfr:      { w: width - margins.tfr.right - margins.tfr.left,
                h: height - margins.tfr.top - margins.tfr.bottom},
    mcu:      { w: width - margins.mcu.right - margins.mcu.left,
                h: height - margins.mcu.top - margins.mcu.bottom},
    religDot: { w: width - margins.religDot.right - margins.religDot.left,
                h: height - margins.religDot.top - margins.religDot.bottom},
    religBar: { w: width - margins.religBar.right - margins.religBar.left,
                h: height - margins.religBar.top - margins.religBar.bottom}
  }
console.log(dims)

// end RESPONSIVENESS (plus call in 'display') ---------------------------------------------------------------

// CONSTANTS -------------------------------------------------------------------
  var numSlides = 12;
  var radius_bc = 7; // radius of breadcrumbs
  var spacing_bc = 25; // spacing between breadcrumbs, in pixels.

  var radius = 5;

  var tDefault = 600; // standard transition timing in ms

  var colorPalette = ['#5254a3','#ad494a','#e7ba52']; // Vega category20b
  var colorPaletteLight = ['#637939', '#7b4173', '#e7ba52', '#ad494a', '#5254a3', '#a7a9ac'];
  // #e7cb94', '#e7969c', '#9c9ede', '#a7a9ac']; // Vega category20b, with some of the lighter colors

  // Initial settings for MCU stepper
  var selectedCat = "Livelihood Zone";
  var selectedYear = 2014;

// Religion
var focusRelig = ["Protestant", "Catholic"];


  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

// INITIALIZE SELECTORS -------------------------------------------------------------------
  var vis = d3.select("#graphic");
  var nav = d3.select("#clicky").append("ul")
    .attr("id", "select-cat")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
  // For TFR
        var x = d3.scale.linear()
             .range([0, dims.tfr.w]);

       var y = d3.scale.linear()
            .range([dims.tfr.h, 0]);

       var z = d3.scale.ordinal()
        .range(colorPalette)

        var xAxTFR = d3.svg.axis()
             .scale(x)
            //  .tickFormat(d3.time.format("%Y"))
             .orient("top")
             .ticks(5);

        var yAxTFR = d3.svg.axis()
             .scale(y)
             .orient("left")
             .innerTickSize(dims.tfr.w);

// AXES for MCU
       var xMCU = d3.scale.linear()
            .range([0, dims.mcu.w]);

       var yMCU = d3.scale.ordinal()
            .rangeBands([0, dims.mcu.h], 0.2, 0);

       var zMCU = d3.scale.linear()
       // .range(colorPalette)
         .range(colorbrewer.Spectral[11])
         .interpolate(d3.interpolateHcl)
            .domain([0.1, 0.2]);

       var xAxMCU = d3.svg.axis()
            .scale(xMCU)
            .orient("top")
            .ticks(5, "%")
            .innerTickSize(dims.mcu.h);

       var yAxMCU= d3.svg.axis()
            .scale(yMCU)
            .orient("left");

// AXES for Religion dot plot

    var xRdot = d3.scale.linear()
     .range([0, dims.religDot.w]);

     var yRdot = d3.scale.linear()
          .range([dims.religDot.h, 0]);


    var zRelig = d3.scale.ordinal()
           .range(colorPaletteLight)

     var xAxRdot = d3.svg.axis()
          .scale(xRdot)
          .tickFormat(d3.format("d"))
          .orient("top");

     var yAxRdot= d3.svg.axis()
          .scale(yRdot)
          .ticks(5, "%")
          .innerTickSize(dims.religDot.w)
          .orient("left");


  // AXES for Religion bar plot

      var xRbar = d3.scale.linear()
       .range([0, dims.religBar.w]);

       var yRbar = d3.scale.ordinal()
            .rangeBands([0, dims.religBar.h], 0.2, 0);

       var xAxRbar = d3.svg.axis()
            .scale(xRbar)
            .tickFormat(d3.format(".1s"))
            .innerTickSize(dims.religBar.h)
            .orient("top");

       var yAxRbar= d3.svg.axis()
            .scale(yRbar)
            // .tickFormat(d3.format("d"))
            // .ticks(5)
            .orient("left");

// line generator
        var line = d3.svg.line() // d3.line for v4
              .x(function(d) { return x(d.year); })
              .y(function(d) { return y(d.tfr); });

// lollipop generator
    // var lollipop = d3.svg.line() // d3.line for v4
    //   .x1(function(d) { return x(0); })
    //   .x2(function(d) { return x(d.ave); })
    //   .y1(function(d) { return y(d.Variable); })
    //   .y2(function(d) { return y(d.Variable); });

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

       svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       // this group element will be used to contain all
       // other elements.
       plotG = svg.select("#plots");

        // create group for images
        // this group element will be used to contain all
        // big image elements (mostly maps; could also be used for static visualizations).
        svg.append("g")
          .attr("id", "imgs");

       imgG = svg.select("#imgs")

    tfr = plotG
    .append("g")
      .attr("id", "tfr")
      .attr("transform", "translate(" + margins.tfr.left + "," + margins.tfr.top + ")")
      .style("opacity", 0) // set initially to 0.

    summ = vis.select("#vis").append("div")
    .attr("id", "fp-summary")
    .style("max-width", dims.map.w + "px")
    .style("opacity", 0);

    mcu = plotG
    .append("g")
     .attr("id", "mcu")
     .attr("transform", "translate(" + margins.mcu.left + "," + margins.mcu.top + ")")
     .style("opacity", 0);

    religDot = plotG
    .append("g")
     .attr("id", "relig-dot")
     .attr("transform", "translate(" + margins.religDot.left + "," + margins.religDot.top + ")")
     .style("opacity", 0);

    religBar = plotG
    .append("g")
     .attr("id", "relig-bar")
     .attr("transform", "translate(" + margins.religBar.left + "," + margins.religBar.top + ")")
     .style("opacity", 0);

// Data processing



// TFR data ---------------------------------------------------------------------------
tfrData = rawData["tfr"];

// convert to numbers
tfrData.forEach(function(d) {
    d.tfr = +d.tfr;
    d.year = +d.year;
});

tfrCountries = tfrData.filter(function(d) {return d.variable == "Total"});
tfrRwanda = tfrData.filter(function(d) {return d.country == "Rwanda"});

var tfrNest = d3.nest()
    .key(function(d) {return d.country;})
    .entries(tfrCountries);

// MCU data ---------------------------------------------------------------------------
    mcuData = rawData["mcu"];

    // convert to numbers
    mcuData.forEach(function(d) {
        d.ave = +d.ave;
        d.lb = +d.lb;
        d.ub = +d.ub;
        d.year = +d.year;
    });

// Filter and sort the data
    filtered = mcuData.filter(function(d) {return d.Category == selectedCat })
        .filter(function(d) {return d.year == selectedYear });

      lz = mcuData
      .filter(function(d) {return d.Category == "Livelihood Zone"});
      // .map(function(element) {return element.Variable;});

      var nested = d3.nest()
      .key(function(d) { return d.Category })
      .entries(mcuData.sort(function(a,b) {return b.order - a.order}));

// Religion census numbers ------------------------------------------------------------
var religData = rawData["relig"];

// convert to numbers
religData.forEach(function(d) {
    d.pct = +d.pct;
    d.pop = +d.pop;
    d.year = +d.year;
});

// Religion pop pyramid ---------------------------------------------------------------------------
var religAgeData = rawData["religAge"];

// Nest by religion
var religAgeData = d3.nest()
  .key(function(d) { return d.religion })
  .entries(religAgeData.sort(function(a,b) {return b.order - a.order}));
// console.log(religAgeData)

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

 // NAVBAR ----------------------------------------------------------------------
           // Clicky buttons at top.
             nav.selectAll("ul")
               .style("width", "20px")
               .data(nested)
             .enter().append("li").append("a")
               .attr("id", function(d) {return d.key;})
               .attr("class", "button")
               .attr("x", function(d, i) {return i*150 + 10;})
               .attr("y",100)
               .text(function(d) {return d.key;})
               // #cde6c6
               .style("background-color", function(d,i) {return d.key == selectedCat ? "#dceed7" : "#eee";});

       // CLICK : select a different category
       // Every time a button is clicked, do the following:
       // 1. turn off the old button color
       // 2. change the button color.
       // 3. revert to the average value for MCU (transition)
       // 4. update the y-axis (scales = "free_y")
       // 5. transition to the new values
       // 6. remove LZ, if needed
   d3.selectAll("a.button")
   .on("click", function(d) {
     selectedCat = this.id;

     // Change the color of the buttons
     nav.selectAll("a")
       .style("background-color", function(d,i) {return d.key == selectedCat ? "#dceed7" : "#eee";})

     nav.selectAll("a.button:before")
       .style("background-color", function(d,i) {return d.key == selectedCat ? "#dceed7" : "#eee";})



// change the dots

filtered2 = mcuData.filter(function(d) {return d.Category == selectedCat })
    .filter(function(d) {return d.year == selectedYear });

    natl = mcuData.filter(function(d) {return d.Category == "National" })
        .filter(function(d) {return d.year == selectedYear });

    var mcuAvg = natl[0].ave;


    var mcuDots = mcu.selectAll("circle")
    .data(filtered2.sort(function(a,b) {return b.ave - a.ave}))


    // Change the y-axis.
    // Note: must be done AFTER the filtering and sorting.
    updateY(filtered2, selectedCat, selectedYear);

    d3.selectAll("#mcu-y")
      .call(yAxMCU)

    mcuDots
    .enter().append("circle")
        .attr("fill", function(d) {return zMCU(mcuAvg)})

    // remove extra dots
    mcuDots.exit().remove();

    // change to average
    mcuDots.transition()
    .duration(600)
    .attr("class", "dot")
    .attr("cx", xMCU(mcuAvg))
    .attr("cy",  dims.mcu.h/2)
    .attr("fill", function(d) {return zMCU(mcuAvg)})
    .attr("r", radius*2)


    // change to new values
    mcuDots.transition(1000).delay(650)
      .attr("cx", function(d) {return xMCU(d.ave);})
      .attr("cy", function(d) {return yMCU(d.Variable) + yMCU.rangeBand()/2})
      // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
      .attr("fill", function(d) {return zMCU(d.ave);});

// Turn on or off lz maps & update position
if(selectedCat == "Livelihood Zone") {
  mcu.selectAll("#lz-icons")
  .transition(1000)
    .attr("y", function(d) {return yMCU(d.Variable) })
    .style("opacity", 1);
   } else {
     mcu.selectAll("#lz-icons")
       .transition(1000)
        .style("opacity", 0);
   }
        })
   // -----------------------------------------------------------------------------

 // DOMAINS -------------------------------------------------------------------------
 // set the domain (data range) of data

 // TFR
   x.domain([d3.min(tfrData, function(element) { return element.year; }),
             d3.max(tfrData, function(element) { return element.year; })]);
   y.domain([0, d3.max(tfrData, function(element) { return element.tfr; })]);
   z.domain(tfrData.map(function(element) {return element.country}));

   // Religion Dot
     xRdot.domain([d3.min(religData, function(element) { return element.year; }),
               d3.max(religData, function(element) { return element.year; })]);
     yRdot.domain([0, d3.max(religData.filter(function(d) {return d.religion != 'national'}),
       function(element) { return element.pct; })]);
     zRelig.domain(religData.map(function(element) {return element.religion}));

     xAxRdot.tickValues(xRdot.domain())

     // Religion Bar
       yRbar.domain(religData.map(function(element) {return element.year}));
       xRbar.domain([0, d3.max(religData.filter(function(d) {return focusRelig.indexOf(d.religion) > -1;}),
         function(element) { return element.pop; })]);

      //  yAxRbar.tickValues(yRbar.domain())

// MCU
   xMCU.domain([0, d3.max(mcuData, function(element) { return element.ave; })]);

   function updateY(mcuData, selectedCat, selectedYear) {
     yMCU.domain(mcuData
       .filter(function(d) {return d.Category == selectedCat})
       .filter(function(d) {return d.year == selectedYear})
       .sort(function(a,b) {return b.ave - a.ave})
       .map(function(element) {return element.Variable})
     );
};
     // Initialize y-domain.
     updateY(mcuData, selectedCat, selectedYear);

// EVENT: on clicking breadcrumb, change the page. -----------------------------
br.selectAll("circle").on("click", function(d,i) {
  selectedFrame = this.id;

  updateBreadcrumbs(selectedFrame);
  activateFunctions[selectedFrame]();
});
// end of BREADCRUMBS (+ update function) ------------------------------------------------------------




// Call the function to set up the svg objects
       setupVis(tfrCountries, tfrNest, tfrRwanda, religData);

// Set up the functions to edit the sections.
       setupSections();

     });
   };



/* SETUP VIS -------------------------------------------------------------------
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function(data, tfrNest, tfrRwanda, religData) {

    // --- RELIGION BAR PLOT ---
        // x-axis label
            religBar.append("text")
                .attr("class", "top-label")
                .attr("x", 0)
                .attr("y", -30)
                .text("percent of population");

            religBar.append("g")
                .call(xAxRbar)
                .attr("class", "x axis")
                .attr("id", "relig-x")
                // .attr("transform", "translate(0," + height + ")")
                .style("opacity", 1);

            religBar.append("g")
                    .call(yAxRbar)
                    .attr("class", "y axis")
                    .attr("id", "relig-y")
                    // .attr("transform", "translate(" + width + ",0)")
                    .style("opacity", 1);

// Normal bars
            religBar.selectAll(".bar")
              .data(religData.filter(function(d) {return d.ref == 0 &
                focusRelig.indexOf(d.religion) > -1;}))
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("y", function(d) {return yRbar(d.year);})
                .attr("width", function(d) {return xRbar(d.pop);})
                .attr("height", yRbar.rangeBand())
                // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
                .attr("fill", function(d) {return zRelig(d.religion);})
                .attr("stroke", function(d) {return d.ref == 0 ? zRelig(d.religion) : "none";})
                .style("stroke-width", 1)
                .style("fill-opacity", 0.35);

// Highlight diff
                religBar.selectAll("#bar-diff")
                  .data(religData.filter(function(d) {return d.ref == 1 &
                    focusRelig.indexOf(d.religion) > -1;}))
                .enter().append("rect")
                    .attr("class", "bar")
                    .attr("id", "bar-diff")
                    .attr("x", function(d) {return xRbar(d.pop);})
                    .attr("y", function(d) {return yRbar(d.year);})
                    .attr("width", function(d) {return xRbar(d.diff);})
                    .attr("height", yRbar.rangeBand())
                    // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
                    .attr("fill", function(d) {return zRelig(d.religion);})
                    .attr("stroke", function(d) {return d.ref == 0 ? zRelig(d.religion) : "none";})
                    .style("stroke-width", 1)
                    .style("fill-opacity", 0.15);

// Ref line: 2002
                religBar.selectAll("#bar-ref")
                  .data(religData.filter(function(d) {return d.ref == 1 &
                    focusRelig.indexOf(d.religion) > -1;}))
                .enter().append("line")
                    .attr("class", "bar")
                    .attr("id", "bar-ref")
                    .attr("x1", function(d) {return xRbar(d.pop);})
                    .attr("y1", function(d) {return yRbar(d.year);})
                    .attr("x2", function(d) {return xRbar(d.pop);})
                    .attr("y2", function(d) {return yRbar(d.year) + yRbar.rangeBand();})
                    // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
                      .attr("stroke", function(d) {return zRelig(d.religion);})
                    .style("opacity", 1);

// Ref line: Catholics
    religBar.selectAll("#cath-ref")
            .data(religData.filter(function(d) {return d.ref == 0 &
              d.religion == "Catholic";}))
          .enter().append("line")
              // .attr("class", "bar")
              .attr("id", "cath-ref")
              .attr("x1", function(d) {return xRbar(d.pop);})
              .attr("y1", function(d) {return yRbar(d.year);})
              .attr("x2", function(d) {return xRbar(d.pop);})
              .attr("y2", function(d) {return yRbar(d.year) + yRbar.rangeBand();})
              // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
                .attr("stroke", function(d) {return zRelig(d.religion);})
                .attr("stroke-width", 4)
              .style("opacity", 1);

    // --- end RELIGION BAR PLOT ---

// --- RELIGION DOT PLOT ---
    // x-axis label
        religDot.append("text")
            .attr("class", "top-label")
            .attr("x", 0)
            .attr("y", -30)
            .text("percent of population");

        religDot.append("g")
            .call(xAxRdot)
            .attr("class", "x axis")
            .attr("id", "relig-x")
            // .attr("transform", "translate(0," + height + ")")
            .style("opacity", 1);

        religDot.append("g")
                .call(yAxRdot)
                .attr("class", "y axis")
                .attr("id", "relig-y")
                // .attr("transform", "translate(" + width + ",0)")
                .style("opacity", 1);

        religDot.selectAll(".dot")
          .data(religData)
        .enter().append("circle")
            .attr("class", "dot")
            .attr("r", radius*1.5)
            .attr("cx", function(d) {return xRdot(d.year);})
            .attr("cy", function(d) {return yRdot(d.pct);})
            // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
            .attr("fill", function(d) {return zRelig(d.religion);})
            .style("opacity", function(d) {return focusRelig.indexOf(d.religion) > -1 ? 1 : 0.35;});

        religDot.selectAll(".slope")
              .data(religData)
            .enter().append("line")
                .attr("class", "slope")
                // .attr("x1", function(d) {return xRdot(d.year);})
                // .attr("cy", function(d) {return yRdot(d.pct);})
                // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
                .attr("fill", function(d) {return zRelig(d.religion);});

      // TEXT: Religion label
          religDot.selectAll("#religDot-annot")
              .data(religData.filter(function(d) {return d.mostrecent == true;}))
            .enter().append("text")
              .attr("id", "religDot-annot")
              .attr("class", "annot")
              .text(function(d) {return d.religion})
              .attr("x", dims.religDot.w)
              .attr("dx", 20)
              .attr("y", function(d) {return yRdot(d.pct);})
              // .attr("dy", "0.4em")
              .attr("fill", function(d) {return zRelig(d.religion);})
              .style("opacity", function(d) {return focusRelig.indexOf(d.religion) > -1 ? 1 : 0.35;});

      // TEXT: % religion value
          religDot.selectAll("#Rpct-annot")
              .data(religData.filter(function(d) {return focusRelig.indexOf(d.religion) > -1;}))
            .enter().append("text")
              .attr("id", "Rpct-annot")
              .attr("class", "annot")
              .text(function(d) {return d3.format(".0%")(d.pct)})
              .attr("x", function(d) {return xRdot(d.year);})
              .attr("dy", -20)
              .attr("y", function(d) {return yRdot(d.pct);})
              .attr("fill", function(d) {return zRelig(d.religion);})
              .style("opacity", 1);
// --- end RELIGION DOT PLOT ---

mcu.append("g")
.call(xAxMCU)
    .attr("class", "x axis")
    .attr("id", "mcu-x")
    // .attr("transform", "translate(0," + height + ")")
    .style("opacity", 1);

mcu.append("g")
.call(yAxMCU)
  .attr("class","y axis")
  .attr("id", "mcu-y")
  .style("opacity", 1);



  mcu.selectAll(".dot")
    .data(filtered)
  .enter().append("circle")
      .attr("class", "dot")
      .attr("r", radius*1.5)
      .attr("cx", function(d) {return xMCU(d.ave);})
      .attr("cy", function(d) {return yMCU(d.Variable) + yMCU.rangeBand()/2})
      // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
      .attr("fill", function(d) {return zMCU(d.ave);});



      // image

var imgs = mcu.selectAll("image")
          .data(lz)
        .enter().append("image")
        .attr("xlink:href", function(d) {return "/img/" + d.Variable + ".png"})
        // .attr("xlink:href", function(d) {return "/img/" +  d.Variable + ".png"})
          .attr("id", "lz-icons")
          .attr("x", d3.max(data, function(element) { return xMCU(element.ave) * 1.03; }))
          .attr("y", function(d) {return yMCU(d.Variable) })
          .attr("height", yMCU.rangeBand()) //y.bandwidth()
          .attr("transform", "translate(" + dims.mcu.w + ",0)")
          .style("opacity", function(d) {return d.Category == "Livelihood Zone" ? 1 : 0})

    // MAP: map
   imgG.append("image")
       .attr("class", "rw-map")
       .attr("id", "popdensity")
       .attr("xlink:href", function(d) {return "/img/intro/afr5.png"})
       .attr("width", dims.map.w)
       .attr("height", "100%")
       .style("opacity", 1);

    // draw the axes
  tfr.append("g")
    .call(xAxTFR)
        .attr("class", "x axis")
        .attr("id", "tfr-x")
        .attr("transform", "translate(0," + -margin.top/2 + ")")
        .style("opacity", 1);

  tfr.append("g")
    .call(yAxTFR)
        .attr("class","y axis")
        .attr("id", "tfr-y")
        .style("opacity", 1);


  // PATH: add connector lines
  var tfr2 = tfr.selectAll(".tfr")
   .data(tfrNest)
   .enter().append("g")
     .attr("class", "tfr");

   tfr2.append("path")
       .attr("class", "line")
       .attr("d", function(d) { return line(d.values); })
       .attr("id", "tfr-line")
       .style("stroke", function(d) { return z(d.key);})
       .style("opacity", 1);

    // CIRCLES: TFR over time
    tfr.selectAll("#tfr-mask")
        .data(data)
      .enter().append("circle")
        .attr("id", "tfr-mask")
        .attr("class", "dot_mask")
        .attr("r", radius)
        .attr("cx", function(d) {return x(d.year);})
        .attr("cy", function(d) {return y(d.tfr);})
        .style("opacity", 1);

    tfr.selectAll("#tfr-circles")
        .data(data)
      .enter().append("circle")
        .attr("id", "tfr-circles")
        .attr("class", "dot")
        .attr("r", radius)
        .attr("cx", function(d) {return x(d.year);})
        .attr("cy", function(d) {return y(d.tfr);})
        .style("fill", function(d) {return z(d.country);})
        .style("stroke", function(d) {return z(d.country);})
        .style("stroke-opacity", 1)
        .style("fill-opacity", 0.5);

  // TEXT: Country label
      tfr.selectAll("#tfr-annot")
          .data(data.filter(function(d) {return d.mostrecent == true;}))
        .enter().append("text")
          .attr("id", "tfr-annot")
          .attr("class", "annot")
          .text(function(d) {return d.country})
          .attr("x", dims.tfr.w)
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
            .attr("y", dims.tfr.h)
            .style("opacity", 1);

// TEXT: Summary ----------

    summ.append("div")
      .attr("class", "subtitle accent-green")
      .text("What did we find?");

summ.append("div")
      .text("For women aged 15 - 49 in a union:")
      .attr("id", "summary-qualifier")
      .append("ul")
        .attr("class", "summary-list")

      var summ1 = summ.selectAll(".summary-list").append("li");

      var summ2 = summ.selectAll(".summary-list").append("li");

      var summ3 = summ.selectAll(".summary-list").append("li");

      summ1.append("a")
        .text("Protestant women are less likely to use modern contraception")
        .attr("href", "#protestants")
        .attr("id", "prot-jump")
      summ1.append("span")
        .attr("id", "intro-link")
        .text(" relative to similar Catholic women, and more likely to want larger families.")

      summ2.append("a")
        .attr("href", "#geo")
        .attr("id", "geo-jump")
        .text("Geography matters:")
      summ2.append("span")
        .text(" In the northwest region, one of the most populated in all Rwanda, were more likely to use modern contraception than those in the central area, while women in the southwest were less likely.")

      summ3.append("a")
        .attr("href", "#demographics")
        .attr("id", "demo-jump")
        .text("Desires for more children are prevalent:")
      summ3.append("span")
        .text(" Modern contraception use and desires for more children appear constant across socioeconomic and educational backgrounds.")

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
    activateFunctions[2] = show3;
    activateFunctions[3] = show4;
    activateFunctions[4] = show5;
    activateFunctions[5] = show6;
    activateFunctions[6] = show7;
    activateFunctions[7] = show8;
    activateFunctions[8] = show9;
    activateFunctions[9] = show10;
    activateFunctions[10] = show11;
    activateFunctions[11] = show12;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 12; i++) {
      updateFunctions[i] = function() {};
    }
  };
// end of SETUP SECTIONS -------------------------------------------------------


// ACTIVATE FUNCTIONS ----------------------------------------------------------
// [[ #1 ]] --------------------------------------------------------------------
  function show1() {
    // -- TURN OFF PREVIOUS --
        // NA

    // -- TURN OFF NEXT --
    tfrOff();
    mcuOff();
    rDotOff();
    // rBarOff();

    // -- TURN ON CURRENT --
    imgG.selectAll("#popdensity")
      .transition()
      .duration(tDefault)
      .style("opacity", 1);

  }

// [[ #2 ]] --------------------------------------------------------------------
  function show2() {

// -- TURN OFF PREVIOUS --
    imgG.selectAll("#popdensity")
      .transition()
        .duration(0)
        .style("opacity", 0);

// -- TURN OFF NEXT --
  summaryOff();

// -- TURN ON CURRENT --
  tfrOn(tDefault);

  }

// [[ #3 ]] --------------------------------------------------------------------
  function show3() {
// -- TURN OFF PREVIOUS --
  tfrOff();

// -- TURN OFF NEXT --
  religOff();

// -- TURN ON CURRENT --
  summaryOn(tDefault);

  }

// [[ #4 ]] --------------------------------------------------------------------
  function show4() {
// -- TURN OFF PREVIOUS --
  summaryOff();

// -- TURN OFF NEXT --
  rDotOff();

// -- TURN ON CURRENT --
  religOn(tDefault);
  }

// [[ #5 ]] --------------------------------------------------------------------
  function show5() {
// -- TURN OFF PREVIOUS --
  religOff();

// -- TURN OFF NEXT --
  rBarOff();

// -- TURN ON CURRENT --
  rDotOn(tDefault);
  }

// [[ #6 ]] --------------------------------------------------------------------
  function show6() {
// -- TURN OFF PREVIOUS --
  rDotOff();

// -- TURN OFF NEXT --


// -- TURN ON CURRENT --
  rBarOn(tDefault);
  }

// [[ #7 ]] --------------------------------------------------------------------
  function show7() {
// -- TURN OFF PREVIOUS --


// -- TURN OFF NEXT --
  religMapOff();

// -- TURN ON CURRENT --

  }

// [[ #8 ]] --------------------------------------------------------------------
  function show8() {
// -- TURN OFF PREVIOUS --

// -- TURN OFF NEXT --
  mcuMapOff();

// -- TURN ON CURRENT --
  religMapOn(tDefault);
  }


// [[ #9 ]] --------------------------------------------------------------------
  function show9() {
// -- TURN OFF PREVIOUS --
  religMapOff();
// -- TURN OFF NEXT --
  mcuRegrOff();

// -- TURN ON CURRENT --
  mcuMapOn(tDefault);
  }

// [[ #10 ]] --------------------------------------------------------------------
  function show10() {
// -- TURN OFF PREVIOUS --
  mcuMapOff();

// -- TURN OFF NEXT --


// -- TURN ON CURRENT --
  mcuRegrOn(tDefault);
  }

// [[ #11 ]] --------------------------------------------------------------------
  function show11() {
// -- TURN OFF PREVIOUS --
  mcuRegrOff();
// -- TURN OFF NEXT --
  mcuOff();

// -- TURN ON CURRENT --

  }

// [[ #12 ]] --------------------------------------------------------------------
  function show12() {
// -- TURN OFF PREVIOUS --

// -- TURN OFF NEXT --


// -- TURN ON CURRENT --
  mcuOn(tDefault);

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

function mcuOn(tDefault) {
  nav.selectAll("a")
    .transition()
    .duration(tDefault)
    .style("opacity", 1);

  plotG.selectAll("#mcu")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);
}

function mcuOff() {
  nav.selectAll("a")
    .transition()
    .duration(0)
    .style("opacity", 0);

  plotG.selectAll("#mcu")
    .transition()
      .duration(0)
      .style("opacity", 0);

}

function rDotOn(tDefault) {
  plotG.selectAll("#relig-dot")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);
}

function rDotOff() {
  plotG.selectAll("#relig-dot")
    .transition()
      .duration(0)
      .style("opacity", 0);
}

function rBarOn(tDefault) {
  plotG.selectAll("#relig-bar")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);
}

function rBarOff() {
  plotG.selectAll("#relig-bar")
    .transition()
      .duration(0)
      .style("opacity", 0);
}

function summaryOn(tDefault) {
  vis.selectAll("#fp-summary")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);
}

function summaryOff() {
  vis.selectAll("#fp-summary")
    .transition()
      .duration(0)
      .style("opacity", 0);
}

function religOn(tDefault) {
  plotG.selectAll("#relig")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);
}

function religOff() {
  plotG.selectAll("#relig")
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

// Declare empty holder of all the data
var ddata = null;

// load data and display -------------------------------------------------------------------
function readData() {

// Check if ddata exists; if data has already been read, re-call display and exit function.
 if(ddata) {
   display(ddata);
   return;
 }

// Nested data calls to read data, bind to ddata.
d3.csv("/data/tfr.csv", function(error, tfr){
  d3.csv("/data/mcu.csv", function(error, mcu){
    d3.csv("/data/relig.csv", function(error, relig){
      d3.csv("/data/relig_byAge2012.csv", function(error, religAge){
        ddata = {};
        ddata['tfr'] = tfr;
        ddata['mcu'] = mcu;
        ddata['relig'] = relig;
        ddata['religAge'] = religAge;

        console.log(ddata)
        // call function to plot the data
        display(ddata);
      });
    });
  });
});



//   var def = new $.Deferred();
//
//   d3.csv("/data/fp.csv", function(error, data1){
//        //display(data1, data2);
//        d[1]=data1;
//   });
//   d3.csv("/data/fp.csv", function(error, data2){
//       //display(data1, data2);
//       d[2]=data2
//
//   });
//
//   if (d != {}) def.resolve(d);
//
//   display(d);
//   return def;
}

readData();

// Add event listener: on resize, redraw the figure
window.addEventListener("resize", readData)
