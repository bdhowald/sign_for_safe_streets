'use strict'

var onHomePageLoad = function(){

  var that = this;

  // that.numbersToWords       = new Object();
  // that.numbersInEnglish     = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  that.campaignsJustAdded   = 0;
  that.campaignsJustRemoved = 0;

  // for (var i = 0; i < _this.numbersInEnglish.length; i++) {
  //   _this.numbersToWords[i] = _this.numbersInEnglish
  // }

  loadCampaignsToBeSigned();
  watchForHover();
  setUpTypeahead();


  $.fn.exists = function () {
    return this.length !== 0;
  }


  $('.form-control.typeahead').bind('change', function(event) {
    toggleClearSearchButton();
  })


  $('.form-control.typeahead').bind('typeahead:select', function(event) {
    toggleClearSearchButton();
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
    signPetitions($(this));

    return false;
  });


  $('body').on('click', 'button.clear-search', function(event){
    clearSearch($(this));

    return false;
  })


  $('body').on('click', '.filter-button', function(event){
    addOrRemoveFilter($(this));

    return false;
  })

  // Click to sign or remove a campaign.
  $('body').on('click', 'div.sign, div.to-be-signed', function(event){
    // Delegate to function.
    addOrRemoveCampaign($(this));

    return false;
  })

  // Expand a campaign's description.
  $('body').on('click', 'a.expand-campaign', function(){
    expandCampaign($(event.target));

    return false;
  })

  // Detect click on sign-all button.
  $('body').on('click', '.sign-all button', function() {
    addOrRemoveAllCampaigns($(this));

    return false;
  });


  /**
   * Delegation function that handles the addition or removal of all campaigns.
   * @name  addOrRemoveAllCampaigns
   * @param signAllButton - the sign all button.
   */
  function addOrRemoveAllCampaigns(signAllButton) {
    var $button = signAllButton;

    if ($button.hasClass('btn-primary')) {
      $button.removeClass('btn-primary').addClass('btn-danger');
      $button.html('Remove All Campaigns');

      // Update campaigns to be signed
      $('div.campaign-list').not('.not-matching').find('div.sign').each(function(){
        addOrRemoveCampaign($(this));
      });

    } else if ($button.hasClass('btn-danger')){
      $button.removeClass('btn-danger').addClass('btn-primary');
      $button.html('Add All Campaigns');

      // Update campaigns to be signed
      $('div.campaign-list').not('.not-matching').find('div.to-be-signed').each(function(){
        addOrRemoveCampaign($(this));
      });
    }
  }


  /**
   * Delegation function that receives request to add or remove a campaign and calls necessary functions.
   * @name  addOrRemoveCampaign
   * @param signCol - the button the user clicked to add or remove a campaign.
   */
  function addOrRemoveCampaign(signCol) {
    var action       = signCol.hasClass('sign') ? 'add' : 'remove';
    var campaignID   = signCol.parents('.campaign').data('campaign-id');
    var currentState = signCol.data('sign');

    // Update the campaign
    changeSignedDisplay(signCol, !currentState);

    // Update list of campaigns
    changeSelectedCampaigns(action, campaignID);

    // Update the footer
    updateStickyFooter(action);

    // Update 'Sign All' button
    toggleSignAllButton();

    // Trackasaurus
    // track(action);

    return false
  }


  /**
   * Adds or removes a filter when it has been clickded. Updates filter terms then performs a search.
   * @name  addOrRemoveFilter
   * @param filterButton - the clicked filter
   */
  function addOrRemoveFilter(filterButton) {
    // var $searchTerms        = $('input#search-terms');
    var $filterButton       = filterButton;
    var filterType          = $filterButton.parents('.filter-buttons').hasClass('categories') ? 'categories' : 'locations'

    var $filterTerms        = $('#' + filterType + '-filter');
    var searchText          = $filterButton.find('.search-button').data('search-text').trim().toLowerCase();

    var currentFilterTerms  = Boolean($filterTerms.val().trim()) ? JSON.parse($filterTerms.val().trim()) : []

    if ((!$filterButton.hasClass('active') && currentFilterTerms.indexOf(searchText) == -1)) {

      // Add active class
      $filterButton.addClass('active');

      // Add new term if we don't have it yet
      if (currentFilterTerms.indexOf(searchText.toLowerCase() != -1)) {
        currentFilterTerms.push(searchText.toLowerCase());
      }

    } else {
      // Remove active class
      $filterButton.removeClass('active');

      // Remove the term
      currentFilterTerms = currentFilterTerms.filter(function(elem){
        return elem !== searchText;
      })
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
    var $staticFooter     = $('.static-footer');
    var $stickyFooter     = $('.sticky-footer');
    var selectedCampaigns = getSelectedCampaigns();
    var inTransition      = false

    var body              = document.body,
        html              = document.documentElement;

    var height            = Math.max( body.scrollHeight, body.offsetHeight,
                                      html.clientHeight, html.scrollHeight, html.offsetHeight );

    if (!inTransition){
      if (selectedCampaigns.length > 0) {

        $stickyFooter.removeClass( 'retracted'    ).addClass('extended');
        $staticFooter.addClass(    'with-padding' );


        if ($(document).scrollTop() + $stickyFooter.height() > (height - html.clientHeight)){

          setTimeout(function(){

            var scrollDistance = $(document).scrollTop() + $stickyFooter.height();

            $("html, body").animate(
              { scrollTop: scrollDistance.toString() + 'px' }
            );
            window.scrollTo(0, scrollDistance );

          }, 400);

        }

        setTimeout(function(){
          // Get campaigns to be signed.
          var selectedCampaigns = getSelectedCampaigns();

          $stickyFooter.removeClass('extended');

          if (selectedCampaigns.length == 0){
            $stickyFooter.removeClass('extended').addClass('retracted');
          }

          that.campaignsJustAdded   = 0;
          that.campaignsJustRemoved = 0;

        }, 1500);
      } else {
        $stickyFooter.addClass(    'retracted'    );
        $staticFooter.removeClass( 'with-padding' );
      }
    }

    $stickyFooter.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {

      // code to execute after transition ends
      inTransition = false

    });

  }


  /**
   * Updates selected campaigns by adding or removing campaigns. Can also add and remove all at once.
   * @name  changeSelectedCampaigns
   * @param action - whether to add, remove, add all, or delete all.
   * @param elem   - the id of the campaign to add or remove if not all.
   */
  function changeSelectedCampaigns(action, id) {

    // Get campaigns to be signed.
    var selectedCampaigns = getSelectedCampaigns();

    switch (action){
      // Adding a campaign
      case 'add':
        // Add item
        selectedCampaigns.push(id);
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
        const index = selectedCampaigns.indexOf(id);
        if (index !== -1) {
          selectedCampaigns.splice(index, 1)
        }
        setSelectedCampaigns(selectedCampaigns);
        break;
    }

  }


  /**
   * Updates display for campaign when user agrees to sign it or removes it.
   * @name  changeSignedDisplay
   * @param elem   - the clicked sign button
   * @param signed - current state (to be signed or not)
   */
  function changeSignedDisplay(elem, signed) {

    var $signCol  = elem;
    var $signText = elem.find('span');
    var $plusSign = elem.find('i.fa');

    if (signed) {
      $signText.text(' ');
      $plusSign.replaceWith("<i class='fa fa-check'></i>");

      $signCol.data('sign', true);
      $signCol.removeClass('sign').addClass('to-be-signed')
    } else {
      $signText.text('Add');
      $plusSign.replaceWith("<i class='fa fa-plus'></i>");

      $signCol.data('sign', false);
      $signCol.removeClass('to-be-signed').addClass('sign')
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

  }


  /**
   * Clears the search and updates the related hidden input.
   * @name  clearSearch
   * @param clearButton - the button used to clear the search.
   */
  function clearSearch(clearButton) {
    var $clearButton   = clearButton
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
   * Expands the details of a selected campaign that are normally hidden in mobile view.
   * @name  expandCampaign
   * @param {Object} elem - the clicked link
   */
  function expandCampaign(elem) {

    var $clickedLink = $(elem);

    const mq = window.matchMedia( "(max-width: 767px)" );

    if (mq.matches) {

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
      var $searchButtons = $('.search-button');
      var $searchTerms   = $('input#search-terms');

      var newSearchTerms = [searchText];

      $searchTerms.val(JSON.stringify(newSearchTerms))

      if (Boolean(searchText)) {
        var $typeahead = $('.form-control.typeahead.tt-input');

        // Hide suggestions
        $typeahead.siblings('.tt-menu').hide();

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
   * Queries server for campaigns
   * @name performSearch
   * @param {Object} [suggestion] - search suggestion from typeahead (optional)
   */
  function performSearch(suggestion){
    var searchData = getSearchData(suggestion);
    var filterData = getFilterData();

    $.ajax({
      url:         '../campaigns.html',
      data:        Object.assign(searchData, filterData),
      type:        'GET',
      contentType: 'text/html; charset=utf-8'
    })
    .done(function(data, status, xhr){
      if (data === undefined) data = null;

      var $campaignListContainer = $('.campaign-list-container')
      $campaignListContainer.html(data);

      toggleSignAllButton();
    })
    .fail(function(xhr, status, error){

    })
    .always(function(){

    })
  }


  /**
   * Handles selection of typeahead suggestion.
   * and updates selected campaign list.
   * @name  selectTypeaheadSuggestion
   * @param suggestion - the typeahead suggestion
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
   * @name  setUpTypeahead
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
   * @param elem   - the clicked sign button
   * @param signed - current state (to be signed or not)
   */
  function signPetitions(stickyFooter){
    var $stickyFooter = stickyFooter;

    if (!stickyFooter.hasClass('disabled')){
      var selectedCampaigns = getSelectedCampaigns();

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

    curVal == '' ? $clearSearchButton.hide() : $clearSearchButton.show()
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

        if ($allUnsignedCampaigns.length == $unsignedMatchingCampaigns.find('div.to-be-signed').length) {
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

      } else if ($unsignedMatchingCampaigns.length == $unsignedMatchingCampaigns.find('div.to-be-signed').length) {
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
   * Changes notification box's color and text depending on whether campaigns have been added or removed.
   * @name  updateNotificationBox
   * @param {string} action - 'add' or 'remove'
   */
  function updateNotificationBox(action) {
    var $notificationBox  = $(".notification-box");
    var $notificationText = $notificationBox.find('.notification');

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
      numbersText = ++that.campaignsJustAdded;
      campaignsText = (that.campaignsJustAdded == 1) ? 'campaign' : 'campaigns';
      that.campaignsJustRemoved = 0;
    } else {
      numbersText = ++that.campaignsJustRemoved;
      campaignsText = (that.campaignsJustRemoved == 1) ? 'campaign' : 'campaigns';
      that.campaignsJustAdded = 0;
    }

    var actionText = action == 'add' ? 'added!' : 'removed';

    // Support add or remove
    $notificationText.html(
      (numbersText + ' ' + campaignsText + ' ' + actionText).trim()
    )

    $notificationBox.css('background-color', backgroundColor);
    $notificationText.css('color', color);

  }


  /**
   * Updates the footer used to finish selection process and move to signing campaigns
   * @name  updateStickyFooter
   * @param {string} action - either 'add' or 'remove'; addition or removal of campaign
   */
  function updateStickyFooter(action){
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

    // Update the notification box if need be
    updateNotificationBox(action);

    // Animate the footer when updates complete
    animateStickyFooter();
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
    document.addEventListener('mousemove', enableHover, true);

    enableHover();
  }

};



$(document).on("turbolinks:load", onHomePageLoad)