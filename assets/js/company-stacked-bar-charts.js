(function($, d3, AllTrials) {
  $(function(){
    var data = AllTrials.companies;

    var chart = AllTrials.stackedBarChart().selectedSection('registration');
    var chart2 = AllTrials.stackedBarChart().selectedSection('results');
    var chart3 = AllTrials.stackedBarChart().selectedSection('csrs');
    var chart4 = AllTrials.stackedBarChart().selectedSection('ipd');

    d3.select('.stacked-bar-chart--registration').datum(data).call(chart);

    AllTrials.companyTabs.on('_after', function(){
      var selectedTab = $('.company-body__tabs__item:visible').find('.stacked-bar-chart').data('section');
      switch(selectedTab) {
      case 'registration':
        if($('.stacked-bar-chart--registration svg').length === 0) {
          d3.select('.stacked-bar-chart--registration').datum(data).call(chart);
        }
        break;
      case 'results':
        if($('.stacked-bar-chart--results svg').length === 0) {
          d3.select('.stacked-bar-chart--results').datum(data).call(chart2);
        }
        break;
      case 'csrs':
        if($('.stacked-bar-chart--csrs svg').length === 0) {
          d3.select('.stacked-bar-chart--csrs').datum(data).call(chart3);
        }
        break;
      case 'ipd':
        if($('.stacked-bar-chart--ipd svg').length === 0) {
          d3.select('.stacked-bar-chart--ipd').datum(data).call(chart4);
        }
        break;
      }
    });
  });
})(window.jQuery, window.d3, window.AllTrials);
