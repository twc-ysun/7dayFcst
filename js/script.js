/**
 * Created by ysun on 12/1/2016.
 */
angular.module("7dayFcstApp", [])
    .controller("forecastController", function ($scope, $http, $interval) {
        //Initial values
        $scope.days = [0,1,2,3,4,5,6];
        $scope.experiences = [{ expId: 'gaAtlanta', name: 'Atlanta,GA' },
            { expId: 'akAnchorage', name: 'Anchorage,AK' },
            { expId: 'caSanDiego', name: 'San Diego,CA' },
            { expId: 'caLosAngeles', name: 'Los Angeles,CA' },
            { expId: 'caSanFrancisco', name: 'San Francisco,CA' },
            { expId: 'hiHawaii', name: 'Hawaii,HI' },
            { expId: 'ilChicago', name: 'Chicago,IL' },
            { expId: 'nyNewYorkCity', name: 'New York,NY' },
            { expId: 'dcWashington', name: 'Washington,DC' },
            { expId: 'waSeattle', name: 'Seattle,WA' },
            { expId: 'flOrlando', name: 'Orlando,FL' },
            { expId: 'flMiami', name: 'Miami,FL' },
            { expId: 'Default', name: 'National' }];

        var times = 0;

        $scope.getConfig = function (curExp) {
            $http({
                method: 'GET',
                url: 'http://qaottcms.weathergroup.com/api/v1/config/' + curExp.expId + '?apiKey=1',
                timeout: 10000,
                cache: false
            }).success(function (data, status, headers, config) {
                $scope.ottConfig = data;
                console.log("successfully got the config");
                //always load the forecast data when location changes
                $scope.getForecast($scope.ottConfig);
            }).error(function (data, status, headers, config) {
                alert("HTTP or data processing error with status (if any):" + status);
            });
        }

        $scope.getForecast = function (ottConfig) {
            $http({
                method: 'GET',
                url: 'http://api.weather.com/v1/geocode/' + ottConfig.response.primaryLoc.latitude + '/' + ottConfig.response.primaryLoc.longitude + '/forecast/daily/10day.json?apiKey=041173ee22e28efdbf3d4145f128aa6f&language=en-US&units=e',
                timeout: 10000,
                cache: false
            }).success(function (data, status) {
                $scope.forecastData = data;
                $scope.weekendDays = [false, false, false, false, false, false, false];

                for (var i = 0; i < 7; i++) {
                    if ($scope.forecastData.forecasts[i].dow == 'Saturday' || $scope.forecastData.forecasts[i].dow == 'Sunday') {
                        $scope.weekendDays[i] = true;
                    }
                }

                $scope.weatherIconURL = 'http://d22owldznd5yor.cloudfront.net/content/image/iconSets/weather/107x107/';
                console.log("successfully got the forecast");
            }).error(function (data, status) {
                alert('Failed getting SUN data' + status);
            });

            console.log("this is refreshed" + times);
            times++;
        }

        $scope.getInit = function () {
            $scope.getConfig($scope.experiences[0]);
        }

        $scope.theTime = function () {
            $scope.theTime = Date.now();
        }

        $scope.backgroundColor = function (index) {
            return $scope.forecastData.forecasts[index].max_temp
        }
        $interval($scope.theTime, 1000);
        $interval(function() {
            if ($scope.ottConfig) {
                $scope.getForecast($scope.ottConfig);
            }
        }, 60000);

    }) //controller

    .directive('clkDirective', function() {
        return {
            template: "{{theTime | date: 'mediumTime': '-0500'}}"
        }

    })

    //Custome directive for day tomestone
    .directive('tomeStone', function() {
        return {
            template:
            '<h1>{{forecastData.forecasts[i].dow | limitTo:3:0 | uppercase}}</h1>' +
            '<img ng-src="{{weatherIconURL}}{{forecastData.forecasts[i].day.icon_code}}.gif" alt="Icon" width="100" height="100" />' +
            '<h2>{{forecastData.forecasts[i].max_temp ? forecastData.forecasts[i].max_temp : "--"}}</h2>' +
            '<h3>{{forecastData.forecasts[i].min_temp}}</h3>' +
            '<h3>{{forecastData.forecasts[i].day.pop}}%</h3>' +
            '<h4>' +
            '{{forecastData.forecasts[i].day.subphrase_pt1}}<br>' +
            '{{forecastData.forecasts[i].day.subphrase_pt2}}<br>' +
            '{{forecastData.forecasts[i].day.subphrase_pt3}}' +
            '</h4>'
        }
    })