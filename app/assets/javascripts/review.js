'use strict'

var onReviewPageLoad = function(){

  var that = this;

  setUpGoogleListeners();
  setUpValidations();

  var googlePlaceSelected = checkAddressFields()


  $('body').on('click', 'a.information-toggle', function(){
    // Expand a campaign's description.
    var $clickedElement = $(event.target);
    toggleTargetDetails($clickedElement);

    return false;
  })


  $('body').on('submit', '#user-form', function(){
    var campaignIds = $('li.campaign').not('.signed').map(function() {
      return $(this).data('campaign-id')
    })
    $('#petition-data').val(JSON.stringify(campaignIds.get()));
  })


  $('body').on('click', 'div.read-more', function(){
    var $thisPetitionText = $(this).parents('.petition-text');
    var $thisBlockquote = $thisPetitionText.find('blockquote.blockquote');

    $thisBlockquote.html($thisBlockquote.data('full-letter'));

    // hide '(read more)'
    $(this).hide();
  })


  /*///*/
  // If user address info is complete, a Google
  // place has been selected.
  //
  // @method checkAddressFields
  /*///*/
  function checkAddressFields(){
    if ($('#user-address-street').val() === '') return false
    if ($('#user-address-city').val()   === '') return false
    if ($('#user-address-state').val()  === '') return false
    if ($('#user-address-zip').val()    === '') return false
    return true
  }


  /*///*/
  // Make sure user selects a location through Google Places.
  //
  // @method ensureGooglePlaceSelected
  /*///*/
  function ensureGooglePlaceSelected(){
    var input = $('#user-address')[0];
    var $input = $('#user-address');

    if (!googlePlaceSelected) {
      input.setCustomValidity('You must select an address');
      $input.siblings('.invalid-feedback').text('You must select an address');
      return false
    } else {
      input.setCustomValidity('');
      $input.siblings('.invalid-feedback').text('Please enter your address');
      return true
    }

  }


  /*///*/
  // When the user selects a place, let's track it.
  //
  // @method handleDetailsResult
  /*///*/
  function handleDetailsResult(location, granularity){
    console.log(
      "We selected the first item from the list automatically " +
      "because the user didn't select anything"
    );
    console.log(location);


    // Trackasaurus
    // trackEvent(
    //   'deals_page',
    //   'search',
    //   "#{granularity}|#{location.formatted_address}",
    //   null
    // )
  }


  /*///*/
  // When the user selects a place,
  // we need to determine the granularity,
  // track it, and recenter the map.
  //
  // @method handleLocationSelection
  /*///*/
  function handleLocationSelection(location, status){
    // Change search bar location to address.
    $('#user-address').val(location.formatted_address);

    // Set flag to signal user has selected a place.
    googlePlaceSelected = true;

    // Set hidden address inputs
    setSelectedLocation(location);

    // // Trigger the search.
    // performSearch();

    // Track location selection.
    // handleDetailsResult(location, granularity);

    // Validate location form input
    ensureGooglePlaceSelected();

  }


  /*///*/
  // Determines the user's place
  // selection if they click enter
  // instead of clicking on a place.
  //
  // @method inferUserChoice
  /*///*/
  function inferUserChoice(result){
    var _this = this;

    var input = $('#user-address')[0];

    // Do the google search, and pass it in a callback (last arg).
    performGoogleSearch(result, input, handleLocationSelection);
  }


  /*///*/
  // Code that obtains google geocoded
  // data from a text search for a place.
  //
  // performGoogleSearch
  /*///*/
  function performGoogleSearch(place, input, callback){
    if (place.name != ""){
      // The user pressed enter in the input
      // without selecting a result from the list
      // Let's get the list from the Google API so that
      // we can retrieve the details about the first result
      // and use it (just as if the user had actually selected it)
      var autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          'input':  place.name,
          'offset': place.name.length,
          // I repeat the options for my AutoComplete here to get
          // the same results from this query as I got in the
          // AutoComplete widget
          'componentRestrictions': {'country': 'us'},
          'types': ['geocode'],
          'key': 'AIzaSyDfamJ3i1uM6Yc61FW0HeaKCRlE-imBH8U'
        },
        function (list, status){
          if(list == null || list.length == 0) {
            // There are no suggestions available.
            // The user saw an empty list and hit enter.
            console.log("No results");
            resetAddressFields();
          } else {
            // Here's the first result that the user saw
            // in the list. We can use it and it'll be just
            // as if the user actually selected it
            // themselves. But first we need to get its details
            // to receive the result on the same format as we
            // do in the AutoComplete.
            var placesService = new google.maps.places.PlacesService(input);
            placesService.getDetails(
              {'reference': list[0].reference},
              function(detailsResult, placesServiceStatus){
                if (callback != null) {
                  callback(detailsResult, placesServiceStatus);
                }
              }
            )
          }
        }
      )
    }
  }


  /*///*/
  // Reset input fields when no Google place is selected.
  //
  // @method resetAddressFields
  /*///*/
  function resetAddressFields(){
    $('#user-address-street').val('');
    $('#user-address-city').val('');
    $('#user-address-state').val('');
    $('#user-address-zip').val('');

    // Set flag to signal user no longer has a selected place.
    googlePlaceSelected = false;
  }


  /*///*/
  // Set input fields when user selects location.
  //
  // @method setSelectedLocation
  /*///*/
  function setSelectedLocation(place){

    if (typeof place !== "undefined" && place !== null) {

      if (place.address_components != null){

        // Set the address
        var street_number = place.address_components.filter(function(component,i){
          return component.types[0] == "street_number"
        });
        var route = place.address_components.filter(function(component,i){
          return component.types[0] == "route"
        });

        if (street_number[0] != null && route[0] != null){
          $('#user-address-street').val([street_number[0].long_name, route[0].long_name].join(' '));
        }

        // set the city
        var city = place.address_components.filter(function(component,i){
          return component.types[0] == "locality";
        });
        if (city[0] != null){
          $('#user-address-city').val(city[0].long_name);
        }

        // In New York, look for boroughs
        var borough = place.address_components.filter(function(component,i){
          return component.types[0] == "sublocality_level_1";
        });
        if (borough[0] != null){
          $('#user-address-city').val(borough[0].long_name);
        }

        // set the region/state
        var region = place.address_components.filter(function(component,i){
          return component.types[0] == "administrative_area_level_1";
        });
        debugger
        if (region[0] != null){
          $('#user-address-state').val(region[0].short_name);
        }

        // Look for a postal_code
        var postal_code = place.address_components.filter(function(component,i){
          return component.types[0] == "postal_code";
        });
        if (postal_code[0] != null){
          $('#user-address-zip').val(postal_code[0].short_name);
        }

      }
    }
  }


  /*///*/
  // Set up google event listeners.
  //
  // @method setUpGoogleListeners
  /*///*/
  function setUpGoogleListeners(){
    var options = {
      types: ['geocode'],//['(cities)']
      componentRestrictions: {country: 'us'}
    }

    var input = $('#user-address')[0];

    if (input && typeof(google) != 'undefined') {
      var autocomplete = new google.maps.places.Autocomplete(input, options);

      google.maps.event.addListener(autocomplete, 'place_changed', function(){

        var result = autocomplete.getPlace();

        if (result.address_components == null){
          console.log("User did not click on an option");
          inferUserChoice(result);
        } else {
          handleLocationSelection(result, null);
        }
      });

      input.addEventListener('blur', function (event) {
        resetAddressFields();
      })

      var form = $('#user-form')[0]
      form.addEventListener("submit", function (event) {
        ensureGooglePlaceSelected();
      }, false);

    }

  }


  function toggleTargetDetails(elem) {

    var $toggleLink             = elem;
    var $allCampaigns           = $toggleLink.parents('div.all-campaigns');

    var $thisCampaign           = $toggleLink.parents('li.campaign');
    var $thisCampaignsDetails   = $thisCampaign.find('.petition-details');


    if ($allCampaigns.find('li.campaign').length > 1) {

      var $allToggleLinks       = $allCampaigns.find('a.information-toggle');
      var $allCampaignsDetails  = $allCampaigns.find('.petition-details');
      var $allPetitionTexts     = $('div.petition-text');

      // var $allCampaignsNames    = $allCampaigns.find('.campaign-name');
      // var $thisCampaignsName    = $thisCampaign.find('.campaign-name');


      if ($thisCampaignsDetails.hasClass('d-none')) {
        $allCampaignsDetails
          .addClass('d-none')

        $thisCampaignsDetails
          .removeClass('d-none')
      } else {
        $thisCampaignsDetails
          .addClass('d-none')
      }

      $allPetitionTexts.each(function(){
        var $thisBlockquote = $(this).find('blockquote.blockquote');

        $thisBlockquote.html($thisBlockquote.data('shortened-letter'));
        $(this).find('div.read-more').show();
      })

    } else {

      if ($thisCampaignsDetails.hasClass('d-none')) {

        $thisCampaignsDetails
          .removeClass('d-none')
      }

    }

  }

  function setUpValidations() {

    $('body').on('submit', '#user-form', function(event){
      var form = event.target;

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        $('#submit-form').prop('disabled', true)
      }
      form.classList.add('was-validated');
    })

  };

}

$(document).on("turbolinks:load", onReviewPageLoad)