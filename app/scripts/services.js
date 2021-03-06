'use strict';

angular.module('financeplannerApp')
//.constant("baseURL", "https://financeplannerlite.mybluemix.net/")
.constant("baseURL", "http://104.155.156.243:3000/")
//104.155.156.243
//.constant("baseURL", "http://localhost:3000/")
.factory('expenseFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "expenses/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('timesheetFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "timesheets/:id/:itemId", {id:"@Id", itemId: "@ItemId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('statisticsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    return $resource(baseURL + "statistics/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    };
}])

.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', function($resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken = undefined;
    

  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
      isAuthenticated = true;
      username = credentials.username;
      authToken = credentials.token;
      
      // Set the token as header for your requests!
      $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData, callback) {
        
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, token: response.token});
              $rootScope.$broadcast('login:Successful');
              callback();
           },
           function(response){
              isAuthenticated = false;
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>';
            
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        
        );

    };
    
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData, callback) {
        
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password}, callback);
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }
           
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';

                ngDialog.openConfirm({ template: message, plain: 'true'});

           }
        
        );
    };
    
    authFac.myData = function(){
        return $resource(baseURL + "users/mydata", null, {
                
            });
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };

    authFac.deleteToken = function() {
        return destroyUserCredentials;
    }
    

    loadUserCredentials();
    
    return authFac;
    
}])

.factory('userSettingsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    return $resource(baseURL + "users/mydata", null, {
            'update': {
                method: 'PUT'
            }
        });

}])

// this is unused code so far...
.service('dataShareService', function() {
  var dataList = [];

  var addData = function(newObj) {
      dataList.push(newObj);
  };

  var getData = function(){
      return dataList;
  };

  return {
    addData: addData,
    getData: getData
  };

});