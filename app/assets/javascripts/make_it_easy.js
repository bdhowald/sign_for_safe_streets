$(document).ready(function(){

  var _this = this;

  _this.numbersToWords = new Object();
  _this.numbersInEnglish = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  for (var i = 0; i < _this.numbersInEnglish.length; i++) {
    _this.numbersToWords[i] = _this.numbersInEnglish
  }

  loadCampaignsToBeSigned();


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

  $('.form-control.typeahead').typeahead(null,
    {
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


  $('.form-control.typeahead').bind('typeahead:select', function(ev, suggestion) {
    var url;

    if (suggestion.type === 'campaigns') {
      url = '../campaigns.html?search[name]='
    } else if (suggestion.type === 'keywords') {
      url = '../campaigns.html?search[search_term]='
    }

    $.ajax({
      url:         url + encodeURIComponent(suggestion.value),
      type:        'GET',
      contentType: 'text/html; charset=utf-8'
    })
    .done(function(data, status, xhr){
      if (data === undefined) data = null;
      var campaignList = $('div.campaign-list')
      campaignList.replaceWith(data);
    })
    .fail(function(xhr, status, error){

    })
    .always(function(){

    })

  });


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
    toggleSignedState($(this));

    return false
  })


  $('body').on('click', 'a.expand-campaign', function(){
    // Expand a campaign's description.
    var clickedElement = $(event.target);
    expandCampaign(clickedElement);

    return false;
  })



  function changeCampaignsToBeSigned(action, id) {

    // Get campaigns to be signed.
    campaignsToSign = useStorage('read','campaigns_to_sign') || [];

    // Adding a campaign
    if (action === 'add') {

      // Add item
      campaignsToSign.push(id);

      useStorage('write', 'campaigns_to_sign', campaignsToSign);

    } else if (action === 'remove') {

      // Remove item
      const index = campaignsToSign.indexOf(id);
      if (index !== -1) {
        campaignsToSign.splice(index, 1)
      }

      useStorage('write', 'campaigns_to_sign', campaignsToSign);

    }

  }


  function changeSignedDisplay(elem, signed) {

    var signCol  = elem;
    var signText = elem.find('span');
    var plusSign = elem.find('i.fa');

    if (signed) {
      signText.text(' ');
      plusSign.replaceWith("<i class='fa fa-check'></i>");

      signCol.data('sign', true);
      signCol.removeClass('sign').addClass('to-be-signed')
    } else {
      signText.text('Sign');
      plusSign.replaceWith("<i class='fa fa-plus'></i>");

      signCol.data('sign', false);
      signCol.removeClass('to-be-signed').addClass('sign')
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

    var pageFooter         = $('.footer');
    var footerNumCampaigns = pageFooter.find('.num-campaigns');

    var numbersToWords = {};
    var numbersInEnglish = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

    for (var i = 0; i < numbersInEnglish.length; i++) {
      numbersToWords[i] = numbersInEnglish[i]
    }

    if (campaignsToSign.length) {
      pageFooter.show();

      numCampaigns = campaignsToSign.length.toString();

      numText = numbersToWords[numCampaigns];
      numText = numText ? numText : numCampaigns;

      campaignsText = campaignsToSign.length == 1 ? ' campaign!' : ' campaigns!'

      footerNumCampaigns.text(numText + campaignsText)
    } else {
      pageFooter.hide();
    }
  }


  function expandCampaign(elem) {

    const mq = window.matchMedia( "(max-width: 767px)" );

    if (mq.matches) {

      var learnMoreLink = elem;

      var campaignList      = learnMoreLink.parents('.campaign-list');
      var thisCampaign      = learnMoreLink.parents('.campaign');
      var allLearnMoreLinks = campaignList.find('a.expand-campaign');

      var allCampaignsDetails  = campaignList.find('.campaign-details .description-list-item');
      var thisCampaignsDetails = thisCampaign.find('.campaign-details .description-list-item');

      var allCampaignsNames = campaignList.find('.campaign-name');
      var thisCampaignsName = thisCampaign.find('.campaign-name');


      allCampaignsNames.each(function() {
        $(this).html($(this).data('shortened-name'));
      });

      // debugger

      allCampaignsDetails
        .removeClass('d-block')
        .addClass('d-none')
        .addClass('d-md-block');

      allLearnMoreLinks.show();


      learnMoreLink.hide();

      thisCampaignsDetails
        .removeClass('d-none')
        .removeClass('d-md-block')
        .addClass('d-block');

      thisCampaignsName.html(
        thisCampaignsName.data('full-name')
      );

    }

  }


  function loadCampaignsToBeSigned() {

    // Get campaigns to be signed.
    campaignsToSign = JSON.parse(localStorage.getItem('campaigns_to_sign')) || [];

    campaignsToSign.forEach(function(campaignID){
      elem = $(document.querySelectorAll("[data-campaign-id='" + campaignID.toString() + "']"));
      changeSignedDisplay(elem.find('div.sign'), true)
    });

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


  function toggleSignedState(elem) {

    var campaignID = elem.parents('.campaign').data('campaign-id');
    var currentState = elem.data('sign');

    changeCampaignsToBeSigned(currentState ? 'remove' : 'add', campaignID);
    changeSignedDisplay(elem, !currentState);

  }

});