Application.View.Register = Backbone.Marionette.ItemView.extend({
    template: {
        type: 'handlebars',
        template: JST['register']
    },
    className: 'register container',

    events: {
        'submit .register-form': 'submit'
    },


    ui: {
        form: '.register-form',
        error: '.form-error'
    },



    submit: function() {
        var data = this.ui.form.serializeObject();


        var self    = this,
            promise = this.model.set(data).save();

        promise.done(function(){
            Backbone.history.navigate('timeline', true);
        });

        promise.fail(function(){
            if (status === 'error') {
                self.ui.error.text('The pid is already taken');
            } else if (status === 'timeout') {
                self.ui.error.text('The server is experiencing heavy load');
            }
        });

        return false;
    }
});