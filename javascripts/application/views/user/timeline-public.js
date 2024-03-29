Application.View.TimelinePublic = Application.View.Timeline.extend({
    name: 'timeline-public',
    className: 'layout-column public',



    initialize: function(options) {
        this.initialEvents();

        // Handle
        this.on('view:followings', function(pid){
            this.followings(pid);
        });

        this.on('view:followers', function(pid){
            this.followers(pid);
        });

        this.on('view:search', function(options){
            this.search(options);
        });
    },



    timeline: function(options) {
        var status, pid;
        if (options.pid === undefined) {
            pid    = this.model.get('pid');
            status = 'p';
        } else {
            pid    = options.pid;
            status = 'm';
        }

        var collection = new Application.Collection.Items(undefined, {
            status: status,
            pid: pid
        });

        var model = new Backbone.Model({
            loading: true,
            pid: pid,
            status: status
        });

        var view = new Application.View.Items({
            collection: collection,
            model: model
        });

        this.bindEvents(view);


        // Bubble
        this.listenTo(view, 'item:promoted', function(event) {
            this.trigger('item:promoted', event);
        });

        this.regionManager.get('collection').show(view);
    },



    followings: function(options) {
        var pid;
        if (options.pid === undefined) {
            pid = this.model.get('pid');
        } else {
            pid = options.pid;
        }

        var collection = new Application.Collection.Followings();

        var model = new Backbone.Model({
            loading: true,
            pid: pid,
            count: 20,
            start: 10
        });

        var view = new Application.View.Followings({
            collection: collection,
            model: model
        });

        this.bindEvents(view);

        this.regionManager.get('collection').show(view);
    },



    followers: function(options) {
        var pid;
        if (options.pid === undefined) {
            pid = this.model.get('pid');
        } else {
            pid = options.pid;
        }

        var collection = new Application.Collection.Followers();

        var model = new Backbone.Model({
            loading: true,
            pid: options.pid,
            count: 20,
            start: 10
        });

        var view = new Application.View.Followers({
            collection: collection,
            model: model
        });

        this.bindEvents(view);

        this.regionManager.get('collection').show(view);
    },



    search: function(options) {
        var collection = new Application.Collection.Searches();

        var search = options.search,
            type   = options.type;

        var model = new Backbone.Model({
            loading: true,
            s: search,
            t: type
        });

        var view = new Application.View.Searches({
            collection: collection,
            model: model
        });

        this.bindEvents(view);

        // Bubble
        this.listenTo(view, 'item:added', function(event) {
            this.trigger('item:added', event);
        });

        this.regionManager.get('collection').show(view);
    },



    onRender: function() {
        this.constructor.__super__.onRender.call(this, arguments);

        // Create header
        var header = new Application.View.PublicTimelineHeader({
            model: this.model
        });

        this.listenTo(header, 'refresh', this.refresh);


        // Show header
        this.regionManager.get('header').show(header);
    }
});