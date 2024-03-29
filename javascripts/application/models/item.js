Application.Model.Item = Backbone.Model.extend({
    // Non-attributes
    now: false,

    defaults: {
        via: undefined,
        image: undefined,
        media: undefined,
        duration: {
            days: undefined,
            hours: undefined,
            minutes: undefined,
            seconds: undefined,
            original: undefined
        }
    },


    initialize: function(data) {
        if (data && data.duration) {
            this.set('duration', this.duration(data.duration));
        }
    },


    idSafe: function() {
        return this.id.replace(/@/, '\\@');
    },


    duration: function(secs) {
        var current = moment(),
            duration = moment();

        duration.add('seconds', secs);

        var days    = duration.diff(current, 'days'),
            hours   = duration.diff(current, 'hours'),
            minutes = duration.diff(current, 'minutes'),
            seconds = duration.diff(current, 'seconds');

        return {
            days: days,
            hours: (hours  - (days * 24)),
            minutes: (minutes - (hours * 60)),
            seconds: (seconds - (minutes * 60)),
            original: secs
        };
    },


    time: function() {
        return moment.unix(
            this.get('ts').toString().substr(0, 10)
        );
    },


    isNow: function() {
        return this.now;
    },


    isPast: function() {
        return this.time().diff() < 0;
    },


    isToday: function() {
        return Math.abs(this.time().diff()) < moment().add('day', 1).diff();
    },


    hasEvent: function() {
        return this.get('event') !== 0;
    },


    isEvent: function() {
        return this.get('media') === 'event';
    },


    isVideo: function() {
        return this.get('media') === 'video';
    },


    isAudio: function() {
        return this.get('media') === 'audio';
    },


    isText: function() {
        return this.get('media') === 'text';
    },


    isAdded: function() {
        return this.get('ts').toString().substr(0, 10) === this.get('added').toString();
    },


    save: function() {
        var promise = $.ajax({
            url: '/-tadd',
            type: 'post',
            data: {
                pid: Application.session.get('pid'),
                link: this.get('link'),
                text: this.get('text'),
                image: this.get('image').replace('/-img/', ''),
                media: this.get('media'),
                event: this.get('event'),
                duration: this.get('duration')
            }
        });

        return promise;
    },


    detect: function(best) {
        if (best === false) {
            best = 0;
        } else {
            best = 1;
        }

        var promise = $.ajax({
            url: '/-jdetect',
            dataType: 'json',
            data: {
                url: this.get('link'),
                best: best
            }
        });

        return promise;
    },


    flag: function() {
        this.trigger('flagged', this.attributes);

        var promise = $.ajax({
            url: '/-tflagprofile',
            type: 'post',
            data: {
                pid: this.get('pid')
            }
        });

        return promise;
    },



    promote: function() {
        var self = this;

        var promise = $.ajax({
            url: '/-tpromote',
            type: 'post',
            dataType: 'json',
            data: {
                pid: Application.session.get('pid'),
                id: this.get('id')
            }
        });

        promise.done(function(data){
            _.each(data, function(item){
                item.promoted = true;
            });

            self.trigger('item:promoted', data);
        });

        return promise;
    },



    demote: function() {
        var self = this;

        var promise = $.ajax({
            url: '/-tdemote',
            type: 'post',
            data: {
                pid: Application.session.get('pid'),
                id: this.get('id')
            }
        });

        promise.done(function(data){
            _.each(data, function(item){
                item.demoted = true;
            });

            self.trigger('item:demoted', self);
        });

        return promise;
    }
});