Application.View.Timeline = Backbone.Marionette.ItemView.extend({
    name: 'timeline',
    template: {
        type: 'handlebars',
        template: JST['timeline']
    },
    className: 'layout-column',

    refreshLastUpdate: moment().subtract('seconds', 2),
    infiniteScrollReference: null,
    infiniteScrollScrollTop: 0,
    infiniteScrollLastUpdate: moment().subtract('seconds', 2),

    initialEvents: function() {
        $(window).on('resize', _.bind(this.resize, this));

        // On view change update model
        // TODO: Find better way
        this.on('all', function(event) {
            var match = event.match(/view:(.*)/);

            if (match === null) {
                return;
            }

            this.model.set('view', match[1]);
        });

        // Pass event to current view
        this.on('item:add', function(event) {
            this.regionManager.get('collection').currentView.trigger('item:add', event);
        });

        this.on('scrollTo:before', function(event) {
            this.regionManager.get('collection').currentView.trigger('scrollTo:before', event);
        });

        this.on('scrollTo:after', function(event) {
            this.regionManager.get('collection').currentView.trigger('scrollTo:after', event);
        });


        // Load timeline view
        this.on('view:timeline', function(options){
            this.timeline(options);
        });

        // Scroll to
        this.on('scrollTo', this.scrollTo);
        this.on('scrollTo:before', this.scrollToBefore);
        this.on('scrollTo:after', this.scrollToAfter);

        // Infinite scroll
        this.on('scroll', this.infiniteScroll);
    },


    bindEvents: function(view) {
        var self = this;

        if (view.collection) {
            this.listenToOnce(view.collection, 'sync', function(event){
                this.now();
            });
        }

        // On show resize the child
        this.listenTo(view, 'show', this.resize);

        // On render resize the child
        this.listenTo(view, 'render', this.resize);

        // On scroll trigger infinite scroll
        this.listenTo(view, 'scroll', this.infiniteScroll);

        // Handle scroll to requests
        this.listenTo(view, 'scrollTo', this.scrollTo);
    },


    resize: function() {
        // TODO: Make -60 dynamic
        this.$el.find('.scroller').height(
            $(window).height() - 60
        );
    },


    reload: function() {
        this.regionManager.get('collection').currentView.trigger('reload', this);
    },


    now: function() {
        this.regionManager.get('collection').currentView.trigger('now', this);
    },


    refresh: function() {
        if (moment().diff(this.refreshLastUpdate) < 1000) {
            return;
        }

        this.refreshLastUpdate = moment();
        this.listenToOnce(this.regionManager.get('collection').currentView, 'reload:done', function(){
            this.now();
        });
        this.listenToOnce(this.regionManager.get('collection').currentView, 'now:done', function(){
            this.refreshLastUpdate = moment();
        });

        this.reload();
    },


    onRender: function() {
        this.regionManager = new Marionette.RegionManager();
        this.regionManager.addRegions({
            'header': {
                parentEl: this.$el,
                selector: '.timeline-header'
            },
            'collection': {
                parentEl: this.$el,
                selector: '.timeline-collection'
            }
        });

        // Load view
        this.trigger('view:' + this.model.get('view'), this.model.get('options'));
    },



    scrollTo: function(event) {
        var self = this;


        var $scroller = this.$el.find('.scroller');

        // Already there
        if (event.top === $scroller.scrollTop()) {
            return;
        }

        self.trigger('scrollTo:before');

        $scroller.animate({
            scrollTop: event.top,
            scrollLeft: event.left
        }, event.duration, function(){
            self.trigger('scrollTo:after');
        });
    },



    scrollToBefore: function() {
        this.scrollToScrolling = true;
    },


    scrollToAfter: function(event) {
        // Defer scroll to after
        var deferred = _.bind(function(){
            this.scrollToScrolling = false;
        }, this, event);

        clearTimeout(this.scrollToReference);


        this.scrollToReference = setTimeout(deferred, 150);
    },



    infiniteScroll: function(event) {
        var deferred = _.bind(this.infiniteScrollDeferred, this, event);


        clearTimeout(this.infiniteScrollReference);

        // Scrolling
        if (this.scrollToScrolling === true) {
            return;
        } else {
            this.infiniteScrollReference = setTimeout(deferred, 150);
        }
    },


    infiniteScrollDeferred: function(event) {
        var $target = $(event.target);


        // Threshold, 10 before end
        var threshold = (140 * 20);

        // Current scrollTop, maxScrollTop
        var scrollTop = $target.scrollTop(),
            maxScrollTop = $target.find('.collection-children').height();

        // Loading
        if (this.infiniteScrollLoading === true) {
            return;
        }

        else if (moment().diff(this.infiniteScrollLastUpdate) < 2000) {
            return;
        }

        // Top infinite scroll
        else if (Math.abs(scrollTop) < threshold) {
            this.infiniteScrollScrollTop  = scrollTop;
            this.infiniteScrollLastUpdate = moment();

            var collection = this.regionManager.get('collection').currentView;
                collection.trigger('infinite:load', {after: true});

            this.listenToOnce(collection, 'infinite:done', function(data) {
                this.$el.find('.scroller').scrollTop(this.infiniteScrollScrollTop);
            });
        }

        // Bottom infinite scroll
        else if (Math.abs(scrollTop) > Math.abs(maxScrollTop - threshold)) {
            this.infiniteScrollLastUpdate = moment();
            this.regionManager.get('collection').currentView.trigger('infinite:load', {before: true});
        }

        // Somewhere inbetween
        else {
            return;
        }
    }
});