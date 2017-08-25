(function($, d3, AllTrials) {
  $(function() {

    var data = [
      {category: 1, score: AllTrials.company.registration},
      {category: 2, score: AllTrials.company.results},
      {category: 3, score: AllTrials.company.csrs},
      {category: 4, score: AllTrials.company.ipd}
    ];

    var data2 = [ {category: 1, score: AllTrials.company.registration} ];
    var data3 = [ {category: 2, score: AllTrials.company.results} ];
    var data4 = [ {category: 3, score: AllTrials.company.csrs} ];
    var data5 = [ {category: 4, score: AllTrials.company.ipd} ];

    // Overall donut chart
    var chart = AllTrials.donutChart();
    // Registration donut chart
    var chart2 = AllTrials.donutChart().titleStyle(chart.TITLE_STYLE_XOFY).maximumPossible(500);
    // Results donut chart
    var chart3 = AllTrials.donutChart().titleStyle(chart.TITLE_STYLE_XOFY).maximumPossible(500);
    // CSRs donut chart
    var chart4 = AllTrials.donutChart().titleStyle(chart.TITLE_STYLE_XOFY).maximumPossible(500);
    // IPD donut chart
    var chart5 = AllTrials.donutChart().titleStyle(chart.TITLE_STYLE_XOFY).maximumPossible(500);

    d3.select('body').select('div.chart-test').datum(data).call(chart);
    d3.select('body').select('div.chart-test-2').datum(data2).call(chart2);

    AllTrials.companyTabs.on('_after', function(){
      var selectedTab = $('.company-body__tabs__item:visible').find('.stacked-bar-chart').data('section');
      switch(selectedTab) {
      case 'registration':
        if($('.chart-test-2 svg').length === 0) {
          d3.select('body').select('div.chart-test-2').datum(data2).call(chart2);
        }
        break;
      case 'results':
        if($('.chart-test-3 svg').length === 0) {
          d3.select('body').select('div.chart-test-3').datum(data3).call(chart3);
        }
        break;
      case 'csrs':
        if($('.chart-test-4 svg').length === 0) {
          d3.select('body').select('div.chart-test-4').datum(data4).call(chart4);
        }
        break;
      case 'ipd':
        if($('.chart-test-5 svg').length === 0) {
          d3.select('body').select('div.chart-test-5').datum(data5).call(chart5);
        }
        break;
      }
    });
  });
})(window.jQuery, window.d3, window.AllTrials);