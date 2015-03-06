require('./style.css');
var angular = require('angular');
var _ = require('lodash');

var DAYS = _.range(1, 32).map((day) => ("Oct " + day));

var randomMillis = function() {
  return Math.floor(Math.random() * 10000);
}

angular.module("myapp", []).
directive("myCalendar", function() {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        template:`
          <div>
           <button class="btn" ng-hide="loaded" ng-click="load()">Load</button>
           <button class="btn" ng-show="loaded" ng-click="searchAll()">Search all month</button>
           <table ng-if="loaded">
            <tr>
             <th ng-repeat="day in days" class="day-header">
               {{day}}
             </th>
            </tr>
            <tr ng-repeat="hour in hours">
             <td ng-repeat="day in days" class="hour-cell">
               <my-calendar-cell hour="{{hour}}" day="{{day}}"></my-calendar-cell>
             </td>
            </tr>
           </table>
         </button>
         `,
        link: function(scope, element, attrs) {
            scope.loaded = false;
            scope.hours = _.range(24);
            scope.days = DAYS;

            scope.searchAll = function() {
              scope.$broadcast('allSearchRequested');
            }

            scope.load = function() {
              scope.loaded = true;
            }
        }
    }
}).
directive("myCalendarCell", function() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    template: `
      <div ng-click="cellClicked(day, hour)" ng-class="cellClass()">
        <div ng-if="showHour()" class="time">
          {{hour}}:00
        </div>
        <div ng-if="showSpinner()">
          ...
        </div>
        <div ng-if="showSearchResults()">
          <div>{{status.searchResults.options}}</div>
          <div class="result-label">results</div>
        </div>
      </div>
      `,
    link: function(scope, element, attrs) {
      scope.day = attrs.day;
      scope.hour = attrs.hour;
      scope.status = {};
    },
    controller: function($scope, $rootScope, $timeout) {
      $scope.showSpinner = function() {
        return $scope.status.isSearching;
      }
      $scope.showHour = function() {
        return !$scope.status.isSearching && !$scope.status.searchResults;
      }
      $scope.showSearchResults = function() {
        return $scope.status.searchResults;
      }
      $scope.cellClass = function() {
        if ($scope.status.isSearching) {
          return 'searching';
        } else if ($scope.status.searchResults) {
          if ($scope.status.searchResults.options > 3) {
            return 'good-results'
          } else if ($scope.status.searchResults.options > 1) {
            return 'weak-results'
          } else {
            return 'bad-results'
          }
        }
      }
      $scope.cellClicked = function() {
        delete $scope.status.searchResults;
        $scope.status.isSearching = true;
        // Simulate an AJAX request:
        $timeout(function() {
          $scope.status.isSearching = false;
          $scope.status.searchResults = {options: Math.floor(Math.random() * 5)};
        }, randomMillis());
      }
      $scope.$on('allSearchRequested', function() {
        $scope.cellClicked();
      });
    }
  }
}).

directive("myCalendarReact", function() {
  return {
    restrict: 'E',
    scope: true,
    template: '<div></div>',
    link: function(scope, element, attrs) {
      // React and Angular, living in harmony:
      React.render(<Calendar/>, element[0]);
    }
  }
});


/* React Components */

var EventEmitter = require('events');
var React = require('react/addons');

var Cell = React.createClass({
  render: function() {
    if (this.state.isSearching) {
      return (
        <td className='hour-cell'>
          <div className='searching'>
            ...
          </div>
        </td>
      );
    } else if (this.state.searchResults) {
      var options = this.state.searchResults.options;
      var classes = React.addons.classSet({
        'good-results': options > 3,
        'weak-results': options > 1 && options <= 3,
        'bad-results' : options >= 0 && options <= 1
      });
      return (
        <td className='hour-cell' onClick={this.clicked}>
          <div className={classes}>
            <div>{this.state.searchResults}</div>
            <div className="result-label">results</div>
          </div>
        </td>
      );
    } else {
      return (
        <td className='hour-cell' onClick={this.clicked}>
          <div className='time'>
            {this.props.hour}:00
          </div>
        </td>
      );
    }
  },
  getInitialState: function() {
    return {
      isSearching: false,
      searchResults: null
    }
  },
  clicked: function() {
    this.search();
  },
  search: function() {
    var self = this;
    self.setState({
      isSearching: true,
      searchResults: {options: null}
    });
    setTimeout(function() {
      self.setState({
        isSearching: false,
        searchResults: {options: Math.floor(Math.random() * 5)}
      });
    }, randomMillis());
  },
  componentWillMount: function() {
    this.props.events.on('search', () => this.search());
  }
});

var Calendar = React.createClass({
  render: function() {
    return (
      <div>
        {this.state.isLoaded ||
         <button className='btn' onClick={this.load}>Load</button>}
        {this.state.isLoaded &&
         <button className='btn' onClick={this.searchAll}>Search all month</button>}
        {this.state.isLoaded &&
         <table>
           <tr>
             {DAYS.map((day) => (
               <th className='day-header' onClick={this.clicked}>{day}</th>
             ))}
           </tr>
           {_.range(24).map((hour) => (
             <tr>
               {DAYS.map((day) => (
                 <Cell hour={hour} day={day} key={day} events={this.events} />
               ))}
             </tr>
           ))}
         </table>
        }
      </div>
      )
  },
  componentWillMount: function() {
    this.events = new EventEmitter();
    this.events.setMaxListeners(0);
  },
  getInitialState: function() {
    return {
      isLoaded: false
    }
  },
  load: function() {
    this.setState({isLoaded: true});
  },
  searchAll: function(args) {
    this.events.emit('search');
  }
});
