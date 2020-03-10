/*! AdminLTE app.js
* ================
* Main JS application file for AdminLTE v2. This file
* should be included in all pages. It controls some layout
* options and implements exclusive AdminLTE plugins.
*
* @Author  Almsaeed Studio
* @Support <https://www.almsaeedstudio.com>
* @Email   <abdullah@almsaeedstudio.com>
* @version 2.4.8
* @repository git://github.com/almasaeed2010/AdminLTE.git
* @license MIT <http://opensource.org/licenses/MIT>
*/

// Make sure jQuery has been loaded
if (typeof jQuery === 'undefined') {
    throw new Error('AdminLTE requires jQuery')
    }
      
    /* BoxRefresh()
    * =========
    * Adds AJAX content control to a box.
    *
    * @Usage: $('#my-box').boxRefresh(options)
    *         or add [data-widget="box-refresh"] to the box element
    *         Pass any option as data-option="value"
    */
    +function ($) {
      'use strict';

      var DataKey = 'lte.boxrefresh';

      var Default = {
        source         : '',
        params         : {},
        trigger        : '.refresh-btn',
        content        : '.box-body',
        loadInContent  : true,
        responseType   : '',
        overlayTemplate: '<div class="overlay"><div class="fa fa-refresh fa-spin"></div></div>',
        onLoadStart    : function () {
        },
        onLoadDone     : function (response) {
          return response;
        }
      };

      var Selector = {
        data: '[data-widget="box-refresh"]'
      };

      // BoxRefresh Class Definition
      // =========================
      var BoxRefresh = function (element, options) {
        this.element  = element;
        this.options  = options;
        this.$overlay = $(options.overlayTemplate);

        if (options.source === '') {
          throw new Error('Source url was not defined. Please specify a url in your BoxRefresh source option.');
        }

        this._setUpListeners();
        this.load();
      };

      BoxRefresh.prototype.load = function () {
        this._addOverlay();
        this.options.onLoadStart.call($(this));

        $.get(this.options.source, this.options.params, function (response) {
          if (this.options.loadInContent) {
            $(this.element).find(this.options.content).html(response);
          }
          this.options.onLoadDone.call($(this), response);
          this._removeOverlay();
        }.bind(this), this.options.responseType !== '' && this.options.responseType);
      };

      // Private

      BoxRefresh.prototype._setUpListeners = function () {
        $(this.element).on('click', this.options.trigger, function (event) {
          if (event) event.preventDefault();
          this.load();
        }.bind(this));
      };

      BoxRefresh.prototype._addOverlay = function () {
        $(this.element).append(this.$overlay);
      };

      BoxRefresh.prototype._removeOverlay = function () {
        $(this.$overlay).remove();
      };

      // Plugin Definition
      // =================
      function Plugin(option) {
        return this.each(function () {
          var $this = $(this);
          var data  = $this.data(DataKey);

          if (!data) {
            var options = $.extend({}, Default, $this.data(), typeof option == 'object' && option);
            $this.data(DataKey, (data = new BoxRefresh($this, options)));
          }

          if (typeof data == 'string') {
            if (typeof data[option] == 'undefined') {
              throw new Error('No method named ' + option);
            }
            data[option]();
          }
        });
      }

      var old = $.fn.boxRefresh;

      $.fn.boxRefresh             = Plugin;
      $.fn.boxRefresh.Constructor = BoxRefresh;

      // No Conflict Mode
      // ================
      $.fn.boxRefresh.noConflict = function () {
        $.fn.boxRefresh = old;
        return this;
      };

      // BoxRefresh Data API
      // =================
      $(window).on('load', function () {
        $(Selector.data).each(function () {
          Plugin.call($(this));
        });
      });

    }(jQuery);


    /* BoxWidget()
    * ======
    * Adds box widget functions to boxes.
    *
    * @Usage: $('.my-box').boxWidget(options)
    *         This plugin auto activates on any element using the `.box` class
    *         Pass any option as data-option="value"
    */
    +function ($) {
      'use strict';

      var DataKey = 'lte.boxwidget';

      var Default = {
        animationSpeed : 500,
        collapseTrigger: '[data-widget="collapse"]',
        removeTrigger  : '[data-widget="remove"]',
        collapseIcon   : 'fa-minus',
        expandIcon     : 'fa-plus',
        removeIcon     : 'fa-times'
      };

      var Selector = {
        data     : '.box',
        collapsed: '.collapsed-box',
        header   : '.box-header',
        body     : '.box-body',
        footer   : '.box-footer',
        tools    : '.box-tools'
      };

      var ClassName = {
        collapsed: 'collapsed-box'
      };

      var Event = {
            collapsing: 'collapsing.boxwidget',
            collapsed: 'collapsed.boxwidget',
            expanding: 'expanding.boxwidget',
            expanded: 'expanded.boxwidget',
            removing: 'removing.boxwidget',
            removed: 'removed.boxwidget'        
        };

      // BoxWidget Class Definition
      // =====================
      var BoxWidget = function (element, options) {
        this.element = element;
        this.options = options;

        this._setUpListeners();
      };

      BoxWidget.prototype.toggle = function () {
        var isOpen = !$(this.element).is(Selector.collapsed);

        if (isOpen) {
          this.collapse();
        } else {
          this.expand();
        }
      };

      BoxWidget.prototype.expand = function () {
        var expandedEvent = $.Event(Event.expanded);
        var expandingEvent = $.Event(Event.expanding);
        var collapseIcon  = this.options.collapseIcon;
        var expandIcon    = this.options.expandIcon;

        $(this.element).removeClass(ClassName.collapsed);

        $(this.element)
          .children(Selector.header + ', ' + Selector.body + ', ' + Selector.footer)
          .children(Selector.tools)
          .find('.' + expandIcon)
          .removeClass(expandIcon)
          .addClass(collapseIcon);

        $(this.element).children(Selector.body + ', ' + Selector.footer)
          .slideDown(this.options.animationSpeed, function () {
            $(this.element).trigger(expandedEvent);
          }.bind(this))
          .trigger(expandingEvent);
      };

      BoxWidget.prototype.collapse = function () {
        var collapsedEvent = $.Event(Event.collapsed);
        var collapsingEvent = $.Event(Event.collapsing);
        var collapseIcon   = this.options.collapseIcon;
        var expandIcon     = this.options.expandIcon;

        $(this.element)
          .children(Selector.header + ', ' + Selector.body + ', ' + Selector.footer)
          .children(Selector.tools)
          .find('.' + collapseIcon)
          .removeClass(collapseIcon)
          .addClass(expandIcon);

        $(this.element).children(Selector.body + ', ' + Selector.footer)
          .slideUp(this.options.animationSpeed, function () {
            $(this.element).addClass(ClassName.collapsed);
            $(this.element).trigger(collapsedEvent);
          }.bind(this))
          .trigger(expandingEvent);
      };

      BoxWidget.prototype.remove = function () {
        var removedEvent = $.Event(Event.removed);
        var removingEvent = $.Event(Event.removing);

        $(this.element).slideUp(this.options.animationSpeed, function () {
          $(this.element).trigger(removedEvent);
          $(this.element).remove();
        }.bind(this))
        .trigger(removingEvent);
      };

      // Private

      BoxWidget.prototype._setUpListeners = function () {
        var that = this;

        $(this.element).on('click', this.options.collapseTrigger, function (event) {
          if (event) event.preventDefault();
          that.toggle($(this));
          return false;
        });

        $(this.element).on('click', this.options.removeTrigger, function (event) {
          if (event) event.preventDefault();
          that.remove($(this));
          return false;
        });
      };

      // Plugin Definition
      // =================
      function Plugin(option) {
        return this.each(function () {
          var $this = $(this);
          var data  = $this.data(DataKey);

          if (!data) {
            var options = $.extend({}, Default, $this.data(), typeof option == 'object' && option);
            $this.data(DataKey, (data = new BoxWidget($this, options)));
          }

          if (typeof option == 'string') {
            if (typeof data[option] == 'undefined') {
              throw new Error('No method named ' + option);
            }
            data[option]();
          }
        });
      }

      var old = $.fn.boxWidget;

      $.fn.boxWidget             = Plugin;
      $.fn.boxWidget.Constructor = BoxWidget;

      // No Conflict Mode
      // ================
      $.fn.boxWidget.noConflict = function () {
        $.fn.boxWidget = old;
        return this;
      };

      // BoxWidget Data API
      // ==================
      $(window).on('load', function () {
        $(Selector.data).each(function () {
          Plugin.call($(this));
        });
      });
    }(jQuery);