// Name:         braggart.js
// Purpose:      Easy to integrate & customize share tools.
// Dependencies: jQuery, a Facebook App ID, & Love 
// Developer:    Troy Griggs 

// HTML CLASSES 
// .facebook 
// .twitter 
// .pinterest
// .email 

// HTML DATA ATTRIBUTES 
// data-cs-url   : Set at share tool level, container level, or in the initialization 
// data-cs-text  : Set at share tool level, container level, or in the initialization 
// data-cs-caption  : Set at share tool level, container level, or in the initialization, FB only
// data-cs-image : Set at share tool level, container level, or in the initialization 

// OPTIONS: ------------ */ 
// test       : sets up automatic https for debugging 
// url        : for canonical url for single share 
// fbAppId    : App ID from the FB App Dashboard
// fbTitle    : Facebook-specific title 
// shareText  : Basic share description text  
// fbText     : Facebook-specific description text 
// tweetText  : Twitter-specific description text 
// pinText    : Pinterest-specific description text 
// emailText  : Email-specific description text 
// shareImage : Primary share image 
// fbImage    : Facebook-specific share image 
// tweetImage : Twitter-specific share image 
// pinImage   : Pinterest-specific share image 
// emailImage : Email-specific share image 

// METHODS: ------------ */ 
// setFacebook    : Event 
// setTwitter     : Event 
// setPinterest   : Event 
// setEmail       : Event 
// getMeta        : Triggers getLinks, getText, and getImages methods 
// getLinks       : Returns an object containing all the links associated with share tools 
// getText        : Returns an object containing all text associated with share tools 
// getImages      : Returns an object containing all images associated with share tools 
// setBoilerplate : Set up Facebook & Pinterest code 


;(function($, window, document, undefined) {

  var pluginName = 'braggart',
      defaults = {
        test: true,
        isUIWebView: null,
        url: null,
        slugURL: null,
        fbAppId: null,
        fbTitle: null,
        shareText: null,
        shareImage: null,
        linkSet: null,
        textSet: null,
        imageSet: null,
        dimensions: {
          facebook: {
            width: null,
            height: null
          },
          twitter: {
            width: 550,
            height: 420
          },
          pinterest: {
            width: 750,
            height: 320
          },
          email: {
            width: 900,
            height: 590
          }
        }
      };

  function Plugin(element, options){
    this.element = element;
    this.opts = $.extend(defaults, options);
    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  };

  Plugin.prototype.init = function(){
    var self = this;

    // set up selections 
    this.opts.$container  = $(this.element);
    this.opts.isUIWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);
    
    // Guards
    if (!this.opts.$container) {
      console.log("CustomShare Error: missing a target container");
      return;
    }
    if (!this.opts.fbAppId) {
      console.log("CustomShare Error: You need to register your App with Facebook in order to use the FB share");
      return;
    };

    this.setBoilerplate(this.opts);

    var $this = this.opts.$container,
        $facebook = $this.find('.facebook'),
        $twitter = $this.find('.twitter'),
        $pinterest = $this.find('.pinterest'),
        $email = $this.find('.email');

    // Need to refactor this 
    $facebook.on('click', function(){
      self.getMeta($this, self.opts);
      self.setFacebook(self.opts);
    });
    $twitter.on('click', function(){
      self.getMeta($this, self.opts);
      self.setTwitter(self.opts);
    });
    $pinterest.on('click', function(){
      self.getMeta($this, self.opts);
      self.setPinterest(self.opts);
    });
    $email.on('click', function(){
      self.getMeta($this, self.opts);
      self.setEmail(self.opts);
    });

  };


  Plugin.prototype.setFacebook = function(opts){
    var fb_opts = {
      method : 'feed',
      name: opts.textSet.fb,
      caption: opts.textSet.fbCaption, //  'Caption Field'
      link: opts.linkSet.fb,
      description: opts.textSet.fbDescription, //  || 'Description Field'
      picture: opts.imageSet.fb
    };
    FB.ui(fb_opts);
  };
  
  Plugin.prototype.setTwitter = function(opts){
    var width = opts.dimensions.twitter.width,
        height = opts.dimensions.twitter.height,
        winHeight = screen.height,
        winWidth = screen.width,
        left = Math.round((winWidth / 2) - (width / 2)), 
        top = 0, 
        windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
        text = opts.textSet.twitter,
        targetUrl = (opts.test ? "https:" : "") + '//twitter.com/intent/tweet?',
        shareUrl = opts.linkSet.twitter;

    if (winHeight > height) {
      top = Math.round((winHeight / 2) - (height / 2));
    }

    targetUrl += 'url=' + encodeURIComponent(shareUrl);
    targetUrl += '&text=' + encodeURIComponent(text);

    windowOptions += ',width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;

    // pop up or navigate to, depending on webview status
    if (!opts.isUIWebView) {
      window.open(targetUrl, 'intent', windowOptions);
    } else {
      window.location.href = targetUrl;
    }
  };
  
  Plugin.prototype.setPinterest = function(opts){
    var width = opts.dimensions.pinterest.width,
        height = opts.dimensions.pinterest.height,
        left, top,
        windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=no',
        targetUrl = (opts.test ? "https:" : "") + "//www.pinterest.com/pin/create/button/?",
        shareUrl = opts.linkSet.pinterest,
        imageUrl = opts.imageSet.pinterest,
        description = opts.textSet.pinterest;

    targetUrl += "url=" + encodeURIComponent(shareUrl);
    targetUrl += "&media=" + encodeURIComponent(imageUrl);
    targetUrl += "&description=" + encodeURIComponent(description);

    windowOptions += ',width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;

    // pop up or navigate to, depending on webview status
    if (!opts.isUIWebView) {
      window.open(targetUrl, 'Pin this recipe', windowOptions);
    } else { 
      window.location.href = targetUrl;
    }
  };

  Plugin.prototype.setEmail = function(opts){
    var width = opts.dimensions.email.width,
        height = opts.dimensions.email.height,
        left, top,
        windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=no',
        pagename = "",
        shareUrl = opts.linkSet.email,
        targetUrl = "mailto:"+pagename+"?Subject=Sharing via email&body="+shareUrl // Baseline url 

    windowOptions += ',width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
    
    standardMail();

    // Based on JayDax's email function 
    function standardMail(){ 
      if (navigator.appName == 'Netscape' || navigator.appName == 'Opera') { 
        // pop up or navigate to, depending on webview status
        if (!opts.isUIWebView) {
          window.open(targetUrl,"_blank", windowOptions);
        } else { 
          window.location.href = targetUrl; 
        }
      }; 
    };
  };

  Plugin.prototype.getMeta = function(obj, option){
    option.linkSet = this.getLinks(obj, option.url);
    option.textSet = this.getText(obj, option.shareText);
    option.imageSet = this.getImages(obj, option.shareImage);
  };


  // Returns object of specific share links
  Plugin.prototype.getLinks = function(obj, defaultLink){
    var $obj = $(obj),
        linkObj = {};

    // Set up primary text as either the text set on the container, or the text set in the options 
    linkObj.main = $obj.data("cs-url") || defaultLink || null;

    if (!linkObj.main) {
      console.log("customShare Error: You are missing a primary URL");
    };

    // Waterfall text check 
    linkObj.fb        = $obj.find(".facebook").data("cs-url") || linkObj.main || null;
    linkObj.twitter   = $obj.find(".twitter").data("cs-url") || linkObj.main || null;
    linkObj.pinterest = $obj.find(".pinterest").data("cs-url") || linkObj.main || null;
    linkObj.email     = $obj.find(".email").data("cs-url") || linkObj.main || null;

    return linkObj;
  };


  // Returns object of specific share language
  Plugin.prototype.getText = function(obj, defaultText){
    var $obj = $(obj),
        textObj = {};

    // Set up primary text as either the text set on the container, or the text set in the options 
    textObj.main = $obj.data("cs-text") || defaultText || null;

    if (!textObj.main) {
      console.log("customShare Error: You are missing primary text");
    };

    // Waterfall text check 
    textObj.fb        = $obj.find(".facebook").data("cs-text") || textObj.main || null;
    textObj.fbCaption = $obj.find(".facebook").data("cs-caption") || '';
    textObj.fbDescription = $obj.find(".facebook").data("cs-description") || ' ';
    textObj.twitter   = $obj.find(".twitter").data("cs-text") || textObj.main || null;
    textObj.pinterest = $obj.find(".pinterest").data("cs-text") || textObj.main || null;
    textObj.email     = $obj.find(".email").data("cs-text") || textObj.main || null;

    return textObj;
  };

  // Returns object of all available images 
  Plugin.prototype.getImages = function(obj, defaultImage){
    var $obj = $(obj),
        imageObj = {};

    // Set up primary image as either the image set on the container, or the image set in the options 
    imageObj.main = $obj.data("cs-image") || defaultImage || null;

    if (!imageObj.main) {
      console.log("You are missing a primary image");
    };

    // Waterfall image check 
    imageObj.fb        = $obj.find(".facebook").data("cs-image") || imageObj.main || null;
    imageObj.twitter   = $obj.find(".twitter").data("cs-image") || imageObj.main || null;
    imageObj.pinterest = $obj.find(".pinterest").data("cs-image") || imageObj.main || null;
    imageObj.email     = $obj.find(".email").data("cs-image") || imageObj.main || null;

    return imageObj;
  };
  

  // Boilerplate code for FB & Pinterest
  Plugin.prototype.setBoilerplate = function(opts){
    // Facebook boilerplate ----- */
    window.fbAsyncInit = function() {
      // init the FB JS SDK
      FB.init({
        appId      : opts.fbAppId || null, // App ID from the App Dashboard
        //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
        status     : false, // check the login status upon init?
        cookie     : false, // set sessions cookies to allow your server to access the session?
        xfbml      : false  // parse XFBML tags on this page?
      });
    };

    // Load the SDK's source Asynchronously
    (function(d, debug){
      var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement('script'); js.id = id; js.async = true;
      js.src = (opts.test ? "https:" : "") + "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
      ref.parentNode.insertBefore(js, ref);
    }(document, /*debug*/ false));
    // END Facebook */

    // Pinterest boilerplate ----- */
    (function(d){
      var f = d.getElementsByTagName('SCRIPT')[0], p = d.createElement('SCRIPT');
      p.type = 'text/javascript';
      p.async = true;
      p.src = (opts.test ? "https:" : "") + '//assets.pinterest.com/js/pinit.js';
      f.parentNode.insertBefore(p, f);
    }(document));
    // END Pinterest */
  };


  $.fn[pluginName] = function (options) {
    return this.each(function(){
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
      }
    });
  }

})(jQuery, window, document);