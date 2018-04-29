'use strict'

var onFooterLoad = function(){

  var that = this;

  initialize();

  /**
   * Sets up all js functions on this page.
   * @name initialize
   */
  function initialize(){
    that.tracker = window.tracker;
  }


  $('body').on('click', '#static-footer .social-media-links .social-media-link', function(event){
    trackSocialMediaClicks(this);
  })

  $('body').on('click', '#static-footer p.site-link', function(event){
    trackFooterLinkClicks(this);
  })


  /**
   * Tracks footer links to internal pages.
   * @name  trackFooterLinkClicks
   * @param {Object} elem - internal link html element
   */
  function trackFooterLinkClicks(elem){
    that.tracker.track('Interal link clicked', {page: elem.id});
  }


  /**
   * Tracks links to my social media.
   * @name  trackSocialMediaClicks
   * @param {Object} elem - social media link html element
   */
  function trackSocialMediaClicks(elem){
    var $link = $(elem);
    var network;

    if ($link.hasClass('twitter')) {
      network = 'twitter';
    } else if ($link.hasClass('github')) {
      network = 'github';
    } else if ($link.hasClass('linkedin')) {
      network = 'linkedin';
    } else if ($link.hasClass('instagram')) {
      network = 'instagram';
    }

    that.tracker.track('Social media link clicked', {network: network});
  }

}

$(document).on("turbolinks:load", onFooterLoad)