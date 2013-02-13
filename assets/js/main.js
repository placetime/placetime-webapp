$(function(){


    /* 


    /* 
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    MODELS

    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    */
    var Item = Backbone.Model.extend({idAttribute: "id"});



    var ItemList = Backbone.Collection.extend({
         model: Item


        ,refresh:function () {
            var url = '/-jtl?count=40&pid=' + this.pid + '&status=' + this.status + '&order=' + this.order;
            var self = this;
            $.ajax({
                url:url,
                dataType:"json",
                success:function (data) {
                    console.log("refresh retrieved " + data.length + " items");
                    _.each(data, function(item){
                      var dt = moment(item.ms);
                      item.year = dt.year();
                      item.month = dt.month();
                      item.day = dt.date();
                      item.hours = dt.hours();
                      item.minutes = dt.minutes();
                      item.seconds = dt.seconds();
                      item.fromnow = dt.fromNow();

                    });
                    console.log("resetting");
                    self.reset(data);
                }
            });
        }


    });


    var Credentials = Backbone.Model.extend({

      defaults: {
          pid: null,
          pwd: null
      }
    
      ,url: "/-session"
    
      ,initialize: function () {
        this.validators = {};
        this.validators.pid = function (value) {
            return (value!==null && value.length!==0) ? {isValid: true} : {isValid: false, message: "Please enter your username."};
        };
        this.validators.pwd = function (value) {
            return (value!==null && value.length!==0) ? {isValid: true} : {isValid: false, message: "Please enter your password."};
        };
      }
    
      ,validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
      }
    
      ,validateAll: function () {
        var messages = {};
        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }
        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
      }
    });

  var RegistrationInfo = Backbone.Model.extend({

      defaults: {
           pid: null
          ,pwd: null
          ,name: null
      }
    
      ,url: "/-session"
    
      ,initialize: function () {
        this.validators = {};
        this.validators.pid = function (value) {
            return (value!==null && value.length!==0) ? {isValid: true} : {isValid: false, message: "Please enter your username."};
        };
        this.validators.pwd = function (value) {
            return (value!==null && value.length!==0) ? {isValid: true} : {isValid: false, message: "Please enter your password."};
        };
        this.validators.name = function (value) {
            return (value!==null && value.length!==0) ? {isValid: true} : {isValid: false, message: "Please enter your full name."};
        };
      }
    
      ,validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
      }
    
      ,validateAll: function () {
        var messages = {};
        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }
        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
      }
    });

    var ItemsView = Backbone.View.extend({

        events:{
           'click .promotebtn'          :  'promote'
          ,'click .demotebtn'           :  'demote'
          ,'click .followbtn'           :  'follow'
          ,'click #possiblebtn'         :  'possible'
          ,'click #maybebtn'            :  'maybe'
          ,'click #newbtn'              :  'newitem'
          ,'click #ts'                  :  'ts'
          ,'click #myts'                :  'myts'
          ,'click #ets'                 :  'ets'
          ,'click #myets'               :  'myets'
        }

        ,initialize:function () {
          var self = this;
          this.template = _.template(window.templates['itemlist']);
          this.templateitem = _.template(window.templates['otheritem']);
          this.templatemyitem = _.template(window.templates['myitem']);
          this.templatecalitem = _.template(window.templates['otheritemcal']);
          this.templatemycalitem = _.template(window.templates['myitemcal']);


          this.el = this.options.el;
          this.itemsModel = this.options.itemsModel;
          this.myitemsModel = this.options.myitemsModel;
          this.pid = this.options.pid;
          
          this.itemsModel.bind("reset", this.render, this);
          this.myitemsModel.bind("reset", this.render, this);
          this.scroller1 = null;

        }

        ,render: function(eventName) {


          if (this.scroller1) {
            this.scroller1.destroy();
          }
          if (this.scroller2) {
            this.scroller2.destroy();
          }
          $(this.el).html(this.template({data:{'pid':this.pid}}));

          this.scroller1 = new iScroll('itemslist', {momentum: true, hScrollbar: false, vScroll: true  } );
          this.scroller2 = new iScroll('myitemslist', {momentum: true, hScrollbar: false, vScroll: true } );



          itemsElem = $("#items", this.el);
          myitemsElem = $("#myitems", this.el);

          itemsElem.html('');
          myitemsElem.html('');
          var self = this;

          _.each(this.itemsModel.models, function(item){
            var data = item.toJSON();
            data.action = 'promote';
            if (this.itemsModel.order == "ets") {
              itemsElem.append(this.templatecalitem(data));
            } else {
              itemsElem.append(this.templateitem(data));
            }
          }, this);

          _.each(this.myitemsModel.models, function(item){
            var data = item.toJSON();
            data.action = 'demote';

            if (this.myitemsModel.order == "ets") {
              myitemsElem.append(this.templatemycalitem(data));
            } else {
              myitemsElem.append(this.templatemyitem(data));
            }
          }, this);

          _.defer(_.bind(function () { 

            this.scroller1.refresh(); 
            this.scroller2.refresh(); 
            }, self));

          return this;
        }


        ,promote: function(e) {
          var clickedEl = $(e.currentTarget);
          var id = clickedEl.data("itemid");
          var itemEl = $('#ti-' + id);
          var self = this;
          self.itemsModel.remove(id);

          $.ajax({
              url:'/-tpromote',
              type:'post',
              data: { pid: session.get("pid"), id: id },
              success:function (data) {
                  itemEl.slideUp('slow').fadeOut('slow', function() {
                      self.itemsModel.refresh();
                      self.myitemsModel.refresh();
                      //self.render();
                  });
              }
          });          

          
          return false;
        }

        ,demote: function(e) {
          var clickedEl = $(e.currentTarget);
          var id = clickedEl.data("itemid");
          // alert("Promote item '" + id + "' to maybe list");
          var self = this;
          var itemEl = $('#ti-' + id);

          $.ajax({
              url:'/-tdemote',
              type:'post',
              data: { pid: session.get("pid"), id: id },
              success:function (data) {
                  itemEl.slideUp('slow').fadeOut('slow', function() {
                    self.itemsModel.refresh();
                    self.myitemsModel.refresh();
                  });
              }
          });          

          return false;
        }        

        ,follow: function(e) {
          var clickedEl = $(e.currentTarget);
          var pid = clickedEl.data("pid");
          alert("Follow user '" + pid + "'");
        }


        ,possible: function(e) {
          //this.itemsModel.status = 'p';
          //this.itemsModel.refresh();
        }


        ,maybe: function(e) {
          //this.itemsModel.status = 'm';
          //this.itemsModel.refresh();
        }

        ,newitem: function(e) {
          //alert("Add a new item");
        }


        ,ts: function(e) {
          this.itemsModel.order = "ts";
          this.itemsModel.refresh();
        }  
        
        ,ets: function(e) {
          this.itemsModel.order = "ets";
          this.itemsModel.refresh();
        } 

        ,myts: function(e) {
          this.myitemsModel.order = "ts";
          this.myitemsModel.refresh();
        }  
        
        ,myets: function(e) {
          this.myitemsModel.order = "ets";
          this.myitemsModel.refresh();
        } 
        
    });


    var LoginView = Backbone.View.extend({
      
    
       initialize: function(options) {
       this.template = _.template(window.templates['login']);
       this.render();
      }

      ,render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
      }
    
      ,events: {
        "change" : "change",
        "click .loginBtn" : "beforeLogin"
      }
    
      ,change: function (event) {
        
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        
        
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            addValidationError(target.id, check.message);
        } else {
            removeValidationError(target.id);
        }
      }
    
      ,beforeLogin: function(){
        var check = this.model.validateAll();
        if (check.isValid === false) {
          displayValidationErrors(check.messages);
          return false;
        } else {
          this.login();
        }
        return false;
      },
    
      login: function(){
          var self = this;
          $.ajax({
              url:"/-session"
              ,type:'post'
              ,data: { pid: this.model.get('pid'), pwd: this.model.get('pwd') }
              ,success:function (data) {
                  console.log("Logged in successfully");
                  console.log("doing navigate");
                  session.set("pid",self.model.get('pid'));
                  Backbone.history.navigate("tl", true);
                  console.log("stopped navigate");
              }
              ,error: function (model, response, options) {
                session.set("pid",null);
                console.log("Error thrown when logging in: " + response.responseText);
              }
          });  

      }
    
    });


    var RegisterView = Backbone.View.extend({
      el: "#register"
    
      ,initialize: function(options) {
       this.template = _.template(window.templates['register']);
       this.render();
      }

      ,render:function () {
        $(this.el).html(this.template(this.model.toJSON())).trigger('create');
        return this;
      }
    
      ,events: {
        "change" : "change",
        "click .submitBtn" : "beforeSubmit"
      }
    
      ,change: function (event) {
        
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        
        
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            addValidationError(target.id, check.message);
        } else {
            removeValidationError(target.id);
        }
      }
    
      ,beforeSubmit: function(){
        var check = this.model.validateAll();
        if (check.isValid === false) {
          displayValidationErrors(check.messages);
          return false;
        } else {
          this.submit();
        }
        return false;
      },
    
      submit: function(){
      
          $.ajax({
              url:"/-taddprofile"
              ,type:'post'
              ,data: { pid: this.model.get('pid'), pwd: this.model.get('pwd'), name: this.model.get('name') }
              ,success:function (data) {
                  console.log("Created profile successfully");
                  Backbone.history.navigate("", true);
              }
              ,error: function (model, response, options) {
                console.log("Error thrown when creating profile: " + response.responseText);
              }
          });  

      }
    
    });
  

    var AppRouter = Backbone.Router.extend({

        routes:{
             "login":"login"
            ,"register":"register"
            ,"*default":"timeline"
        }


        ,initialize:function() {
          session.set("ptsession", getCookie("ptsession"));
        }

        ,timeline:function () {
          var self = this;
          session.check( function() {
                          var items = new ItemList();
                          items.order = "ets";
                          items.pid = session.get("pid");
                          items.status = 'p';
                          items.refresh();

                          var myItems = new ItemList();
                          myItems.order = items.order;
                          myItems.pid = items.pid;
                          myItems.status = 'm';
                          myItems.refresh();

                          

                          self.changePage(new ItemsView({ 
                                                           el:$('#content')
                                                          ,itemsModel:items
                                                          ,myitemsModel: myItems
                                                          ,pid: session.get("pid")
                                                        }));

                        }, 
                        function() {
                          self.login();
                        }
                      );
        }

        ,login:function () {
          console.log("Routed to login");
          var self = this;
          session.set("ptsession", null);
          setCookie('ptsession', null);
          this.changePage(new LoginView({el:$('#content'), model: new Credentials()}));
        }

        ,register:function () {
          console.log("Routed to register");
          var self = this;
          session.set("ptsession", null);
          setCookie('ptsession', null);
          this.changePage(new RegisterView({el:$('#content'), model: new RegistrationInfo()} ));
        }        

        ,logout: function() {
          this.login();
        }

        ,changePage:function (view) {
            console.log("Changing view to " + $(view.el).attr('id'));
            view.render();
            if (view.postRender) {
              view.postRender();
            }
        }


    });

    var session = new Session();

    var approute = new AppRouter();
    Backbone.history.start();

});
