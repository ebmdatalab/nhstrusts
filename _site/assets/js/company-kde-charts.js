(function($, d3, AllTrials) {
  $(function(){
    // Scores from each company for the registration section
    var data = AllTrials.companies.map(function(company) {
      return company.registration;
    });
    var score = AllTrials.company.registration;

    // Make the chart generating function and set it up
    var chartk = AllTrials.kdeChart();
    chartk = chartk.score(score);

    // Draw a chart in the body of the supplied data
    d3.select('.kernel-chart').datum(data).call(chartk);
  });
})(window.jQuery, window.d3, window.AllTrials);
