'use strict';

angular.module('financeplannerApp', ['ui.router','ngResource','ngDialog'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                        controller  : 'HeaderController'
                    },
                    'footer': {
                        //templateUrl : 'views/footer.html',
                    }
                }

            })
        
            // route for the aboutus page
            .state('app.expenses', {
                url:'expenses',
                views: {
                    'content@': {
                        templateUrl : 'views/expenses.html',
                        controller  : 'ExpenseController'                  
                    }
                }
            })
        
            // route for the contactus page
            .state('app.timesheet', {
                url:'timesheet',
                views: {
                    'content@': {
                        templateUrl : 'views/timesheet.html',
                        controller  : 'TimesheetController'                  
                    }
                }
            })

            // route for the menu page
            .state('app.actions', {
                url: 'actions',
                views: {
                    'content@': {
                        templateUrl : 'views/actions.html',
                        controller  : 'ActionsController'
                    }
                }
            })

            // route for the dishdetail page
            .state('app.historical', {
                url: 'historical',
                views: {
                    'content@': {
                        templateUrl : 'views/historical.html',
                        controller  : 'HistoricalDataController'
                   }
                }
            })
        
            // route for the dishdetail page
            .state('app.statistics', {
                url: 'statistics',
                views: {
                    'content@': {
                        templateUrl : 'views/statistics.html',
                        controller  : 'StatisticsController'
                   }
                }
            });
    
        $urlRouterProvider.otherwise('/');
    })
;
