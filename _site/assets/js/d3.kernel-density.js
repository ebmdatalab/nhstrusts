// This function returns a "chart" object, which is a function to generate an
// SVG tag containing a line chart that's estimated from a selection of data
// points using Kernel Density Estimation, inside the D3 selection you give it.
// The format is taken from http://bost.ocks.org/mike/chart/
(function($, d3, AllTrials) {
  // TODO - make this a proper JS module?
  AllTrials.kdeChart = function kdeChart() {
    // Defaults
    // All stolen from https://bl.ocks.org/mbostock/1134768 at the moment
    // until we understand them
    var causes = ['registration', 'results', 'csrs', 'ipd'];

    var parseDate = d3.time.format("%m/%Y").parse;

    var margin = {top: 20, right: 50, bottom: 30, left: 20},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width]);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var z = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%b"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Chart generating function
    function my(selection) {
      selection.each(function(data) {
        var scores = data;

        // Put the scores into buckets of 50, this makes the data turn into a
        // better looking graph for the KDE by increasing the frequency of
        // similar scores. Necessary because the sample size is small (48) but
        // the range of scores is high (0-500). I'm not sure if this is a bit
        // statistically dishonest? TODO: see what the real data looks like
        // without it.
        var scoreBucket = d3.scale.quantize()
            .domain([0, 500])
            .range(d3.range(0,500,20));
        var quantizedScores = scores.map(scoreBucket);
        scores = quantizedScores;

        // Compute the min, max and mean so that we can draw these as markers
        // on the chart.
        var minScore = d3.min(scores);
        var maxScore = d3.max(scores);
        var meanScore = d3.mean(scores);

        // These functions actually produce the array of KDE'd values we'll
        // chart
        function kernelDensityEstimator(kernel, x) {
          return function(sample) {
            return x.map(function(x) {
              return [x, d3.mean(sample, function(v) { return kernel(x - v); })];
            });
          };
        }

        function epanechnikovKernel(scale) {
          return function(u) {
            return Math.abs(u /= scale) <= 1 ? 0.75 * (1 - u * u) / scale : 0;
          };
        }

        // Get width/height of the container to give to the chart
        var $el = $(d3.select(this)[0]);
        var width = $el.width() - margin.left - margin.right,
            height = $el.height() - margin.top - margin.bottom;

        // TODO: parameterize this so that we can keep multiple graphs on the
        // same scale.
        // Compute the minimum value for the xAxis' scales' domain, we add a
        // bit of space if we're not at 0
        if (!xAxisMin) {
          xAxisMin = d3.max([0, d3.min(scores) - 20]);
        }
        // Likewise, compute the minimum value for the xAxis' scales' domain,
        // here we add a bit of space if we're not at 500
        if (!xAxisMax) {
          xAxisMax = d3.min([500, d3.max(scores) + 20]);
        }

        // Set up the axes and the scales that map values onto our graph
        var x = d3.scale.linear()
            .domain([xAxisMin, xAxisMax])
            .range([0, width]);
        var y = d3.scale.linear()
            .domain([0, 0.025])
            .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickPadding(10)
            .outerTickSize(0);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .outerTickSize(0);

        // Functions to draw a line on the chart, and the area underneath it
        var line = d3.svg.line()
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); });
        var area = d3.svg.area()
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
            .y0(height);

        // Create the base group for all our drawing.
        // It seems to be D3 convention to call this "svg" even though it's
        // actually a <g> element at the end
        var svg = d3.select(this).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Get a Kernel Density Estimated version of the data set
        var kde = kernelDensityEstimator(epanechnikovKernel(10), x.ticks(10));
        var kdeData = kde(scores);

        // Trim the KDE values to the real min and max (otherwise it gets
        // estimated higher and lower, which looks weird).
        var kdeDataCopy = kdeData.slice();
        for(var i = 0; i < kdeData.length; i++) {
          var d = kdeData[i];
          if (d[0] < minScore) {
            kdeDataCopy[i]= [minScore, d[1]];
          } else if (d[0] > maxScore) {
            kdeDataCopy[i]= [maxScore, d[1]];
          } else {
            kdeDataCopy[i]= d;
          }
        }
        kdeData = kdeDataCopy;

        // Draw the line and the area underneath it
        svg.append('path')
            .datum(kdeData)
            .attr('class', 'line')
            .attr('d', line);
        svg.append('path')
            .datum(kdeData)
            .attr('class', 'area')
            .attr('d', area);

        // Draw vertical lines for the min, max, mean:
        var scoreLines = svg.append('g')
            .attr('class', 'score-lines');
        var scoreLineData = [
          {label: 'min', value: minScore},
          {label: 'max', value: maxScore},
          {label: 'mean', value: meanScore},
        ];

        // Add a line for the score if one was given too
        if (score) {
          scoreLineData.push({label: 'score', value: score});
        }

        scoreLines.selectAll('line')
            .data(scoreLineData)
          .enter()
            .append('line')
            .attr('class', function(d) { return 'line ' + d.label; })
            .attr('x1', function(d){ return x(d.value); })
            .attr('y1', height)
            .attr('x2', function(d){ return x(d.value); })
            .attr('y2', height/2);
        svg.selectAll('.line-label')
            .data(scoreLineData)
          .enter()
            .append('text')
            .attr('class', function(d) { return 'line-label ' + d.label; })
            .attr('text-anchor', 'middle')
            .attr('transform', function(d) {
              return 'translate(' + x(d.value).toString() + ',' + (height/2 - 5).toString() + ')';
            })
            .text(function(d){ return d.label + ' (' + d3.round(d.value) + ')'; });

        // Draw the axes last so it's over the top of everything
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
          .append('text')
            .attr('class', 'label')
            .attr('x', width/2)
            .attr('y', 60)
            .style('text-anchor', 'middle')
            .text('Score (out of 500)');
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);
      });
    }

    // Getters and Setters
    my.margin = function (value) {
      if (!arguments.length) return margin;
      margin = value;
      return my;
    };

    my.xAxisMin = function (value) {
      if (!arguments.length) return xAxisMin;
      xAxisMin = value;
      return my;
    };

    my.xAxisMax = function (value) {
      if (!arguments.length) return xAxisMax;
      xAxisMax = value;
      return my;
    };

    my.score = function (value) {
      if (!arguments.length) return score;
      score = value;
      return my;
    };

    return my;
  };
})(window.jQuery, window.d3, window.AllTrials);
