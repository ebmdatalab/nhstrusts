(function($, Awesomplete, AllTrials){
  function slugify(text)
  {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }
  $(function() {
    var trustNames = AllTrials.trusts.map(function(trust) {
      return trust['name'];
    });
    var $input = $('.search-block__text-input');
    new Awesomplete($input[0], {
      list: trustNames,
      minChars: 1
    });

    $input.on('awesomplete-selectcomplete', function() {
      var name = $input.val();
      window.location.href = '/trusts/' + slugify(name) + '.html';
    });
  });
})(window.jQuery, window.Awesomplete, window.AllTrials);
