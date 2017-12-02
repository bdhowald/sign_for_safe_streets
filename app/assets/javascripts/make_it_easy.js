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


  $.fn.exists = function () {
    return this.length !== 0;
  }



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
              type:  'campaigns',
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
      }
    }
  );


  $('.form-control.typeahead').bind('change', function(ev) {

    // Open bug for typeahead, should be:
    // $('.form-control.typeahead').typeahead('val')
    var $clearSearchButton = $('#filters').find('button.btn-secondary');
    var curVal            = $('.form-control.typeahead.tt-input').typeahead('val')

    curVal == '' ? $clearSearchButton.hide() : $clearSearchButton.show()

  })

  $('.form-control.typeahead').bind('typeahead:select', function(ev) {

    // Open bug for typeahead, should be:
    // $('.form-control.typeahead').typeahead('val')
    var $clearSearchButton = $('#filters').find('button.btn-secondary');
    var curVal            = $('.form-control.typeahead.tt-input').typeahead('val')

    curVal == '' ? $clearSearchButton.hide() : $clearSearchButton.show()

  })


  $('.form-control.typeahead').bind('typeahead:select', function(ev, suggestion) {

    // Reset search buttons
    toggleSearchButtons(suggestion.value);

    // Search for campaigns
    performSearch(suggestion);

  });


  $('body').on('click', 'div.sign-petitions', function(event){
    if (!$(this).hasClass('disabled')){
      var selectedCampaigns = getSelectedCampaigns();

      var $petitionData = $(this).find('input#petition-data');

      $petitionData.val(JSON.stringify(selectedCampaigns));

      $petitionData.parents('form').submit();
    }
  });


  $('body').on('click', 'button.clear-search', function(event){
    // Clear search bar
    $('.form-control.typeahead.tt-input').typeahead('val', '');

    $('.form-control.typeahead').triggerHandler('typeahead:select', {
      type:  'all',
      value: true
    });

    $(this).hide();
  })


  $('body').on('click', 'li.filter-button', function(event){

    var searchText = $(this).find('.search-button').data('search-text').trim().toLowerCase();

    // Set typeahead
    $('.form-control.typeahead').typeahead('val', searchText);

    // Trigger selection
    $('.form-control.typeahead').triggerHandler('typeahead:select', {
      type: 'keywords',
      value: searchText
    });
  })


  $('body').on('click', 'div.sign, div.to-be-signed', function(event){
    // Delegate to function.
    addOrRemoveCampaign($(this));
  })


  $('body').on('click', 'a.expand-campaign', function(){
    // Expand a campaign's description.
    var $clickedElement = $(event.target);
    expandCampaign($clickedElement);

    return false;
  })


  $('body').on('click', '.sign-all button', function() {
    var $button = $(this);

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

  });



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


  function animateStickyFooter() {
    var $stickyFooter     = $('.sticky-footer');
    var selectedCampaigns = getSelectedCampaigns();
    var inTransition      = false

    if (!inTransition){
      if (selectedCampaigns.length > 0) {
        $stickyFooter.removeClass('retracted').addClass('extended');

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
        $stickyFooter.addClass('retracted')
      }
    }

    $stickyFooter.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {

      // code to execute after transition ends
      inTransition = false

    });

  }


  function expandCampaign(elem) {

    const mq = window.matchMedia( "(max-width: 767px)" );

    if (mq.matches) {

      var $learnMoreLink = elem;

      var $campaignList      = $learnMoreLink.parents('.campaign-list');
      var $thisCampaign      = $learnMoreLink.parents('.campaign');
      var $allLearnMoreLinks = $campaignList.find('a.expand-campaign');

      var $allCampaignsDetails  = $campaignList.find('.campaign-details .description-list-item');
      var $thisCampaignsDetails = $thisCampaign.find('.campaign-details .description-list-item');

      var $allCampaignsNames = $campaignList.find('.campaign-name');
      var $thisCampaignsName = $thisCampaign.find('.campaign-name');


      $allCampaignsNames.each(function() {
        $(this).html($(this).data('shortened-name'));
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


  function loadCampaignsToBeSigned() {

    // Get campaigns to be signed.
    var selectedCampaigns = getSelectedCampaigns();

    selectedCampaigns.forEach(function(campaignID){
      var $elem = $(document.querySelectorAll("[data-campaign-id='" + campaignID.toString() + "']"));
      changeSignedDisplay($elem.find('div.sign'), true)
    });

  }


  function performSearch(suggestion){

    var url;

    if (suggestion.type === 'campaigns') {
      url = '../campaigns.html?search[name]='
    } else if (suggestion.type === 'keywords') {
      url = '../campaigns.html?search[search_term]='
    } else if (suggestion.type === 'all') {
      url = '../campaigns.html?search[all]='
    }

    $.ajax({
      url:         url + encodeURIComponent(suggestion.value),
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


  function toggleSearchButtons(searchText) {

    var $allSearchButtons = $('.search-button');
    $allSearchButtons.removeClass('active');

    $('.search-button').each(function( index ) {
      var buttonSearchText = $(this).data('search-text').trim().toLowerCase()

      if (buttonSearchText === searchText) {
        $(this).addClass('active')
      }

      if (buttonSearchText === 'schools' && searchText === 'school') {
        $(this).addClass('active')
      }
    });

  }


  function toggleSignAllButton(){
    var $allUnsignedCampaigns = $('div.campaign-list .campaign').not('.already-signed');
    var $matchingCampaigns    = $('.campaign-list').not('.not-matching').find('.campaign').not('.already-signed');

    var queryPerformed = $('div.campaign-list.matching').exists();
    var $signAllButton = $('div.sign-all button.btn');

    // There is no query being performed or query selected all campaigns.
    if ($allUnsignedCampaigns.length == $matchingCampaigns.length) {

      if ($allUnsignedCampaigns.length > 0) {

        if ($allUnsignedCampaigns.length == $matchingCampaigns.find('div.to-be-signed').length) {

          $signAllButton.html('Remove All Campaigns');
          $signAllButton.removeClass('btn-primary btn-secondary').addClass('btn-danger');
          $signAllButton.prop('disabled', false)

        } else {

          $signAllButton.removeClass('btn-danger btn-secondary').addClass('btn-primary');
          $signAllButton.html('Add All Campaigns');
          $signAllButton.prop('disabled', false)

        }

      }

    } else {

      if ($matchingCampaigns.length == $matchingCampaigns.find('div.to-be-signed').length) {

        if ($matchingCampaigns.length == 0) {

          $signAllButton.html('All Campaigns Signed');
          $signAllButton.removeClass('btn-primary btn-danger').addClass('btn-secondary');
          $signAllButton.prop('disabled', true)

        } else {

          $signAllButton.html('Remove Matching Campaigns');
          $signAllButton.removeClass('btn-primary btn-secondary').addClass('btn-danger');
          $signAllButton.prop('disabled', false)

        }

      } else {

        $signAllButton.removeClass('btn-danger btn-secondary').addClass('btn-primary');
        $signAllButton.html('Add Matching Campaigns');
        $signAllButton.prop('disabled', false)

      }

    }

  }


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

  function getSelectedCampaigns() {
    // Get campaigns to be signed.
    let campaignData = useStorage('read', 'campaigns') || {};
    return (campaignData.selected || [])

  }

  function setSelectedCampaigns(selectedCampaigns){
    var campaignData = useStorage('read', 'campaigns') || {};
    campaignData.selected = selectedCampaigns;

    useStorage('write', 'campaigns', campaignData)
  }

};



$(document).on("turbolinks:load", onHomePageLoad)
// $(document).on('page:change', onPageLoad);