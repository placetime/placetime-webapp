Application.Admin.View.ProfileView = Backbone.Marionette.ItemView.extend({
    template: {
        type: 'handlebars',
        template: JST['profile-view']
    },
    className: 'layout-container',

    events: {
        'click .profile-edit': 'edit',
        'click .profile-add': 'add'
    },


    edit: function () {
        Backbone.history.navigate('profile/' + this.model.get('pid') + '/feed/edit/', true);

        return false;
    },


    add: function () {
        Backbone.history.navigate('profile/' + this.model.get('pid') + '/feed/new', true);

        return false;
    },



    // TODO: Insert dynamically to all pages
    onShow: function() {
        var view = new Application.Admin.View.Back();
            view.render();

        this.$el.prepend(view.el);
    },


    onRender: function() {
        var view = new Application.Admin.View.ItemListBrief({
            collection: new Application.Collection.ItemsProfile({
                pid: this.model.get('pid')
            })
        });

        this.$el.find('.profile-items').append(view.el);
    }
});