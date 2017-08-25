(function($, d3, AllTrials) {
  $(function() {
    if (typeof AllTrials.trust !== 'undefined') {
      var data = [
        {category: 1, score: AllTrials.trust.responded_on_time * 20},
        {category: 2, score: AllTrials.trust.sent_a_register * 20},
        {category: 3, score: AllTrials.trust.complete_data_structure * 20},
        {category: 4, score: AllTrials.trust.publically_accessible * 20},
        {category: 5, score: AllTrials.trust.reusable_format * 20},
      ];
      var chart = AllTrials.donutChart().maximumPossible(100);
      d3.select('body').select('div.chart-test').datum(data).call(chart);
    }
  });
})(window.jQuery, window.d3, window.AllTrials);
