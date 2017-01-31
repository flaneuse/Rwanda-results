// array of links
var links = [
  {name: "introduction", order: 0, link: "/index.html"},
  {name: "family planning", order: 1, link:"/fp.html"}
];

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
