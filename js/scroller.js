
/**
 * scroller - handles the details
 * of figuring out which section
 * the user is currently scrolled
 * to.
 *
 */
function scroller() {
    var windowHeight;
    var container = d3.select('body');
    // event dispatcher
    var dispatch = d3.dispatch("active", "progress");

    // d3 selection of all the
    // text sections that will
    // be scrolled through
    var sections = null;

    // array that will hold the
    // y coordinate of each section
    // that is scrolled through
    var sectionPositions = [];
    var currentIndex = -1;

    // Range when you need to update the section
    var displayRange = 250;

    // y coordinate of containier: $('#graphic')
    var containerStart = 0;

  /**
   * scroll - constructor function.
   * Sets up scroller to monitor
   * scrolling of els selection.
   *
   * @param els - d3 selection of
   *  elements that will be scrolled
   *  through by user.
   */
    function scroll(els) {
        // $('.step') ==> These are the els
        sections = els;

        // when window is scrolled call
        // position. When it is resized
        // call resize.
        d3.select(window)
        .on("scroll.scroller", position)
        .on("resize.scroller", resize);

        // manually call resize
        // initially to setup
        // scroller.
        resize();

        // hack to get position
        // to be called once for
        // the scroll position on
        // load.
        d3.timer(function() {
            position();
            return true;
        });
    }

  /**
   * resize - called initially and
   * also when page is resized.
   * Resets the sectionPositions
   *
   */
    function resize() {
        // sectionPositions will be each sections
        // starting position relative to the top
        // of the first section.
        sectionPositions = [];
        var startPos;

        sections.each(function(d,i) {
            var top = this.getBoundingClientRect().top;

            if(i === 0) {
                startPos = top;
            }
            sectionPositions.push(top - startPos);
        });

        containerStart = container.node()
        .getBoundingClientRect().top + window.pageYOffset;
    }

  /**
   * position - get current users position.
   * if user has scrolled to new section,
   * dispatch active event with new section
   * index.
   *
   */
    function position() {
        // position of the container: $('#graphic')
        var pos = window.pageYOffset - 10 - containerStart;

        // BK => This is a nice way to find the figure out which section
        // is next but it trigger each time the current section has a piece out.
        var sectionIndex = d3.bisect(sectionPositions, pos);

        //BK => What is this doing?
        //sectionIndex = Math.min(sections.size() - 1, sectionIndex);

        $.each(sectionPositions, function(i, sPos) {
            // get the real position of the sections
            var nPos = sPos - pos;
            // check if the section is within the right range
            if ( nPos < displayRange ) {
                sectionIndex = i;
                return;
            }
        });

        // this will trigger the change of section
        if (currentIndex !== sectionIndex) {
            dispatch.active(sectionIndex);
            currentIndex = sectionIndex;
        }

        var prevIndex = Math.max(sectionIndex - 1, 0);
        var prevTop = sectionPositions[prevIndex];
        var progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);

        dispatch.progress(currentIndex, progress);
    }

  /**
   * container - get/set the parent element
   * of the sections. Useful for if the
   * scrolling doesn't start at the very top
   * of the page.
   *
   * @param value - the new container value
   */
    scroll.container = function(value) {
        if (arguments.length === 0) {
            return container;
        }

        // $('#graphic') => This is the container
        container = value;

        return scroll;
    };

    // allows us to bind to scroller events
    // which will interally be handled by
    // the dispatcher.
    d3.rebind(scroll, dispatch, "on");

    return scroll;
}
