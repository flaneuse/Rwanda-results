
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 * responsiveness code based on http://blog.apps.npr.org/2014/05/19/responsive-charts.html
 */
var scrollVis = function() {
// Define std. transition length
stdTransition = 600;

// RESPONSIVENESS ---------------------------------------------------------------
// Define graphic aspect ratio.
// Based on iPad w/ 2/3 of max width taken up by vis., 2/3 of max height taken up by vis.: 1024 x 768 --> perserve aspect ratio of iPad

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
var margin = { top: 0, right: 75, bottom: 30, left: 15 };
var width = maxW - margin.left - margin.right;
var widthFull = graphicSize.width - padding_right;
var height = maxH;
// var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

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


  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  var imgG = null;

  // breadcrumbs
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

  var margins = {
    map:      { top: 0, right: 15, bottom: 0, left: 0 }
  };

  var dims = {
    fullMap:      { w: widthFull - margins.map.right - margins.map.left,
                h: height - margins.map.top - margins.map.bottom},
    map:      { w: width - margins.map.right - margins.map.left,
                h: height - margins.map.top - margins.map.bottom}
              };

  // IMAGES
  var imageArray = [
    {url:"/img/intro/rw-countryside.jpg", title:"Rwandan countryside"},
    {url:"/img/intro/afr1.png", title:"First image"},
    {url:"/img/intro/afr2.png", title:"Second image"},
    {url:"/img/intro/afr3.png", title:"Third image"},
    {url:"/img/intro/afr4.png", title:"Third image"},
    {url:"/img/intro/afr5.png", title:"Third image"}];

  var imageCounter = 0;

  // Image annotations
  var annotArray = [
    {frame:0, x:100, y:100, text:"Areas in light pink have few people living in the area"},
    {frame:0, x:100, y:200, text:"... while areas in dark pink and purple have high population density"}];

  var annotCounter = 0;

    console.log(annotArray)

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

       // create group for images
       svg.append("g")
             .attr("id", "imgs");

       // this group element will be used to contain all
       // other elements.
       g = svg.select("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

         // this group element will be used to contain all
         // big image elements (mostly maps; could also be used for static visualizations).
         imgG = svg.select("#imgs")

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

     // Full frame, to be used for images / maps or summary text.
        fullG = d3.select("#graphic")
          .append("div")
            .attr("id", "intro-max")
            .style("max-width", dims.fullMap.w + "px");

      // Attach initial Africa map (afr1)
          fullG.append("div")
            .attr("id", "afr1")
            .data(["interpolateTransform", "interpolateString"])
            .attr("class", "intro-full")
            .html("<div id='g-Africa_base_final-afr-map-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-14 - 15:15 -->	<!-- ai file: Africa_base_final -->	<style type='text/css' media='screen,print'>		.g-artboard {			margin:0 auto;		}	</style>	<!-- Artboard: afr-map -->	<div id='g-Africa_base_final-afr-map' class='g-artboard g-artboard-v3 ' data-min-width='538'>		<style type='text/css' media='screen,print'>			#g-Africa_base_final-afr-map{				position:relative;				overflow:hidden;			}			.g-aiAbs{				position:absolute;			}			.g-aiImg{				display:block;				width:100% !important;			}			#g-Africa_base_final-afr-map p{				font-family:nyt-franklin,arial,helvetica,sans-serif;				font-size:13px;				line-height:18px;				margin:0;			}			#g-Africa_base_final-afr-map .g-aiPstyle0 {				font-family:Lato,sans-serif;				font-size:60px;				line-height:72px;				font-weight:300;				text-align:right;				color:#00ff00;			}			#g-Africa_base_final-afr-map .g-aiPstyle1 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:17px;				font-weight:300;				color:#636466;			}			#g-Africa_base_final-afr-map .g-aiPstyle2 {				font-family:Lato,sans-serif;				font-size:7px;				line-height:8px;				font-weight:300;				text-align:right;				color:#00ff00;			}			#g-Africa_base_final-afr-map .g-aiPstyle3 {				font-family:Lato,sans-serif;				font-size:14px;				line-height:17px;				font-weight:300;				text-align:right;				color:#636466;			}			.g-aiPtransformed p { white-space: nowrap; }		</style>		<div id='g-Africa_base_final-afr-map-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/intro/afr1.png'				/>			<div id='g-ai0-1' class='g-pop-explain g-aiAbs' style='top:16.9629%;right:63.7546%;width:8.9219%;'>				<p class='g-aiPstyle0'>O</p>			</div>			<div id='g-ai0-2' class='g-pop-explain g-aiAbs' style='top:18.023%;left:40.3965%;width:19.8265%;'>				<p class='g-aiPstyle1'>Areas in light pink have few people living in the area</p>			</div>			<div id='g-ai0-3' class='g-pop-explain g-aiAbs' style='top:21.557%;right:68.0026%;width:0.426%;'>				<p class='g-aiPstyle2'>.</p>			</div>			<div id='g-ai0-4' class='g-pop-explain g-aiAbs' style='top:36.7529%;right:18.7537%;width:8.9219%;'>				<p class='g-aiPstyle0'>O</p>			</div>			<div id='g-ai0-5' class='g-pop-explain g-aiAbs' style='top:41.347%;right:23.0017%;width:0.426%;'>				<p class='g-aiPstyle2'>.</p>			</div>			<div id='g-ai0-6' class='g-pop-explain g-aiAbs' style='top:45.5877%;right:2.4783%;width:16.109%;'>				<p class='g-aiPstyle3'>... while areas in dark pink and purple have high population density</p>			</div>			<div id='g-ai0-7' class='g-scrolly-text g-aiAbs' style='top:66.968%;left:3.3196%;width:31.9572%;'>				<p class='g-aiPstyle1'>To orient ourselves to the Rwandan context, let's look at how the population in Rwanda compares to the rest of Africa</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-14 - 15:15 --></div>")
            .style("opacity", 1);

// fullG.select("#afr1").selectAll("img").each(cycle)


            //
            // function cycle(d) {
            //   d3.select(this).transition()
            //       .duration(4000)
            //       .style("transform",
            //         d3.interpolate(
            //           "rotate(180)translate(0,-100)"
            //         ))
            //       // })
            //       .each("end", cycle);
            // }

// fullG.select("#afr1").selectAll("img").each(cycle)
fullG.select("#afr1").selectAll("img").transition().delay(1000).duration(2000).styleTween("transform",
function() {return d3.interpolate("translate(0%, 0%) scale(1)", "translate(-113.5%, -17.5%) scale(5.349)")});
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
         // end of BREADCRUMBS ------------------------------------------------------------

       setupVis();

       setupSections();

     });
   };



  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function() {

// MAP: map
  afrMap = imgG.selectAll("image")
    .data(imageArray)
  .enter().append("image")
    .attr("class", "afr-map")
    .attr("xlink:href", function(d) {return d.url})
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("opacity", 0);

    // afrMap.attr("opacity", 0) //start invisible
    //   .transition().duration(1000) //schedule a transition to last 1000ms
    //   .delay(function(d,i){return i*2000;})
    //     //Delay the transition of each element according to its index
    //     // in your selection so that it won't start to appear
    //     // until one second after the last image reached full opacity.
    //     //The second parameter passed to any function you give to d3
    //     // is usually the index of that element within the current selection.
    //   .attr("opacity", 1);

// TEXT: annotations
imgG.selectAll("text")
  .data(annotArray)
.enter().append("text")
  .attr("class", "afr-annot")
  .attr("x", function(d) {return d.x;})
  .attr("y", function(d) {return d.y;})
  .text(function(d) {return d.text;})
  .attr("opacity", 0);

// circles: annotations


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

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */

   function show1() {
     imageCounter = 0;

     changeImage();

    changeAnnot(1, 0);

   }

  function show2() {
    imageCounter = 1;

     changeImage();

     changeAnnot(0, 1);
  }

  function show3() {

  }


  function show4() {
    imageCounter = 2;

     changeImage();

// change annotations
     changeAnnot(1, 0);

// revert zoom
// NOTE: FIX!!
// afrMap
// .transition()
// .duration(stdTransition)
// .attr("transform", "translate(-100,-100)" + " scale(1)");
  }

  function show5() {
    afrMap
    .transition()
    .duration(stdTransition*2)
    // .attr("transform", "translate("+ 0.6176 * width + "," + 0.4558 * height ")" + " scale(3.5)");

    // NOTE: Cross-fade to the real image

  }

  function show6() {
// NOTE: outline Rwanda


// Reversal
imageCounter = 2;

 changeImage();
  }

  function show7() {
    // reset scale
         afrMap
         .transition()
         .duration(0)
         .attr("transform", "translate(-1000, -700)" + " scale(1)");
 imageCounter = 3;

     changeImage();


  }

  function show8() {
    imageCounter = 4;

     changeImage();
  }

  function show9() {
    imageCounter = 5;

     changeImage();
  }

// HELPER FUNCTIONS ---------

function changeImage() {
  // turn on current layer
  imgG.selectAll(".afr-map")
      .filter(function(d,i) {return i == imageCounter})
  .transition()
   .duration(stdTransition)
   .attr("opacity", 1);

   // turn off other layers
   imgG.selectAll(".afr-map")
       .filter(function(d,i) {return i != imageCounter})
   .transition()
    .duration(stdTransition)
    .attr("opacity", 0);
}


function changeAnnot(idxOn, idxOff, tDelay) {

  imgG.selectAll(".afr-annot")
    .filter(function(d) {return(d.frame == idxOn);})
 .transition()
   .delay(1000)
  .duration(stdTransition)
  .attr("opacity", 1)

  imgG.selectAll(".afr-annot")
    .filter(function(d) {return(d.frame == idxOff);})
 .transition()
   .delay(0)
  .duration(stdTransition)
  .attr("opacity", 0)
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

  // HELPER FUNCTIONS ------------------------------------------------------------
  function updateBreadcrumbs(idx) {
    br.selectAll("circle")
       .style("fill-opacity", function(d,i) {return i==idx ? 0.6:0.1;});
  }

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


function readData() {
  d3.csv("", function(error, data){
      display(data);
  });
}

readData();

// Add event listener: on resize, redraw the figure
window.addEventListener("resize", readData)
