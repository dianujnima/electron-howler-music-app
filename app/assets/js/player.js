'use strict';
angular.module('Player.player', [
	'ngRoute'
])

.config(['$routeProvider',function($routeProvider) {
	$routeProvider
	.when('/player',{
		templateUrl: './assets/views/player.html',
		controller: 'PlayerCtrl'
	})
}])

.controller('PlayerCtrl', ['$scope', '$location', function($scope, $location){
	$scope.musicSelected = false;
	$scope.trackName = null;
	$scope.songsList = null;
	$scope.wave = null;
	$scope.songPlaying = false;
	$scope.playlistVisible = false;
	$scope.updateTimer = "0:00";

	const ipc = require('electron').ipcRenderer;
	
	ipc.on('audio-file', function(event, args) {
		$scope.songsList = args.files;
		console.log($scope.songsList);

		var songsList = [];
		for(var i=0;i<$scope.songsList.length;i++){
          songsList.push(
            {
              title: args.path+'/'+$scope.songsList[i],
              file: args.path+'/'+$scope.songsList[i],
              howl: null,
              name:$scope.songsList[i]
            }
          );
        }
		console.log(songsList);

		$scope.player = new Player(songsList)
		$scope.musicSelected = true;
		$scope.wave = new SiriWave({
			container: waveform,
			width: window.innerWidth,
			height: window.innerHeight * 0.3,
			cover: true,
			speed: 0.05,
			amplitude: 0.7,
			frequency: 2
		});
		$scope.wave.start();
		$scope.$apply();
	});

	$scope.seekToTime = function($event){
		$scope.player.seek($event.clientX / window.innerWidth);
	}

	$scope.playPlaylistSong = function(index){
		if($scope.songPlaying){
			$scope.player.pause();
			$scope.player.play(index);
		}else{
			$scope.player.play(index);
		}
	}

	$scope.prevSong = function(){
		$scope.player.skip('prev');
		$scope.songPlaying = true;
	}

	$scope.nextSong = function(){
		$scope.player.skip('next');
		$scope.songPlaying = true;
	}

	$scope.showPlaylist = function(){
		if($scope.playlistVisible){
			$scope.playlistVisible = false;
		}else{
			$scope.playlistVisible = true;
		}
	}

	$scope.playPause = function(){
        if($scope.songPlaying){
          $scope.songPlaying=false;
          $scope.player.pause();
        }else {
          $scope.songPlaying=true;
          $scope.player.play();
        }
      }
	var Player = function(playlist){
		this.playlist = playlist;
		this.index = 0;
	}

	Player.prototype = {
		play: function(index){
			var self = this;
			var sound = null;
			index = typeof index === 'number' ? index : self.index;
			var data = self.playlist[index];
			$scope.trackName = data.name;
			if(data.howl){
				sound = data.howl;
			}else{
				sound = data.howl = new Howl({
					src: [data.file],
					html5: true,
					onplay: function(){
						$scope.timer = self.formatTime(Math.round(sound.duration()));
						requestAnimationFrame(self.step.bind(self));
						$scope.$apply();
					},
					onend: function(){
						self.skip('right');
					}
				})
			}
			sound.play();
			self.index = index;
		},
		formatTime: function(secs){
			var minutes = Math.floor(secs/60) || 0;
			var seconds = (secs - minutes * 60) || 0;
			return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
		},
		step: function(){
			var self = this;
			var sound = self.playlist[self.index].howl;
			var seek = sound.seek() || 0;

			progress.style.width = (((seek / sound.duration() ) * 100 ) || 0 ) + "%";

			if(sound.playing()){
				$scope.updateTimer = '-'+self.formatTime(Math.round(sound.duration() - seek));
				requestAnimationFrame(self.step.bind(self));
				$scope.$apply();
			}
		},
		pause: function(){
			var self = this;
			var sound = self.playlist[self.index].howl;
			sound.pause();
		},
		skip: function(direction){
			var self = this;
			var index = 0;
			if(direction == 'prev'){
				index = self.index - 1;
				if(index < 0){
					index = self.playlist.length - 1;
				}
			}else{
				index = self.index + 1;
				if(index >= self.playlist.length){
					index = 0;
				}
			}

			self.skipTo(index);
		},
		skipTo: function(index){
			var self = this;
			if(self.playlist[self.index].howl){
				self.playlist[self.index].howl.stop();
			}
			self.play(index);
		},
		seek: function(time){
			var self = this;
			var sound = self.playlist[self.index].howl;
			if(sound.playing()){
				sound.seek(sound.duration() * time);
			}
		}
	}
}])