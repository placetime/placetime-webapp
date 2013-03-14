Application.View.MyCalItem = Backbone.Marionette.ItemView.extend({
    template: '#my-cal-item-template',


    close: function() {
        if (this.isClosed) {
            return;
        }

        this.triggerMethod('item:before:close');

        var self = this;
        this.$el.animate({opacity: 0, height: 0}, 'slow', function () {
            Marionette.View.prototype.close.apply(
                self,
                Array.prototype.slice.apply(arguments)
            );
        });

        this.triggerMethod('item:closed');
    }
});