/**
 * Home
 * It is starting controller for the Spello App
 *
 * @author Shameer
 * @module Home
 *
 * @param {[type]} $scope [description]
 *
 */
import _ from 'lodash';
import wurl from 'wurl';
 
import homeController from './controllers/home-controller';
import homeTemplate from './views/index.html';

/**
 * Home page routes for the spellodrome student centre.
 * @ngInject
 */
export default function homeRoutes($stateProvider, $urlRouterProvider, $locationProvider) {
  'ngInject';

  // $locationProvider.html5Mode( {
  //   enabled: false,
  //   requireBase: false
  // });

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('spello', {
      url: '',
      abstract: true,
      templateUrl: homeTemplate,
      resolve: {
        /**
         * Check the user authentication
         * @param  {[type]} $q                  [description]
         * @param  {[type]} $timeout            [description]
         * @param  {[type]} $state              [description]
         * @param  {[type]} $location           [description]
         * @param  {[type]} AppConstants        [description]
         * @param  {[type]} EnvEndPointsConfig  [description]
         * @param  {[type]} AppEndPointsService [description]
         * @param  {[type]} Authentication      [description]
         * @return {[type]}                     [description]
         */
        checkAuth: function($q, $timeout, $state, $location, $cookies,
          AppConstants, EnvEndPointsConfig, AppEndPointsService, Authentication){
          'ngInject';


          var authToken   = wurl('?userToken') || $location.search().userToken,
              // When someone come from teacher center or parent App then we receive an AppId.
              redirectAppId = wurl('?appId') || $location.search().appId,
              userDetails = null,
              endPointUrl = EnvEndPointsConfig.get(AppConstants.currentEnv);

          // if(EnvEndPointsConfig.isDev(AppConstants.currentEnv)){
          //   authToken = $cookies.get('auth-token');
          //   userDetails = $cookies.getObject('login-data');
          // }
          authToken = _.trimRight(authToken, '/');

          if(!_.isEmpty(redirectAppId)){
              AppConstants.redirectAppId = redirectAppId;
          }
          
          if(_.isEmpty(authToken) || authToken == "true"){
            /**
             * Steps
             * - Get the end points url
             * - Go to login page
             */
            
            AppEndPointsService.fetch(endPointUrl, function(){
              $state.go('spello.login');
            });

            return $q.resolve();

          }else{
            /**
             * Steps
             * - Get the end points urls
             * - Validate the auth token
             * - Validate the auth token
             * - If valid then redirect to splash controller
             * - else send to login page
             */
            var onSuccess = function(userData){
              // Set the user details from cookies
              // if(EnvEndPointsConfig.isDev(AppConstants.currentEnv)){
                // Authentication.setAuthToken(userDetails);
                
                userDetails = {AuthToken: authToken, userData: userData}
                Authentication.setAuthToken(userDetails);

              // }
              $timeout(function(){
                $state.go('spello.splash');
              });
              $q.resolve();
            }, 

            onFailure = function(){
              $state.go('spello.login');
              $q.reject();
            };

            AppEndPointsService.fetch(endPointUrl, function(error){
              if(error){
                return $q.reject();
              }else{
                Authentication.isValidAuthToken(authToken, onSuccess, onFailure);
              }
            });
          }

          return $q.promise;
        }
      }
    })
     .state('spello.home', {
      url: '/',
      template: '<div><ui-view></ui-view></div>',
      controller : homeController
    });
}

