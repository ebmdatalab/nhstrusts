// This function returns a "chart" object, which is a function to generate an
// SVG tag containing a stacked bar chart, inside the D3 selection you give it.
// The format is taken from http://bost.ocks.org/mike/chart/
(function($, d3, AllTrials){
  // TODO - make this a proper JS module?
  AllTrials.stackedBarChart = function stackedBarChart(){
    // Defaults
    var barSections = ['registration', 'results', 'csrs', 'ipd'];

    var companyNames = AllTrials.companies.map(function(company) {
      return company['publisher_1'];
    });

    var selectedSection = 'registration';

    // Chart generating function
    function my(selection) {
      selection.each(function(data) {
        // Get width/height of the container to give to the chart
        var $el = $(d3.select(this)[0]);
        var margin = {top: 20, right: 50, bottom: 250, left: 0};
        var width = $el.width() - margin.left - margin.right,
            height = $el.height() - margin.top - margin.bottom;

        var x = d3.scale.ordinal().domain(companyNames).rangeRoundBands([0, width]);
        // 1400 is hardcoded because we know it's the top of the score range
        var y = d3.scale.linear().domain([0, 1400]).rangeRound([height, 0]);
        // This is a way to assign classes to each of the bar chart sections
        var z = d3.scale.ordinal().range(barSections);

        var xAxis = d3.svg.axis().scale(x).orient('bottom');
        var yAxis = d3.svg.axis().scale(y).orient('right');

        var svg = d3.select(this).append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
            .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Get our individual data points for each section of each bar in
        // the bar chart
        var points = barSections.map(function(section) {
          return data.map(function(company) {
            return {
              x: company['publisher_1'],
              y: parseFloat(company[section]),
              section: section
            };
          });
        });

        // Create some layers for the stack
        var layers = d3.layout.stack()(points);

        // Apply the data to layers in the SVG, setting a class from the z
        // scale so that we can colour it in css
        var layer = svg.selectAll('.layer')
            .data(layers)
          .enter().append('g')
            .attr('class', function(d, i) {
              var classString = 'layer layer--' + z(i);
              if(d[i].section === selectedSection) {
                classString += ' layer--selected';
              }
              return classString;
            });

        // Size the rectangles that make up each of our bars, based on their
        // values and make them wide enough to squeeze them all in.
        layer.selectAll('rect')
            .data(function(d) { return d; })
          .enter().append('rect')
            .attr('x', function(d) { return x(d.x); })
            .attr('y', function(d) { return y(d.y + d.y0); })
            .attr('height', function(d) { return y(d.y0) - y(d.y + d.y0); })
            .attr('width', x.rangeBand() - 1)
            .attr('class', function(d) {
              if(d.x === AllTrials.company['publisher_1']) {
                return 'selected-company';
              } else {
                return 'other-company';
              }
            });

        // Add the X axis label
        svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
          // Rotate all the text 90 degrees
          .selectAll('text')
            .attr('y', 0)
            .attr('x', 9)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'start');

        // Add the Y axis label
        svg.append('g')
            .attr('class', 'axis axis--y')
            .attr('transform', 'translate(' + width + ',0)')
            .call(yAxis);
      });
    }

    // Parameter getter and setters
    my.selectedSection = function(value) {
      if (!arguments.length) return selectedSection;
      selectedSection = value;
      return my;
    };

    return my;
  };
})(window.jQuery, window.d3, window.AllTrials);
