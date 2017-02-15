
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 * responsiveness code based on http://blog.apps.npr.org/2014/05/19/responsive-charts.html
 */
var scrollVis = function() {
// Define std. transition length
  var tDefault = 600; // standard transition timing in ms

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
    fullMap:      { w: 538*2,
                h: 566*2},
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

    // console.log(annotArray)

    // AXES -----------------------------------------------------------------------------------
    // to translate annotations on maps.
    // In scale of the original AI file (in pixels) for ease of use.
    var x = d3.scale.linear()
         .range([0, dims.fullMap.w ])
         .domain([0, 538.41]);

    var y = d3.scale.linear()
        .range([0, dims.fullMap.h])
        .domain([0, 565.94]);



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

        mapSVG = fullG.append("svg")
              .attr("id", "map-svg")
              .attr("class", "intro-full")
              .attr("width", dims.fullMap.w)
              .attr("height", dims.fullMap.h)
              .attr("transform", "translate(" + margins.map.left + "," + margins.map.top + ")")
              .style("z-index", 200)
              .style("opacity", 1);

      // Attach initial Africa map (afr1)
          fullG.append("div")
            .attr("id", "afr1")
            .attr("class", "intro-full")
            .style("max-width", "inherit")
            .html("<div id='g-Africa_base_final-afr-map-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-14 - 15:15 -->	<!-- ai file: Africa_base_final -->	<!-- Artboard: afr-map -->	<div id='g-Africa_base_final-afr-map' class='g-artboard g-artboard-v3 ' data-min-width='538'>		<div id='g-Africa_base_final-afr-map-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/intro/afr1.png'				/>			<div id='g-ai0-2' class='g-pop-explain g-aiAbs' style='top:18.023%;left:40.3965%;width:19.8265%;'>				<p class='g-aiPstyle1'>Areas in light pink have few people living in the area</p>			</div>			</div>			<div id='g-ai0-6' class='g-pop-explain g-aiAbs' style='top:45.5877%;right:2.4783%;width:16.109%;'>				<p class='g-aiPstyle3'>... while areas in dark pink and purple have high population density</p>			</div>			<div id='g-ai0-7' class='g-scrolly-text g-aiAbs' style='top:66.968%;left:3.3196%;width:31.9572%;'>				<p class='g-aiPstyle1'>To orient ourselves to the Rwandan context, let's look at how the population in Rwanda compares to the rest of Africa</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-14 - 15:15 --></div>")
            .style("opacity", 0); //not it

          fullG.select("#afr1").selectAll(".g-pop-explain")
            .style("opacity", 0) //not it


            fullG.append("div")
              .attr("id", "afr2")
              .attr("class", "intro-full")
              .style("max-width", "inherit")
              .html("<div id='g-Africa_base_final-afr-map-box' class='ai2html'>	<!-- Generated by ai2html v0.61 - 2017-02-14 - 15:19 -->	<!-- ai file: Africa_base_final -->	<!-- Artboard: afr-map -->	<div id='g-Africa_base_final-afr-map' class='g-artboard g-artboard-v3 ' data-min-width='538'>		<div id='g-Africa_base_final-afr-map-graphic'>			<img id='g-ai0-0'				class='g-aiImg'				src='/img/intro/afr2.png'				/>			<div id='g-ai0-1' class='g-scrolly-text g-aiAbs' style='top:66.968%;left:3.3196%;width:31.9572%;'>				<p class='g-aiPstyle0'>We'll make this easier to see by adding in the surrounding ocean and inland lakes</p>			</div>		</div>	</div>	<!-- End ai2html - 2017-02-14 - 15:19 --></div>")
              .style("opacity", 0); //not it


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




// end AXES -------------------------------------------------------------------------------

       setupVis(words);

       setupSections();

     });
   };



  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function(afr) {


      var line = d3.svg.line()
        .x(function(d) {return x(d.x);})
        .y(function(d) {return y(d.y);})


var path = mapSVG.append("path")
    .attr("class", "spirograph")
    // .style("fill", "none")
    .attr("d", line(afr));
// code via http://www.visualcinnamon.com/2016/01/animating-dashed-line-d3.html
    //Get the total length of the path
    var totalLength = path.node().getTotalLength();

    //Animate the path by offsetting the path so all you see is the white last bit of the dash pattern
    //(which has a length that is the same as the length of the entire path), and then slowly move the offset
    //to zero (i.e. out of the way) so the rest of the path becomes visible
    //(the visible stuff at the start of the dash pattern)
    path
      	.attr("stroke-dasharray", totalLength + " " + totalLength)
    	.attr("stroke-dashoffset", totalLength)
      	.transition().duration(3000).ease("linear")
    	.attr("stroke-dashoffset", 0);
    // mapSVG.selectAll("text").data(afr)
    //   .enter().append("circle")
    //     .attr("class", "dot")
    //     .attr("cx", function(d) {return x(d.x)})
    //     .attr("cy", function(d) {return y(d.y)})
    //     // .attr("cy", function(d) {return y(d.y)})
    //     // .style("z-index",1000)
    //     .attr("r", 2)
    //     .attr("id", "AFRICA") //572px
    //     // .attr("points", "220,36.2 224.7,38.7 225.3,45.1 228.2,46.6 228.9,49.4 225.1,54.2 221.1,56.8 222.2,59.1 229.2,63.4	234.1,64.4 236.8,65.9 243.6,65.4 256.6,69 260,75.3 262.4,76.7 272.1,78.1 277.7,80.2 283.1,83.7 287.6,82.7 290.5,80 291.3,77.3	289.9,72.1 294.1,68 301.5,65.3 306.7,65.8 311.9,67.5 312.8,70.3 318.8,71.8 324.8,72 326.1,75 330.5,74.5 341.1,76.2 345.1,78	348.6,78.2 352.8,79.9 355.9,79.1 361.9,75.6 370.5,75.6 373.9,78.1 378.7,78.4 381,77.4 385.4,77.8 388.8,76.7 393.2,88 390,97.3	388.1,100.9 381.9,95.6 381.4,92.6 378.5,89.4 377.6,92.7 381.1,97.5 384.1,100.3 383.7,101.9 386,104.6 386.7,108.6 391,115.2	394.7,122.2 397.4,126.1 397.5,130.6 399.9,135.7 402.9,136.9 407,140.5 408.6,145.9 409.2,154.7 410.3,160.7 416.2,167	418.9,168.2 421.4,173.2 423.4,181.6 425,185.8 427.9,186 429.9,189.6 431.8,189.4 434.3,191.5 436.8,192 440.3,196.8 444.5,199.3	445.1,201.8 450,204.5 452.3,208.6 452,210.2 447.9,212.1 452.6,214.7 455.1,218.4 458.3,220.9 463.2,221 468.5,218 474.7,218.9	479.9,215.9 484.9,216.2 488.6,214.8 491.1,215.4 498.5,213.6 503.2,210.3 506.7,211.3 505.4,215.9 505.8,219.6 504.1,221.9	503.7,227.9 500,234.3 496.5,238.7 495.1,242.6 492.5,246.5 491.3,250.7 484.1,261.9 475.5,271.4 469.5,277 460.1,282.5	452.8,288.7 446.5,295.4 442.3,300.3 437.8,306.8 434.9,307.2 434.3,309.8 429.9,312.5 429.4,316 424.6,325.3 423.5,325.2	420.2,335 421.2,337.8 425.5,342.2 423.7,345.7 424.9,347.3 423.9,350.7 424.2,353.6 426.2,356.9 427.5,362.4 432.3,365.8	432.9,368.1 431.4,371.6 432.2,379.3 433.1,381.7 432.4,387.6 432.8,391.8 434.5,395.2 432.7,400.5 429.6,403.5 426.6,407.7	422.6,410 413.8,413.5 409.5,416.1 402.8,424 398.7,425.6 393.3,430.7 392.3,435.5 394.9,438.4 394.6,440.8 397,446.7 398,452.5	396.5,457.2 397.5,460 395.1,463.3 385.2,467 379.4,470 377.5,473.4 378.9,475.1 379.3,480.3 375.9,490.8 371.8,493.5 368.7,496.6	362.2,506.8 359.7,509.7 355.4,512.6 352.1,516.2 345,522 339.4,525.3 335,527 329.6,527.2 327.9,528.9 323.7,530 315.5,528.5	313.6,529.3 307.9,528.7 302.2,531.4 297.6,531.1 287.8,534 279.7,527.4 275.4,520.5 278.3,519.4 278.9,516.8 277.7,512.5	271.4,503.3 268.3,494.7 266.3,491.9 260.5,486.8 257.7,482.4 254.6,471.6 254.2,465 252,460.1 251.6,452.7 252.3,449.4 248.4,444	244.6,437.7 238.1,424.3 235.1,421.2 233.3,417.6 233,414.3 233.7,407.5 233.1,403.2 235,401.3 236.8,395.4 238.5,386.2	244.3,380.6 247.3,375 247.7,369.5 247,367 244,362.3 241.9,356.2 244.7,353.3 244.6,351.4 238.6,339.2 236,332.6 236.5,331.2	233.2,324.6 228.3,320 225.3,316.1 220.3,311.7 216,306 215.4,303 212.7,298.9 216.3,295.6 216.3,288.9 218.5,287.8 216.7,285.1	219.8,279.9 219.5,277.2 220.8,271.9 217.9,266.9 214,264.9 213.5,262.4 209.3,261.8 205,262.1 201.5,261.5 199.3,263.1	194.2,263.7 189.9,260 188.9,256.4 184.4,250.5 182.4,249.2 176.4,248.6 164.4,249.9 160,251.1 158.7,252.9 154,253.3 146.4,257.2	140.7,258.5 138.3,260.2 130.8,258.2 121,256.6 119,257.6 111.6,258.4 104.3,260.9 100.5,263.1 98.5,263.1 88.6,258.3 80.1,250.6	73.3,246.9 70.1,243.8 65.3,242.1 61,236.5 59.7,230.5 57.8,225.7 53.4,223.3 50.4,220.8 50.1,218.8 44.6,214.8 44.9,211.1	41.4,212 38.7,208.9 35.7,207.3 35.5,200.7 37.3,199.4 34.6,193.8 31.6,190.8 33.3,189.9 37.4,184.2 37.9,178.3 40.9,170.5	40.7,165.3 39.2,160.9 39.8,153.3 36.7,150.3 35,147.1 34.5,142.1 37.7,138.7 42.7,127.8 48.8,122.4 49.5,117.2 51.7,112.2	58.1,108 60.7,101.7 62.6,99.8 68.4,98.9 72.2,97.4 75.4,94.2 78.3,92.9 81.7,89.6 85,85 83.8,81.3 84,75.6 87.7,70.5 87.7,68	92.8,63.1 100,60.4 104.8,57.5 107.9,52.7 110.9,45.6 114.8,44.7 115.6,47.1 121.7,50 130.6,49 134.2,50.4 139.6,50.2 144.7,46.3	151.1,45.6 153.3,43.4 160.1,40.6 169.2,40.1 171.9,38.6 185,37.9 189.4,39.6 196.7,36.6 199.8,38 201.9,36.6 205.6,37.4 213,37.3	218.7,34.9 220,36.2 ")
    //     .style("opacity", 1)

    mapSVG
      .append("circle")
        .attr("class", "dotted-line")
        .attr("id", "low-density-annot")
        .attr("cx", x(170))
        .attr("cy", y(120))
        .attr("r", x(25))
        .style("opacity", 0)

    mapSVG
          .append("circle")
            .attr("class", "dotted-line")
            .attr("id", "high-density-annot")
            .attr("cx", x(410))
            .attr("cy", y(239))
            .attr("r", x(25))
            .style("opacity", 0)

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
// PREVIOUS
    imageCounter = -1;

     changeImage();

// NEXT
     mapOff("#afr2")

  // CURRENT
     mapOn("#afr1");
     changeScrollyText("#afr1", "To orient ourselves to the Rwandan context, let's look at how the population in Rwanda compares to the rest of Africa.");


     mapSVG.selectAll("#low-density-annot")
     .transition("low-d")
     .duration(tDefault) //not it
     .style("opacity", 1)
     .each("end", function() {
       mapSVG.selectAll("#high-density-annot")
         .transition("high-d")
         .delay(tDefault/2)
         .duration(tDefault) //not it
         .style("opacity", 1)
       })

     fullG.select("#afr1").selectAll("#g-ai0-2")
     .transition("low-d")
     .duration(tDefault) //not it
     .style("opacity", 1)
     .each("end", function() {
       fullG.select("#afr1").selectAll("#g-ai0-6")
         .transition("high-d")
         .delay(tDefault/2)
         .duration(tDefault) //not it
         .style("opacity", 1)
     })

  }

function show3(){
  fullG.select("#afr1").selectAll(".g-pop-explain")
  .transition()
  .duration(tDefault)
  .style("opacity", 0) // not it

  changeScrollyText("#afr1", "Even without any other markers, you can begin to see the outline of the African coast.");
}

  function show4() {
    mapOff("#afr1");
    mapOn("#afr2");

    fullG.select("#afr2").selectAll("img")
      .transition()
      .delay(0)
      .duration(0)
      .styleTween("transform",
                  function() {return d3.interpolate("translate(-113.5%, -17.5%) scale(5.349)", "translate(0%, 0%) scale(1)")});
  }

function show5() {
  fullG.select("#afr2").selectAll("img")
    .transition()
    .delay(1000)
    .duration(2000)
    .styleTween("transform",
                function() {return d3.interpolate("translate(0%, 0%) scale(1)", "translate(-113.5%, -17.5%) scale(5.349)")});

}

function show6(){

}

function show7() {

}

function show8() {

}

function show9(){}
// HELPER FUNCTIONS ---------
function mapOn(id){
     fullG.selectAll(id)
      .transition()
      .duration(tDefault)
      .style("opacity", 1);
}

function mapOff(id){
     fullG.selectAll(id)
      .transition()
      .duration(0)
      .style("opacity", 0); //not it
}

function changeScrollyText(id, text) {
  fullG.select(id)
  .select(".g-scrolly-text")
  .text(text)
}

function changeImage() {
  // turn on current layer
  imgG.selectAll(".afr-map")
      .filter(function(d,i) {return i == imageCounter})
  .transition()
   .duration(tDefault)
   .attr("opacity", 1);

   // turn off other layers
   imgG.selectAll(".afr-map")
       .filter(function(d,i) {return i != imageCounter})
   .transition()
    .duration(tDefault)
    .attr("opacity", 0);
}


function changeAnnot(idxOn, idxOff, tDelay) {

  imgG.selectAll(".afr-annot")
    .filter(function(d) {return(d.frame == idxOn);})
 .transition()
   .delay(1000)
  .duration(tDefault)
  .attr("opacity", 1)

  imgG.selectAll(".afr-annot")
    .filter(function(d) {return(d.frame == idxOff);})
 .transition()
   .delay(0)
  .duration(tDefault)
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

  var $map = $("#intro-max");
  $map.empty();

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
  d3.csv("/data/afr_outline.csv", function(error, data){
      display(data);
  });
}

readData();

// Add event listener: on resize, redraw the figure
window.addEventListener("resize", readData)
