;(function ( $, window, document, undefined ) {

  var pluginName = "ColorPairPicker";

  function Plugin ( element, options ) {
      this.element = element;
      this.$el = $(element);
      this._name = pluginName;
      this.colorPickers = $('.color-picker', this.$el),
      this.colorPickerPairs = $('.pickers', this.$el),
      this.init();
  }

  Plugin.prototype = {
    init: function () {
      this.initColorPickers();
    },

    a11yLevels: [
      {
        min: 0,
        status: 'fail',
        color: '#CC0000',
        icon: 'cross'
      },
      {
        min: 3,
        status: 'aa-large',
        color: '#E69900',
        icon: 'warning'
      },
      {
        min: 4.5,
        status: 'aa',
        color: '#B8B82E',
        icon: 'success'
      },
      {
        min: 7,
        status: 'aaa',
        color: '#5EA72A',
        icon: 'success'
      }
    ],


    a11yMessages: {
      'fail': "Doesn't pass accessibility color contrast tests.",
      'aa-large': 'Accessible, but only in large sizes.',
      'aa': 'AA accessible everywhere. AAA accessible in large sizes.',
      'aaa': 'AAA accessible everywhere.'
    },

    hexToR: function(hex) {
      return parseInt((this.cutHex(hex)).substring(0,2),16);
    },

    hexToG: function(hex) {
      return parseInt((this.cutHex(hex)).substring(2,4),16);
    },

    hexToB: function(hex) {
      return parseInt((this.cutHex(hex)).substring(4,6),16);
    },

    cutHex: function(hex) {
      return (hex.charAt(0)=="#") ? hex.substring(1,7) : hex;
    },

    luminanace: function(r, g, b) {
        var a = [r,g,b].map(function(v) {
            v /= 255;
            return (v <= 0.03928) ?
                v / 12.92 :
                Math.pow( ((v+0.055)/1.055), 2.4 );
            });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },

    contrastRatio: function(foreground, background) {
      var fg_R = this.hexToR(foreground),
          fg_G = this.hexToG(foreground),
          fg_B = this.hexToB(foreground),

          bg_R = this.hexToR(background),
          bg_G = this.hexToG(background),
          bg_B = this.hexToB(background),

          fg_luminance = this.luminanace(fg_R, fg_G, fg_B),
          bg_luminance = this.luminanace(bg_R, bg_G, bg_B),

          l1 = fg_luminance + 0.05,
          l2 = bg_luminance + 0.05,

          ratio = l1 < l2 ? l2 / l1 : l1 / l2;

      return Math.round(ratio);
    },

    a11yStatus:  function(foreground, background) {
      var ratio = this.contrastRatio(foreground, background),
          current_status;

      $(this.a11yLevels).each(function() {
        if(ratio >= parseFloat(this.min)) {
          current_status = this;
        }
      });
      return current_status;
    },
    
    generateStatus: function () {
      var _this = this;
      this.colorPickerPairs.each(function() {
        var foreground = $('.foreground', this).val(),
            background = $('.background', this).val(),
            status = _this.a11yStatus(foreground, background);
            
            if (_this.$el.find('label').data('tooltipsy')) {
              _this.$el.find('label').data('tooltipsy').destroy()
            }

            $('.tooltipsy', _this.$el).remove(); // tooltipsy destroy method sometimes fail.

            _this.$el
              .find('label')
              .tooltipsy({
                content: _this.a11yMessages[status.status],
                offset: [5,0],
                css: {
                  'padding': '3px',
                  'max-width': '100px',
                  'font-size': '10px',
                  'text-align': 'center',
                  'color': '#fff',
                  'background-color': '#222',
                  'border': '1px solid #eee',
                  'font-family': '"Helvetica Neue", Helvetica, Arial, freesans, sans-serif'
                }
              })
              .find('span')
              .remove()
              .end()
              .prepend($('<span></span>',{class: status.icon})
              .css("color", status.color));
      });
    },

    initColorPickers: function() {
      var _this = this;
      this.colorPickers.each(function() {
        var el = $(this),
            options = {
              color: el.text(),
              showButtons: false,
              preferredFormat: "hex",
              showInput: true
            };
        el.spectrum(options);
      });
      this.$el.on('dragstop.spectrum', '.color-picker', function(e, color) {
        $(this).val(color.toHexString());
        _this.generateStatus();
      });
      this.generateStatus();
    },
  };

  $.fn[ pluginName ] = function ( options ) {
      this.each(function() {
          if ( !$.data( this, "plugin_" + pluginName ) ) {
              $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
          }
      });
      return this;
  };

})( jQuery, window, document );