Application.Model.SearchItem = Application.Model.Item.extend({
    // Non-attributes
    now: false,

    time: function() {
        if (this.isEvent() === true) {
            return moment.unix(
                this.get('event').toString().substr(0, 10)
            );
        } else {
            return moment.unix(
                this.get('added').toString().substr(0, 10)
            );
        }
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


    add: function() {
        var self = this;

        var duration;
        if (typeof this.get('duration') === 'number') {
            duration = this.get('duration');
        } else {
            duration = this.get('duration').original;
        }

        var promise = $.ajax({
            url: '/-tadd',
            type: 'post',
            dataType: 'json',
            data: {
                pid: Application.session.get('pid'),
                link: this.get('link'),
                text: this.get('text'),
                image: this.get('image'),
                media: this.get('media'),
                event: this.get('event'),
                duration: duration
            }
        });

        promise.done(function(data) {
            self.trigger('item:added', data[0]);
        });

        return promise;
    }
});