(function($) {
  'use strict';

  /**
   * Search modal with Algolia
   * @constructor
   */
  var SearchModal = function() {
    this.$openButton = $('.open-algolia-search');
    this.$searchModal = $('#algolia-search-modal');
    this.$closeButton = this.$searchModal.find('.close-button');
    this.$searchForm = $('#algolia-search-form');
    this.$searchInput = $('#algolia-search-input');
    this.$results = this.$searchModal.find('.results');
    this.$noResults = this.$searchModal.find('.no-result');
    this.$resultsCount = this.$searchModal.find('.results-count');
    this.scriptsToLoad = 2;
    this.scriptsLoaded = false;
  };

  SearchModal.prototype = {
    /**
     * Run feature
     * @returns {void}
     */
    run: function() {
      var self = this;

      // open modal when open button is clicked
      self.$openButton.click(function() {
        self.open();
      });

      // open modal when `s` button is pressed
      $(document).keyup(function(event) {
        var target = event.target || event.srcElement;
        // exit if user is focusing an input or textarea
        var tagName = target.tagName.toUpperCase();
        if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
          return;
        }

        if (event.keyCode === 83 && !self.$searchModal.is(':visible')) {
          self.open();
        }
      });

      // close button when overlay is clicked
      self.$searchModal.click(function(e) {
        if (e.target === this) {
          self.close();
        }
      });

      // close modal when close button is clicked
      self.$closeButton.click(function() {
        self.close();
      });

      // close modal when `ESC` button is pressed
      $(document).keyup(function(e) {
        if (e.keyCode === 27 && self.$searchModal.is(':visible')) {
          self.close();
        }
      });

      // send search when form is submitted
      self.$searchForm.submit(function(event) {
        event.preventDefault();
        self.search(self.$searchInput.val());
      });
    },

    /**
     * Open search modal and display overlay
     * @returns {void}
     */
    open: function() {
      this.scriptsToLoad > 0 && this.showSpinner();
      this.loadMoment();
      this.loadAlgolia();
    },

    /**
     * Close search modal and overlay
     * @returns {void}
     */
    close: function() {
      this.hideSearchModal();
      this.hideOverlay();
      this.$searchInput.blur();
    },

    /**
     * Search with Algolia API and display results
     * @param {String} search
     * @returns {void}
     */
    search: function(search) {
      var self = this;
      this.algolia.search(search).then(function(content) {
        self.showResults(content.hits);
        self.showResultsCount(content.nbHits);
      });
    },

    /**
     * Display results
     * @param {Array} posts
     * @returns {void}
     */
    showResults: function(posts) {
      var html = '';
      posts.forEach(function(post) {
        var lang = window.navigator.userLanguage || window.navigator.language || post.lang;

        html += '<div class="media">';
        html += '<div class="media-body">';
        html += '<a class="link-unstyled" href="' + (post.link || post.permalink) + '">';
        html += '<h3 class="media-heading">' + post.title + '</h3>';
        html += '</a>';
        html += '<span class="media-meta">';
        html += '<span class="media-date text-small">';
        html += moment(post.date).locale(lang).format('ll');
        html += '</span>';
        html += '</span>';
        html += '<div class="media-content hide-xs font-merryweather">' + post.excerpt + '</div>';
        html += '</div>';
        html += '<div style="clear:both;"></div>';
        html += '<hr>';
        html += '</div>';
      });
      this.$results.html(html);
    },

    /**
     * Show loading spinner
     * @returns {void}
     */
    showSpinner: function() {
      const loading = document.createElement('div');
      loading.classList.add('loading');
      loading.setAttribute('id', 'loading');
      loading.innerHTML = `<div class="spinner-bg spinner-center"></div><div class="spinner spinner-center"></div>`;
      document.getElementById('blog').appendChild(loading);
    },

    /**
     * Hide loading spinner
     * @returns {void}
     */
    hideSpinner: function() {
      var searchLoading = document.getElementById('loading');
      if (searchLoading) {
        searchLoading.remove();
      }
    },

    /**
     * Show search modal
     * @returns {void}
     */
    showSearchModal: function() {
      this.$searchModal.fadeIn();
    },

    /**
     * Hide search modal
     * @returns {void}
     */
    hideSearchModal: function() {
      this.$searchModal.fadeOut();
    },

    /**
     * Display messages and counts of results
     * @param {Number} count
     * @returns {void}
     */
    showResultsCount: function(count) {
      var string = '';
      if (count < 1) {
        string = this.$resultsCount.data('message-zero');
        this.$noResults.show();
      }
      else if (count === 1) {
        string = this.$resultsCount.data('message-one');
        this.$noResults.hide();
      }
      else if (count > 1) {
        string = this.$resultsCount.data('message-other').replace(/\{n\}/, count);
        this.$noResults.hide();
      }
      this.$resultsCount.html(string);
    },

    /**
     * Show overlay
     * @returns {void}
     */
    showOverlay: function() {
      $('body').append('<div class="overlay"></div>');
      $('.overlay').fadeIn();
      $('body').css('overflow', 'hidden');
    },

    /**
     * Hide overlay
     * @returns {void}
     */
    hideOverlay: function() {
      $('.overlay').fadeOut(function() {
        $(this).remove();
        $('body').css('overflow', 'auto');
      });
    },

    loadDep: function() {
      if (--this.scriptsToLoad <= 0) {
        this.openAlgoliaModal();
      }
    },

    openAlgoliaModal: function() {
      var algoliaClient = algoliasearch(appId, apiKey);
      this.algolia = algoliaClient.initIndex(indexName);
      setTimeout((function() {
        this.hideSpinner();
        this.showSearchModal();
        this.showOverlay();
        this.$searchInput.focus();
        this.scriptsLoaded = true;
      }).bind(this), this.scriptsLoaded ? 0 : 750);
    },

    loadMoment: function() {
      var momentScript = document.createElement('script');
      momentScript.onload = this.loadDep.bind(this);
      momentScript.src = '/assets/js/moment-with-locales.js';
      document.head.appendChild(momentScript);
    },

    loadAlgolia: function() {
      var algoliaScript = document.createElement('script');
      algoliaScript.onload = this.loadDep.bind(this);
      algoliaScript.src = '/assets/js/algoliasearch.js';
      document.head.appendChild(algoliaScript);
    }
  };

  $(document).ready(function() {
    // launch feature only if there is an Algolia index available
    var searchModal = new SearchModal();
    searchModal.run();
  });
})(jQuery);
