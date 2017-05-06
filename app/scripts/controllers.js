'use strict';

angular.module('financeplannerApp')

.controller('ActionsController', ['$scope', 'AuthFactory', function ($scope, AuthFactory) {
    
    $scope.firstName = '';
    
    AuthFactory.myData().query(
        function (response){
            console.log(response);
            if(response[0].firstname.length>0){
                $scope.firstName = " " + response[0].firstname;
            } else {
                
            }
        },
        function (response){
            $scope.message = "Get name error: " + response.status + " " + response.statusText;
        }
    )
    
}])

.controller('StatisticsController', ['$scope', function ($scope) {
    
    
}])

.controller('HistoricalDataController', ['$scope', 'timesheetFactory', 'statisticsFactory', 'ngDialog', function ($scope, timesheetFactory, statisticsFactory, ngDialog) {
    
    $scope.monthYear = '';
    console.log($scope.monthYear);
    $scope.showHistoricalData = false;
    $scope.showLoading = false;
    
    $scope.showHistory = function(){
        
        var date = new Date($scope.monthYear);
        var aYear = date.getFullYear().toString();
        var aMonth = date.getMonth().toString();
        var reqMonthString = aYear.concat(aMonth);
        
        $scope.showLoading = true;
        
        console.log("Requested month: " + reqMonthString);
        
        $scope.timesheetReq = {};
        $scope.statisticsReq = {};
        var timesheet = timesheetFactory.query({id: reqMonthString},
            function (response) {
            
            var statistics = statisticsFactory.query({id: reqMonthString},
                function (response) {
                    $scope.statisticsReq = response;
                    $scope.showHistoricalData = true;
                    $scope.showLoading = false;
                    console.log($scope.statisticsReq);
                },
                function (response) {
                    ngDialog.open({ template: 'views/notfound.html', scope: $scope, className: 'ngdialog-theme-default'});
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                    $scope.showLoading = false;
                }
            );
                $scope.timesheetReq = response;
                console.log($scope.timesheetReq);
            },
            function (response) {
                $scope.showLoading = false;
                ngDialog.open({ template: 'views/notfound.html', scope: $scope, className: 'ngdialog-theme-default'});

                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
        
        
    }
}])

.controller('TimesheetController', ['$scope', 'timesheetFactory', 'statisticsFactory', 'ngDialog', '$state', function ($scope, timesheetFactory, statisticsFactory, ngDialog, $state) {
    
    $scope.message = "Loading ...";
    
    $scope.showTable = false;
    
    $scope.balance = 0;
    $scope.status = "ON TRACK"
    
    $scope.newItem = {
        itemName: '',
        amountPlanned: '',
        amountPaid: '',
        paid: false
    }
    
    $scope.modItem = {
        itemName: '',
        amountPlanned: '',
        amountPaid: '',
        paid: false
    }
    
    $scope.timesheet = {};
    var timesheet = timesheetFactory.query(
            function (response) {
                $scope.timesheet = response;
                $scope.showTable = true;
                console.log($scope.timesheet);
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
   $scope.statistics = [{
                         plannedToSpend: 0,
                         totalSpent: 0,
                         balance: 0
                         }
                         ];
    
    
    statisticsFactory.query(
            function (response) {
                $scope.statistics = response;
                console.log($scope.statistics);
                console.log($scope.statistics.length);
                if ($scope.statistics.length > 0){
                    $scope.balance = $scope.statistics[0].plannedToSpend - $scope.statistics[0].totalSpent;
                } else {
                    $scope.balance = 0;
                    console.log("PAGE RELOAD");
                    $state.go($state.current, {}, {reload: true});                 
                }
                
                console.log("Balance: " + $scope.balance);
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
        
        console.log('Adding new item to timesheet ', $scope.timesheetId);
        
            ngDialog.open({ template: 'views/additem.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"TimesheetHandlingController" });

    };
    
    $scope.doModifyItem = function(newItemName, newAmountPlanned, newAmountPaid, itemId) {
        
        $scope.timesheetId = $scope.timesheet[0]._id;
        $scope.itemId = itemId;
        
        $scope.modItem.itemName = newItemName;
        $scope.modItem.amountPlanned = newAmountPlanned;
        $scope.modItem.amountPaid = newAmountPaid;
        
        console.log('Modifying item ' + itemId + " from: " + $scope.timesheetId);
        
            ngDialog.open({ template: 'views/modifyitem.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"TimesheetHandlingController" });

    };
    
    $scope.doDeleteItem = function(itemId) {
        
        $scope.timesheetId = $scope.timesheet[0]._id;
        $scope.itemId = itemId;
        
        console.log('Deleting item ' + itemId + " from: " + $scope.timesheetId);
        
            ngDialog.open({ template: 'views/deleteitem.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"TimesheetHandlingController" });

    };
    
    $scope.backToActoins = function(){
        $state.go('app.actions');
    }
}])

.controller('TimesheetHandlingController', ['$scope', 'timesheetFactory', 'ngDialog', '$state', 'statisticsFactory', function ($scope, timesheetFactory, ngDialog, $state, statisticsFactory) {
    
    $scope.addItemToDb = function(timesheetId){
        console.log("Add new item to: " + timesheetId + " timesheet");
        console.log("New Values: " + $scope.newItem.itemName + " " + $scope.newItem.amountPlanned);
        //console.log($scope.newItem);
        
        timesheetFactory.save({id: timesheetId}, $scope.newItem ).$promise.then(
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
        
    }
    
    $scope.modifyItemFromTimesheet = function(newItemName, newAmountPlanned, newAmountPaid, timesheetId, itemId){
        console.log("Modify item: " + itemId + " from: " + timesheetId);
        console.log("New values: " + newItemName + " " + newAmountPlanned + " " + newAmountPaid);
        
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
    }
    
    $scope.deleteItemFromTimesheet = function(timesheetId, itemId){
        console.log("Delete item: " + itemId + " from: " + timesheetId);
        
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
    }
    
    var updateStatistics = function(){
        statisticsFactory.query(
            function (response) {
                $scope.statistics = response;
                console.log($scope.statistics);
                $scope.balance = $scope.statistics[0].plannedToSpend - $scope.statistics[0].totalSpent;
                console.log("Balance: " + $scope.balance);
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
    }
    
    $scope.cancelNgDialogue = function() {
        ngDialog.close();
    }
    
}])

.controller('ExpenseController', ['$scope', 'expenseFactory', 'ngDialog', '$state', function ($scope, expenseFactory, ngDialog, $state) {

    $scope.showExpenses = false;
    
    $scope.expenses = [];
    var expenses = expenseFactory.query(
            function (response) {
                $scope.expenses = response;
                $scope.showExpenses = true;
                console.log($scope.expenses);
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    
    $scope.newExpense = {
        expensename: '',
        amount: '',
        frequency: 12,
        createdate: new Date()
    }
    
    $scope.doAddExpense = function() {
        console.log('Adding new expense', $scope.registration);
        
            ngDialog.open({ template: 'views/addexpense.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"ExpenseHandlingController" });

    };
    
    $scope.doModifyExpense = function(newName, newAmount, objectId) {
        console.log('Modifying existing expense ' + objectId + " " + newName + " " + newAmount);
        
        $scope.modExpenseName = newName;
        $scope.modExpenseAmount = newAmount;
        $scope.modExpenseId = objectId;
        
            ngDialog.open({ template: 'views/modifyexpense.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"ExpenseHandlingController" });

    };
    
    $scope.doDeleteExpense = function(objectId) {
        console.log('Deleting expense ' + objectId);
        
        $scope.delExpenseId = objectId;
        
            ngDialog.open({ template: 'views/deleteexpense.html', scope: $scope, className: 'ngdialog-theme-default',    controller:"ExpenseHandlingController" });

    };
    
    $scope.backToActoins = function(){
        $state.go('app.actions');
    }
    
}])

.controller('ExpenseHandlingController', ['$scope', 'expenseFactory', 'ngDialog', '$state', function ($scope, expenseFactory, ngDialog, $state) {

    
    $scope.newExpense = {
        expensename: '',
        amount: '',
        frequency: 12,
        createdate: new Date()
    }
    
    $scope.modExpense = {
        expensename: '',
        amount: '',
        frequency: 12,
        createdate: new Date()
    }
    
    $scope.addExpenseToDb = function(){
        console.log($scope.newExpense);
        
        expenseFactory.save($scope.newExpense).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
        ngDialog.close();
        $state.go($state.current, {}, {reload: true});
    }
    
    $scope.modExpense.amount = $scope.modExpenseAmount;
    $scope.modExpense.expensename = $scope.modExpenseName;
    
    $scope.modifyExpenseInDb = function(newName, newAmount, id){
        console.log("New Parameters: " + newName + " " + newAmount + " " + id);
        
        expenseFactory.update({id: id}, $scope.modExpense).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
        ngDialog.close();
        $state.go($state.current, {}, {reload: true});
    }
    
    $scope.deleteExpenseInDb = function(id){
        console.log("Delete expense: " + id);
        
        expenseFactory.delete({id: id}).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
        ngDialog.close();
        $state.go($state.current, {}, {reload: true});
    }
    
    $scope.cancelNgDialogue = function() {
        ngDialog.close();
    }
    
    
}])


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
.directive('redirectToactions', [ '$state', function($state) {
    console.log("MY DIRECTIVE CALLED...");
    $state.go('app.actions');
    return {
    }
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
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration, function(){
            if ($scope.loggedIn){
            $state.go('app.actions');
        }
        });
        
        ngDialog.close();

    };
}])
;