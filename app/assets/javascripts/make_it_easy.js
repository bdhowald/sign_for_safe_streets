var onPageLoad = function(){

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
    var campaignsToSign = useStorage('read','campaigns_to_sign');

    var $petitionData = $(this).find('input#petition-data');

    $petitionData.val(JSON.stringify(campaignsToSign));

    $petitionData.parents('form').submit();
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

    var searchText = $(this).find('span.sans').html().trim().toLowerCase();

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

    } else {
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
    changeCampaignsToBeSigned(action, campaignID);

    // Update the footer
    updateFooter(action);

    // Update 'Sign All' button
    toggleSignAllButton();

    return false
  }


  function changeCampaignsToBeSigned(action, id) {

    // Get campaigns to be signed.
    var campaignsToSign = useStorage('read','campaigns_to_sign') || [];

    switch (action){
      // Adding a campaign
      case 'add':
        // Add item
        campaignsToSign.push(id);
        useStorage('write', 'campaigns_to_sign', campaignsToSign);
        break;
      case 'all':
        // Add all items
        campaignsToSign = JSON.parse($('#unsigned-campaign-ids').val());
        useStorage('write', 'campaigns_to_sign', campaignsToSign);
        break;
      case 'none':
        // Remove all items
        campaignsToSign = []
        useStorage('write', 'campaigns_to_sign', campaignsToSign);
        break;
      case 'remove':
        // Remove item
        const index = campaignsToSign.indexOf(id);
        if (index !== -1) {
          campaignsToSign.splice(index, 1)
        }
        useStorage('write', 'campaigns_to_sign', campaignsToSign);
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
    var campaignsToSign   = useStorage('read', 'campaigns_to_sign') || [];

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


  function animatePageFooter() {
    var $pageFooter      = $('.footer');
    var campaignsToSign  = useStorage('read', 'campaigns_to_sign') || []
    var newPosition      = campaignsToSign.length > 0 ? '75px' : '-75px';


    if (!$pageFooter.is(':animated')) {

      $pageFooter.animate({
        bottom: newPosition
      }, 200, function() {

        setTimeout(function(){
          var campaignsToSign = useStorage('read', 'campaigns_to_sign') || [];

          $pageFooter.animate({
            bottom: (campaignsToSign.length > 0 ? '0px' : '-75px')
          }, 200);

          that.campaignsJustAdded   = 0;
          that.campaignsJustRemoved = 0;

        }, 1000);

      });
    } else if (campaignsToSign.length == 0) {
      $pageFooter.animate({
        bottom: '-75px'
      }, 800);
    } else {

    }
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
    var campaignsToSign = useStorage('read', 'campaigns_to_sign') || [];

    campaignsToSign.forEach(function(campaignID){
      $elem = $(document.querySelectorAll("[data-campaign-id='" + campaignID.toString() + "']"));
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

    $('span.sans').each(function( index ) {
      var buttonText = $(this).html().trim().toLowerCase();

      if (buttonText === searchText) {
        $(this).parents('.search-button').addClass('active')
      }

      if (buttonText === 'schools' && searchText === 'school') {
        $(this).parents('.search-button').addClass('active')
      }
    });

  }


  function toggleSignAllButton(){
    var $allCampaigns      = $('div.campaign-list .campaign');
    var $matchingCampaigns = $('.campaign-list').not('.not-matching').find('.campaign');

    var queryPerformed = $('div.campaign-list.matching').exists();
    var $signAllButton = $('div.sign-all button.btn');

    // There is no query being performed or query selected all campaigns.
    if ($allCampaigns.length == $matchingCampaigns.length) {

      if ($allCampaigns.length == $matchingCampaigns.find('div.to-be-signed').length) {

        $signAllButton.html('Remove All Campaigns');
        $signAllButton.removeClass('btn-primary').addClass('btn-danger');

      } else {

        $signAllButton.removeClass('btn-danger').addClass('btn-primary');
        $signAllButton.html('Add All Campaigns');

      }

    } else {

      if ($matchingCampaigns.length == $matchingCampaigns.find('div.to-be-signed').length) {

        $signAllButton.html('Remove Matching Campaigns');
        $signAllButton.removeClass('btn-primary').addClass('btn-danger');

      } else {

        $signAllButton.removeClass('btn-danger').addClass('btn-primary');
        $signAllButton.html('Add Matching Campaigns');

      }

    }

  }


  function useStorage(operation, key, value) {

    if (operation === 'read') {
      if (typeof(Storage) !== "undefined") {
        // Push to local storage
        return JSON.parse(localStorage.getItem(key));
      } else {
        return JSON.parse(Cookies.get(key));
      }

    } else if (operation === 'write') {
      if (typeof(Storage) !== "undefined") {
        // Push to local storage
        localStorage.setItem(key, JSON.stringify(value));
      }
      // Always set cookie.
      Cookies.set(key, JSON.stringify(value));
    }

  }


  function updateFooter(action){
    var pageFooter         = $('.footer');
    var footerText         = pageFooter.find('.footer-text');
    var footerNumCampaigns = pageFooter.find('.num-campaigns');
    var footerCampaignText = pageFooter.find('.campaign-word');
    var campaignsToSign    = useStorage('read', 'campaigns_to_sign') || [];

    // var numbersToWords = {};
    // var numbersInEnglish = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

    // for (var i = 0; i < numbersInEnglish.length; i++) {
    //   numbersToWords[i] = numbersInEnglish[i]
    // }

    if (campaignsToSign.length) {

      pageFooter.css('background-color', '#0dc50d');
      footerText.css('visibility', 'visible');

      numCampaigns = campaignsToSign.length.toString();

      var numText = null;
      // numText = numbersToWords[numCampaigns];
      numText = numText ? numText : numCampaigns;

      campaignsText = campaignsToSign.length == 1 ? ' petition!' : ' petitions!'

      footerNumCampaigns.text(numText);
      footerCampaignText.text(campaignsText);

    } else {

      footerText.css('visibility', 'hidden');
      pageFooter.css('background-color', 'transparent');

    }

    // Update the notification box if need be
    updateNotificationBox(action);

    // Animate the footer when updates complete
    animatePageFooter();
  }

};



$(document).ready(onPageLoad);
// $(document).on('page:change', onPageLoad);