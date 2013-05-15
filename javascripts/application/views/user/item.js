Application.View.Item = Application.View.TimelineItem.extend({
    template: '#item-template',

    templateHelpers: {
        isEvent: function(ts, event) {
            return Application.Model.Item.prototype.isEvent.apply(
                new Backbone.Model({
                    ts: ts,
                    event: event
                })
            );
        },

        time: function(ts) {
            return Application.Model.Item.prototype.time.apply(
                new Backbone.Model({
                    ts: ts
                })
            );
        }
    },


    className: function() {
        var className = 'item collapsed';

        if (this.model.get('image')) {
            className += ' image';
        }

        // Type
        if (this.model.isEvent()) {
            className += ' event';
        } else if (this.model.isVideo()) {
            className += ' video';
        } else if (this.model.isAudio()) {
            className += ' audio';
        }

        if (this.model.isAdded()) {
            className += ' added';
        }

        // Time
        if (this.model.isPast()) {
            className += ' past';
        }

        return className;
    }
});