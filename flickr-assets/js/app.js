'use strict';

(function () {
	
	var app = angular.module('flickrApp', ['ngRoute', 'ngSanitize', 'ngAnimate']);

	app.config( function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/home', {
				templateUrl: '/flickr-assets/partials/home.html',
				controller: 'HomeController'
			})
			.when('/photo/:photoIndex', {
				templateUrl: '/flickr-assets/partials/photo.html',
				controller: 'PhotoController'
			})
			.otherwise({
				redirectTo: '/home'
			});

		$locationProvider.html5Mode(true);
	});

	app.controller('HomeController', function( $scope, photoService, $filter ) {
		// animate page class - for future development
		$scope.pageClass = 'home-page';
		// used to move content for "published"
		$('.publish-details').appendAround();

		$scope.getData = function() {
			// Call the async method and then do stuff with what is returned inside our own then function
			photoService.async().then(function(d) {
				$scope.posts = d.items;
				// loop through posts and give int value
				angular.forEach($scope.posts, function(post, index) {
					post.index = index;
				});
			});
		};

	 	$scope.getData();

	  	var orderBy = $filter('orderBy');
	  	
	  	$scope.order = function(predicate) {
	  		$scope.posts = orderBy($scope.posts, predicate);
	  	};

	  	$scope.order('title', false);

	});

	app.controller('PhotoController', function( $scope, $routeParams, photoService ) {

		$scope.pageClass = 'photo-page';
 		
		$scope.getData = function(n) {
			// Call the async method and then do stuff with what is returned inside our own then function
			photoService.async().then(function(d) {
				$scope.post = d.items[n];
				$scope.tags = $scope.post.tags.split(" ");
				// make below into a filter
				$scope.author = $scope.post.author.match(/\(([^)]+)\)/)[1];
			});
		};

	  $scope.getData($routeParams.photoIndex);

	});

	// truncate custom filter
    app.filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;
            if (end === undefined)
                end = "...";
            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }
        };
    });

    // custom filter to get name out of brackets
    app.filter('showAuthorName', function() {
    	return function(input) {
    		return input = input.match(/\(([^)]+)\)/)[1];
    	};
    });

    app.directive('backButton', function(){
	    return {
	      restrict: 'A',

	      link: function(scope, element, attrs) {
	        element.bind('click', goBack);

	        function goBack() {
	          history.back();
	          scope.$apply();
	        }
	      }
	    }
	});

	app.factory('photoService', function($http) {
	  var promise;
	  var photoService = {
	    async: function() {
	      if ( !promise ) {
	        // $http returns a promise, which has a then function, which also returns a promise
	        promise = $http.jsonp('//api.flickr.com/services/feeds/photos_public.gne?tags=potato&tagmode=all&format=json&jsoncallback=JSON_CALLBACK').then(function (response) {
	          // The then function here is an opportunity to modify the response
	          // The return value gets picked up by the then in the controller.
	          return response.data;
	        });
	      }
	      // Return the promise to the controller
	      return promise;
	    }
	  };
	  return photoService;
	});

}());
