'use strict'

var onHomePageLoad = function(){

  var that = this;

  initialize();

  /**
   * Sets up all js functions on this page.
   * @name initialize
   */
  function initialize() {
    // that.numbersToWords       = new Object();
    // that.numbersInEnglish     = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    that.campaignsJustAdded   = 0;
    that.campaignsJustRemoved = 0;
    that.tracker              = window.tracker;

    // Trackasaurus
    that.tracker.track('Homepage loaded');

    // for (var i = 0; i < _this.numbersInEnglish.length; i++) {
    //   _this.numbersToWords[i] = _this.numbersInEnglish
    // }

    determineFingerprint();
    loadCampaignsToBeSigned();
    setUpTypeahead();
    watchForHover();
  }


  $.fn.exists = function () {
    return this.length !== 0;
  }


  $('.form-control.typeahead').bind('change', function(event) {
    toggleClearSearchButton();

    return false
  })


  $('.form-control.typeahead').bind('typeahead:select', function(event) {
    toggleClearSearchButton();

    return false
  })


  $('.form-control.typeahead').bind('typeahead:select', function(event, suggestion) {
    selectTypeaheadSuggestion(suggestion);

    return false;
  });

  $('body').on('keyup', '.form-control.typeahead.tt-input', function(event) {
    handleUserSearch(event);

    return false;
  });


  $('body').on('click', 'div.sign-petitions', function(event){
    signPetitions(this);

    return false;
  });


  $('body').on('click', 'button.clear-search', function(event){
    clearSearch(this);

    return false;
  });


  $('body').on('click', '.filter-button', function(){
    addOrRemoveFilter(this);

    return false;
  });


  // Click to sign or remove a campaign.
  $('body').on('click', '.col.sign, .col.to-be-signed', function(event){
    // Delegate to function.
    addOrRemoveCampaign(this);

    return false;
  });

  // Expand a campaign's description.
  $('body').on('click', 'a.expand-campaign', function(event){
    expandCampaign(this);

    return false;
  })

  // Detect click on sign-all button.
  $('body').on('click', '.sign-all button', function(event) {
    addOrRemoveAllCampaigns(this);

    return false;
  });

  // Track potential shares to social media.
  $('body').on('click', '.social-media-list-item .social-media-share-link', function(event) {
    trackSocialMediaShareClick(this);
  });


  /**
   * Delegation function that handles the addition or removal of all campaigns.
   * @name  addOrRemoveAllCampaigns
   * @param {Object} elem - sign all button html element.
   */
  function addOrRemoveAllCampaigns(elem) {
    // var time = new Date().getTime();
    // console.log('starting timer: ' + 0);

    var $button = $(elem);

    if ($button.hasClass('btn-primary')) {

      // Trackasaurus
      that.tracker.track('All campaigns added');

      $button.removeClass('btn-primary').addClass('btn-danger');
      $button.html('Remove All Campaigns');

      // console.log('beginning adding all campaigns: ' + (new Date().getTime() - time) );
      // Update campaigns to be signed
      // $('div.campaign-list').not('.not-matching').find('.col.sign').each(function(){
      //   // var timer = new Date().getTime()
      //   // console.log('beginning adding a campaign: ' + (new Date().getTime() - time) );
      //   addOrRemoveCampaign($(this));
      //   // console.log('finishing adding a campaign: ' + (new Date().getTime() - time) );
      //   // console.log('time to add a campaign: ' + (new Date().getTime() - timer) )
      // });
      var campaignsToAdd = $('div.campaign-list').not('.not-matching').find('.campaign').not('.already-signed, .to-be-signed');
      addOrRemoveCampaigns(campaignsToAdd, 'add');
      // console.log('finished adding all campaigns: ' + (new Date().getTime() - time) );

    } else if ($button.hasClass('btn-danger')){

      // Trackasaurus
      that.tracker.track('All campaigns removed');

      $button.removeClass('btn-danger').addClass('btn-primary');
      $button.html('Add All Campaigns');

      // Update campaigns to be signed
      // console.log('beginning removing all campaigns: ' + (new Date().getTime() - time) );
      // $('div.campaign-list').not('.not-matching').find('.col.to-be-signed').each(function(){
      //   // var timer = new Date().getTime()
      //   // console.log('beginning removing a campaign: ' + (new Date().getTime() - time) );
      //   addOrRemoveCampaign($(this));
      //   // console.log('finishing removing a campaign: ' + (new Date().getTime() - time) );
      //   // console.log('time to remove a campaign: ' + (new Date().getTime() - timer) )
      // });
      var campaignsToRemove = $('div.campaign-list').not('.not-matching').find('.campaign.to-be-signed');
      addOrRemoveCampaigns(campaignsToRemove, 'remove');
      // console.log('finished removing all campaigns: ' + (new Date().getTime() - time) );
    }

    // console.log('timer finished!: ' + (new Date().getTime() - time) );
  }


  /**
   * Exists to wrap adding or removing a single campaign to addOrRemoveCampaigns
   * @name  addOrRemoveCampaign
   * @param {Object} elem - add button html element for campaign
   */
  function addOrRemoveCampaign(elem) {
    var $signCol = $(elem);
    var action   = $signCol.data('sign') == true ? 'remove' : 'add';

    addOrRemoveCampaigns($signCol.parents('.campaign'), action);
  }


  /**
   * Delegation function that receives request to add or remove a campaign and calls necessary functions.
   * @name  addOrRemoveCampaigns
   * @param {Object} $campaigns - jQuery object of all matching campaigns
   * @param {string} action     - add or remove
   */
  function addOrRemoveCampaigns($campaigns, action) {
    // var start = new Date().getTime();
    // console.log('starting timer: ' + 0)
    var campaignIDs = $.map($campaigns, function(elem){
      return parseInt(elem.dataset.campaignId);
    });

    // var timePoint1 = new Date().getTime();
    // console.log('calling subfunctions...: ' + (timePoint1 - start))

    // Update the campaign
    changeSignedDisplay($campaigns, action);

    // var timePoint2 = new Date().getTime();
    // console.log('called changeSignedDisplay...: ' + (timePoint2 - timePoint1))

    // Update list of campaigns
    changeSelectedCampaigns(campaignIDs, action);

    // var timePoint3 = new Date().getTime();
    // console.log('called changeSelectedCampaigns...: ' + (timePoint3 - timePoint2))

    // Update the footer
    updateStickyFooter(campaignIDs, action);

    // var timePoint4 = new Date().getTime();
    // console.log('called updateStickyFooter...: ' + (timePoint4 - timePoint3))

    // Update 'Sign All' button
    toggleSignAllButton();

    // var timePoint5 = new Date().getTime();
    // console.log('called toggleSignAllButton...: ' + (timePoint5 - timePoint4))

    // Trackasaurus
    if (action == 'add'){
      that.tracker.track('Campaigns added', {campaignIDs: campaignIDs});
    } else if (action == 'remove') {
      that.tracker.track('Campaign removed', {campaignIDs: campaignIDs});
    }

    // var timePoint6 = new Date().getTime();
    // console.log('called tracker...: ' + (timePoint6 - timePoint5))

    // var end = new Date().getTime()
    // console.log('total time: ' + (end - start));
  }


  /**
   * Adds or removes a filter when it has been clickded. Updates filter terms then performs a search.
   * @name  addOrRemoveFilter
   * @param {Object} elem - filter button html element
   */
  function addOrRemoveFilter(elem) {
    var $filterButton       = $(elem);
    var filterType          = $filterButton.parents('.filter-buttons').hasClass('categories') ? 'categories' : 'locations'

    var $filterTerms        = $('#' + filterType + '-filter');
    var searchText          = $filterButton.data('search-text').trim().toLowerCase();

    var currentFilterTerms  = Boolean($filterTerms.val().trim()) ? JSON.parse($filterTerms.val().trim()) : []

    if ((!$filterButton.hasClass('active') && currentFilterTerms.indexOf(searchText) == -1)) {

      // Add active class
      $filterButton.addClass('active');

      // Add new term if we don't have it yet
      if (currentFilterTerms.indexOf(searchText.toLowerCase() != -1)) {
        currentFilterTerms.push(searchText.toLowerCase());
      }

      // Show users using screen readers that button has been pressed
      $filterButton.attr('aria-pressed', true);


      // Trackasaurus
      that.tracker.track('Filter added');

    } else {
      // Remove active class
      $filterButton.removeClass('active');

      // Remove the term
      currentFilterTerms = currentFilterTerms.filter(function(elem){
        return elem !== searchText;
      })

      // Show users using screen readers that button has been pressed
      $filterButton.attr('aria-pressed', false);

      // Trackasaurus
      that.tracker.track('Filter removed');
    }

    // Put updated value in input
    $filterTerms.val(JSON.stringify(currentFilterTerms));

    // Trigger search
    performSearch();
  }


  /**
   * Scrolls the sticky footer up and down depending on whether campaigns have been selected. Also, updates page height so page elements can always be seen.
   * @name animateStickyFooter
   */
  function animateStickyFooter() {
    var staticFooter      = document.getElementsByClassName('static-footer')[0];
    var stickyFooter      = document.getElementsByClassName('sticky-footer')[0];
    var notificationBox   = document.getElementsByClassName('notification-box')[0];

    var selectedCampaigns = getSelectedCampaigns();

    var body              = document.body,
        html              = document.documentElement;

    var height            = Math.max( body.scrollHeight, body.offsetHeight,
                                      html.clientHeight, html.scrollHeight, html.offsetHeight );


    // If we have selected campaigns, extend footer if need be
    if (selectedCampaigns.length > 0) {

      if (stickyFooter.classList.value.indexOf('retracted') != -1) {
        stickyFooter.classList.remove('retracted')
      }
      if (stickyFooter.classList.value.indexOf('extended') == -1) {
        stickyFooter.className += ' extended';

        notificationBox.classList.remove('sr-only');
      }
      if (staticFooter.classList.value.indexOf('with-padding') == -1) {
        staticFooter.className += ' with-padding';
      }


      if ($(document).scrollTop() + stickyFooter.clientHeight > (height - html.clientHeight)){

        setTimeout(function(){

          var scrollDistance = $(document).scrollTop() + stickyFooter.clientHeight;

          $("html, body").animate(
            { scrollTop: scrollDistance.toString() + 'px' }
          );
          window.scrollTo(0, scrollDistance );

        }, 400);

      }


      // Reset counters for adding and removing of campaigns
      oneTimeEvent(stickyFooter, 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
        notificationBox.classList.remove('sr-only');
      });



      // If we have transitioned up, we need to transition back down.
      setTimeout(function(){

        // Get campaigns to be signed.
        var selectedCampaigns = getSelectedCampaigns();

        // If we showed the notification box, hide it.
        if (stickyFooter.classList.value.indexOf('extended') != -1) {
          stickyFooter.classList.remove('extended');

          notificationBox.className += ' sr-only';
        }

        // If we have selected campaigns, retract footer to hide notification box only if need be
        if (selectedCampaigns.length == 0){
          if (staticFooter.classList.value.indexOf('with-padding') != -1) {
            staticFooter.classList.remove('with-padding');
          }

          if (stickyFooter.classList.value.indexOf('retracted') == -1) {
            stickyFooter.className += ' retracted';
          }

        }

        // Reset counters for adding and removing of campaigns
        oneTimeEvent(stickyFooter, 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
          that.campaignsJustAdded   = 0;
          that.campaignsJustRemoved = 0;

          notificationBox.className += ' sr-only';
        });

      }, 1500);


    } else {

      stickyFooter.className += ' retracted';
      staticFooter.classList.remove('with-padding');
    }

  }


  /**
   * Updates selected campaigns by adding or removing campaigns. Can also add and remove all at once.
   * @name  changeSelectedCampaigns
   * @param {number} ids    - the ids of the campaigns to add or remove if not all.
   * @param {string} action - whether to add, remove, add all, or delete all.
   */
  function changeSelectedCampaigns(ids, action) {

    // Get campaigns to be signed.
    var selectedCampaigns = getSelectedCampaigns();

    switch (action){
      // Adding a campaign
      case 'add':
        // Add item
        selectedCampaigns.push.apply(selectedCampaigns, ids);
        setSelectedCampaigns(selectedCampaigns);
        break;
      case 'all':
        // Add all items
        selectedCampaigns = JSON.parse($('#unsigned-campaign-ids').val());
        setSelectedCampaigns(selectedCampaigns);
        break;
      case 'none':
        // Remove all items
        selectedCampaigns = []
        setSelectedCampaigns(selectedCampaigns);
        break;
      case 'remove':
        // Remove item
        selectedCampaigns = selectedCampaigns.filter(function(i) {
          return ids.indexOf(i) < 0;
        });

        setSelectedCampaigns(selectedCampaigns);
        break;
    }

  }


  /**
   * Updates display for campaign when user agrees to sign it or removes it.
   * @name  changeSignedDisplay
   * @param {Object}  $campaigns - the clicked sign button
   * @param {boolean} signed     - current state (to be signed or not)
   */
  function changeSignedDisplay($campaigns, action) {

    // Iterate through campaigns
    $campaigns.each(function(){

      var $campaign = $(this);

      var $signCol     = $campaign.find('.col.sign, .col.to-be-signed');
      var $signText    = $signCol.find('span');
      var $icon        = $signCol.find('i.fa');
      var currentState = $signCol.data('sign');

      // signed is true if we are adding campaigns or we are toggling and the campaign isn't currently to-be-signed.
      var signed = (action == 'add');

      if (signed) {
        if (!currentState) {
          $signText.text(' ');
          $icon.replaceWith("<i class='fa fa-check' aria-hidden='true'></i>");

          $signCol.data('sign', true);
          $signCol.attr('data-sign', true);

          $signCol.removeClass('sign').addClass('to-be-signed');
          $signCol.attr('aria-pressed', true);
          $signCol.attr('aria-label', 'Campaign added');

          $campaign.addClass('to-be-signed')
        }
      } else {
        if (currentState) {
          $signText.text('Add');
          $icon.replaceWith("<i class='fa fa-plus' aria-hidden='true'></i>");

          $signCol.data('sign', false);
          $signCol.attr('data-sign', false);

          $signCol.removeClass('to-be-signed').addClass('sign');
          $signCol.attr('aria-pressed', false);
          $signCol.attr('aria-label', 'Add campaign');

          $campaign.removeClass('to-be-signed')
        }
      }

      // Change colors
      // var color = signCol.css('background-color');
      // var rgb = color.replace(/rgb(a)?|[()]/g, '').split(',').map(function(item) {
      //   return parseFloat(item);
      // });

      // if (rgb.length === 3) {
      //   rgb.push(0.5)
      //   signCol.css('background-color', "rgba(" + rgb + ")");
      // } else {
      //   rgb[rgb.length - 1] === 0.5 ? rgb[rgb.length - 1] = 1 : rgb[rgb.length - 1] = 0.5;
      //   signCol.css('background-color', "rgba(" + rgb + ")");
      // }

    })

  }


  /**
   * Clears the search and updates the related hidden input.
   * @name  clearSearch
   * @param {Object} elem - clear search html element
   */
  function clearSearch(elem) {
    var $clearButton   = $(elem);
    var $searchTerms   = $('input#search-terms');
    var newSearchTerms = [];

    $searchTerms.val(JSON.stringify(newSearchTerms));

    // Clear search bar
    $('.form-control.typeahead.tt-input').typeahead('val', newSearchTerms.join(' '));

    // Hide 'clear button'
    $clearButton.hide();

    // Perform search
    performSearch();
  }


  /**
   * Calculates users fingerprint and adds it to data to be
   * @name determineFingerprint
   */
  function determineFingerprint() {

    new Fingerprint2().get(function(result, components){
      useStorage('write', 'fingerprint_id', result)
    });

    // hack due to macbook pro GPU rendering issue
    setTimeout(function(){
      new Fingerprint2().get(function(result, components){
        useStorage('write', 'fingerprint_id', result)
      });
    }, 5000)

  }


  /**
   * Expands the details of a selected campaign that are normally hidden in mobile view.
   * @name  expandCampaign
   * @param {Object} elem - see more link html element of a campaign.
   */
  function expandCampaign(elem) {

    var $clickedLink = $(elem);

    var mq = window.matchMedia( "(max-width: 767px)" );

    if (mq.matches) {

      // Trackasaurus
      that.tracker.track('Campaign expanded');

      var $learnMoreLink = $clickedLink;

      var $campaignList      = $learnMoreLink.parents('.campaign-list');
      var $thisCampaign      = $learnMoreLink.parents('.campaign');
      var $allLearnMoreLinks = $campaignList.find('a.expand-campaign');

      var $allCampaignsDetails  = $campaignList.find('.campaign-details .description-list-item');
      var $thisCampaignsDetails = $thisCampaign.find('.campaign-details .description-list-item');

      var $allCampaignsNames = $campaignList.find('.campaign-name');
      var $thisCampaignsName = $thisCampaign.find('.campaign-name');


      $allCampaignsNames.each(function() {
        $clickedLink.html($clickedLink.data('shortened-name'));
      });


      $allCampaignsDetails
        .removeClass('d-block')
        .addClass('d-none')
        .addClass('d-md-block');

      $allLearnMoreLinks.show();


      $learnMoreLink.hide();

      $thisCampaignsDetails
        .removeClass('d-none')
        .removeClass('d-md-block')
        .addClass('d-block');


      $thisCampaignsName.html(
        $thisCampaignsName.data('full-name')
      );

    }

  }


  /**
   * Marshals into form filter data from hidden inputs
   * @name getFilterData
   */
  function getFilterData() {
    var data = {filters: new Object()};

    $('.filter-terms').each(function(){
      var $filterTerms       = $(this)
      var currentFilterTerms = $filterTerms.val()
      var filterType         = $filterTerms.data('filter-type');

      if (JSON.parse(currentFilterTerms).length > 0) {
        data['filters'][filterType] = currentFilterTerms
      }
    })

    return data
  }


  /**
   * Marshals into form search data from hidden input or optional suggestion
   * @name  getSearchData
   * @param {Object} searchObj - search suggestion passed by typeahead.
   */
  function getSearchData(searchObj) {
    var data          = {search: new Object()};
    var queryType;
    var searchTerms;

    if (searchObj) {
      searchTerms = searchObj.value;
      queryType   = searchObj.type;
    } else {
      searchTerms = JSON.parse($('input#search-terms').val());
      queryType   = (searchTerms.length > 0) ? 'keywords' : 'all';
    }

    data['search']['query_type']  = queryType;
    data['search']['query_value'] = searchTerms;

    return data;
  }


  /**
   * Convenience function that grabs current campaign data from storage.
   * @name getSelectedCampaigns
   */
  function getSelectedCampaigns() {
    // Get campaigns to be signed.
    var campaignData = useStorage('read', 'campaigns') || {};
    return (campaignData.selected || [])

  }


  /**
   * Handles when user presses enter in the search box. Updates search terms and performs search.
   * @name handleUserSearch
   */
  function handleUserSearch(enterEvent) {
    if(enterEvent.which == 13) {
      var $typeahead     = $('.form-control.typeahead.tt-input');
      var searchText     = $typeahead.typeahead('val').trim().toLowerCase();
      var $searchTerms   = $('input#search-terms');

      var newSearchTerms = [searchText];

      $searchTerms.val(JSON.stringify(newSearchTerms))

      if (Boolean(searchText)) {
        var $typeahead = $('.form-control.typeahead.tt-input');

        // Hide suggestions
        $typeahead.siblings('.tt-menu').hide();

        // Trackasaurus
        that.tracker.track('Free text search', {searchTerms: searchText});

        // Perform search
        performSearch();
      }
    }
  }


  /**
   * Loads selected campaigns from storage and sets their current display state.
   * @name loadCampaignsToBeSigned
   */
  function loadCampaignsToBeSigned() {

    // Get campaigns to be signed.
    var selectedCampaigns = getSelectedCampaigns();

    selectedCampaigns.forEach(function(campaignID){
      var $elem = $(document.querySelectorAll("[data-campaign-id='" + campaignID.toString() + "']"));
      changeSignedDisplay($elem.find('div.sign'), true)
    });

  }


  /**
   * Replacement for jQuery's .one() function
   * @name  oneTimeEvent
   * @param {Object} element    - html element
   * @param {string} eventTypes - all the events to create listeners for
   * @param {callback} callback - callback to call when event listener is triggered
   */
  function oneTimeEvent(element, eventTypes, callback) {
    var events = eventTypes.split(' ');

    for (var i = 0; i < events.length; i++) {
      var eventName = events[i];
      element.addEventListener(eventName, function callThenRemove(e) {
        e.target.removeEventListener(e.type, callThenRemove, false);
        return callback(e);
      });
    }
  }


  /**
   * Queries server for campaigns
   * @name performSearch
   * @param {Object} [suggestion] - search suggestion from typeahead (optional)
   */
  function performSearch(suggestion){
    // var nojQueryStart = new Date().getTime();
    // var nojQueryEnd;

    // console.log('nojQuery starting timer...')

    // console.log('calling performSearch: ' + new Date().getTime())
    var url = '../campaigns.html';

    var searchData = getSearchData(suggestion);
    var filterData = getFilterData();

    var searchDataString = toQueryString(searchData);
    var filterDataString = toQueryString(filterData);

    if (searchDataString.length && filterDataString.length) {
      url = url + '?' + searchDataString + '&' + filterDataString
    } else if (searchDataString.length) {
      url = url + '?' + searchDataString
    } else if (filterDataString.length) {
      url = url + '?' + filterDataString
    }


    // Change colors to grey to let user know site is loading.
    var campaigns = document.getElementsByClassName('campaign');

    Array.prototype.forEach.call(campaigns, function(campaign){
      campaign.setAttribute("style","color: #999");
    });

    var headers = document.getElementsByClassName('results-header');

    Array.prototype.forEach.call(headers, function(header){
      header.setAttribute("style","color: #999");
    });


    var xhr = new XMLHttpRequest();
    // console.log('nojQuery calling ajax: ' + ( new Date().getTime() - nojQueryStart ) );
    xhr.open("GET", url, true);
    xhr.send();

    xhr.onload=function(){
      if(xhr.readyState==4 && xhr.status==200){

        // var nojQueryAjaxDone = new Date().getTime()
        // console.log('nojQuery ajax done: ' + ( nojQueryAjaxDone - nojQueryStart ) )
        var campaignListContainer = document.getElementsByClassName('campaign-list-container');
        // console.log('nojQuery grabbed container: ' + ( new Date().getTime() - nojQueryStart ) )
        campaignListContainer[0].innerHTML = xhr.responseText
        // console.log('nojQuery data replaced: ' + ( new Date().getTime() - nojQueryStart ) )

        toggleSignAllButton();
        // nojQueryEnd = new Date().getTime();
        // console.log('nojQuery finished everything: ' + (nojQueryEnd - nojQueryStart) + '\n' );

        // console.log('nojQuery: ' + (nojQueryEnd - nojQueryStart))
        // console.log('nojQuery after ajax: ' + (nojQueryEnd - nojQueryAjaxDone));
      }

      // Array.prototype.forEach.call(campaigns, function(campaign){
      //   campaign.setAttribute("style","color: #000");
      // });

    }

    // // var jQueryStart = new Date().getTime();
    // // var jQueryEnd;
    // // console.log('jQuery starting timer...')

    // var searchData = getSearchData(suggestion);
    // var filterData = getFilterData();

    // // console.log('jQuery calling ajax: ' + ( new Date().getTime() - jQueryStart ) );
    // $.ajax({
    //   url:         '../campaigns.html',
    //   data:        Object.assign(searchData, filterData),
    //   type:        'GET',
    //   contentType: 'text/html; charset=utf-8'
    // })
    // .done(function(data, status, xhr){
    //   // var jQueryAjaxDone = new Date().getTime();
    //   // console.log('jQuery ajax done: ' + ( jQueryAjaxDone - jQueryStart ) )
    //   if (data === undefined) data = null;

    //   var $campaignListContainer = $('.campaign-list-container')
    //   // console.log('jQuery grabbed container: ' + ( new Date().getTime() - jQueryStart ) )
    //   $campaignListContainer.html(data);
    //   // console.log('jQuery data replaced: ' + ( new Date().getTime() - jQueryStart ) )

    //   toggleSignAllButton();
    //   // jQueryEnd = new Date().getTime()
    //   // console.log('jQuery finished everything: ' + ( jQueryEnd - jQueryStart ) + '\n' )

    //   // console.log('jQuery: ' + (jQueryEnd - jQueryStart))
    //   // console.log('jQuery after ajax: ' + (jQueryEnd - jQueryAjaxDone));
    // })
    // .fail(function(xhr, status, error){

    // })
    // .always(function(){

    // })

    // // console.log( '\n\n\n' )
  }


  /**
   * Handles selection of typeahead suggestion.
   * and updates selected campaign list.
   * @name  selectTypeaheadSuggestion
   * @param {Object} suggestion - the typeahead suggestion
   */
  function selectTypeaheadSuggestion(suggestion) {
    var $searchTerms   = $('input#search-terms');
    var newSearchTerms = [suggestion.value];

    $searchTerms.val(JSON.stringify(newSearchTerms))

    // Search for campaigns
    performSearch(suggestion);
  }


  /**
   * Convenience function that grabs current campaign data from storage and updates selected campaign list.
   * @name  setSelectedCampaigns
   * @param {array} selectedCampaigns - updated selected campaigns
   */
  function setSelectedCampaigns(selectedCampaigns){
    var campaignData = useStorage('read', 'campaigns') || {};
    campaignData.selected = selectedCampaigns;

    useStorage('write', 'campaigns', campaignData)
  }


  /**
   * Initializes typeahead and bloodhound functions for search.
   * @name setUpTypeahead
   */
  function setUpTypeahead() {
    var campaignEngine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: '../campaigns.json?search[suggestion]=%QUERY',
        wildcard: '%QUERY',
        transform: function(response) {
          // Map the remote source JSON array to a JavaScript object array
          return $.map(response.data, function(campaign) {
            if (campaign.attributes) {
              return {
                type:  'name',
                value: campaign.attributes.name
              };
            }
          });
        }
      }
    });


    var tagEngine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: '../tags.json?search[suggestion]=%QUERY',
        wildcard: '%QUERY',
        transform: function(response) {
          // Map the remote source JSON array to a JavaScript object array
          return $.map(response.data, function(tag) {
            if (tag.attributes) {
              return {
                type:  'keywords',
                value: tag.attributes.word
              };
            }
          });
        }
      }
    });

    $('.form-control.typeahead').typeahead(
      {
        highlight: true,
        hint: true
      },{
        name: 'tags',
        display: 'value',
        source: tagEngine,
        templates: {
          header: "<div class='tt-header'>Keywords</div>",
          suggestion: function (data) {
            return "<div class='tt-suggestion tt-selectable tt-keyword'>" + data.value + "</div>"
          }
        }
      },
      {
        name: 'campaigns',
        display: 'value',
        source: campaignEngine,
        templates: {
          header: "<div class='tt-header'>Campaigns</div>",
          suggestion: function (data) {
            return "<div class='tt-suggestion tt-selectable tt-campaign'>" + data.value + "</div>"
          }
        },
        limit: 10
      }
    );
  }


  /**
   * Updates display for campaign when user agrees to sign it or removes it.
   * @name  signPetitions
   * @param {Object} elem - 'div.sign-petitions' html element
   */
  function signPetitions(elem){
    var $stickyFooter = $(elem);

    if (!$stickyFooter.hasClass('disabled')){
      var selectedCampaigns = getSelectedCampaigns();

      // Trackasaurus
      that.tracker.track('User will sign petitions', {campaignIDs: selectedCampaigns})

      var $petitionData = $stickyFooter.find('input#petition-data');

      $petitionData.val(JSON.stringify(selectedCampaigns));

      $petitionData.parents('form').submit();
    }
  }


  /**
   * Removes the clear search button from the view when the search is empty.
   * @name toggleClearSearchButton
   */
  function toggleClearSearchButton() {
    // Open bug for typeahead, should be:
    // $('.form-control.typeahead.tt-input').typeahead('val')
    var $clearSearchButton = $('#filters').find('button.btn-secondary');
    var curVal             = $('.form-control.typeahead.tt-input').typeahead('val')


    if (curVal == '') {
      $clearSearchButton.hide();
      $clearSearchButton.attr('aria-hidden', true);
    } else {
      $clearSearchButton.show();
      $clearSearchButton.attr('aria-hidden', false);
    }
  }


  /**
   * Toggles the 'sign all' button depending on whether campaigns are available to sign and have already been added
   * @name toggleSignAllButton
   */
  function toggleSignAllButton(){
    var $allUnsignedCampaigns      = $('div.campaign-list .campaign').not('.already-signed');
    var $matchingCampaigns         = $('.campaign-list').not('.not-matching').find('.campaign')
    var $unsignedMatchingCampaigns = $matchingCampaigns.not('.already-signed');

    var queryPerformed = $('div.campaign-list.matching').length > 0;
    var $signAllButton = $('div.sign-all button.btn');


    // There is no query being performed or query selected all campaigns.
    if ($allUnsignedCampaigns.length == $unsignedMatchingCampaigns.length) {

      if ($allUnsignedCampaigns.length > 0) {
        // If there are still campaigns we have not yet signed

        if ($allUnsignedCampaigns.length == $unsignedMatchingCampaigns.find('.col.to-be-signed').length) {
          // But if we have already added all to be signed.

          $signAllButton.html('Remove All Campaigns');
          $signAllButton.removeClass('btn-primary btn-secondary').addClass('btn-danger');
          $signAllButton.prop('disabled', false)

        } else {
          // There are still unsigned campaigns to be added.

          $signAllButton.removeClass('btn-danger btn-secondary').addClass('btn-primary');
          $signAllButton.html('Add All Campaigns');
          $signAllButton.prop('disabled', false)

        }

      }

    } else {

      if ($matchingCampaigns.length == 0) {
        // No campaigns match.

        $signAllButton.html('No Campaigns Match');
        $signAllButton.removeClass('btn-primary btn-danger').addClass('btn-secondary');
        $signAllButton.prop('disabled', true)

      } else if ($unsignedMatchingCampaigns.length == $unsignedMatchingCampaigns.find('.col.to-be-signed').length) {
        // There are as many unsigned campaigns as campaigns to be signed.

        if ($unsignedMatchingCampaigns.length == 0) {
          // We signed them all.

          $signAllButton.html('All Campaigns Signed');
          $signAllButton.removeClass('btn-primary btn-danger').addClass('btn-secondary');
          $signAllButton.prop('disabled', true)

        } else {
          // Or we have selected them all.

          $signAllButton.html('Remove Matching Campaigns');
          $signAllButton.removeClass('btn-primary btn-secondary').addClass('btn-danger');
          $signAllButton.prop('disabled', false)

        }

      } else {
        // We can add campaigns that match our query.

        $signAllButton.removeClass('btn-danger btn-secondary').addClass('btn-primary');
        $signAllButton.html('Add Matching Campaigns');
        $signAllButton.prop('disabled', false)

      }

    }

  }


  /**
   * Convert a javascript object into a query string of params
   * @name  toQueryString
   * @param {Object} obj - the object to convert into a query string
   */
  function toQueryString(obj, urlEncode) {
    //
    // Helper function that flattens an object, retaining key structer as a path array:
    //
    // Input: { prop1: 'x', prop2: { y: 1, z: 2 } }
    // Example output: [
    //     { path: [ 'prop1' ],      val: 'x' },
    //     { path: [ 'prop2', 'y' ], val: '1' },
    //     { path: [ 'prop2', 'z' ], val: '2' }
    // ]
    //
    function flattenObj(x, path) {
      var result = [];
      var isArray = Array.isArray(x);

      path = path || [];

      Object.keys(x).forEach(function (key) {
        if (!x.hasOwnProperty(key)) return;

        var newPath = path.slice();
        if (isArray) {
          newPath.push('');
        } else {
          newPath.push(key);
        }

        var vals = [];
        if (typeof x[key] == 'object') {
          vals = flattenObj(x[key], newPath);
        } else {
          vals.push({ path: newPath, val: x[key] });
        }
        vals.forEach(function (obj) {
          return result.push(obj);
        });
      });

      return result;
    } // flattenObj

    // start with  flattening `obj`
    var parts = flattenObj(obj); // [ { path: [ ...parts ], val: ... }, ... ]

    // convert to array notation:
    parts = parts.map(function (varInfo) {
      if (varInfo.path.length == 1) varInfo.path = varInfo.path[0];else {
        var first = varInfo.path[0];
        var rest = varInfo.path.slice(1);
        varInfo.path = first + '[' + rest.join('][') + ']';
      }
      return varInfo;
    }); // parts.map

    // join the parts to a query-string url-component
    var queryString = parts.map(function (varInfo) {
        return varInfo.path + '=' + varInfo.val;
    }).join('&');
    if (urlEncode) return encodeURIComponent(queryString);else return queryString;
  }


  /**
   * Track clicks to share campaigns to social media
   * @name  trackSocialMediaShareClick
   * @param {Object} elem - the clicked html link to share
   */
  function trackSocialMediaShareClick(elem){
    var $shareLink = $(elem);
    var $campaign  = $shareLink.parents('.campaign')
    var campaignID = $campaign.data('campaign-id')

    if ($shareLink.hasClass('twitter-link')) {
      // Trackasaurus
      that.tracker.track('Twitter share link clicked', {campaignID: campaignID});
    } else if ($shareLink.hasClass('facebook-link')) {
      // Trackasaurus
      that.tracker.track('Facebook share link clicked', {campaignID: campaignID});
    }
  }


  /**
   * Changes notification box's color and text depending on whether campaigns have been added or removed.
   * @name  updateNotificationBox
   * @param {array}  campaignIDs - ids of the campaigns we just added or removed
   * @param {string} action      - 'add' or 'remove'
   */
  function updateNotificationBox(campaignIDs, action) {
    var $notificationBox    = $(".notification-box");
    var $notificationText   = $notificationBox.find('.notification');
    var $notificationSRText = $('#sr-notification-text');

    var add = (action == 'add');

    var backgroundColor =
      (add ? $notificationBox.data('add-color')
        : $notificationBox.data('remove-color'));
    // If browser doesn't support data
    var backgroundColor = (backgroundColor || (add ? '#29b9e7' : '#ffc107'));

    var color = (add ? '#fff' : '#000');


    var numbersText;
    var campaignsText;

    // Keep track of how many campaigns have just been clicked to sign
    if (add) {
      that.campaignsJustAdded   += campaignIDs.length;
      numbersText                = that.campaignsJustAdded
      campaignsText              = (that.campaignsJustAdded == 1) ? 'campaign' : 'campaigns';
      that.campaignsJustRemoved  = 0;
    } else {
      that.campaignsJustRemoved += campaignIDs.length;
      numbersText                = that.campaignsJustRemoved;
      campaignsText              = (that.campaignsJustRemoved == 1) ? 'campaign' : 'campaigns';
      that.campaignsJustAdded    = 0;
    }

    var actionText               = action == 'add' ? 'added!' : 'removed';

    // Support add or remove
    $notificationText.html(
      (numbersText + ' ' + campaignsText + ' ' + actionText).trim()
    )

    $notificationBox.css('background-color', backgroundColor);
    $notificationText.css('color', color);

    // For screen readers
    $notificationSRText.replaceWith(
      "<div id='sr-notification-text' role='alert'>" + (numbersText + ' ' + campaignsText + ' ' + actionText).trim() + '</div>'
    )
    var $notificationSRText = $('#sr-notification-text');
    $notificationSRText.attr('aria-live', 'polite');

  }


  /**
   * Updates the footer used to finish selection process and move to signing campaigns
   * @name  updateStickyFooter
   * @param {array}  campaignIDs - ids of the campaigns we just added or removed
   * @param {string} action      - either 'add' or 'remove'; addition or removal of campaign
   */
  function updateStickyFooter(campaignIDs, action){
    // var start = new Date().getTime();
    // console.log('starting timer: ' + 0)

    var $stickyFooter       = $('.sticky-footer');
    // var $footerText         = $stickyFooter.find('.footer-text');
    var $footerNumCampaigns = $stickyFooter.find('.num-campaigns');
    var $footerCampaignText = $stickyFooter.find('.campaign-word');
    var selectedCampaigns   = getSelectedCampaigns();

    // var numbersToWords = {};
    // var numbersInEnglish = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

    // for (var i = 0; i < numbersInEnglish.length; i++) {
    //   numbersToWords[i] = numbersInEnglish[i]
    // }

    // var timePoint1 = new Date().getTime();
    // console.log('calling internal code...: ' + (timePoint1 - start))

    if (selectedCampaigns.length) {
      $stickyFooter.removeClass('disabled');

      var numCampaigns = selectedCampaigns.length.toString();

      var numText = null;
      // numText = numbersToWords[numCampaigns];
      numText = numText ? numText : numCampaigns;

      var campaignsText = selectedCampaigns.length == 1 ? ' petition!' : ' petitions!'

      $footerNumCampaigns.text(numText);
      $footerCampaignText.text(campaignsText);

    } else {
      $stickyFooter.addClass('disabled');
    }

    // var timePoint2 = new Date().getTime();
    // console.log('finished calling internal code...: ' + (timePoint2 - timePoint1))

    // Update the notification box if need be
    updateNotificationBox(campaignIDs, action);

    // var timePoint3 = new Date().getTime();
    // console.log('finished calling updateNotificationBox...: ' + (timePoint3 - timePoint2))

    // Animate the footer when updates complete
    animateStickyFooter();

    // var timePoint4 = new Date().getTime();
    // console.log('finished calling animateStickyFooter...: ' + (timePoint4 - timePoint3))

    // console.log('total time: ' + (timePoint4 - start))
  }


  /**
   * Wrapper function meant to handle reads and writes from storage, whether local or cookie
   * @name  useStorage
   * @param {string} operation - 'read' or 'write'
   * @param {string} key - name under which to store record
   * @param {any}    value - item to be stored
   */
  function useStorage(operation, key, value) {
    if (operation === 'read') {
      if (typeof(Storage) !== "undefined" && false) {
        // Push to local storage
        return JSON.parse(localStorage.getItem(key));
      } else {
        return JSON.parse(Cookies.get(key) || null);
      }

    } else if (operation === 'write') {
      if (typeof(Storage) !== "undefined" && false) {
        // Push to local storage
        localStorage.setItem(key, JSON.stringify(value));
      }
      // Always set cookie.
      Cookies.set(key, JSON.stringify(value));
    }

  }


  /**
   * Removes hover events for touch devices
   * that do not also have mouse capabilities.
   * @name watchForHover
   */
  function watchForHover() {
    var hasHoverClass = false;
    var container = document.body;
    var lastTouchTime = 0;

    function enableHover() {
        // filter emulated events coming from touch events
        if (new Date() - lastTouchTime < 500) return;
        if (hasHoverClass) return;

        container.className += ' hasHover';
        hasHoverClass = true;
    }

    function disableHover() {
        if (!hasHoverClass) return;

        container.className = container.className.replace(' hasHover', '');
        hasHoverClass = false;
    }

    function updateLastTouchTime() {
        lastTouchTime = new Date();
    }

    document.addEventListener('touchstart', updateLastTouchTime, true);
    document.addEventListener('touchstart', disableHover, true);
    document.addEventListener('mousemove',  enableHover, true);

    enableHover();
  }

};



$(document).on("turbolinks:load", onHomePageLoad)