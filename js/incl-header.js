// GOOGLE ANALYTICS ------------------------------------------------------------
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-XX', 'auto');
ga('send', 'pageview');

var trackOutboundLink = function(url) {
  ga("send", "event", "outbound", url, {
    "transport": "beacon",
    "hitCallback": function() {
      //document.location = url;
    }
  });
};
// end GOOGLE ANALYTICS ------------------------------------------------------------

// NAVBAR HEADER ---------------------------------------------------------------
// array of links
var links = [
  {name: "introduction", order: 0, link: "/index.html"},
  {name: "family planning", order: 2, link:"/fp.html"},
  {name: "malnutrition", order: 3, link:"/stunting.html"},
  {name: "diet", order: 4, link:"/diet.html"},
  {name: "about", order: 5, link:"/about.html"},
  {name: "summary", order: 1, link:"/summary.html"}
];

// Make sure the links are sorted by order
links.sort(function(a,b) {return a.order - b.order});

// spans to insert to get hamburger collapse on small screens
var collapse_spans = ["sr-only", "icon-bar", "icon-bar", "icon-bar"];

// select navbar
var nav = d3.select("#navbar-header")


// Hamburger collapse
nav.append("button")
  .attr("class", "navbar-toggle collapsed")
  .attr("data-toggle", "collapse")
  .attr("data-target", "#collapsable-nav")
  .attr("aria-expanded", false)

// Create the three bars
nav.select(".navbar-toggle.collapsed").selectAll("span")
    .data(collapse_spans)
  .enter().append("span")
    .attr("class", function(d) {return d});
nav.select(".sr-only").text("Toggle navigation")


// Create nav bar ul divs.
nav.append("div")
  .attr("id", "collapsable-nav")
  .attr("class", "collapse navbar-collapse")
.append("ul")
  .attr("id", "nav-list")
  .attr("class", "nav navbar-nav navbar-right");


// Append data and populate links
nav.selectAll(".nav.navbar-nav.navbar-right").selectAll("li")
  .data(links)
.enter().append("li")
  .append("a")
  .attr("class", "page-link")
  .attr("href", function(d) {return d.link;})
  .text(function(d) {return d.name;})
// END NAVBAR HEADER -----------------------------------------------------------

// FOOTER ----------------------------------------------------------------------
footer = d3.select(".site-footer")
  .append("div")
    .attr("class", "row");

  footer.append("div")
    .attr("class", "col-sm-5")
    .attr("id", "usaid-logo")
  .append("a")
    .attr("href", "https://www.usaid.gov/rwanda")
    .attr("target", "_blank")
  .append("img")
    .attr("class", "logo logo-L")
    .attr("alt", "USAID Rwanda")
    .attr("src", "/img/USAID-Rwanda-logo.png");

    footer.append("div")
      .attr("class", "col-sm-1")
      .attr("id", "copyright")
    .append("text")
      .html("&#169; 2017");

      footer.append("div")
          .attr("class", "col-sm-3")
        .append("a")
          .attr("href", "http://creativecommons.org/licenses/by-nc/4.0/")
          .attr("target", "_blank")
        .append("img")
          .attr("class", "logo logo-R")
          .attr("id", "cc")
          .attr("alt", "Creative Commons License")
          .attr("src", "https://i.creativecommons.org/l/by-nc/4.0/80x15.png");

  footer.append("div")
      .attr("class", "col-sm-3")
      .attr("id", "gc-logo")
    .append("a")
      .attr("href", "https://sites.google.com/a/usaid.gov/usaidgeocenter/home")
      .attr("target", "_blank")
    .append("img")
      .attr("class", "logo logo-R")
      .attr("alt", "USAID GeoCenter")
      .attr("src", "/img/geocenter.png");




// end FOOTER ------------------------------------------------------------------
                // <a href= "https://www.usaid.gov/rwanda" target="_blank">
                //   <img class="logo logo-L" alt = "USAID Rwanda" src="/img/USAID-Rwanda-logo.png"/>
                // </a>
                //
                // <span>&#169; 2017 </span>
                //
                // <a href="{{site.gc_website}}" target="_blank">
                //   <img class="logo logo-R" alt ="USAID GeoCenter" src="/img/geocenter.png"/>
                // </a>
                //
                // <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">
                //   <img alt="Creative Commons License" class="logo-R"
                //   src="https://i.creativecommons.org/l/by-nc/4.0/80x15.png"/> </a>
