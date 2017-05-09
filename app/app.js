'use strict';
angular.module('Player', [
	'ngRoute',
	'Player.player',
	'rzModule'
])

.config(['$routeProvider',function($routeProvider) {
	$routeProvider
	.otherwise({redirectTo: '/player'})
}])
