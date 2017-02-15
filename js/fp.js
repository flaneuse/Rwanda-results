
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

  var margin = { top: 5, right: 5, bottom: 35, left: 5 };
  var width = maxW - margin.left - margin.right;
  var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

  // check height is within window
  if(height > maxH) {
    height = maxH;
  }

  // Specific margins for each of the different windows
  var margins = {
    map:      { top: 0, right: 15, bottom: 0, left: 0 },
    tfr:      { top: 65, right: 100, bottom: 25, left: 50 },
    mcu:      { top: 75, right: 75, bottom: 0, left: 235 },
    mcuRelig: { top: 75, right: 75, bottom: 0, left: 100 },
    religSlope: { top: 75, right: 125, bottom: 25, left: 75 },
    religBar: { top: 175, right: 100, bottom: 75, left: 45 },
    religAge: { top: 125, right: 100, bottom: 5, left: 75 }
  };

  var dims = {
    map:      { w: width - margins.map.right - margins.map.left,
                h: height - margins.map.top - margins.map.bottom},
    tfr:      { w: width - margins.tfr.right - margins.tfr.left,
                h: height - margins.tfr.top - margins.tfr.bottom},
    mcu:      { w: width - margins.mcu.right - margins.mcu.left,
                h: height - margins.mcu.top - margins.mcu.bottom},
    mcuRelig: { w: width - margins.mcuRelig.right - margins.mcuRelig.left,
                h: height - margins.mcuRelig.top - margins.mcuRelig.bottom},
    religSlope: { w: width - margins.religSlope.right - margins.religSlope.left,
                h: height - margins.religSlope.top - margins.religSlope.bottom},
    religBar: { w: width - margins.religBar.right - margins.religBar.left,
                h: height - margins.religBar.top - margins.religBar.bottom},
    religAge: { w: width - margins.religAge.right - margins.religAge.left,
                h: height - margins.religAge.top - margins.religAge.bottom}
  }

// text annotations
annotations = {
  relig_map: [{class: "prot-annot", id:"prot-a1",
  x: 10, y: 10, w: "30%",
  text: "The Protestant population in the northeast has expanded dramatically in the past decade"},
  {class: "prot-annot", id:"prot-a2",
  x: 60, y: height * 0.7, w: "30%",
  text: "Protestants have typically lived along Lake Kivu"},
  {class: "cath-annot", id:"cath-a1",
  x: width/2 + 50, y: 10, w: "30%",
  text: "Catholics are concentrated in the central portion of the country"}],

  tfr: [{class: "basic-annot", id:"tfr-annot",
  x: 2011, y: 5,
  text: "TFR has changed little"}],

  relig_slope: [{class: "prot-annot", id:"slope-annot",
  x: 0.6 * dims.religSlope.w, y: 0.3,
  text: "This 11% increase translates into an increase of ~ 1.8 million Protestants, nearly doubling their population"}],

  all:[


  {class: "prot-annot", id:"tfr-a1",
  x: 10, y: 120, w: "20%",
  text: "Protestants have a larger share of children under 10"},
  {class: "cath-annot", id:"tfr-a1",
  x: 10, y: 140, w: "20%",
  text: "Catholics have a larger portion of adults over 40"},
  {class: "prot-annot", id:"tfr-a1",
  x: 10, y: 180, w: "20%",
  text: "Women in the Northwest had lower modern contraception use in 2010, but dramatically increased by 2014/2015"},
  {class: "cath-annot", id:"tfr-a1",
  x: 10, y: 230, w: "20%",
  text: "Households in the Southwest, where ACCESS TO HEALTHCARE FACILITIES MAY BE AN ISSUE, continue to report low modern contraception use"},
    {class: "cath-annot", id:"tfr-a1",
    x: 10, y: 300, w: "20%",
  text: "Women in the Lake Kivu Coffee region are less likely to use modern contraception"},
  {class: "prot-annot", id:"tfr-a1",
  x: 10, y: 350, w: "20%",
  text: ""}
]
}

// swoopy arrow annotations
// swoopyArrows = {
//   relig_map: [{class: "prot-annot", id:"prot-a1",
//                 x: 10, y: 10, w: "30%",
//                 text: "The Protestant population in the northeast has expanded dramatically in the past decade"},
//                 {class: "prot-annot", id:"prot-a2",
//                 x: 60, y: height * 0.7, w: "30%",
//                 text: "Protestants have typically lived along Lake Kivu"}
//   tfr: [{class: "prot-annot", id:"prot-a1",
//                               x: 10, y: 10, w: "30%",
//                               text: "The Protestant population in the northeast has expanded dramatically in the past decade"},
//                               {class: "prot-annot", id:"prot-a2",
//                               x: 60, y: height * 0.7, w: "30%",
//                               text: "Protestants have typically lived along Lake Kivu"}
//               ]
// }
// end RESPONSIVENESS (plus call in 'display') ---------------------------------------------------------------

// CONSTANTS -------------------------------------------------------------------
  var numSlides = 12;
  var radius_bc = 7; // radius of breadcrumbs
  var spacing_bc = 25; // spacing between breadcrumbs, in pixels.

  var radius = 5;

  var tDefault = 600; // standard transition timing in ms

  var xaxisOffset = -20; // amount of spacing b/w end of axis and labels

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
             .tickFormat(d3.format("d"))
             .orient("top")
             .ticks(5);

        var yAxTFR = d3.svg.axis()
             .scale(y)
             .orient("left")
             .innerTickSize(-dims.tfr.w);

// AXES for MCU
       var xMCU = d3.scale.linear()
            .range([0, dims.mcu.w]);

       var yMCU = d3.scale.ordinal()
            .rangeBands([0, dims.mcu.h], 0.2, 0);

       var zMCU = d3.scale.linear()
       // .range(colorPalette)
         .range(["#ffffbf", "#2388bd"])
        //  .range([colorbrewer.Spectral[11][5], colorbrewer.Spectral[11][10]])
         .interpolate(d3.interpolateHcl)
        .domain([0.23, 0.65]);

       var xAxMCU = d3.svg.axis()
            .scale(xMCU)
            .orient("top")
            .ticks(5, "%")
            .innerTickSize(-dims.mcu.h);

       var yAxMCU= d3.svg.axis()
            .scale(yMCU)
            .orient("left");

// AXES for MCU Religion
       var xMCUrelig = d3.scale.linear()
            .range([0, dims.mcuRelig.w]);

       var yMCUrelig = d3.scale.ordinal()
            .rangeBands([0, dims.mcuRelig.h], 0.2, 0);


       var xAxMCUrelig = d3.svg.axis()
            .scale(xMCUrelig)
            .orient("top")
            .ticks(5, "%")
            .innerTickSize(-dims.mcuRelig.h);

       var yAxMCUrelig= d3.svg.axis()
            .scale(yMCUrelig)
            .orient("left");

// AXES for Religion dot plot

    var xRslope = d3.scale.linear()
     .range([0, dims.religSlope.w]);

     var yRslope = d3.scale.linear()
          .range([dims.religSlope.h, 0]);


    var zRelig = d3.scale.ordinal()
           .range(colorPaletteLight)

     var xAxRslope = d3.svg.axis()
          .scale(xRslope)
          .tickFormat(d3.format("d"))
          .orient("top");

     var yAxRslope= d3.svg.axis()
          .scale(yRslope)
          .ticks(5, "%")
          .innerTickSize(-dims.religSlope.w)
          .orient("left");


  // AXES for Religion by age bar plot

      var xRage = d3.scale.linear()
       .range([0, dims.religAge.w]);

       var yRage = d3.scale.ordinal()
            .rangeBands([0, dims.religAge.h], 0.2, 0.2);

       var xAxRage = d3.svg.axis()
            .scale(xRage)
            // .tickFormat(d3.format(".1s"))
            .ticks(4, "%")
            .innerTickSize(-dims.religAge.h + xaxisOffset)
            .orient("top");

       var yAxRage = d3.svg.axis()
            .scale(yRage)
            // .tickFormat(d3.format("d"))
            // .ticks(5)
            .orient("left");

    // AXES for Religion bar plot

        var xRbar = d3.scale.linear()
         .range([0, dims.religBar.w]);

         var yRbar = d3.scale.ordinal()
              .rangeBands([0, dims.religBar.h], 0.5, 0.2);

         var xAxRbar = d3.svg.axis()
              .scale(xRbar)
              .tickFormat(d3.format(".1s"))
              .ticks(4)
              .innerTickSize(-dims.religBar.h + xaxisOffset)
              .orient("top");

         var yAxRbar= d3.svg.axis()
              .scale(yRbar)
              // .tickFormat(d3.format("d"))
              // .ticks(5)
              .orient("left");
// GENERATORS ---------------------------------------------------------------------
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

       svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       // this group element will be used to contain all
       // other elements.
       plotG = svg.select("#plots");


// Full frame, to be used for images / maps or summary text.
       fullG = vis.select("#vis")
         .append("div")
           .attr("id", "max-frame")
           .style("max-width", dims.map.w + "px");

// TEMP ANNOTATIONS
           vis.selectAll("annots")
             .data(annotations.all)
             .enter().append("div")
             .attr("class", function(d) {return d.class;})
             .attr("id", function(d) {return d.id;})
             .text(function(d) {return d.text;})
                     // .tspans(function(d) {return d3.wordwrap(d.text, ncharBreak);})
             .style("width", function(d) {return d.w;})
             .style("left", function(d) {return d.x + "px";})
             .style("top", function(d) {return d.y + "px";})
             .style("position", "fixed")
             .style("opacity", 1);





// Individual pages
    tfr = plotG
    .append("g")
      .attr("id", "tfr")
      .attr("transform", "translate(" + margins.tfr.left + "," + margins.tfr.top + ")")
      .style("opacity", 0) // set initially to 0.

    var nav = fullG.append("div")
        .attr("id", "clicky")
        .style("opacity", 0)
        .append("ul")
        .attr("id", "select-cat");

    summ = fullG
      .append("div")
        .attr("id", "fp-summary")
        .style("opacity", 0);

// Attach pop density raster map
        fullG.append("div")
          .attr("id", "popdensity")
          .attr("class", "full-frame")
          .html("<div id='g-Rwanda_base_final-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-13 - 16:12 -->	<!-- ai file: Rwanda_base_final -->	<style type='text/css' media='screen,print'>		.g-artboard {			margin:0 auto;		}	</style>	<!-- Artboard: popdensity -->	<div id='g-Rwanda_base_final-popdensity' class='g-artboard g-artboard-v3 ' data-min-width='806'>		<style type='text/css' media='screen,print'>			#g-Rwanda_base_final-popdensity{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-Rwanda_base_final-popdensity p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:16px;				line-height:19px;				font-weight:300;				color:#414042;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:18px;				line-height:12px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#9d9fa2;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				color:#414042;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-align:right;				color:#414042;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:14px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#9d9fa2;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:15px;				font-weight:100;				text-align:center;				letter-spacing:-0.02083333333333em;				color:#658338;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:16px;				line-height:19px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-Rwanda_base_final-popdensity .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:18px;				line-height:12px;				font-weight:400;				letter-spacing:0.08333333333333em;				color:#ffffff;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-Rwanda_base_final-popdensity-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/popdensity.png'				/>			<div id='g-ai0-1' class='g-legend g-aiAbs' style='top:2.8249%;left:2.687%;width:31.1756%;'>				<p class='g-aiPstyle0'>Population density</p>			</div>			<div id='g-ai0-2' class='g-countries g-aiAbs' style='top:6.2147%;left:55.1061%;width:16.5885%;margin-left:-8.2943%;'>				<p class='g-aiPstyle1'>uganda</p>			</div>			<div id='g-ai0-3' class='g-legend g-aiAbs' style='top:8.3333%;left:2.4846%;width:5.0662%;'>				<p class='g-aiPstyle2'>high</p>			</div>			<div id='g-ai0-4' class='g-legend g-aiAbs' style='top:8.3333%;right:66.1374%;width:5.0662%;'>				<p class='g-aiPstyle3'>low</p>			</div>			<div id='g-ai0-5' class='g-countries g-aiAbs' style='top:14.6893%;left:18.3425%;width:24.8743%;margin-left:-12.4372%;'>				<p class='g-aiPstyle4'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai0-6' class='g-parks g-aiAbs' style='top:32.4859%;left:87.9187%;width:9.2579%;margin-left:-4.6289%;'>				<p class='g-aiPstyle5'>Akagera National Park</p>			</div>			<div id='g-ai0-7' class='g-lake g-aiAbs' style='top:43.0791%;left:17.1513%;width:10.8079%;margin-left:-5.4039%;'>				<p class='g-aiPstyle6'>Lake kivu</p>			</div>			<div id='g-ai0-8' class='g-cities g-aiAbs' style='top:52.2599%;left:47.1935%;'>				<p class='g-aiPstyle7'>Kigali</p>			</div>			<div id='g-ai0-9' class='g-parks g-aiAbs' style='top:76.4124%;left:22.748%;width:13.303%;margin-left:-6.6515%;'>				<p class='g-aiPstyle5'>Nyungwe National Park</p>			</div>			<div id='g-ai0-10' class='g-countries g-aiAbs' style='top:83.3333%;left:64.3085%;width:17.4725%;margin-left:-8.7362%;'>				<p class='g-aiPstyle1'>burundi</p>			</div>			<div id='g-ai0-11' class='g-countries g-aiAbs' style='top:83.3333%;left:88.5935%;width:19.6951%;margin-left:-9.8476%;'>				<p class='g-aiPstyle1'>tanzania</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-13 - 16:12 --></div>")
          //.style("min-width", dims.map.w + "px")
          .style("opacity", 0);

        popMap = fullG.selectAll("#pop-map") ;

// Attach religion map
    fullG.append("div")
      .attr("id", "relig-map")
      .attr("class", "full-frame")
      .html("<div id='g-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-13 - 18:32 -->	<!-- ai file: 07_RWA_religion_300px-copy -->	<style type='text/css' media='screen,print'>		.g-artboard {			margin:0 auto;		}	</style>	<!-- Artboard: protestant-map -->	<div id='g-protestant-map' class='g-artboard g-artboard-v3 ' data-min-width='300'>		<style type='text/css' media='screen,print'>			#g-protestant-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-protestant-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-protestant-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				text-transform:uppercase;				color:#414042;			}			#g-protestant-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-protestant-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:6px;				line-height:7px;				font-weight:300;				color:#808285;			}			#g-protestant-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:8px;				line-height:8px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#d1d3d4;			}			#g-protestant-map .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:6px;				line-height:6px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#d1d3d4;			}			#g-protestant-map .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-protestant-map .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-protestant-map-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/fp/protestant-map.png'				/>			<div id='g-ai0-1' class='g-scale_-_religion g-aiAbs' style='top:2.5632%;left:3.0072%;width:24.6687%;'>				<p class='g-aiPstyle0'>PERCENT Protestant</p>			</div>			<div id='g-ai0-2' class='g-year g-aiAbs' style='top:2.9293%;left:84.4583%;width:10.1492%;'>				<p class='g-aiPstyle1'>2012</p>			</div>			<div id='g-ai0-3' class='g-scale_-_religion g-aiAbs' style='top:7.6895%;left:2.3929%;'>				<p class='g-aiPstyle2'>0%</p>			</div>			<div id='g-ai0-4' class='g-scale_-_religion g-aiAbs' style='top:7.6895%;left:7.1917%;'>				<p class='g-aiPstyle2'>25%</p>			</div>			<div id='g-ai0-5' class='g-scale_-_religion g-aiAbs' style='top:7.6895%;left:12.5339%;'>				<p class='g-aiPstyle2'>50%</p>			</div>			<div id='g-ai0-6' class='g-scale_-_religion g-aiAbs' style='top:7.6895%;left:17.876%;'>				<p class='g-aiPstyle2'>75%</p>			</div>			<div id='g-ai0-7' class='g-label_-_countries g-aiAbs' style='top:9.8865%;left:53.1081%;width:14.8318%;margin-left:-7.4159%;'>				<p class='g-aiPstyle3'>uganda</p>			</div>			<div id='g-ai0-8' class='g-label_-_countries g-aiAbs' style='top:16.8436%;left:21.3928%;width:22.5077%;margin-left:-11.2539%;'>				<p class='g-aiPstyle4'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai0-9' class='g-label_-_parks g-aiAbs' style='top:31.4903%;left:86.1023%;width:5.9419%;margin-left:-2.9709%;'>				<p class='g-aiPstyle5'>Akagera National Park</p>			</div>			<div id='g-ai0-10' class='g-label_-_kivu g-aiAbs' style='top:41.3768%;left:18.7158%;width:10.7428%;margin-left:-5.3714%;'>				<p class='g-aiPstyle6'>Lake kivu</p>			</div>			<div id='g-ai0-11' class='g-label_-_parks g-aiAbs' style='top:72.1347%;left:24.4809%;width:9.8945%;margin-left:-4.9473%;'>				<p class='g-aiPstyle5'>Nyungwe National Park</p>			</div>			<div id='g-ai0-12' class='g-label_-_countries g-aiAbs' style='top:77.9934%;left:62.9954%;width:16.7067%;margin-left:-8.3534%;'>				<p class='g-aiPstyle3'>burundi</p>			</div>			<div id='g-ai0-13' class='g-label_-_countries g-aiAbs' style='top:77.9934%;left:86.9399%;width:16.8484%;margin-left:-8.4242%;'>				<p class='g-aiPstyle3'>tanzania</p>			</div>		</div>	</div>	<!-- Artboard: catholic-map -->	<div id='g-catholic-map' class='g-artboard g-artboard-v3 ' data-min-width='300'>		<style type='text/css' media='screen,print'>			#g-catholic-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-catholic-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-catholic-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				text-transform:uppercase;				color:#414042;			}			#g-catholic-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-catholic-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:6px;				line-height:7px;				font-weight:300;				color:#808285;			}			#g-catholic-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:8px;				line-height:8px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#d1d3d4;			}			#g-catholic-map .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:6px;				line-height:6px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#d1d3d4;			}			#g-catholic-map .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-catholic-map .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-catholic-map .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:300;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-catholic-map-graphic'>			<img id='g-ai1-0'				class='g-aiImg'				src='/img/fp/catholic-map.png'				/>			<div id='g-ai1-1' class='g-scale_-_religion_copy g-aiAbs' style='top:2.5632%;left:2.8405%;width:22.7719%;'>				<p class='g-aiPstyle0'>PERCENT catholic</p>			</div>			<div id='g-ai1-2' class='g-label_-_year_copy g-aiAbs' style='top:2.9293%;left:84.2917%;width:10.1492%;'>				<p class='g-aiPstyle1'>2012</p>			</div>			<div id='g-ai1-3' class='g-scale_-_religion_copy g-aiAbs' style='top:7.6895%;left:2.2262%;'>				<p class='g-aiPstyle2'>0%</p>			</div>			<div id='g-ai1-4' class='g-scale_-_religion_copy g-aiAbs' style='top:7.6895%;left:7.0251%;'>				<p class='g-aiPstyle2'>25%</p>			</div>			<div id='g-ai1-5' class='g-scale_-_religion_copy g-aiAbs' style='top:7.6895%;left:12.3672%;'>				<p class='g-aiPstyle2'>50%</p>			</div>			<div id='g-ai1-6' class='g-scale_-_religion_copy g-aiAbs' style='top:7.6895%;left:17.7093%;'>				<p class='g-aiPstyle2'>75%</p>			</div>			<div id='g-ai1-7' class='g-label_-_countries_copy g-aiAbs' style='top:9.8865%;left:52.9414%;width:14.8318%;margin-left:-7.4159%;'>				<p class='g-aiPstyle3'>uganda</p>			</div>			<div id='g-ai1-8' class='g-label_-_countries_copy g-aiAbs' style='top:16.8436%;left:21.2261%;width:22.5077%;margin-left:-11.2539%;'>				<p class='g-aiPstyle4'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai1-9' class='g-label_-_parks_copy g-aiAbs' style='top:31.4903%;left:85.9356%;width:5.9419%;margin-left:-2.9709%;'>				<p class='g-aiPstyle5'>Akagera National Park</p>			</div>			<div id='g-ai1-10' class='g-label_-_kivu_copy g-aiAbs' style='top:41.3768%;left:18.5491%;width:10.7428%;margin-left:-5.3714%;'>				<p class='g-aiPstyle6'>Lake kivu</p>			</div>			<div id='g-ai1-11' class='g-label_-_parks_copy g-aiAbs' style='top:72.1347%;left:24.3142%;width:9.8945%;margin-left:-4.9473%;'>				<p class='g-aiPstyle5'>Nyungwe National Park</p>			</div>			<div id='g-ai1-12' class='g-label_-_countries_copy g-aiAbs' style='top:77.9934%;left:62.8287%;width:16.7067%;margin-left:-8.3534%;'>				<p class='g-aiPstyle3'>burundi</p>			</div>			<div id='g-ai1-13' class='g-label_-_countries_copy g-aiAbs' style='top:77.9934%;left:86.7733%;width:16.8484%;margin-left:-8.4242%;'>				<p class='g-aiPstyle3'>tanzania</p>			</div>			<div id='g-ai1-14' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:67.7474%;'>				<p class='g-aiPstyle7'>0</p>			</div>			<div id='g-ai1-15' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:74.8307%;'>				<p class='g-aiPstyle7'>20</p>			</div>			<div id='g-ai1-16' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:82.3968%;'>				<p class='g-aiPstyle7'>40</p>			</div>			<div id='g-ai1-17' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:89.9629%;'>				<p class='g-aiPstyle7'>60 km</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-13 - 18:32 --></div>")
      //.style("min-width", dims.map.w + "px")
      .style("opacity", 0);

    religMap = fullG.selectAll("#relig-map") ;

// Attach annotations
      religMap.selectAll("annots")
        .data(annotations.relig_map)
        .enter().append("div")
        .attr("class", function(d) {return d.class;})
        .attr("id", function(d) {return d.id;})
        .text(function(d) {return d.text;})
                // .tspans(function(d) {return d3.wordwrap(d.text, ncharBreak);})
        .style("width", function(d) {return d.w;})
        .style("left", function(d) {return d.x + "px";})
        .style("top", function(d) {return d.y + "px";})
        .style("position", "absolute")
        .style("opacity", 0);


        // Attach population map
            // fullG.append("div")
            //   .attr("id", "pop-map")
            //   .attr("class", "full-frame")
            //   .html("<div id='g-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-13 - 15:31 -->	<!-- ai file: 07_RWA_religion_500px -->	<style type='text/css' media='screen,print'>		.g-artboard {			margin:0 auto;		}	</style>	<!-- Artboard: population2002-map -->	<div id='g-population2002-map' class='g-artboard g-artboard-v3 ' data-min-width='595'>		<style type='text/css' media='screen,print'>			#g-population2002-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-population2002-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-population2002-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.02083333333333em;				color:#414042;			}			#g-population2002-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:27px;				line-height:33px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-population2002-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:11px;				line-height:13px;				font-weight:300;				color:#808285;			}			#g-population2002-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:16px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#d1d3d4;			}			#g-population2002-map .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#d1d3d4;			}			#g-population2002-map .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:400;				letter-spacing:0.08333333333333em;				color:#ffffff;			}			#g-population2002-map .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-population2002-map .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:17px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-population2002-map .g-aiPstyle8 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:300;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-population2002-map-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/population2002-map.png'				/>			<div id='g-ai0-1' class='g-scale_-_pop g-aiAbs' style='top:2.5855%;left:3.1142%;width:35.0106%;'>				<p class='g-aiPstyle0'>population by Sector</p>			</div>			<div id='g-ai0-2' class='g-year g-aiAbs' style='top:2.9549%;left:84.7523%;width:10.2345%;'>				<p class='g-aiPstyle1'>2010</p>			</div>			<div id='g-ai0-3' class='g-scale_-_pop g-aiAbs' style='top:7.7565%;left:3.0628%;'>				<p class='g-aiPstyle2'>low</p>			</div>			<div id='g-ai0-4' class='g-scale_-_pop g-aiAbs' style='top:7.7565%;left:20.029%;'>				<p class='g-aiPstyle2'>high</p>			</div>			<div id='g-ai0-5' class='g-label_-_countries g-aiAbs' style='top:9.9726%;left:53.1387%;width:14.9564%;margin-left:-7.4782%;'>				<p class='g-aiPstyle3'>uganda</p>			</div>			<div id='g-ai0-6' class='g-label_-_countries g-aiAbs' style='top:16.8057%;left:21.1569%;width:22.6969%;margin-left:-11.3484%;'>				<p class='g-aiPstyle4'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai0-7' class='g-cities g-aiAbs' style='top:24.5622%;left:24.8067%;'>				<p class='g-aiPstyle5'>Ruhengeri</p>			</div>			<div id='g-ai0-8' class='g-cities g-aiAbs' style='top:27.7018%;left:57.7613%;'>				<p class='g-aiPstyle5'>Byumba</p>			</div>			<div id='g-ai0-9' class='g-label_-_parks g-aiAbs' style='top:31.9494%;left:86.4102%;width:5.9918%;margin-left:-2.9959%;'>				<p class='g-aiPstyle6'>Akagera National Park</p>			</div>			<div id='g-ai0-10' class='g-cities g-aiAbs' style='top:35.2736%;left:12.8269%;'>				<p class='g-aiPstyle5'>Gisenyi</p>			</div>			<div id='g-ai0-11' class='g-label_-_kivu g-aiAbs' style='top:41.7373%;left:18.4574%;width:10.8331%;margin-left:-5.4165%;'>				<p class='g-aiPstyle7'>Lake kivu</p>			</div>			<div id='g-ai0-12' class='g-cities g-aiAbs' style='top:45.0616%;left:57.721%;'>				<p class='g-aiPstyle5'>Kigali</p>			</div>			<div id='g-ai0-13' class='g-cities g-aiAbs' style='top:50.4172%;left:45.0555%;'>				<p class='g-aiPstyle5'>Gitarama</p>			</div>			<div id='g-ai0-14' class='g-label_-_parks g-aiAbs' style='top:72.7633%;left:24.271%;width:9.9777%;margin-left:-4.9888%;'>				<p class='g-aiPstyle6'>Nyungwe National Park</p>			</div>			<div id='g-ai0-15' class='g-cities g-aiAbs' style='top:74.6101%;left:43.805%;'>				<p class='g-aiPstyle5'>Butare</p>			</div>			<div id='g-ai0-16' class='g-label_-_countries g-aiAbs' style='top:78.6731%;left:63.1091%;width:16.8471%;margin-left:-8.4236%;'>				<p class='g-aiPstyle3'>burundi</p>			</div>			<div id='g-ai0-17' class='g-label_-_countries g-aiAbs' style='top:78.6731%;left:87.2549%;width:16.99%;margin-left:-8.495%;'>				<p class='g-aiPstyle3'>tanzania</p>			</div>			<div id='g-ai0-18' class='g-scale_-_dimensions g-aiAbs' style='top:91.0465%;left:68.0692%;'>				<p class='g-aiPstyle8'>0</p>			</div>			<div id='g-ai0-19' class='g-scale_-_dimensions g-aiAbs' style='top:91.0465%;left:75.2117%;'>				<p class='g-aiPstyle8'>20</p>			</div>			<div id='g-ai0-20' class='g-scale_-_dimensions g-aiAbs' style='top:91.0465%;left:82.8417%;'>				<p class='g-aiPstyle8'>40</p>			</div>			<div id='g-ai0-21' class='g-scale_-_dimensions g-aiAbs' style='top:91.0465%;left:90.4715%;'>				<p class='g-aiPstyle8'>60 km</p>			</div>		</div>	</div>	<!-- Artboard: population2012-map -->	<div id='g-population2012-map' class='g-artboard g-artboard-v3 ' data-min-width='595'>		<style type='text/css' media='screen,print'>			#g-population2012-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-population2012-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-population2012-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.02083333333333em;				color:#414042;			}			#g-population2012-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:27px;				line-height:33px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-population2012-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:11px;				line-height:13px;				font-weight:300;				color:#808285;			}			#g-population2012-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:16px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#d1d3d4;			}			#g-population2012-map .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#d1d3d4;			}			#g-population2012-map .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:400;				letter-spacing:0.08333333333333em;				color:#ffffff;			}			#g-population2012-map .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-population2012-map .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:17px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-population2012-map .g-aiPstyle8 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:300;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-population2012-map-graphic'>			<img id='g-ai1-0'				class='g-aiImg'				src='/img/population2012-map.png'				/>			<div id='g-ai1-1' class='g-scale_-_pop_copy g-aiAbs' style='top:2.5855%;left:3.1141%;width:35.0106%;'>				<p class='g-aiPstyle0'>population by Sector</p>			</div>			<div id='g-ai1-2' class='g-label_-_year_copy g-aiAbs' style='top:2.9549%;left:84.7523%;width:10.2345%;'>				<p class='g-aiPstyle1'>2012</p>			</div>			<div id='g-ai1-3' class='g-scale_-_pop_copy g-aiAbs' style='top:7.7565%;left:3.0629%;'>				<p class='g-aiPstyle2'>low</p>			</div>			<div id='g-ai1-4' class='g-scale_-_pop_copy g-aiAbs' style='top:7.7565%;left:20.029%;'>				<p class='g-aiPstyle2'>high</p>			</div>			<div id='g-ai1-5' class='g-label_-_countries_copy g-aiAbs' style='top:9.9726%;left:53.1387%;width:14.9564%;margin-left:-7.4782%;'>				<p class='g-aiPstyle3'>uganda</p>			</div>			<div id='g-ai1-6' class='g-label_-_countries_copy g-aiAbs' style='top:16.8057%;left:21.1569%;width:22.6969%;margin-left:-11.3484%;'>				<p class='g-aiPstyle4'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai1-7' class='g-cities g-aiAbs' style='top:24.5622%;left:24.8269%;'>				<p class='g-aiPstyle5'>Ruhengeri</p>			</div>			<div id='g-ai1-8' class='g-cities g-aiAbs' style='top:27.7018%;left:57.7815%;'>				<p class='g-aiPstyle5'>Byumba</p>			</div>			<div id='g-ai1-9' class='g-label_-_parks_copy g-aiAbs' style='top:31.9494%;left:86.4102%;width:5.9918%;margin-left:-2.9959%;'>				<p class='g-aiPstyle6'>Akagera National Park</p>			</div>			<div id='g-ai1-10' class='g-cities g-aiAbs' style='top:35.2736%;left:12.8471%;'>				<p class='g-aiPstyle5'>Gisenyi</p>			</div>			<div id='g-ai1-11' class='g-label_-_kivu_copy g-aiAbs' style='top:41.7373%;left:18.4574%;width:10.8331%;margin-left:-5.4165%;'>				<p class='g-aiPstyle7'>Lake kivu</p>			</div>			<div id='g-ai1-12' class='g-cities g-aiAbs' style='top:45.0616%;left:57.7412%;'>				<p class='g-aiPstyle5'>Kigali</p>			</div>			<div id='g-ai1-13' class='g-cities g-aiAbs' style='top:50.4172%;left:45.0756%;'>				<p class='g-aiPstyle5'>Gitarama</p>			</div>			<div id='g-ai1-14' class='g-label_-_parks_copy g-aiAbs' style='top:72.7633%;left:24.271%;width:9.9777%;margin-left:-4.9888%;'>				<p class='g-aiPstyle6'>Nyungwe National Park</p>			</div>			<div id='g-ai1-15' class='g-cities g-aiAbs' style='top:74.6101%;left:43.7849%;'>				<p class='g-aiPstyle5'>Butare</p>			</div>			<div id='g-ai1-16' class='g-label_-_countries_copy g-aiAbs' style='top:78.6731%;left:63.1091%;width:16.8471%;margin-left:-8.4236%;'>				<p class='g-aiPstyle3'>burundi</p>			</div>			<div id='g-ai1-17' class='g-label_-_countries_copy g-aiAbs' style='top:78.6731%;left:87.2549%;width:16.99%;margin-left:-8.495%;'>				<p class='g-aiPstyle3'>tanzania</p>			</div>			<div id='g-ai1-18' class='g-scale_-_dimensions_copy g-aiAbs' style='top:91.0465%;left:68.0692%;'>				<p class='g-aiPstyle8'>0</p>			</div>			<div id='g-ai1-19' class='g-scale_-_dimensions_copy g-aiAbs' style='top:91.0465%;left:75.2117%;'>				<p class='g-aiPstyle8'>20</p>			</div>			<div id='g-ai1-20' class='g-scale_-_dimensions_copy g-aiAbs' style='top:91.0465%;left:82.8417%;'>				<p class='g-aiPstyle8'>40</p>			</div>			<div id='g-ai1-21' class='g-scale_-_dimensions_copy g-aiAbs' style='top:91.0465%;left:90.4715%;'>				<p class='g-aiPstyle8'>60 km</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-13 - 15:31 --></div>")
            //   .style("opacity", 0);
            //
            // popMap = fullG.selectAll("#pop-map") ;

    // Attach MCU raster map (2010)
        fullG.append("div")
          .attr("id", "mcu-map")
          .attr("class", "full-frame")
          .html("<!-- Artboard: mcu2010-map -->	<div id='g-mcu2010-map' class='g-artboard g-artboard-v3 ' data-min-width='595'>		<style type='text/css' media='screen,print'>			#g-mcu2010-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-mcu2010-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-mcu2010-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.02083333333333em;				color:#414042;			}			#g-mcu2010-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:27px;				line-height:33px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu2010-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-align:right;				color:#a7a9ac;			}			#g-mcu2010-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:11px;				line-height:13px;				font-weight:300;				color:#808285;			}			#g-mcu2010-map .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:16px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#d1d3d4;			}			#g-mcu2010-map .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:9px;				line-height:9px;				font-weight:300;				color:#636466;			}			#g-mcu2010-map .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#d1d3d4;			}			#g-mcu2010-map .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-mcu2010-map .g-aiPstyle8 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:12px;				font-weight:400;				text-align:center;				color:#e6e7e8;			}			#g-mcu2010-map .g-aiPstyle9 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:17px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-mcu2010-map .g-aiPstyle10 {				font-family:Lato,sans-serif;				font-size:6px;				line-height:7px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu2010-map .g-aiPstyle11 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:300;				color:#808285;			}			#g-mcu2010-map .g-aiPstyle12 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:300;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-mcu2010-map-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/fp/mcu2010-map.png'				/>			<div id='g-ai0-1' class='g-scale_-_MCU g-aiAbs' style='top:2.5855%;left:3.1142%;width:39.84%;'>				<p class='g-aiPstyle0'>Modern  Contraception*  use</p>			</div>			<div id='g-ai0-2' class='g-year g-aiAbs' style='top:2.9549%;left:84.7523%;width:10.2345%;'>				<p class='g-aiPstyle1'>2002</p>			</div>			<div id='g-ai0-3' class='g-scale_-_MCU g-aiAbs' style='top:5.9097%;right:58.7935%;width:15.5287%;'>				<p class='g-aiPstyle2'>in women in a union aged 15-49</p>			</div>			<div id='g-ai0-4' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:4.6606%;'>				<p class='g-aiPstyle3'>30%</p>			</div>			<div id='g-ai0-5' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:9.509%;'>				<p class='g-aiPstyle3'>40%</p>			</div>			<div id='g-ai0-6' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:14.3573%;'>				<p class='g-aiPstyle3'>50%</p>			</div>			<div id='g-ai0-7' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:19.2057%;'>				<p class='g-aiPstyle3'>60%</p>			</div>			<div id='g-ai0-8' class='g-label_-_countries_MCU g-aiAbs' style='top:9.9726%;left:53.1387%;width:14.9564%;margin-left:-7.4782%;'>				<p class='g-aiPstyle4'>uganda</p>			</div>			<div id='g-ai0-9' class='g-scale_-_MCU g-aiAbs' style='top:11.6347%;left:3.0628%;width:37.5593%;'>				<p class='g-aiPstyle5'>* includes female or male sterilization, pills, Intrauterine device, injectables, implants, male or female condom, lactational amenorrhea, and standard days method</p>			</div>			<div id='g-ai0-10' class='g-label_-_countries_MCU g-aiAbs' style='top:20.8687%;left:16.6718%;width:22.6969%;margin-left:-11.3484%;'>				<p class='g-aiPstyle6'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai0-11' class='g-label_-_parks g-aiAbs' style='top:31.9494%;left:86.4102%;width:5.9918%;margin-left:-2.9959%;'>				<p class='g-aiPstyle7'>Akagera National Park</p>			</div>			<div id='g-ai0-12' class='g-provinces g-aiAbs' style='top:34.1655%;left:50.28%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Northern</p>			</div>			<div id='g-ai0-13' class='g-label_-_kivu g-aiAbs' style='top:41.7373%;left:18.4574%;width:10.8331%;margin-left:-5.4165%;'>				<p class='g-aiPstyle9'>Lake kivu</p>			</div>			<div id='g-ai0-14' class='g-provinces g-aiAbs' style='top:46.539%;left:59.3557%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Kigali</p>			</div>			<div id='g-ai0-15' class='g-provinces g-aiAbs' style='top:47.2777%;left:76.4178%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Eastern</p>			</div>			<div id='g-ai0-16' class='g-provinces g-aiAbs' style='top:50.4172%;left:32.9355%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Western</p>			</div>			<div id='g-ai0-17' class='g-provinces g-aiAbs' style='top:64.6375%;left:42.1725%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Southern</p>			</div>			<div id='g-ai0-18' class='g-SE_scale g-aiAbs' style='top:71.8399%;left:71.969%;width:9.5185%;'>				<p class='g-aiPstyle10'>CONFIDENCE Level</p>			</div>			<div id='g-ai0-19' class='g-label_-_parks g-aiAbs' style='top:72.7633%;left:24.271%;width:9.9777%;margin-left:-4.9888%;'>				<p class='g-aiPstyle7'>Nyungwe National Park</p>			</div>			<div id='g-ai0-20' class='g-SE_scale g-aiAbs' style='top:73.8714%;left:71.9475%;'>				<p class='g-aiPstyle11'>low</p>			</div>			<div id='g-ai0-21' class='g-SE_scale g-aiAbs' style='top:73.8714%;left:78.7948%;'>				<p class='g-aiPstyle11'>high</p>			</div>			<div id='g-ai0-22' class='g-label_-_countries_MCU g-aiAbs' style='top:80.7045%;left:62.1007%;width:16.8471%;margin-left:-8.4236%;'>				<p class='g-aiPstyle4'>burundi</p>			</div>			<div id='g-ai0-23' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:3.0885%;'>				<p class='g-aiPstyle12'>0</p>			</div>			<div id='g-ai0-24' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:10.2312%;'>				<p class='g-aiPstyle12'>20</p>			</div>			<div id='g-ai0-25' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:17.8611%;'>				<p class='g-aiPstyle12'>40</p>			</div>			<div id='g-ai0-26' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:25.4909%;'>				<p class='g-aiPstyle12'>60 km</p>			</div>		</div>	</div>")
          .style("opacity", 0);

        // Attach MCU raster map (2014)
        fullG.append("div")
          .attr("id", "mcu-map14")
          .attr("class", "full-frame ")
          .html("<div id='g-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-13 - 15:16 -->	<!-- ai file: 07_RWA_religion_500px -->	<style type='text/css' media='screen,print'>		.g-artboard {			margin:0 auto;		}	</style>	<!-- Artboard: mcu2010-map -->	<div id='g-mcu2010-map' class='g-artboard g-artboard-v3 ' data-min-width='595'>		<style type='text/css' media='screen,print'>			#g-mcu2010-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-mcu2010-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-mcu2010-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.02083333333333em;				color:#414042;			}			#g-mcu2010-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:27px;				line-height:33px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu2010-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-align:right;				color:#a7a9ac;			}			#g-mcu2010-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:11px;				line-height:13px;				font-weight:300;				color:#808285;			}			#g-mcu2010-map .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:16px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#d1d3d4;			}			#g-mcu2010-map .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:9px;				line-height:9px;				font-weight:300;				color:#636466;			}			#g-mcu2010-map .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#d1d3d4;			}			#g-mcu2010-map .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-mcu2010-map .g-aiPstyle8 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:12px;				font-weight:400;				text-align:center;				color:#e6e7e8;			}			#g-mcu2010-map .g-aiPstyle9 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:17px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-mcu2010-map .g-aiPstyle10 {				font-family:Lato,sans-serif;				font-size:6px;				line-height:7px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu2010-map .g-aiPstyle11 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:300;				color:#808285;			}			#g-mcu2010-map .g-aiPstyle12 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:300;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-mcu2010-map-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/fp/mcu2010-map.png'				/>			<div id='g-ai0-1' class='g-scale_-_MCU g-aiAbs' style='top:2.5855%;left:3.1142%;width:39.84%;'>				<p class='g-aiPstyle0'>Modern  Contraception*  use</p>			</div>			<div id='g-ai0-2' class='g-year g-aiAbs' style='top:2.9549%;left:84.7523%;width:10.2345%;'>				<p class='g-aiPstyle1'>2002</p>			</div>			<div id='g-ai0-3' class='g-scale_-_MCU g-aiAbs' style='top:5.9097%;right:58.7935%;width:15.5287%;'>				<p class='g-aiPstyle2'>in women in a union aged 15-49</p>			</div>			<div id='g-ai0-4' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:4.6606%;'>				<p class='g-aiPstyle3'>30%</p>			</div>			<div id='g-ai0-5' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:9.509%;'>				<p class='g-aiPstyle3'>40%</p>			</div>			<div id='g-ai0-6' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:14.3573%;'>				<p class='g-aiPstyle3'>50%</p>			</div>			<div id='g-ai0-7' class='g-scale_-_MCU g-aiAbs' style='top:7.7565%;left:19.2057%;'>				<p class='g-aiPstyle3'>60%</p>			</div>			<div id='g-ai0-8' class='g-label_-_countries_MCU g-aiAbs' style='top:9.9726%;left:53.1387%;width:14.9564%;margin-left:-7.4782%;'>				<p class='g-aiPstyle4'>uganda</p>			</div>			<div id='g-ai0-9' class='g-scale_-_MCU g-aiAbs' style='top:11.6347%;left:3.0628%;width:37.5593%;'>				<p class='g-aiPstyle5'>* includes female or male sterilization, pills, Intrauterine device, injectables, implants, male or female condom, lactational amenorrhea, and standard days method</p>			</div>			<div id='g-ai0-10' class='g-label_-_countries_MCU g-aiAbs' style='top:20.8687%;left:16.6718%;width:22.6969%;margin-left:-11.3484%;'>				<p class='g-aiPstyle6'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai0-11' class='g-label_-_parks g-aiAbs' style='top:31.9494%;left:86.4102%;width:5.9918%;margin-left:-2.9959%;'>				<p class='g-aiPstyle7'>Akagera National Park</p>			</div>			<div id='g-ai0-12' class='g-provinces g-aiAbs' style='top:34.1655%;left:50.28%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Northern</p>			</div>			<div id='g-ai0-13' class='g-label_-_kivu g-aiAbs' style='top:41.7373%;left:18.4574%;width:10.8331%;margin-left:-5.4165%;'>				<p class='g-aiPstyle9'>Lake kivu</p>			</div>			<div id='g-ai0-14' class='g-provinces g-aiAbs' style='top:46.539%;left:59.3557%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Kigali</p>			</div>			<div id='g-ai0-15' class='g-provinces g-aiAbs' style='top:47.2777%;left:76.4178%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Eastern</p>			</div>			<div id='g-ai0-16' class='g-provinces g-aiAbs' style='top:50.4172%;left:32.9355%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Western</p>			</div>			<div id='g-ai0-17' class='g-provinces g-aiAbs' style='top:64.6375%;left:42.1725%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Southern</p>			</div>			<div id='g-ai0-18' class='g-SE_scale g-aiAbs' style='top:71.8399%;left:71.969%;width:9.5185%;'>				<p class='g-aiPstyle10'>CONFIDENCE Level</p>			</div>			<div id='g-ai0-19' class='g-label_-_parks g-aiAbs' style='top:72.7633%;left:24.271%;width:9.9777%;margin-left:-4.9888%;'>				<p class='g-aiPstyle7'>Nyungwe National Park</p>			</div>			<div id='g-ai0-20' class='g-SE_scale g-aiAbs' style='top:73.8714%;left:71.9475%;'>				<p class='g-aiPstyle11'>low</p>			</div>			<div id='g-ai0-21' class='g-SE_scale g-aiAbs' style='top:73.8714%;left:78.7948%;'>				<p class='g-aiPstyle11'>high</p>			</div>			<div id='g-ai0-22' class='g-label_-_countries_MCU g-aiAbs' style='top:80.7045%;left:62.1007%;width:16.8471%;margin-left:-8.4236%;'>				<p class='g-aiPstyle4'>burundi</p>			</div>			<div id='g-ai0-23' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:3.0885%;'>				<p class='g-aiPstyle12'>0</p>			</div>			<div id='g-ai0-24' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:10.2312%;'>				<p class='g-aiPstyle12'>20</p>			</div>			<div id='g-ai0-25' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:17.8611%;'>				<p class='g-aiPstyle12'>40</p>			</div>			<div id='g-ai0-26' class='g-scale_-_dimensions_MCU g-aiAbs' style='top:91.0465%;left:25.4909%;'>				<p class='g-aiPstyle12'>60 km</p>			</div>		</div>	</div>	<!-- Artboard: mcu2014-map -->	<div id='g-mcu2014-map' class='g-artboard g-artboard-v3 ' data-min-width='595'>		<style type='text/css' media='screen,print'>			#g-mcu2014-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-mcu2014-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-mcu2014-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.02083333333333em;				color:#414042;			}			#g-mcu2014-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:27px;				line-height:33px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu2014-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-align:right;				color:#a7a9ac;			}			#g-mcu2014-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:11px;				line-height:13px;				font-weight:300;				color:#808285;			}			#g-mcu2014-map .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:16px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.16666666666667em;				color:#d1d3d4;			}			#g-mcu2014-map .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:9px;				line-height:9px;				font-weight:300;				color:#636466;			}			#g-mcu2014-map .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:12px;				line-height:12px;				font-weight:300;				text-transform:uppercase;				text-align:center;				letter-spacing:0.15em;				color:#d1d3d4;			}			#g-mcu2014-map .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-mcu2014-map .g-aiPstyle8 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:12px;				font-weight:400;				text-align:center;				color:#e6e7e8;			}			#g-mcu2014-map .g-aiPstyle9 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:17px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-mcu2014-map .g-aiPstyle10 {				font-family:Lato,sans-serif;				font-size:6px;				line-height:7px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu2014-map .g-aiPstyle11 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:300;				color:#808285;			}			#g-mcu2014-map .g-aiPstyle12 {				font-family:Lato,sans-serif;				font-size:10px;				line-height:12px;				font-weight:300;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-mcu2014-map-graphic'>			<img id='g-ai1-0'				class='g-aiImg'				src='/img/fp/mcu2014-map.png'				/>			<div id='g-ai1-1' class='g-scale_-_MCU_copy g-aiAbs' style='top:2.5855%;left:3.1142%;width:38.1763%;'>				<p class='g-aiPstyle0'>Modern  Contraception* use</p>			</div>			<div id='g-ai1-2' class='g-label_-_year_copy g-aiAbs' style='top:2.9549%;left:84.7523%;width:10.2345%;'>				<p class='g-aiPstyle1'>2014</p>			</div>			<div id='g-ai1-3' class='g-scale_-_MCU_copy g-aiAbs' style='top:5.9097%;right:58.7935%;width:15.5287%;'>				<p class='g-aiPstyle2'>in women in a union aged 15-49</p>			</div>			<div id='g-ai1-4' class='g-scale_-_MCU_copy g-aiAbs' style='top:7.7565%;left:4.6606%;'>				<p class='g-aiPstyle3'>30%</p>			</div>			<div id='g-ai1-5' class='g-scale_-_MCU_copy g-aiAbs' style='top:7.7565%;left:9.5089%;'>				<p class='g-aiPstyle3'>40%</p>			</div>			<div id='g-ai1-6' class='g-scale_-_MCU_copy g-aiAbs' style='top:7.7565%;left:14.3574%;'>				<p class='g-aiPstyle3'>50%</p>			</div>			<div id='g-ai1-7' class='g-scale_-_MCU_copy g-aiAbs' style='top:7.7565%;left:19.2056%;'>				<p class='g-aiPstyle3'>60%</p>			</div>			<div id='g-ai1-8' class='g-label_-_countries_MCU_copy g-aiAbs' style='top:9.9726%;left:53.1387%;width:14.9564%;margin-left:-7.4782%;'>				<p class='g-aiPstyle4'>uganda</p>			</div>			<div id='g-ai1-9' class='g-scale_-_MCU_copy g-aiAbs' style='top:11.6347%;left:3.0628%;width:37.5593%;'>				<p class='g-aiPstyle5'>* includes female or male sterilization, pills, Intrauterine device, injectables, implants, male or female condom, lactational amenorrhea, and standard days method</p>			</div>			<div id='g-ai1-10' class='g-label_-_countries_MCU_copy g-aiAbs' style='top:20.8687%;left:16.6718%;width:22.6969%;margin-left:-11.3484%;'>				<p class='g-aiPstyle6'>Democratic Republic of the Congo</p>			</div>			<div id='g-ai1-11' class='g-label_-_parks_copy g-aiAbs' style='top:31.9494%;left:86.4102%;width:5.9918%;margin-left:-2.9959%;'>				<p class='g-aiPstyle7'>Akagera National Park</p>			</div>			<div id='g-ai1-12' class='g-provinces_copy g-aiAbs' style='top:34.1655%;left:50.2599%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Northern</p>			</div>			<div id='g-ai1-13' class='g-label_-_kivu_copy g-aiAbs' style='top:41.7373%;left:18.4574%;width:10.8331%;margin-left:-5.4165%;'>				<p class='g-aiPstyle9'>Lake kivu</p>			</div>			<div id='g-ai1-14' class='g-provinces_copy g-aiAbs' style='top:46.539%;left:59.3758%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Kigali</p>			</div>			<div id='g-ai1-15' class='g-provinces_copy g-aiAbs' style='top:47.2777%;left:76.3977%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Eastern</p>			</div>			<div id='g-ai1-16' class='g-provinces_copy g-aiAbs' style='top:50.4172%;left:32.9557%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Western</p>			</div>			<div id='g-ai1-17' class='g-provinces_copy g-aiAbs' style='top:64.6375%;left:42.1926%;width:10.6911%;margin-left:-5.3456%;'>				<p class='g-aiPstyle8'>Southern</p>			</div>			<div id='g-ai1-18' class='g-SE_scale_copy g-aiAbs' style='top:71.8399%;left:71.969%;width:9.5185%;'>				<p class='g-aiPstyle10'>CONFIDENCE Level</p>			</div>			<div id='g-ai1-19' class='g-label_-_parks_copy g-aiAbs' style='top:72.7633%;left:24.271%;width:9.9777%;margin-left:-4.9888%;'>				<p class='g-aiPstyle7'>Nyungwe National Park</p>			</div>			<div id='g-ai1-20' class='g-SE_scale_copy g-aiAbs' style='top:73.8714%;left:71.9475%;'>				<p class='g-aiPstyle11'>low</p>			</div>			<div id='g-ai1-21' class='g-SE_scale_copy g-aiAbs' style='top:73.8714%;left:78.7948%;'>				<p class='g-aiPstyle11'>high</p>			</div>			<div id='g-ai1-22' class='g-label_-_countries_MCU_copy g-aiAbs' style='top:80.7045%;left:62.1007%;width:16.8471%;margin-left:-8.4236%;'>				<p class='g-aiPstyle4'>burundi</p>			</div>			<div id='g-ai1-23' class='g-scale_-_dimensions_copy_MCU g-aiAbs' style='top:91.0465%;left:3.0885%;'>				<p class='g-aiPstyle12'>0</p>			</div>			<div id='g-ai1-24' class='g-scale_-_dimensions_copy_MCU g-aiAbs' style='top:91.0465%;left:10.2312%;'>				<p class='g-aiPstyle12'>20</p>			</div>			<div id='g-ai1-25' class='g-scale_-_dimensions_copy_MCU g-aiAbs' style='top:91.0465%;left:17.8611%;'>				<p class='g-aiPstyle12'>40</p>			</div>			<div id='g-ai1-26' class='g-scale_-_dimensions_copy_MCU g-aiAbs' style='top:91.0465%;left:25.4909%;'>				<p class='g-aiPstyle12'>60 km</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-13 - 15:16 --></div>")
          .style("opacity", 0);

        mcuMap = fullG.selectAll("#mcu-map") ;

    // Attach annotations
          // mcuMap.selectAll("annots")
          //   .data(annotations.mcu_map)
          //   .enter().append("div")
          //   .attr("class", function(d) {return d.class;})
          //   .attr("id", function(d) {return d.id;})
          //   .text(function(d) {return d.text;})
          //   .style("width", function(d) {return d.w;})
          //   .style("left", function(d) {return d.x + "px";})
          //   .style("top", function(d) {return d.y + "px";})
          //   .style("position", "absolute")
          //   .style("opacity", 0);

          // Attach MCU regression by LZ map
              fullG.append("div")
                .attr("id", "mcu-regr")
                .attr("class", "full-frame")
                .html("<div id='g-mcu_regr-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-13 - 18:10 -->	<!-- ai file: 07_RWA_religion_300px-copy -->	<style type='text/css' media='screen,print'>		.g-artboard {			margin:0 auto;		}	</style>	<!-- Artboard: MCU-regr2010 -->	<div id='g-mcu_regr-MCU-regr2010' class='g-artboard g-artboard-v3 ' data-min-width='300'>		<style type='text/css' media='screen,print'>			#g-mcu_regr-MCU-regr2010{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-mcu_regr-MCU-regr2010 p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:7px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:400;				text-align:center;				letter-spacing:0.00416666666667em;				color:#f1f2f2;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				color:#a7a9ac;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:7px;				font-weight:300;				text-align:right;				color:#636466;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:7px;				font-weight:300;				text-align:center;				color:#636466;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:400;				text-align:right;				letter-spacing:0.00416666666667em;				color:#636466;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:100;				text-align:center;				color:#658338;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle8 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle9 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:400;				text-align:right;				letter-spacing:0.00416666666667em;				color:#f1f2f2;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle10 {				font-family:Lato,sans-serif;				font-size:8px;				line-height:8px;				font-weight:300;				text-transform:uppercase;				color:#414042;			}			#g-mcu_regr-MCU-regr2010 .g-aiPstyle11 {				font-family:Lato,sans-serif;				font-size:8px;				line-height:8px;				font-weight:300;				text-align:justify;				letter-spacing:0.00416666666667em;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-mcu_regr-MCU-regr2010-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/fp/MCU-regr2010.png'				/>			<div id='g-ai0-1' class='g-scale_-_regressions g-aiAbs' style='top:2.9293%;left:3.5003%;width:39.0612%;'>				<p class='g-aiPstyle0'>Difference   in   Contraception Use   from   Central   plateau   zone</p>			</div>			<div id='g-ai0-2' class='g-year g-aiAbs' style='top:2.9293%;left:84.4583%;width:10.1492%;'>				<p class='g-aiPstyle1'>2010</p>			</div>			<div id='g-ai0-3' class='g-lz_regr g-aiAbs' style='top:6.591%;left:70.0112%;width:19.9158%;margin-left:-9.9579%;'>				<p class='g-aiPstyle2'>Eastern Agro- Pastoral</p>			</div>			<div id='g-ai0-4' class='g-scale_-_regressions g-aiAbs' style='top:10.985%;left:6.1178%;'>				<p class='g-aiPstyle3'>10%</p>			</div>			<div id='g-ai0-5' class='g-scale_-_regressions g-aiAbs' style='top:11.7173%;right:72.8669%;'>				<p class='g-aiPstyle4'>not</p>				<p class='g-aiPstyle4'>different</p>			</div>			<div id='g-ai0-6' class='g-scale_-_regressions g-aiAbs' style='top:11.3512%;left:13.5052%;'>				<p class='g-aiPstyle3'>5%</p>			</div>			<div id='g-ai0-7' class='g-scale_-_regressions g-aiAbs' style='top:11.3512%;left:35.9961%;'>				<p class='g-aiPstyle3'>5%</p>			</div>			<div id='g-ai0-8' class='g-scale_-_regressions g-aiAbs' style='top:11.3512%;left:42.0247%;'>				<p class='g-aiPstyle3'>10%</p>			</div>			<div id='g-ai0-9' class='g-scale_-_regressions g-aiAbs' style='top:13.9143%;left:9.1919%;width:12.2962%;margin-left:-6.1481%;'>				<p class='g-aiPstyle5'>worse</p>			</div>			<div id='g-ai0-10' class='g-scale_-_regressions g-aiAbs' style='top:13.9143%;left:39.7191%;width:43.6927%;margin-left:-21.8464%;'>				<p class='g-aiPstyle5'>better than C. Plateau</p>			</div>			<div id='g-ai0-11' class='g-lz_regr g-aiAbs' style='top:24.8993%;right:80.4176%;width:11.449%;'>				<p class='g-aiPstyle6'>Northwestern Volcanic Irish Potato</p>			</div>			<div id='g-ai0-12' class='g-label_-_parks g-aiAbs' style='top:31.4903%;left:86.1023%;width:5.9419%;margin-left:-2.9709%;'>				<p class='g-aiPstyle7'>Akagera National Park</p>			</div>			<div id='g-ai0-13' class='g-lz_regr g-aiAbs' style='top:37.349%;left:76.8396%;width:26.6926%;margin-left:-13.3463%;'>				<p>&nbsp;</p>				<p class='g-aiPstyle2'>Southeastern Plateau Banana</p>			</div>			<div id='g-ai0-14' class='g-label_-_kivu g-aiAbs' style='top:41.3768%;left:18.7158%;width:10.7428%;margin-left:-5.3714%;'>				<p class='g-aiPstyle8'>Lake kivu</p>			</div>			<div id='g-ai0-15' class='g-lz_regr g-aiAbs' style='top:43.2076%;left:45.8455%;width:19.2644%;margin-left:-9.6322%;'>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p class='g-aiPstyle2'>Central Plateau Cassava & Coffee</p>			</div>			<div id='g-ai0-16' class='g-lz_regr g-aiAbs' style='top:58.5866%;right:74.8065%;width:6.2601%;'>				<p class='g-aiPstyle9'>Lake Kivu Coffee</p>			</div>			<div id='g-ai0-17' class='g-label_-_parks g-aiAbs' style='top:72.1347%;left:24.4809%;width:9.8945%;margin-left:-4.9473%;'>				<p class='g-aiPstyle7'>Nyungwe National Park</p>			</div>			<div id='g-ai0-18' class='g-label_-_reference g-aiAbs' style='top:73.9656%;left:56.708%;width:24.3707%;'>				<p class='g-aiPstyle10'>Reference Zone</p>			</div>			<div id='g-ai0-19' class='g-label_-_reference g-aiAbs' style='top:77.9934%;left:56.708%;width:38.765%;'>				<p class='g-aiPstyle11'>Women in livelihood zones were compared similar ones from the Central Plateau Cassava & Coffee  to test for significantly higher or lower modern contaception use.</p>			</div>		</div>	</div>	<!-- Artboard: MCU-regr2014 -->	<div id='g-mcu_regr-MCU-regr2014' class='g-artboard g-artboard-v3 ' data-min-width='300'>		<style type='text/css' media='screen,print'>			#g-mcu_regr-MCU-regr2014{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-mcu_regr-MCU-regr2014 p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:7px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:16px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:400;				text-align:center;				letter-spacing:0.00416666666667em;				color:#f1f2f2;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				color:#a7a9ac;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle4 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:7px;				font-weight:300;				text-align:right;				color:#636466;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle5 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:7px;				font-weight:300;				text-align:center;				color:#636466;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle6 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:400;				text-align:right;				letter-spacing:0.00416666666667em;				color:#636466;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle7 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				font-style:italic;				text-transform:uppercase;				text-align:center;				letter-spacing:0.33333333333333em;				color:#a1abb7;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle8 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:400;				text-align:right;				letter-spacing:0.00416666666667em;				color:#f1f2f2;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle9 {				font-family:Lato,sans-serif;				font-size:8px;				line-height:8px;				font-weight:300;				text-transform:uppercase;				letter-spacing:-0.04166666666667em;				color:#414042;			}			#g-mcu_regr-MCU-regr2014 .g-aiPstyle10 {				font-family:Lato,sans-serif;				font-size:5px;				line-height:6px;				font-weight:300;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-mcu_regr-MCU-regr2014-graphic'>			<img id='g-ai1-0'				class='g-aiImg'				src='/img/fp/MCU-regr2014.png'				/>			<div id='g-ai1-1' class='g-scale_-_regressions_copy g-aiAbs' style='top:2.9293%;left:3.3337%;width:39.0612%;'>				<p class='g-aiPstyle0'>Difference   in   Contraception Use   from   Central   plateau   zone</p>			</div>			<div id='g-ai1-2' class='g-label_-_year_copy g-aiAbs' style='top:2.9293%;left:84.2917%;width:10.1492%;'>				<p class='g-aiPstyle1'>2014</p>			</div>			<div id='g-ai1-3' class='g-lz_regr_copy g-aiAbs' style='top:6.591%;left:69.8246%;width:19.9158%;margin-left:-9.9579%;'>				<p class='g-aiPstyle2'>Eastern Agro- Pastoral</p>			</div>			<div id='g-ai1-4' class='g-scale_-_regressions_copy g-aiAbs' style='top:10.985%;left:5.9512%;'>				<p class='g-aiPstyle3'>10%</p>			</div>			<div id='g-ai1-5' class='g-scale_-_regressions_copy g-aiAbs' style='top:11.7173%;right:73.0335%;'>				<p class='g-aiPstyle4'>not</p>				<p class='g-aiPstyle4'>different</p>			</div>			<div id='g-ai1-6' class='g-scale_-_regressions_copy g-aiAbs' style='top:11.3512%;left:13.3385%;'>				<p class='g-aiPstyle3'>5%</p>			</div>			<div id='g-ai1-7' class='g-scale_-_regressions_copy g-aiAbs' style='top:11.3512%;left:35.8294%;'>				<p class='g-aiPstyle3'>5%</p>			</div>			<div id='g-ai1-8' class='g-scale_-_regressions_copy g-aiAbs' style='top:11.3512%;left:41.8581%;'>				<p class='g-aiPstyle3'>10%</p>			</div>			<div id='g-ai1-9' class='g-scale_-_regressions_copy g-aiAbs' style='top:13.9143%;left:9.0252%;width:12.2962%;margin-left:-6.1481%;'>				<p class='g-aiPstyle5'>worse</p>			</div>			<div id='g-ai1-10' class='g-scale_-_regressions_copy g-aiAbs' style='top:13.9143%;left:39.5524%;width:43.6927%;margin-left:-21.8464%;'>				<p class='g-aiPstyle5'>better than C. Plateau</p>			</div>			<div id='g-ai1-11' class='g-lz_regr_copy g-aiAbs' style='top:24.8993%;right:80.6043%;width:11.449%;'>				<p class='g-aiPstyle6'>Northwestern Volcanic Irish Potato</p>			</div>			<div id='g-ai1-12' class='g-lz_regr_copy g-aiAbs' style='top:37.349%;left:76.733%;width:26.6926%;margin-left:-13.3463%;'>				<p>&nbsp;</p>				<p class='g-aiPstyle2'>Southeastern Plateau Banana</p>			</div>			<div id='g-ai1-13' class='g-label_-_kivu_copy g-aiAbs' style='top:41.3768%;left:18.5491%;width:10.7428%;margin-left:-5.3714%;'>				<p class='g-aiPstyle7'>Lake kivu</p>			</div>			<div id='g-ai1-14' class='g-lz_regr_copy g-aiAbs' style='top:43.2076%;left:45.7389%;width:19.2644%;margin-left:-9.6322%;'>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p>&nbsp;</p>				<p class='g-aiPstyle2'>Central Plateau Cassava & Coffee</p>			</div>			<div id='g-ai1-15' class='g-lz_regr_copy g-aiAbs' style='top:58.5866%;right:74.9932%;width:6.2601%;'>				<p class='g-aiPstyle8'>Lake Kivu Coffee</p>			</div>			<div id='g-ai1-16' class='g-label_-_reference_2014 g-aiAbs' style='top:73.9656%;left:57.334%;width:22.6471%;'>				<p class='g-aiPstyle9'>Reference Zone</p>			</div>			<div id='g-ai1-17' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:67.7474%;'>				<p class='g-aiPstyle10'>0</p>			</div>			<div id='g-ai1-18' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:74.8307%;'>				<p class='g-aiPstyle10'>20</p>			</div>			<div id='g-ai1-19' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:82.3968%;'>				<p class='g-aiPstyle10'>40</p>			</div>			<div id='g-ai1-20' class='g-scale_-_dimensions_copy g-aiAbs' style='top:90.0769%;left:89.9629%;'>				<p class='g-aiPstyle10'>60 km</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-13 - 18:10 --></div>")
                //.style("min-width", dims.map.w + "px")
                .style("opacity", 0);

              mcuRegrMap = fullG.selectAll("#mcu-regr") ;


// MCU dot plot
    mcu = plotG
      .append("g")
       .attr("id", "mcu")
       .attr("transform", "translate(" + margins.mcu.left + "," + margins.mcu.top + ")")
       .style("opacity", 0);

    mcuRelig = plotG
         .append("g")
          .attr("id", "mcuRelig")
          .attr("transform", "translate(" + margins.mcuRelig.left + "," + margins.mcuRelig.top + ")")
          .style("opacity", 0);

    religSlope = plotG
      .append("g")
       .attr("id", "relig-dot")
       .attr("transform", "translate(" + margins.religSlope.left + "," + margins.religSlope.top + ")")
       .style("opacity", 0);


    svg.append("svg")
      .attr("width", width + margin.left + margin.right)
      // .attr("height", margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + 10) + ")")
        .attr("id", "source")
      .style("opacity", 1)

      source = svg.selectAll("#source");

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
    d.diff = +d.diff;
    d.year = +d.year;
});

var religNest = d3.nest()
  .key(function(d) { return d.religion;})
  .sortKeys(d3.descending)
  .entries(religData.filter(function(d) {return focusRelig.indexOf(d.religion) > -1}));

// Religion pop pyramid ---------------------------------------------------------------------------
var religAgeData = rawData["religAge"];

// Nest by religion
var religAgeNest = d3.nest()
  .key(function(d) { return d.religion })
  .entries(religAgeData.sort(function(a,b) {return b.order - a.order}));



// Religion pct for dot plot ---------------------------------------------------------------------------
var religPctData = rawData["religPct"];



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
               .data(nested.filter(function(d) {return d.key != "National"}))
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
        .style("fill", function(d) {return zMCU(mcuAvg)})

    // remove extra dots
    mcuDots.exit().remove();

    // change to average
    mcuDots.transition()
    .duration(600)
    .attr("class", "dot")
    .attr("cx", xMCU(mcuAvg))
    .attr("cy",  dims.mcu.h/2)
    .style("fill", function(d) {return zMCU(mcuAvg)})
    .attr("r", radius*2)


    // change to new values
    mcuDots.transition(1000).delay(650)
      .attr("cx", function(d) {return xMCU(d.ave);})
      .attr("cy", function(d) {return yMCU(d.Variable) + yMCU.rangeBand()/2})
      // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
      .style("fill", function(d) {return zMCU(d.ave);});

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
     xRslope.domain([d3.min(religData, function(element) { return element.year; }),
               d3.max(religData, function(element) { return element.year; })]);
     yRslope.domain([0, d3.max(religData.filter(function(d) {return d.religion != 'national'}),
       function(element) { return element.pct; })]);
     zRelig.domain(religData.map(function(element) {return element.religion}));

     xAxRslope.tickValues(xRslope.domain())

     // Religion Bar
       yRbar.domain(religData.map(function(element) {return element.year}));
       xRbar.domain([0, d3.max(religData.filter(function(d) {return focusRelig.indexOf(d.religion) > -1;}),
         function(element) { return element.pop; })]);

    // Religion by Age Bar
       yRage.domain(religAgeData.map(function(element) {return element.age_label}));
       xRage.domain([0, d3.max(religAgeData.filter(function(d) {return focusRelig.indexOf(d.religion) > -1;}),
         function(element) { return element.pct; })]);


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

   xMCUrelig.domain([0, d3.max(mcuData, function(element) { return element.ave; })]);

  yMCUrelig.domain(mcuData
       .filter(function(d) {return d.Category == "Religion"})
       .filter(function(d) {return d.year == selectedYear})
       .sort(function(a,b) {return a.ave - b.ave}) // ascending sort
       .map(function(element) {return element.Variable}));

// EVENT: on clicking breadcrumb, change the page. -----------------------------
br.selectAll("circle").on("click", function(d,i) {
  selectedFrame = this.id;

  updateBreadcrumbs(selectedFrame);
  activateFunctions[selectedFrame]();
});
// end of BREADCRUMBS (+ update function) ------------------------------------------------------------




// Call the function to set up the svg objects
       setupVis(tfrCountries, tfrNest, tfrRwanda, religData, religNest, religPctData, religAgeNest);

// Set up the functions to edit the sections.
       setupSections();

     });
   };



/* SETUP VIS -------------------------------------------------------------------
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function(data, tfrNest, tfrRwanda, religData, religNest, religPctData, religAgeData) {

// Swoopy arrows!
    // swoopy arrow annotations
    var swAnnot =
    {tfr: [{coords: [[x(2010.5), y(5)],[x(2010.25), y(4.7)]]},
          {coords: [[x(2016.5), y(4.8)],[x(2016.25), y(4.5)]]}
    ],
    mcuRelig: {coords: [[xMCUrelig(0.55), yMCUrelig("Protestant")],[xMCUrelig(0.5), yMCUrelig("Protestant") + 15]]},
    slope: [{coords: [[xRslope(2004), yRslope(0.54)],[xRslope(2003), yRslope(0.53)]]},
    {coords: [[xRslope(2008), yRslope(0.28)],[xRslope(2007), yRslope(0.3)]]}
  ],
    rBar: [{coords: [[xRbar(2.2e6), yRbar(2012) - 50],[xRslope(2003), yRbar(2012) - 50]]}
  ]
    }

    // TEXT / SWOOPY ANNOTATION
    // Basic swoopy arrow
               var swoopyOver = swoopyArrow()
                 .angle(Math.PI/3)
                 .x(ƒ(0))
                 .y(ƒ(1))
                 .clockwise(false);

                 var swoopyUnder = swoopyArrow()
                   .angle(Math.PI/3)
                   .x(ƒ(0))
                   .y(ƒ(1))
                   .clockwise(true);


               // Define simple arrowhead marker
               svg.append('defs')
                 .append("marker")
                   .attr("id", "arrowhead")
                   .attr("viewBox", "-10 -10 20 20")
                   .attr("refX", 0)
                   .attr("refY", 0)
                   .attr("markerWidth", 15)
                   .attr("markerHeight", 20)
                   .attr("stroke-width", 1)
                   .attr("orient", "auto")
                 .append("polyline")
                   .attr("stroke-linejoin", "bevel")
                   .attr("points", "-6.75,-4.75 0,0 -6.75,4.75");
    // --- SOURCE ---
    // TEXT: source


source.append("rect")
  .attr("class", "source-bg")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width - padding_right)
  .attr("height", margin.bottom)

  source.append("line")
        .attr("class", "source-div")
        .attr("x1", 0)
        .attr("x2", width - padding_right)
        .attr("y1", 0)
        .attr("y2", 0)
        .style("opacity", 1);

  source.append("image")
      .attr("id", "usaid-logo")
      .attr("xlink:href", function(d) {return "/img/USAID-Rwanda-logo.png"})
      .attr("x", "10px")
      .attr("width", "20%")
      .attr("height", margin.bottom)
      .style("opacity", 1);

  source.append("image")
          .attr("id", "gc-logo")
          .attr("xlink:href", function(d) {return "/img/geocenter.png"})
          .attr("x", "80%")
          .attr("y", "5px")
          .attr("width", "12%")
          // .attr("height", margin.bottom)
          .style("opacity", 1);

  source.append("text")
      .attr("class", "source")
      .attr("id", "email")
      .attr("x", "92%")
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "end")
      .style("alignment-baseline", "baseline")
      .text("geocenter@usaid.gov")
      .style("opacity", 1);

  source.append("text")
    .attr("class", "source")
    .attr("id", "source-text")
    .attr("x", "25%")
    .attr("y", margin.bottom/2)
    .style("opacity", 1);

    // end SOURCE ----------------------------------------------------------------

    // --- RELIGION BAR PLOT ---

    religBar = d3.select("#vis").selectAll("#relig-bar");

  religBar.data(religNest)
    .enter().append("div")
      .attr("class", "sm-mult")
      .attr("id", "relig-bar")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("left", function(d,i) {return i*(width/2) + "px";})
      .style("width", width / 2 + "px")
      .style("height", height + "px")
    .append("svg")
      .attr("width", width / 2)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + margins.religBar.left + "," + margins.religBar.top + ")")
      .each(multiple);

      function multiple(popByRelig){
        var svg = d3.select(this);

        xRbar.range([0, dims.religBar.w/2]);


        svg.selectAll(".top-label")
          .data(popByRelig.values.filter(function(d,i) {return i == 0;}))
        .enter().append("text")
          .attr("class", "top-label")
          .attr("x", 0)
          .attr("y", -margins.religBar.top/2)
          .style("font-size", "18px")
          .style("fill", function(d) {return zRelig(d.religion);})
          .text(function(d) {return d.religion + " population";});

        svg.append("g")
            .call(xAxRbar)
            .attr("class", "x axis")
            .attr("id", "relig-x")
            .attr("transform", "translate(0," + xaxisOffset + ")")
            .style("opacity", 1);

        svg.append("g")
                .call(yAxRbar)
                .attr("class", "y axis")
                .attr("id", "relig-y")
                // .attr("transform", "translate(" + width + ",0)")
                .style("opacity", 1);

// Normal bars
          svg.selectAll(".bar")
                        .data(popByRelig.values.filter(function(d) {return d.ref == 0 &
                          focusRelig.indexOf(d.religion) > -1;}))
          .enter().append("rect")
              .attr("class", "bar")
              .attr("x", 0)
              .attr("y", function(d) {return yRbar(d.year);})
              .attr("width", function(d) {return xRbar(d.pop);})
              .attr("height", yRbar.rangeBand())
              // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
              .style("fill", function(d) {return zRelig(d.religion);})
              .attr("stroke", function(d) {return d.ref == 0 ? zRelig(d.religion) : "none";})
              .style("stroke-width", 1)
              .style("fill-opacity", 0.35);

              // Highlight diff
          svg.selectAll("#bar-diff")
            .data(popByRelig.values.filter(function(d) {return d.ref == 1 &
              focusRelig.indexOf(d.religion) > -1;}))
          .enter().append("rect")
              .attr("class", "bar")
              .attr("id", "bar-diff")
              .attr("x", function(d) {return xRbar(d.pop);})
              .attr("y", function(d) {return yRbar(d.year);})
              .attr("width", function(d) {return xRbar(d.diff);})
              .attr("height", yRbar.rangeBand())
              // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
              .style("fill", function(d) {return zRelig(d.religion);})
              .attr("stroke", function(d) {return d.ref == 0 ? zRelig(d.religion) : "none";})
              .style("stroke-width", 1)
              .style("fill-opacity", 0.2);

// Text annotation: difference
svg.selectAll("#diff-line")
  .data(popByRelig.values.filter(function(d,i) {return d.ref == 1 & d.year == 2012 & d.religion == "Protestant";}))
.enter().append("line")
  .attr("id", "diff-line")
  .attr("class", "solid-line")
  .attr("x1", function(d) {console.log(d); return xRbar(d.pop);})
  .attr("x2", function(d) {return xRbar(d.diff + d.pop);})
  .attr("y1", yRbar.rangeBand() * 2.2)
  .attr("y2", yRbar.rangeBand() * 2.2)
  .style("fill", function(d) {return zRelig(d.religion);})
  .style("text-anchor", "middle")
  .text(function(d) {return (d3.format(".2s"))(d.diff);});

svg.selectAll("#diff-annot")
  .data(popByRelig.values.filter(function(d,i) {return d.ref == 1 & d.year == 2012;}))
.enter().append("text")
  .attr("id", "diff-annot")
  .attr("x", function(d) {return xRbar(d.diff/2 + d.pop);})
  .attr("y", yRbar.rangeBand() * 2.2)
  .style("fill", function(d) {return zRelig(d.religion);})
  .text(function(d) {return (d3.format(".2s"))(d.diff);});

if(popByRelig.key == "Protestant"){
// White box to hide underlying line
  var text = d3.select("#diff-annot");
  var bbox = text.node().getBBox();

  var padding = 4;

  svg.insert("rect", "#diff-annot")
      .attr("x", bbox.x - padding)
      .attr("y", bbox.y - padding)
      .attr("width", bbox.width + (padding*2))
      .attr("height", bbox.height + (padding*2))
      .style("fill", "white");
}

// Ref line: 2002
              svg.selectAll("#bar-ref")
                .data(popByRelig.values.filter(function(d) {return d.ref == 1 &
                  d.year == 2012 &
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
  svg.selectAll("#cath-ref")
          .data(popByRelig.values.filter(function(d) {return d.ref == 0}))
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


      }





    // --- end RELIGION BAR PLOT ---


// --- RELIGION BY AGE BAR PLOT ---

  d3.select("#vis")
    .selectAll("#relig-age")
    .data(religAgeData)
    .enter().append("div")
      .attr("class", "sm-mult")
      .attr("id", function(d) {return "relig-age_" + d.key;})
      .style("position", "absolute")
      .style("opacity", 0)
      .style("left", function(d,i) {return i*(width/2) + "px";})
      .style("width", width / 2 + "px")
      .style("height", height + "px")
      .style("opacity", 0)
    .append("svg")
      .attr("width", width / 2)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + margins.religAge.left + "," + margins.religAge.top + ")")
      .each(multipleAge);

// Function to repeat over the plot.
      function multipleAge(popByRelig){
        var svg = d3.select(this);


        xRage.range([0, dims.religAge.w/2]);


        svg.selectAll(".top-label")
          .data(popByRelig.values.filter(function(d,i) {return i == 0;}))
        .enter().append("text")
          .attr("class", "top-label")
          .attr("x", -margins.religAge.left)
          .attr("y", -margins.religAge.top/2)
          .style("font-size", "18px")
          .style("fill", function(d) {return zRelig(d.religion);})
          .text(function(d) {return "percent of " + d.religion + " population";});

if(popByRelig.key == "Protestant") {
  svg.append("g")
          .call(yAxRage)
          .attr("class", "y axis")
          .attr("id", "religAge-y")
          // .attr("transform", "translate(" + width + ",0)")
          .style("opacity", 1);
}

      svg.append("g")
        .call(xAxRage)
        .attr("class", "x axis")
        .attr("id", "religAge-x")
        .attr("transform", "translate(0," + xaxisOffset + ")")
        .style("opacity", 1);


// Normal bars
          svg.selectAll("#age-bar")
              .data(popByRelig.values)
          .enter().append("rect")
              .attr("class", "bar")
              .attr("id", "age-bar")
              .attr("x", 0)
              .attr("y", function(d) {return yRage(d.age_label);})
              .attr("width", function(d) { return xRage(d.pct);})
              .attr("height", yRage.rangeBand())
              // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
              .style("fill", function(d) {return zRelig(d.religion);})
              .attr("stroke", function(d) {return d.ref == 0 ? zRelig(d.religion) : "none";})
              .style("stroke-width", 1)
              .style("fill-opacity", 0.5);
      }
    // --- end RELIGION BY AGE BAR PLOT ---

// --- RELIGION SLOPE PLOT ---
    // x-axis label
        religSlope.selectAll(".top-label")
            .data(religData.filter(function(d) {return d.religion == "Catholic" & d.mostrecent == true;}))
          .enter().append("text")
            .attr("class", "top-label")
            .attr("x", dims.religSlope.w * 0.22)
            .attr("y", -margins.religSlope.top*2/3)
            // .attr("dx", -dims.religSlope.w * 0.35)
            // .attr("dy", -dims.religSlope.h * 0.1)
            .style("text-anchor", "start")
            .text("percent of population")
            .style("opacity", 1);

        religSlope.append("g")
            .call(xAxRslope)
            .attr("class", "x axis big")
            .attr("id", "relig-x")
            .attr("transform", "translate(0," + -margins.religSlope.top/2 + ")")
            .style("opacity", 1);

        religSlope.append("g")
                .call(yAxRslope)
                .attr("class", "y axis")
                .attr("id", "relig-y")
                .attr("transform", "translate(" + (40-margins.religSlope.left) + ",0)")
                .style("opacity", 1);


// Swoopy arrows
religSlope
.append("path.arrow")
  .attr('marker-end', 'url(#arrowhead)')
  .attr("id", "slope-arrow")
  .datum(swAnnot.slope[0].coords)
  .attr("d", swoopyOver)
  .style("opacity", 0);

  religSlope
  .append("path.arrow")
    .attr('marker-end', 'url(#arrowhead)')
    .attr("id", "slope-annot")
    .datum(swAnnot.slope[1].coords)
    .attr("d", swoopyUnder)
    .style("opacity", 0);

                // Annotations
    religSlope.selectAll("slope-annot")
      .data(annotations.relig_slope)
      .enter().append('text')
          .attr("y", function(d) {return yRslope(d.y);})
          .attr("id", function(d) {return d.id;})
          .style("opacity", 0)
        .tspans(function(d) {
        return d3.wordwrap(d.text, 25);  // break line after 25 characters
      });


religSlope.selectAll("tspan")
  .attr("x", 0.62 * dims.religSlope.w)

                    // Underlying box, to mask the grid lines
        var text = d3.select("#slope-annot");
        var bbox = text.node().getBBox();

        var padding = 4;

        religSlope.insert("rect", "#slope-annot")
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y - padding)
            .attr("width", bbox.width + (padding*2))
            .attr("height", bbox.height + (padding*2))
            .style("fill", "white")
            .style("opacity", 0.5);



// LINE: slope line connecting pts
religSlope.selectAll(".slope")
    .data(religPctData)
  .enter().append("line")
      .attr("class", "slope")
      .attr("x1", function(d) {return xRslope(2002);})
      .attr("x2", function(d) {return xRslope(2002);})
      .attr("y1", function(d) {return yRslope(d.pct2002);})
      .attr("y2", function(d) {return yRslope(d.pct2002);})
      .attr("stroke", function(d) {return zRelig(d.religion);})
      .style("opacity", function(d) {return focusRelig.indexOf(d.religion) > -1 ? 1 : 0.35;});



// 2002 dot mask
    religSlope.selectAll("#relig2002-mask")
      .data(religPctData)
    .enter().append("circle")
        .attr("class", "dot_mask")
        .attr("id", "relig2002-mask")
        .attr("r", radius*1.5)
        .attr("cx", function(d) {return xRslope(2002);})
        .attr("cy", function(d) {return yRslope(d.pct2002);})
        // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
        .style("opacity", 1);

// 2002 dots
        religSlope.selectAll("#relig2002")
          .data(religPctData)
        .enter().append("circle")
            .attr("class", "dot")
            .attr("id", "relig2002")
            .attr("r", radius*1.5)
            .attr("cx", function(d) {return xRslope(2002);})
            .attr("cy", function(d) {return yRslope(d.pct2002);})
            // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
            .style("fill", function(d) {return zRelig(d.religion);})
            .style("opacity", function(d) {return focusRelig.indexOf(d.religion) > -1 ? 1 : 0.35;});

// 2012 dots. Initially set to be at 2002 values.
          religSlope.selectAll("#relig2012-mask")
            .data(religPctData)
          .enter().append("circle")
              .attr("class", "dot_mask")
              .attr("id", "relig2012-mask")
              .attr("r", radius*1.5)
              .attr("cx", function(d) {return xRslope(2002);})
              .attr("cy", function(d) {return yRslope(d.pct2002);})
              // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
              .style("opacity", 1);

// 2012 dots. Initially set to be at 2002 values.
            religSlope.selectAll("#relig2012")
              .data(religPctData)
            .enter().append("circle")
                .attr("class", "dot")
                .attr("id", "relig2012")
                .attr("r", radius*1.5)
                .attr("cx", function(d) {return xRslope(2002);})
                .attr("cy", function(d) {return yRslope(d.pct2002);})
                // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
                .style("fill", function(d) {return zRelig(d.religion);})
                .style("opacity", function(d) {return focusRelig.indexOf(d.religion) > -1 ? 1 : 0.35;});



      // TEXT: Religion label
          religSlope.selectAll("#religSlope-annot")
              .data(religPctData)
            .enter().append("text")
              .attr("id", "religSlope-annot")
              .attr("class", "annot")
              .text(function(d) {return d.religion})
              .attr("x", function(d) {return d.pct2002;})
              .attr("dx", 20)
              .attr("y", function(d) {return yRslope(d.pct2002);})
              // .attr("dy", "0.4em")
              .style("fill", function(d) {return zRelig(d.religion);})
              .style("opacity", function(d) {return focusRelig.indexOf(d.religion) > -1 ? 1 : 0.35;});

      // TEXT: % religion value (init.)
          religSlope.selectAll("#Rpct-annot")
              .data(religPctData.filter(function(d) {return focusRelig.indexOf(d.religion) > -1;}))
            .enter().append("text")
              .attr("id", "Rpct-annot")
              .attr("class", "annot")
              .text(function(d) {return d3.format(".0%")(d.pct2002)})
              .attr("x", function(d) {return xRslope(2002);})
              .attr("dy", -20)
              .attr("y", function(d) {return yRslope(d.pct2002);})
              .style("fill", function(d) {return zRelig(d.religion);})
              .style("opacity", 1);

    // TEXT: % religion value
    religSlope.selectAll("#Rpct-annot2012")
        .data(religPctData.filter(function(d) {return focusRelig.indexOf(d.religion) > -1;}))
      .enter().append("text")
        .attr("id", "Rpct-annot2012")
        .attr("class", "annot")
        .text(function(d) {return d3.format(".0%")(d.pct2002)})
        .attr("x", function(d) {return xRslope(2002);})
        .attr("dy", -20)
        .attr("y", function(d) {return yRslope(d.pct2002);})
        .style("fill", function(d) {return zRelig(d.religion);})
        .style("opacity", 1);


// --- end RELIGION DOT PLOT ---------------------------------------------------

// --- RELIGION MCU PLOT ---
mcuRelig.selectAll(".top-label")
    .data(religData.filter(function(d) {return d.religion == "Catholic" & d.mostrecent == true;}))
  .enter().append("text")
    .attr("class", "top-label")
    .attr("y", -margins.mcuRelig.top/2)
    .text("percent of women 15-49 married or in a union using modern contraception")
    .style("opacity", 1);

mcuRelig.append("g")
.call(xAxMCUrelig)
    .attr("class", "x axis")
    .attr("id", "mcuRelig-x")
    .style("opacity", 1);

mcuRelig.append("g")
.call(yAxMCUrelig)
  .attr("class","y axis")
  .attr("id", "mcuRelig-y")
  .style("opacity", 1);

  // LINE: natl. avg.
      mcuRelig.selectAll("#natl")
             .data(mcuData.filter(function(d) {return d.Category == "National" & d.year == selectedYear;}))
           .enter().append("line")
             .attr("class", "natl")
             .attr("id", "natl")
             .attr("y1", 0)
             .attr("y2", dims.mcuRelig.h)
             .attr("x1", function(d) {return xMCUrelig(d.natl)})
             .attr("x2", function(d) {return xMCUrelig(d.natl)})
             .style("stroke-dasharray", ("5, 10"))
             .style("opacity", 1);

  // TEXT: national annotation
  mcuRelig.selectAll("#natl-annot-right")
        .data(mcuData.filter(function(d) {return d.Category == "National" & d.year == selectedYear;}))
      .enter().append("text")
        .attr("class", "natl-annot-right")
         .attr("id", "natl-annot")
        .attr("x", function(d) {return xMCUrelig(d.natl)})
        .attr("y", yMCUrelig.rangeBand()/3)
        // .attr("y", y.bandwidth())
        .attr("dx", 10)
        .text(function(d) {return "national average: " + d3.format(".0%")(d.natl)})
        .style("opacity", 1);


        mcuRelig
        .append("path.arrow")
          .attr('marker-end', 'url(#arrowhead)')
          .attr("id", "mcuRelig-arrow")
          .datum(swAnnot.mcuRelig.coords)
          .attr("d", swoopyUnder)
          .style("opacity", 1);

        // TEXT: protestant annotation
        mcuRelig.selectAll(".val-labels")
              .data(mcuData.filter(function(d) {return d.Variable == "Protestant" & d.year == selectedYear;}))
            .enter().append("text")
              .attr("class", "val-labels")
               .attr("id", "val-annot")
              .attr("x", function(d) {return xMCUrelig(d.ave)})
              .attr("y", function(d) {return yMCUrelig(d.Variable) + yMCUrelig.rangeBand()/2})
              // .attr("y", y.bandwidth())
              .attr("dx", -30)
              .attr("dy", 6)
              .text(function(d) {return d3.format(".0%")(d.ave)})
              .style("opacity", 0)
              .style("font-size", 18)
              .style("fill", function(d) {return zMCU(d.natl);}); // Keep constant so consistent w/ later results.

// lollipop connectors
  mcuRelig.selectAll("#mcu-lolli")
    .data(mcuData.filter(function(d) {return d.Category == "Religion" & d.year == selectedYear;}))
  .enter().append("line")
        .attr("id", "mcu-lolli")
        .attr("x1", function(d) {return xMCUrelig(d.natl);})
        .attr("x2", function(d) {return xMCUrelig(d.natl);})
        .attr("y1", function(d) {return yMCUrelig(d.Variable) + yMCUrelig.rangeBand()/2;})
        .attr("y2", function(d) {return yMCUrelig(d.Variable) + yMCUrelig.rangeBand()/2;})
        .style("opacity", 1);


// dot avg.
  mcuRelig.selectAll("#mcu-relig")
    .data(mcuData.filter(function(d) {return d.Category == "Religion" & d.year == selectedYear;}))
  .enter().append("circle")
      .attr("class", "dot")
      .attr("id", "mcu-relig")
      .attr("r", radius*1.5)
      .attr("cx", function(d) {return xMCUrelig(d.natl);})
      .attr("cy", function(d) {return yMCUrelig(d.Variable) + yMCUrelig.rangeBand()/2})
      // .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
      .style("fill", function(d) {return zMCU(d.natl);}); // Keep constant so consistent w/ later results.




// --- end RELIGION MCU PLOT --------------------------------------------------

// --- MCU stepper ---
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
      .style("fill", function(d) {return zMCU(d.ave);});

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
// end MCU stepper -------------------------------------------------------------

    // MAP: map
  //  imgG.append("image")
  //      .attr("class", "rw-map")
  //      .attr("id", "popdensity")
  //      .attr("xlink:href", function(d) {return "/img/intro/afr5.png"})
  //      .attr("width", dims.map.w)
  //      .attr("height", "100%")
  //      .style("opacity", 1);

// --- TFR plot ---
tfr.append("text")
    .attr("class", "top-label")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", -margins.tfr.top)
    .text("estimated total fertility rate");



    // draw the axes
  tfr.append("g")
    .call(xAxTFR)
        .attr("class", "x axis")
        .attr("id", "tfr-x")
        .attr("transform", "translate(0," + xaxisOffset + ")")
        .style("opacity", 1);

  tfr.append("g")
    .call(yAxTFR)
        .attr("class","y axis")
        .attr("id", "tfr-y")
        .attr("transform", "translate(" + (20-margins.tfr.left) + ",0)")
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
       .style("opacity", function(d) {return d.key == "Rwanda" ? 1 : 0.5;});

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
       .style("fill-opacity", function(d) { if(d.country == "Rwanda" & d.year >= 2010) { return 0.8;
       } else if(d.country == "Rwanda") {
         return 0.45;
       } else {
         return 0.15;}});


  // TEXT: Country label
      tfr.selectAll("#tfr-country")
          .data(data.filter(function(d) {return d.mostrecent == true;}))
        .enter().append("text")
          .attr("id", "tfr-country")
          .attr("class", "annot")
          .text(function(d) {return d.country})
          .attr("x", dims.tfr.w)
          .attr("dx", 20)
          .attr("y", function(d) {return y(d.tfr);})
          // .attr("dy", "0.4em")
          .style("fill", function(d) {return z(d.country);})
          .style("opacity", function(d) {return d.country == "Rwanda" ? 1 : 0.65;});

  // TEXT: TFR at final value
      tfr.selectAll("#val-annot")
          .data(data.filter(function(d) {return d.mostrecent == true | d.leastrecent == true;}))
        .enter().append("text")
          .attr("id", "val-annot")
          .attr("class", "annot")
          .text(function(d) {return d.tfr})
          .attr("x", function(d) {return x(d.year);})
          .attr("dy", function(d) {return d.country == "Kenya" & d.mostrecent == 1 ? 20 : -20;})
          .attr("y", function(d) {return y(d.tfr);})
          .style("fill", function(d) {return z(d.country);})
          .style("opacity", function(d) {return d.country == "Rwanda" ? 1 : 0.5;});



// Draw some arrows!
tfr
.append("path.arrow")
  .attr('marker-end', 'url(#arrowhead)')
  .attr("id", "tfr-arrow")
  .datum(swAnnot.tfr[0].coords)
  .attr("d", swoopyOver)
  .style("opacity", 0);

  tfr
  .append("path.arrow")
    .attr('marker-end', 'url(#arrowhead)')
    .attr("id", "tfr-arrow")
    .datum(swAnnot.tfr[1].coords)
    .attr("d", swoopyUnder)
    .style("opacity", 0);

          tfr.selectAll("annots")
            .data(annotations.tfr)
            .enter().append("text")
            .attr("class", function(d) {return d.class;})
            .attr("id", function(d) {return d.id;})
            .html(function(d) {return d.text})
                    // .tspans(function(d) {return d3.wordwrap(d.text, ncharBreak);})
            .attr("x", function(d) {return x(d.x);})
            .attr("y", function(d) {return y(d.y);})
            .style("opacity", 1);

// end of TFR -------------------------------------------------------------------

// TEXT: Summary ----------

    summ.append("div")
      .attr("class", "subtitle accent-green")
      .text("What did we find?");

summ.append("div")
      .text("For women aged 15 - 49 married or in a union:")
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
        .text(" In the Northwest, one of the most populated in all Rwanda, women were more likely to use modern contraception than those in the central area, while women in the southwest were less likely.")

      summ3.append("a")
        .attr("href", "#demographics")
        .attr("id", "demo-jump")
        .text("Socioeconomic and education levels weakly influence family planning:")
      summ3.append("span")
        .text(" Modern contraception use and desires for more children do not appear to differ between socioeconomic and educational backgrounds.")

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
    // RslopeOff();
    // rBarOff();

    // -- TURN ON CURRENT --
    fullG.selectAll("#popdensity")
      .transition()
      .duration(tDefault)
      .style("opacity", 1);

      sourceOn("World Pop 2015", tDefault)

  }

// [[ #2 ]] --------------------------------------------------------------------
  function show2() {

// -- TURN OFF PREVIOUS --
    fullG.selectAll("#popdensity")
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
  RslopeOff();

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
  RslopeOn(tDefault);
  }

// [[ #6 ]] --------------------------------------------------------------------
  function show6() {
// -- TURN OFF PREVIOUS --
  RslopeOff();

// -- TURN OFF NEXT --
  rAgeOff(tDefault);

// -- TURN ON CURRENT --
  rBarOn(tDefault);
  }

// [[ #7 ]] --------------------------------------------------------------------
  function show7() {
// -- TURN OFF PREVIOUS --
  rBarOff();

// -- TURN OFF NEXT --
  religMapOff();

// -- TURN ON CURRENT --
  rAgeOn(tDefault);
  }

// [[ #8 ]] --------------------------------------------------------------------
  function show8() {
// -- TURN OFF PREVIOUS --
  rAgeOff();

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
  mcuOff();

// -- TURN ON CURRENT --
  mcuRegrOn(tDefault);
  }

// [[ #11 ]] --------------------------------------------------------------------
  function show11() {
// -- TURN OFF PREVIOUS --
  mcuRegrOff();
// -- TURN OFF NEXT --


// -- TURN ON CURRENT --
  mcuOn(tDefault);
  }

// [[ #12 ]] --------------------------------------------------------------------
  function show12() {
// -- TURN OFF PREVIOUS --

// -- TURN OFF NEXT --


// -- TURN ON CURRENT --
  // mcuOn(tDefault);

  }

// end of ACTIVATE FUNCTIONS ---------------------------------------------------


// HELPER FUNCTIONS ------------------------------------------------------------
function updateBreadcrumbs(idx) {
  br.selectAll("circle")
     .style("fill-opacity", function(d,i) {return i==idx ? 0.6:0.1;});
}

function sourceOn(text, tDefault) {
  vis.selectAll("#source")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);

  source.selectAll("#source-text").text("SOURCE: " + text);
}

function sourceOff() {
  vis.selectAll("#source")
    .transition()
      .duration(0)
      .style("opacity", 0);
}

function tfrOn(tDefault) {
  plotG.selectAll("#tfr")
    .transition()
      .duration(tDefault)
      .style("opacity", 1)
      .each("end", function() {

  plotG.selectAll("#tfr-arrow")
    .transition()
    .duration(tDefault)
    .delay(tDefault)
    .style("opacity", 1);

    plotG.selectAll("#tfr-annot")
      .transition()
      .duration(tDefault)
          .delay(tDefault)
      .style("opacity", 1);
})

  sourceOn("Demographic and Health Surveys", tDefault)
}

function tfrOff() {
  plotG.selectAll("#tfr")
    .transition()
      .duration(0)
      .style("opacity", 0);

      plotG.selectAll("#tfr-arrow")
        .transition()
          .duration(0)
          .style("opacity", 0);

          plotG.selectAll("#tfr-annot")
            .transition()
            .duration(0)
            .style("opacity", 0);
}

function mcuOn(tDefault) {
  fullG.selectAll("#clicky")
    .transition()
    .duration(tDefault)
    .style("opacity", 1);

  plotG.selectAll("#mcu")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);

  sourceOn("2010 & 2014/2015 Rwanda Demographic and Health Surveys", tDefault)
}

function mcuOff() {
  fullG.selectAll("#clicky")
    .transition()
    .duration(0)
    .style("opacity", 0);

  plotG.selectAll("#mcu")
    .transition()
      .duration(0)
      .style("opacity", 0);

}

function RslopeOn(tDefault) {


  plotG.selectAll("#relig-dot")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);

      plotG.selectAll("#slope-arrow")
      .transition("tSlope")
        .duration(tDefault)
        .style("opacity", 1)

  plotG.selectAll(".slope")
  .transition("tSlope")
    .duration(tDefault*3)
    .delay(tDefault)
      .attr("x2", function(d) {return xRslope(2012);})
      .attr("y2", function(d) {return yRslope(d.pct2012);});




  plotG.selectAll("#relig2012")
  .transition("tSlope")
    .duration(tDefault*3)
    .delay(tDefault)
    .attr("cx", function(d) {return xRslope(2012);})
    .attr("cy", function(d) {return yRslope(d.pct2012);})
    .each("end", function() {

// numeric labels
      plotG.selectAll("#Rpct-annot2012")
          .text(function(d) {return d3.format(".0%")(d.pct2012)})
          .attr("x", function(d) {return xRslope(2012);})
          .attr("dy", -20)
          .attr("y", function(d) {return yRslope(d.pct2012);})
          .style("opacity", 0)
        .transition("tSlope")
          .duration(tDefault*3)
          .delay(tDefault)
          .style("opacity", 1);

// annotation of interesting behavior
      plotG.selectAll("#slope-annot")
      .transition("tSlope")
        .duration(tDefault*2)
        .delay(tDefault)
        .style("opacity", 1)
    });

    plotG.selectAll("#relig2012-mask")
    .transition("tSlope")
      .duration(tDefault*3)
      .delay(tDefault)
      .attr("cx", function(d) {return xRslope(2012);})
      .attr("cy", function(d) {return yRslope(d.pct2012);});

  plotG.selectAll("#religSlope-annot")
  .transition("tSlope")
  .duration(tDefault*3)
  .delay(tDefault)
      .attr("x", function(d) {return xRslope(2012)})
      .attr("dx", 20)
      .attr("y", function(d) {return yRslope(d.pct2012);});

  sourceOn("2002 & 2012 Rwanda Population & Housing Census", tDefault)

  plotG.selectAll("#Rpct-annot2012")
      .text(function(d) {return d3.format(".0%")(d.pct2012)})
      .attr("x", function(d) {return xRslope(2012);})
      .attr("dy", -20)
      .attr("y", function(d) {return yRslope(d.pct2012);})
      .style("opacity", 0)
    .transition("tSlope")
      .duration(tDefault*3)
      .delay(tDefault*4)
      .style("opacity", 1);
}

function RslopeOff() {
  plotG.selectAll("#relig-dot")
    .transition()
      .duration(0)
      .style("opacity", 0);


      plotG.selectAll(".slope")
      .transition("tSlope")
        .duration(0)
        .delay(0)
          .attr("x2", function(d) {return xRslope(2002);})
          .attr("y2", function(d) {return yRslope(d.pct2002);});


      plotG.selectAll("#relig2012")
      .transition("tSlope")
        .duration(0)
        .delay(0)
        .attr("cx", function(d) {return xRslope(2002);})
        .attr("cy", function(d) {return yRslope(d.pct2002);});

        plotG.selectAll("#relig2012-mask")
        .transition("tSlope")
          .duration(0)
          .delay(0)
          .attr("cx", function(d) {return xRslope(2002);})
          .attr("cy", function(d) {return yRslope(d.pct2002);});

      plotG.selectAll("#religSlope-annot")
      .transition("tSlope")
      .duration(0)
      .delay(0)
          .attr("x", function(d) {return xRslope(2002)})
          .attr("dx", 20)
          .attr("y", function(d) {return yRslope(d.pct2002);});

      // sourceOn("Rwanda Population & Housing Census 2002 & 2012", tDefault)

      // plotG.selectAll("#Rpct-annot2012")
      //     .text(function(d) {return d3.format(".0%")(d.pct2012)})
      //     .attr("x", function(d) {return xRslope(2012);})
      //     .attr("dy", -20)
      //     .attr("y", function(d) {return yRslope(d.pct2012);})
      //     .style("opacity", 0)
      //   .transition("tSlope")
      //     .duration(tDefault*3)
      //     .delay(tDefault*4)
      //     .style("opacity", 1);
}

function rBarOn(tDefault) {
  vis.selectAll("#relig-bar")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);

  sourceOn("2002 & 2012 Rwanda Population & Housing Census", tDefault)
}

function rBarOff() {
  vis.selectAll("#relig-bar")
    .transition()
      .duration(0)
      .style("opacity", 0);
}


function rAgeOn(tDefault) {
// turn on stuff
  vis.selectAll("#relig-age_Catholic")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);

  vis.selectAll("#relig-age_Protestant")
        .transition()
          .duration(tDefault)
          .style("opacity", 1);

// remove Catholic text
  vis.selectAll("#relig-age_Catholic").select("svg").select("g").select(".top-label")
                    .transition("overlay-bars")
                      .delay(tDefault*2)
                      .duration(tDefault*3)
                      .text("");

// overlay bars
  vis.selectAll("#relig-age_Catholic")
    .transition("overlay-bars")
      .delay(tDefault*2)
      .duration(tDefault*3)
      .style("left", "0px")
      .each("end", function(){


// change title
  vis.selectAll("#relig-age_Protestant").select("svg").select("g").select(".top-label")
        .transition("overlay-bars")
          .delay(0)
          .duration(tDefault)
          .text("percent of population")
          .style("fill", "#555");
})

  sourceOn("2002 & 2012 Rwanda Population & Housing Census", tDefault)
}

function rAgeOff() {
  vis.selectAll("#relig-age_Catholic")
    .transition()
      .duration(0)
      .style("left", (width/2) + "px")
      .style("opacity", 0);

  vis.selectAll("#relig-age_Protestant")
        .transition()
          .duration(0)
          .style("opacity", 0);

  vis.selectAll("#relig-age_Protestant").select("svg").select("g").select(".top-label")
  .transition()
    .delay(0)
    .duration(0)
      .style("fill", function(d) {return zRelig(d.key);})
      .text(function(d) {return "percent of " + d.key + " population";});

  vis.selectAll("#relig-age_Catholic").select("svg").select("g").select(".top-label")
      .transition()
        .delay(0)
        .duration(0)
        .style("fill", function(d) {return zRelig(d.key);})
        .text(function(d) {return "percent of " + d.key + " population";});
}

function summaryOn(tDefault) {
  vis.selectAll("#fp-summary")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);

  sourceOff()
}

function summaryOff() {
  vis.selectAll("#fp-summary")
    .transition()
      .duration(0)
      .style("opacity", 0);
}

function religOn(tDefault) {
  plotG.selectAll("#mcuRelig")
    .transition()
      .duration(tDefault)
      .style("opacity", 1);

  sourceOn("2002 & 2012 Rwanda Population & Housing Census", tDefault)

  // lollipop connectors
mcuRelig.selectAll("#mcu-lolli")
.transition("changeNatl")
  .duration(tDefault * 1)
  .delay(tDefault)
      .attr("x1", function(d) {return xMCUrelig(d.natl);})
      .attr("x2", function(d) {return xMCUrelig(d.ave);});

// dot avg.
mcuRelig.selectAll("#mcu-relig")
.transition("changeNatl")
  .duration(tDefault* 1)
  .delay(tDefault)
    .attr("cx", function(d) {return xMCUrelig(d.ave);})
    .style("fill", function(d) {return zMCU(d.ave);}); // Keep constant so consistent w/ later results.

    mcuRelig.selectAll(".val-labels")
    .transition("changeNatl")
      .duration(tDefault)
      .delay(tDefault * 2)
          .style("opacity", 1);
}

function religOff() {
  plotG.selectAll("#mcuRelig")
    .transition()
      .duration(0)
      .style("opacity", 0);

      // lollipop connectors
    mcuRelig.selectAll("#mcu-lolli")
    .transition("changeNatl")
      .duration(0)
      .delay(0)
          .attr("x1", function(d) {return xMCUrelig(d.natl);})
          .attr("x2", function(d) {return xMCUrelig(d.natl);});

    // dot avg.
    mcuRelig.selectAll("#mcu-relig")
    .transition()
      .duration(0)
      .delay(0)
        .attr("cx", function(d) {return xMCUrelig(d.natl);})
        .style("fill", function(d) {return zMCU(d.natl);}); // Keep constant so consistent w/ later results.

        mcuRelig.selectAll(".val-labels")
        .transition()
          .duration(0)
          .delay(0)
              .style("opacity", 0);
}

function religMapOn(tDefault) {
  fullG.selectAll("#relig-map")
    .transition("mapOn")
      .duration(tDefault)
      .style("opacity", 1);

  fullG.selectAll(".prot-annot")
        .transition("mapOn")
        .duration(tDefault)
        .delay(function(d, i) {return i * 300 + 500})
        .style("opacity", 1)
        .each("end", function(){
  fullG.selectAll(".cath-annot")
              .transition("mapOn")
              .duration(tDefault)
              .delay(function(d, i) {return i * 300})
              .style("opacity", 1);
            })

  sourceOn("Rwanda Population & Housing Census 2002 & 2012", tDefault)
}



function religMapOff(tDefault) {
  fullG.selectAll("#relig-map")
    .transition()
      .duration(0)
      .style("opacity", 0);

  fullG.selectAll(".prot-annot")
        .transition()
        .duration(0)
        .style("opacity", 0)

  fullG.selectAll(".cath-annot")
              .transition()
              .duration(0)
              .style("opacity", 0);

}


function mcuMapOn(tDefault) {
  fullG.selectAll("#mcu-map")
    .transition("mapOn")
      .duration(tDefault)
      .style("opacity", 1);

      // fullG.selectAll("#mcu-map")
      // .select("img")
      // .transition()
      // .delay(1000)
      // .duration(tDefault);

  // fullG.selectAll(".prot-annot")
  //       .transition("mapOn")
  //       .duration(tDefault)
  //       .delay(function(d, i) {return i * 300 + 500})
  //       .style("opacity", 1)
  //       .each("end", function(){
  // fullG.selectAll(".cath-annot")
  //             .transition("mapOn")
  //             .duration(tDefault)
  //             .delay(function(d, i) {return i * 300})
  //             .style("opacity", 1);
  //           })

  sourceOn("2010 & 2014/2015 Rwanda Demographic and Health Surveys", tDefault)
}



function mcuMapOff(tDefault) {
  fullG.selectAll("#mcu-map")
    .transition()
      .duration(0)
      .style("opacity", 0);

  // fullG.selectAll(".prot-annot")
  //       .transition()
  //       .duration(0)
  //       .style("opacity", 0)
  //
  // fullG.selectAll(".cath-annot")
  //             .transition()
  //             .duration(0)
  //             .style("opacity", 0);

}


function mcuRegrOn(tDefault) {
  fullG.selectAll("#mcu-regr")
    .transition("mapOn")
      .duration(tDefault)
      .style("opacity", 1);

  // fullG.selectAll(".prot-annot")
  //       .transition("mapOn")
  //       .duration(tDefault)
  //       .delay(function(d, i) {return i * 300 + 500})
  //       .style("opacity", 1)
  //       .each("end", function(){
  // fullG.selectAll(".cath-annot")
  //             .transition("mapOn")
  //             .duration(tDefault)
  //             .delay(function(d, i) {return i * 300})
  //             .style("opacity", 1);
  //           })

  sourceOn("2010 & 2014/2015 Rwanda Demographic and Health Surveys", tDefault)
}



function mcuRegrOff(tDefault) {
  fullG.selectAll("#mcu-regr")
    .transition()
      .duration(0)
      .style("opacity", 0);

  // fullG.selectAll(".prot-annot")
  //       .transition()
  //       .duration(0)
  //       .style("opacity", 0)
  //
  // fullG.selectAll(".cath-annot")
  //             .transition()
  //             .duration(0)
  //             .style("opacity", 0);

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
        d3.csv("/data/religPct.csv", function(error, religPct){
        ddata = {};
        ddata['tfr'] = tfr;
        ddata['mcu'] = mcu;
        ddata['relig'] = relig;
        ddata['religAge'] = religAge;
        ddata['religPct'] = religPct;

        console.log(ddata)
        // call function to plot the data
        display(ddata);
      });
          });
    });
  });
});


// Delay function for asynchronous loading of data
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
