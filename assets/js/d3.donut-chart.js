// This function returns a "chart" object, which is a function to generate an
// SVG tag containing a donut chart, inside the D3 selection you give it.
// The format is taken from http://bost.ocks.org/mike/chart/
(function($, d3, AllTrials){
  // TODO - make this a proper JS module?
  AllTrials.donutChart = function donutChart(){
    // Defaults
    // What type of title to put in the centre of the chart
    // can be "total" or "xofy"
    var TITLE_STYLE_TOTAL = 'total';
    var TITLE_STYLE_XOFY = 'xofy';
    var titleStyle = TITLE_STYLE_TOTAL;
    // What's the maximum possible total? Used to calculate how much of the
    // donut should be coloured in, and what to print for "y" if you choose
    // x of y as the title style.
    var maximumPossible = 2000;

    // Chart generating function
    function my(selection) {
      selection.each(function(data) {
        // Get width/height of the container to give to the chart
        var $el = $(d3.select(this)[0]);
        var width = $el.width(),
            height = $el.height(),
            radius = Math.min(width, height) / 2;

        // The basic arc that forms our pie chart shape
        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(radius - 40);

        // A pie-chart layout object, to help us calculate the right start and end
        // angles for each section
        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.score; });

        // A helpful tweening function generator to expand our pie chart in an
        // animated way
        var tweenPie = function tweenPie(d) {
          var interpolatedD = d3.interpolate(d.startAngle+0.1, d.endAngle);
          return function(t) {
            d.endAngle = interpolatedD(t);
            return arc(d);
          };
        };

        // The basic value for single animation's basic time
        var segmentAnimationBase = 75;

        var segmentAnimationDelay = function segmentAnimationDelay(d, i) {
          // Make the animation delay dependent on the size of the segments before it
          // so that each segment appears to expand in turn
          if (i === 0) {
            return 0;
          }
          var totalBefore = d3.sum(data.slice(0, i), function(d) { return d.score; });
          var durationBefore = (i * segmentAnimationBase) * (totalBefore / (i*500));
          return durationBefore;
        };

        var segmentAnimationDuration = function segmentAnimationDuration(d) {
          // Make the animation dependent on the size of the segment, so that all
          // segments expand at the same rate
          return segmentAnimationBase * (d.data.score / 500);
        };

        // Calculate the amount missing from the perfect score
        var total = d3.sum(data, function(d) { return d.score; });
        var shortOfMaximum = maximumPossible - total;

        // Add that in as a final value
        data.push({category: 'empty', score: shortOfMaximum});

        // Create the base group for all our drawing.
        // It seems to be D3 convention to call this "svg" even though it's
        // actually a <g> element at the end
        var svg = d3.select(this).append('svg')
            .attr('width', width)
            .attr('height', height)
          .append('g')
            // This translates the coordinate system so that 0,0 is the middle
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


        // Draw the data onto the SVG. This adds a new group of elements with
        // the class 'arc' for each row in our data object
        var g = svg.selectAll('.arc')
            .data(pie(data))
          .enter().append('g')
            .attr('class', 'arc');

        // g is now a selection of group elements, to which we append paths that
        // actually form the segments of our donut.
        // We add them with a transition that's delayed a bit longer for each
        // one and takes a specific amount of time to finish depending on how
        // big the segment is, and use a special 'tween' function so that the
        // transition appears to make them 'grow' round the donut.
        g.append('path')
            .attr('class', function(d) { return 'category_' + d.data.category; })
            .transition().delay(segmentAnimationDelay).duration(segmentAnimationDuration).ease('linear')
            .attrTween('d', tweenPie);

        // Add the title
        svg.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-1.1em')
          .attr('class', 'donut__label donut__label--' + TITLE_STYLE_TOTAL)
          .text('TOTAL');
        svg.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.6em')
          .attr('class', 'donut__value donut__value--' + TITLE_STYLE_TOTAL)
          .text(total + "%");
      });
    }

    // Parameter getter and setters
    my.titleStyle = function(value) {
      if (!arguments.length) return titleStyle;
      titleStyle = value;
      return my;
    };
    my.maximumPossible = function(value) {
      if (!arguments.length) return maximumPossible;
      maximumPossible = value;
      return my;
    };

    // Expose these contants for others to use
    my.TITLE_STYLE_TOTAL = TITLE_STYLE_TOTAL;
    my.TITLE_STYLE_XOFY = TITLE_STYLE_XOFY;

    return my;
  };
})(window.jQuery, window.d3, window.AllTrials);
