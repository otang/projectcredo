$(document).ready(function() {
  var resultsElement = $('#crossref-results');

  var hideResults = function() {
    resultsElement.toggleClass('hidden', true);
    resultsElement.children().remove();
  }

  var hideResultsAndClearSubmittable = function() {
    hideResults();
    $('.crossref').toggleClass('submittable', false);
    $('#crossref-locator-id').val('');
  }

  var showCrossrefResults = debounce(function() {
    if (this.value === '') {
      hideResultsAndClearSubmittable();
    } else {
      $.get('https://search.crossref.org/dois?sort=score&type=Journal+Article&rows=10&q=' + this.value).done(function(data) {
        var results;

        if (data.length > 0) {
          resultsElement.children().remove();

          results = data.map(function(result) {
            return '<li class="list-group-item" data-doi="' + result.doi.replace('http://dx.doi.org/', '') + '">' + result.fullCitation + "</li>"
          });
          resultsElement.append(results.join(''));
          resultsElement.toggleClass('hidden', false);
        } else {
          hideResultsAndClearSubmittable();
        };
      })
    }
  }, 200);

  $(document).on('click', '#crossref-results .list-group-item', function(e) {
    $('#crossref-search').val(this.innerText);
    $('#crossref-locator-id').val(this.dataset.doi);
    $('.crossref').toggleClass('submittable', true);
    hideResults();
  });

  $('#crossref-search').on('input', showCrossrefResults);
  $('#crossref-search').on('input', hideResultsAndClearSubmittable);
  $('#crossref-search').on('keydown', function (e) {
    if (e.keyCode === 27) {
      this.value = '';
      hideResultsAndClearSubmittable();
    };
  });

  $('#crossref-submit').on('click', function(e) {
    if ($(this).parent().hasClass('submittable')) {
      $(this).siblings('form#new_reference').submit();
    };
  });
});
