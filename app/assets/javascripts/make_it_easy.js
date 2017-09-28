$(document).ready(function(){

  var _this = this;


  // $('.typeahead').typeahead({
  //   minLength: 3,
  //   highlight: true
  // },
  // {
  //   name: 'my-dataset',
  //   source: mySource
  // });


  var campaignEngine = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: '../search.json?search[keywords]=%QUERY',
      wildcard: '%QUERY',
      transform: function(response) {
        // Map the remote source JSON array to a JavaScript object array
        return $.map(response.data, function(campaign) {
          if (campaign.attributes) {
            return {
              value: campaign.attributes.name
            };
          }
        });
      }
    }
  });

  $('.form-control.typeahead').typeahead(null, {
    name: 'campaigns',
    display: 'value',
    source: campaignEngine
  });

  // name: 'clientNames',
  //   limit: 10,
  //   remote: {
  //     filter : (data)->
  //       $.each data, (i, el)->
  //         el.value = el.email
  //       data
  //     url: "#{this.url}/clients.json",
  //     replace : (url, query)=>
  //       url = url + "?search[query]=#{query}"
  //       url += "&token=#{this.getToken()}"
  //   },
  //   template : Handlebars.compile(
  //     "{{email}} ({{first_name}} {{last_name}})"
  //   )

  // #/*///*/
  // #// Set up keyword search typeahead.
  // #//
  // #// @method setUpTypeAhead
  // #/*///*/
  // setUpTypeAhead : ()->
  //   keywords = new Bloodhound({
  //     datumTokenizer: Bloodhound.tokenizers.whitespace,
  //     queryTokenizer: (d)->
  //       test = Bloodhound.tokenizers.whitespace(d)
  //       i = 0
  //       for _,token of test
  //         while(i+1 < token.length)
  //           test.push(token.substr(i++, token.length))

  //       return test
  //     ,
  //     remote: {
  //       url: '/api_search/suggest',
  //       prepare : (query, settings)=>
  //         settings.url += '?text='
  //         settings.url += encodeURIComponent(query)
  //         settings.url += '&lat='
  //         settings.url += encodeURIComponent($("input[name='selected_location[latitude]']").val())
  //         settings.url += '&lon='
  //         settings.url += encodeURIComponent($("input[name='selected_location[longitude]']").val())
  //         settings.url += '&radius='
  //         settings.url += encodeURIComponent('50')
  //         settings.url += '&search_type='
  //         settings.url += encodeURIComponent('all')

  //         return settings;
  //       wildcard : '%QUERY',
  //       filter : (data)->
  //         objs = [];
  //         serviceNames = [];

  //         return data.filter (item)->

  //           if (item.type != 'service')
  //             return objs.push(item)
  //           else
  //             if (serviceNames.indexOf(item.name) < 0 )
  //               serviceNames.push(item.name)
  //               return objs.push(item)
  //             else
  //               return false

  //         return objs
  //     }
  //   })

  //   $('#home #keywords').typeahead({
  //     highlight: false
  //   },
  //   {
  //     limit: 10,
  //     name: 'keywords',
  //     display: 'name',
  //     source: keywords,
  //     templates: {
  //       suggestion: (data)->
  //         switch data.type
  //           when 'category' then '<div>' + data.name + '</div>'
  //           when 'location' then "<div data-location-id=" + data.id + "><i class='building icon'></i>" + data.name + '</div>'
  //           when 'service'  then '<div>' + data.name + '</div>'
  //     }
  //   })





  $('body').on('click', 'a.expand-campaign', function(){

    var clickedElement = $(event.target);

    expandCampaign(clickedElement);

    return false;
  })

  function expandCampaign(elem) {

    const mq = window.matchMedia( "(max-width: 575px)" );

    if (mq.matches) {

      var learnMoreLink = elem;

      var campaignList      = learnMoreLink.parents('.campaign-list');
      var thisCampaign      = learnMoreLink.parents('.campaign');
      var allLearnMoreLinks = campaignList.find('a.expand-campaign');

      var allCampaignsDetails  = campaignList.find('.campaign-details');
      var thisCampaignsDetails = thisCampaign.find('.campaign-details');

      var allCampaignsNames = campaignList.find('.campaign-name');
      var thisCampaignsName = thisCampaign.find('.campaign-name');


      allCampaignsNames.each(function() {
        $(this).html($(this).data('shortened-name'));
      });

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

});