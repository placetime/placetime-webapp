Application.Admin.View.ProfileNew = Backbone.Marionette.ItemView.extend({
    template: {
        type: 'handlebars',
        template: JST['profile-new']
    },
    className: 'layout-container',

    events: {
        'submit form': 'submit'
    },


    submit: function (event) {
        var data = $(event.target).serializeObject();

        var promise = $.ajax({
            url: '/-taddprofile',
            type: 'post',
            data: data
        });

        promise.done(function(){
            Backbone.history.navigate('profile/' + data.pid, true);
        });

        promise.fail(function(){
            // TODO: Display errors
        });


        return false;
    }
});