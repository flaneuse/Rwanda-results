// <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#collapsable-nav" aria-expanded="false">
//   <span class="sr-only">Toggle navigation</span>
//   <span class="icon-bar"></span>
//   <span class="icon-bar"></span>
//   <span class="icon-bar"></span>
// </button>
//
// <div id="collapsable-nav" class="collapse navbar-collapse">
//   <ul id="nav-list" class="nav navbar-nav navbar-right">
//
//     {% assign allpages = site.pages | sort:'order'%}
//     {% for page in allpages %}
//     {% if page.title %}
//     <li>
//       <a class="page-link" href="{{ page.url | prepend: site.baseurl }}">{{ page.title }}</a>
//     </li>
//     {% endif %}
//     {% endfor %}
//   </ul>
// </div>
