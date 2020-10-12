'use strict';

angular.module('financeplannerApp')

.controller('ActionsController', ['$scope', 'AuthFactory', function ($scope, AuthFactory) {
    
    $scope.firstName = '';
    
    AuthFactory.myData().query(
        function (response){
            if(typeof response[0].firstname !== 'undefined' && response[0].firstname.length>0){
                $scope.firstName = " " + response[0].firstname;
            } else {
                
            }
        },
        function (response){
            $scope.message = "Get name error: " + response.status + " " + response.statusText;
        }
    );
    
}])

.controller('StatisticsController', ['$scope', function ($scope) {
    
    
}])

.controller('HistoricalDataController', ['$scope', 'timesheetFactory', 'statisticsFactory', 'userSettingsFactory', 'ngDialog', function ($scope, timesheetFactory, statisticsFactory, userSettingsFactory, ngDialog) {
    
    $scope.monthYear = '';
    $scope.showHistoricalData = false;
    $scope.showLoading = false;
    
    $scope.currencyCodeInHC = '';
    
    userSettingsFactory.query(
            function (response) {
                $scope.currencyCodeInHC = response[0].currencySymbol;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
    $scope.showHistory = function(){
        
        var date = new Date($scope.monthYear);
        var aYear = date.getFullYear().toString();
        var aMonth = date.getMonth().toString();
        var reqMonthString = aYear.concat(aMonth);
        
        $scope.showLoading = true;
        
        $scope.timesheetReq = {};
        $scope.statisticsReq = {};
        var timesheet = timesheetFactory.query({id: reqMonthString},
            function (response) {
            
            var statistics = statisticsFactory.query({id: reqMonthString},
                function (response) {
                    $scope.statisticsReq = response;
                    $scope.showHistoricalData = true;
                    $scope.showLoading = false;
                },
                function (response) {
                    ngDialog.open({ template: 'views/notfound.html', scope: $scope, className: 'ngdialog-theme-default'});
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                    $scope.showLoading = false;
                }
            );
                $scope.timesheetReq = response;
            },
            function (response) {
                $scope.showLoading = false;
                ngDialog.open({ template: 'views/notfound.html', scope: $scope, className: 'ngdialog-theme-default'});

                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
        
        
    };
}])

.controller('TimesheetController', ['$scope', 'timesheetFactory', 'userSettingsFactory', 'statisticsFactory', 'ngDialog', '$state', function ($scope, timesheetFactory, userSettingsFactory, statisticsFactory, ngDialog, $state) {
    
    $scope.message = "Loading ...";
    
    $scope.showTable = false;
    
    $scope.balance = 0;
    $scope.status = "ON TRACK";
    
    $scope.newItem = {
        itemName: '',
        amountPlanned: '',
        amountPaid: '',
        paid: false
    };
    
    $scope.modItem = {
        itemName: '',
        amountPlanned: '',
        amountPaid: '',
        paid: false
    };
    
    $scope.currencyCodeForItem = '';
    
    userSettingsFactory.query(
            function (response) {
                $scope.currencyCodeForItem = response[0].currencySymbol;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
    $scope.timesheet = {};
    var timesheet = timesheetFactory.query(
            function (response) {
                $scope.timesheet = response;
                //console.log($scope.timesheet[0].items);
                $scope.showTable = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
        // item in timesheet[0].items

   $scope.statistics = [{
                         plannedToSpend: 0,
                         totalSpent: 0,
                         balance: 0
                         }
                         ];
    
    
    statisticsFactory.query(
            function (response) {
                $scope.statistics = response;
                if ($scope.statistics.length > 0){
                    $scope.balance = $scope.statistics[0].plannedToSpend - $scope.statistics[0].totalSpent;
                } else {
                    $scope.balance = 0;
                    $state.go($state.current, {}, {reload: true});                 
                }
                
                if ($scope.balance >= 0){
                    $scope.status = "ON TRACK";
                } else {
                    $scope.status = "OVERSPEND!!!";
                }
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
    $scope.doAddItem = function() {
        
        $scope.timesheetId = $scope.timesheet[0]._id;
        
            ngDialog.open({ template: 'views/additem.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"TimesheetHandlingController" });

    };
    
    $scope.doModifyItem = function(newItemName, newAmountPlanned, newAmountPaid, itemId) {
        
        $scope.timesheetId = $scope.timesheet[0]._id;
        $scope.itemId = itemId;
        
        $scope.modItem.itemName = newItemName;
        $scope.modItem.amountPlanned = newAmountPlanned;
        $scope.modItem.amountPaid = newAmountPaid;
        
            ngDialog.open({ template: 'views/modifyitem.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"TimesheetHandlingController" });

    };

    $scope.doAddPayment = function(newItemName, newAmountPlanned, newAmountPaid, itemId) {
        
        $scope.timesheetId = $scope.timesheet[0]._id;
        $scope.itemId = itemId;
        
        $scope.modItem.itemName = newItemName;
        $scope.modItem.amountPlanned = newAmountPlanned;
        $scope.modItem.amountPaid = newAmountPaid;
        
            ngDialog.open({ template: 'views/addpayment.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"TimesheetHandlingController" });

    };

    $scope.doCompletePayment = function(newItemName, newAmountPlanned, itemId) {
        
        $scope.timesheetId = $scope.timesheet[0]._id;
        $scope.itemId = itemId;
        
        $scope.modItem.itemName = newItemName;
        $scope.modItem.amountPlanned = newAmountPlanned;
        $scope.modItem.amountPaid = newAmountPlanned;
        
        timesheetFactory.update({id: $scope.timesheetId, itemId: $scope.itemId}, $scope.modItem ).$promise.then(
            function (response) {
                $scope.showLoading = false;
                ngDialog.close();
                updateStatistics();
                $state.go($state.current, {}, {reload: true});           
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
                ngDialog.close();
                $scope.showLoading = false;
            });
    };

    var updateStatistics = function(){
        statisticsFactory.query(
            function (response) {
                $scope.statistics = response;
                $scope.balance = $scope.statistics[0].plannedToSpend - $scope.statistics[0].totalSpent;
                if ($scope.balance >= 0){
                    $scope.status = "ON TRACK";
                } else {
                    $scope.status = "OVERSPEND!!!";
                }
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    };
    
    $scope.doDeleteItem = function(itemId) {
        
        $scope.timesheetId = $scope.timesheet[0]._id;
        $scope.itemId = itemId;
        
            ngDialog.open({ template: 'views/deleteitem.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"TimesheetHandlingController" });

    };
    
    $scope.backToActoins = function(){
        $state.go('app.actions');
    };
}])

.controller('TimesheetHandlingController', ['$scope', 'timesheetFactory', 'ngDialog', '$state', 'statisticsFactory', function ($scope, timesheetFactory, ngDialog, $state, statisticsFactory) {
    $scope.addedAmount;
    $scope.addItemToDb = function(timesheetId){
        
        timesheetFactory.save({id: timesheetId}, $scope.newItem ).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                updateStatistics();
                                //var modifiedItem = Array.find()
                                //console.log()
                                $state.go($state.current, {}, {reload: true});           
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                ngDialog.close();
                                $scope.showLoading = false;
                            });
        
    };
    
    $scope.modifyItemFromTimesheet = function(newItemName, newAmountPlanned, newAmountPaid, timesheetId, itemId){
        
        timesheetFactory.update({id: timesheetId, itemId: itemId}, $scope.modItem ).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                updateStatistics();

                                console.log("Finding new for: " + newItemName);
                                
                                //$scope.timesheet = timesheet;
                                var index = $scope.timesheet[0].items.findIndex(obj => {
                                    return obj._id === itemId
                                  });
                                // We need a response, because the item's _id is changed, so it needs to be read from it!!!
                                var itemsArray = response.items;
                                itemsArray.forEach(element => {
                                    if (element.itemName === newItemName){
                                        $scope.timesheet[0].items[index]._id = element._id;
                                    }
                                });
                                //var index = $scope.timesheet[0].items.find(obj => {
                                //    return obj._id === itemId
                                //  });
                                $scope.timesheet[0].items[index].itemName = newItemName;
                                $scope.timesheet[0].items[index].amountPlanned = newAmountPlanned;
                                $scope.timesheet[0].items[index].amountPaid = newAmountPaid;
                                //$state.go($state.current, {}, {reload: true});           
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                ngDialog.close();
                                $scope.showLoading = false;
                            });
    };

    $scope.addPaymentToTimesheetItem = function(newItemName, newAmountPlanned, newAmountPaid, timesheetId, itemId){
        $scope.modItem.amountPaid = $scope.modItem.amountPaid + $scope.addedAmount;
        timesheetFactory.update({id: timesheetId, itemId: itemId}, $scope.modItem ).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                updateStatistics();
                                $state.go($state.current, {}, {reload: true});           
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                ngDialog.close();
                                $scope.showLoading = false;
                            });
    };
    
    $scope.deleteItemFromTimesheet = function(timesheetId, itemId){
        
        timesheetFactory.delete({id: timesheetId, itemId: itemId}, $scope.newItem ).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                updateStatistics();
                                $state.go($state.current, {}, {reload: true});           
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                ngDialog.close();
                                $scope.showLoading = false;
                            });
    };
    
    var updateStatistics = function(){
        statisticsFactory.query(
            function (response) {
                $scope.statistics = response;
                $scope.balance = $scope.statistics[0].plannedToSpend - $scope.statistics[0].totalSpent;
                if ($scope.balance >= 0){
                    $scope.status = "ON TRACK";
                } else {
                    $scope.status = "OVERSPEND!!!";
                }
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    };
    
    $scope.cancelNgDialogue = function() {
        ngDialog.close();
    };
    
}])

.controller('ExpenseController', ['$scope', '$window', 'expenseFactory', 'userSettingsFactory', 'ngDialog', '$state', function ($scope, $window, expenseFactory, userSettingsFactory, ngDialog, $state) {

    $scope.showExpenses = false;
    
    $scope.currencyCodeForExpense = '';
    
    userSettingsFactory.query(
            function (response) {
                $scope.currencyCodeForExpense = response[0].currencySymbol;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
        // It is called every time the page is rendered
    $scope.expenses = [];
    var expenses = expenseFactory.query(
            function (response) {
                $scope.expenses = response;
                $scope.showExpenses = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
    var newDate = new Date();
    var nextMonth = (parseInt(newDate.getMonth()) + 2);
    
    if (nextMonth > 12){
        nextMonth = nextMonth - 12;
    }
    
    var newExpense = {
        expensename: '',
        amount: '',
        frequency: 12,
        createdate: newDate,
        nextmonth: nextMonth,
        duetomonth: 999912
    };
    
    var modExpense = {
        expensename: '',
        amount: '',
        frequency: '',
        createdate: newDate,
        nextmonth: nextMonth
    };

    $scope.newExpense = newExpense;
    $scope.modExpense = modExpense;
    
    $scope.doAddExpense = function() {
        
            ngDialog.open({ template: 'views/addexpense.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"ExpenseHandlingController" });

    };
    
    $scope.doModifyExpense = function(prevName, prevAmount, objectId, prevFreq, prevNextMonth, dueToMonth) {
        
        // Reading theparameters for the Edit dialogue
        
        $scope.modExpenseName = prevName;
        $scope.modExpenseAmount = prevAmount;
        $scope.modExpenseId = objectId;
        $scope.modExpenseFreq = prevFreq;
        $scope.modExpenseNextMonth = prevNextMonth;
        $scope.duetomonth = dueToMonth;
        
        // Open the Edit dialogue
        
            ngDialog.open({ template: 'views/modifyexpense.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"ExpenseHandlingController" });

    };
    
    $scope.doDeleteExpense = function(objectId) {
        
        $scope.delExpenseId = objectId;
        
            ngDialog.open({ template: 'views/deleteexpense.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"ExpenseHandlingController" });

    };
    
    $scope.backToActoins = function(){
        $state.go('app.actions');
    };
    
}])

.controller('ExpenseHandlingController', ['$scope', '$window', 'expenseFactory', 'ngDialog', '$state', function ($scope, $window, expenseFactory, ngDialog, $state) {

    var currentYear = parseInt(new Date().getFullYear());
    var currentMonth = parseInt(new Date().getMonth());
    $scope.dueToMonthYear = new Date(currentYear+2, currentMonth +2, 1);  
    
    if (typeof $scope.duetomonth !== 'undefined'){
        var aYear = parseInt($scope.duetomonth.toString().substring(0, 4)); 
        var aMonth = parseInt($scope.duetomonth.toString().substring(4, 6));
        $scope.duetoMonthForMP = new Date(aYear, aMonth-1, 1);
    }
    
    $scope.addExpenseToDb = function(){
        
        var date = new Date($scope.dueToMonthYear);
        var aYear = date.getFullYear().toString();
        var aMonth = (date.getMonth()+1).toString();
        var reqMonthString = aYear.concat(aMonth);
        
        $scope.newExpense.duetomonth = reqMonthString;
        
        expenseFactory.save($scope.newExpense).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                $state.go($state.current, {}, {reload: true});
                                
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
    };
    
    $scope.modExpense.amount = $scope.modExpenseAmount;
    $scope.modExpense.expensename = $scope.modExpenseName;
    $scope.modExpense.frequency = $scope.modExpenseFreq;
    $scope.modExpense.nextmonth = $scope.modExpenseNextMonth;
    $scope.modExpense.duetomonth = $scope.duetomonth;
    
    $scope.modifyExpenseInDb = function(newName, newAmount, id){
        
        var date = new Date($scope.duetoMonthForMP);
        var aYear = date.getFullYear().toString();
        var aMonth = (date.getMonth()+1).toString();
        var reqMonthString = aYear.concat(aMonth);
        
        $scope.modExpense.duetomonth = reqMonthString;
        
        expenseFactory.update({id: id}, $scope.modExpense).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                //$state.go($state.current, {}, {reload: true});
                                // Update the $scope.expenses here
                                // find the appropriate id and update that element
                                //console.log("ID: " + id);
                                var index = $scope.expenses.findIndex(obj => {
                                    return obj._id === id
                                  });
                                //console.log(index);
                                $scope.expenses[index].amount = $scope.modExpense.amount;
                                $scope.expenses[index].expensename = $scope.modExpense.expensename;
                                $scope.expenses[index].frequency = $scope.modExpense.frequency;
                                $scope.expenses[index].nextmonth = $scope.modExpense.nextmonth;
                                $scope.expenses[index].duetomonth = $scope.modExpense.duetomonth;                              
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
    };
    
    $scope.deleteExpenseInDb = function(id){
                
        expenseFactory.delete({id: id}).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                $state.go($state.current, {}, {reload: true});
                                
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
    };
    
    $scope.cancelNgDialogue = function() {
        ngDialog.close();
    };

}])

.filter('duetomonthfilter', function() {
  return function(input /*, param1, param2*/) {
      
    if (typeof input !== 'undefined'){
        var aYear = parseInt(input.toString().substring(0, 4)); 
        var aMonth = parseInt(input.toString().substring(4, 6));
    
        var out = aMonth.toString().concat(" / ").concat(aYear.toString());
    
        return out;
    } else {
        return " - ";
    }
  };
})

.filter('customcurrencyfilter', function() {
  return function(input, currCode) {
      
      if (typeof input !== 'undefined' && typeof currCode !== 'undefined'){
          
          //console.log("Price and input defined: " ); 
          
          var price = input.toString();
          var pointsNeeded = Math.floor((price.length-1)/3);
          
		  if (pointsNeeded > 0){
			var priceFormatted = price.split("");
			//console.log("priceFormatted: " + priceFormatted.toString() + " " + priceFormatted.length);
          
			switch (pointsNeeded){
				case 1: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); break;
				case 2: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); break;
				case 3: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); break;
				case 4: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); priceFormatted.splice( (priceFormatted.length-15), 0, "." ); break;
				case 5: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); priceFormatted.splice( (priceFormatted.length-15), 0, "." ); break; priceFormatted.splice( (priceFormatted.length-19), 0, "." ); break;
			}
			
			//console.log("priceFormatted new: " + priceFormatted.toString());
			
			price = priceFormatted.join('');
			
			//console.log("new price string: " + price);
		  }
          
		  
          var out = price.concat(" ").concat(currCode.toString());
          return out;
      } else {
          return " - ";
      }
    
  };
})

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, $state, $rootScope, ngDialog, $localStorage, AuthFactory) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.setUserProps = function () {
        ngDialog.open({ template: 'views/usersettings.html', scope: $scope, className: 'ngdialog-theme-default', controller:"UserSettingsController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
        $state.go('app', {}, {reload: true}); // back to home
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData, function(){
            if ($scope.loggedIn){
            $state.go('app.actions');
        }
        });

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('UserSettingsController', ['$scope', 'userSettingsFactory', 'ngDialog', '$state', function ($scope, userSettingsFactory, ngDialog, $state) {
    
    $scope.userSettings = {
        currencyDecimals : '',
        currencySymbol : '',
        lastname : '',
        firstname : ''
    };
    
    userSettingsFactory.query(
            function (response) {
                $scope.userSettings.currencyDecimals = response[0].currencyDecimals;
                $scope.userSettings.currencySymbol = response[0].currencySymbol;
                $scope.userSettings.lastname = response[0].lastname;
                $scope.userSettings.firstname = response[0].firstname;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
    $scope.modifyUserSettings = function() {
        userSettingsFactory.update($scope.userSettings).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                ngDialog.close();
                                $state.go($state.current, {}, {reload: true});
                                
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
    };
    
    $scope.cancelNgDialogue = function() {
        ngDialog.close();
    };
    
    
}])

.directive('redirectToactions', [ '$state', function($state) {
    $state.go('app.actions');
    return {
    };
}])

.directive('freqnotallowed', [ '$state', function($state) {
    return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
          var blacklist = attr.freqnotallowed.split(',');

          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             var valid = blacklist.indexOf(value) === -1;
             ngModel.$setValidity('freqnotallowed', valid);
             return valid ? value : undefined;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('freqnotallowed', blacklist.indexOf(value) === -1);
             return value;
          });
      }
   };
}])

.controller('LoginController', ['$scope', '$state', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, $state, ngDialog, $localStorage, AuthFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        $state.go('app.actions');

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', '$state', function ($scope, ngDialog, $localStorage, AuthFactory, $state) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {

        AuthFactory.register($scope.registration, function(){
            if ($scope.loggedIn){
            $state.go('app.actions');
        }
        });
        
        ngDialog.close();

    };
}])
;
