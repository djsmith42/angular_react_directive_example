/**
 * @jsx React.DOM
 */

var HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
var DAYS  = ["1 October", "2 October", "3 October", "4 October", "5 October", "6 October", "7 October", "8 OCtober", "9 October", "10 October", "11 October", "12  October", "13 October", "14 October", "15 October", "16 October", "17 October", "18 October", "19 October", "20 October"] //, "21 October", "22 October", "23 October", "24 October", "25 October", "26 October", "27 October", "28 October", "29 October", "30 October", "31 October"];

var randomMillis = function() {
  return Math.floor(Math.random() * 1000);
}

angular.module("myapp", []).
directive("myCalendar", function() {
    return {
        restrict: 'E',
        scope: {},
        replace: true,
        template:
            '<div class="calendar">' +
            ' <button class="btn" ng-click="searchAll()">Search all month</button>' +
            ' <table>' +
            '  <tr>' +
            '   <th ng-repeat="day in days" class="day-header" ng-click="dayHeaderClicked(day)">' +
            '     {{day}}' +
            '   </th>' +
            '  </tr>' +
            '  <tr ng-repeat="hour in hours">' +
            '   <td ng-repeat="day in days" class="hour-cell">' +
            '     <my-calendar-cell hour="{{hour}}" day="{{day}}"></my-calendar-cell>' +
            '   </td>' +
            '  </tr>' +
            ' </table>' +
            '</button>',
        link: function(scope, element, attrs) {
            scope.hours = HOURS;
            scope.days  = DAYS;

            scope.searchAll = function() {
              scope.$broadcast('allSearchRequested');
            }

            scope.dayHeaderClicked = function(day) {
              scope.$broadcast('daySearchRequested', day);
            }
        }
    }
}).
directive("myCalendarCell", function() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    template:
      '<div ng-click="cellClicked(day, hour)" ng-class="cellClass()">' +
      '  <div ng-if="showSpinner()">' +
      '    Searching' +
      '  </div>' +
      '  <div ng-if="showHour()" class="time">' +
      '    {{hour}}:00' +
      '  </div>' +
      '  <div ng-if="showSearchResults()">' +
      '    <div>{{status.searchResults.options}}</div>' +
      '    <div>results</div>' +
      '  </div>' +
      '</div>',
    link: function(scope, element, attrs) {
      scope.day = attrs.day;
      scope.hour = attrs.hour;
      scope.status = {};
    },
    controller: function($scope, $timeout, $rootScope) {
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
        var alreadySearching = $scope.status.isSearching;
        delete $scope.status.searchResults;
        $scope.status.isSearching = !alreadySearching;
        if (!alreadySearching) {
          // Simulate an AJAX request:
          $timeout(function() {
            $scope.status.isSearching = false;
            $scope.status.searchResults = {options: Math.floor(Math.random() * 5)};
          }, randomMillis());
        }
      }
      $scope.$on('daySearchRequested', function(event, day) {
        if (day == $scope.day) {
          $scope.cellClicked();
        }
      });
      $scope.$on('allSearchRequested', function() {
        $scope.cellClicked();
      });
    }
  }
}).
directive("myCalendarReact", function() {
  return {
    restrict: 'E',
    scope: {},
    template: '<div></div>',
    link: function(scope, element, attrs) {
      var cellCache = {};
      for (var i=0; i<DAYS.length; i++) {
        cellCache[DAYS[i]] = {}
      }

      function _searchCell(day, hour) {
        var cell = cellCache[day][hour];
        cell.setState({isSearching: true, searchResults: null});
        setTimeout(function() {
          cell.setState({
            isSearching: false,
            searchResults: {options: Math.floor(Math.random() * 5)}
          });
        }, randomMillis());
      }

      var HeaderCell = React.createClass({
        render: function() {
          return (<th className='day-header' onClick={this.clicked}>{this.props.day}</th>)
        },
        clicked: function() {
          for (var i=0; i < HOURS.length; i++) {
            _searchCell(this.props.day, HOURS[i]);
          }
        }
      });

      var HeaderRow = React.createClass({
        render: function() {
          var headerCells = [];
          for (var i=0; i < DAYS.length; i++) {
            headerCells.push(HeaderCell({day: DAYS[i]}));
          }
          return (<tr>{headerCells}</tr>);
        }
      });

      var Cell = React.createClass({
        render: function() {
          var options = this.state.searchResults && this.state.searchResults.options;
          var classes = React.addons.classSet({
            'time'        : !this.state.isSearching && options === undefined,
            'searching'   : this.state.isSearching,
            'good-results': options && options > 3,
            'weak-results': options && options > 1 && options <= 3,
            'bad-results' : options === 0 || options === 1
          });
          if (this.state.isSearching) {
            return (
              <td className='hour-cell'>
                <div className={classes}>Searching</div>
              </td>
              );
          } else if (this.state.searchResults) {
            return (
              <td className='hour-cell' onClick={this.clicked}>
                <div className={classes}>
                  <div>{this.state.searchResults}</div>
                  <div>results</div>
                </div>
              </td>
              );
          } else {
            return (
              <td className='hour-cell' onClick={this.clicked}>
                <div className={classes}>
                  {this.props.hour}:00
                </div>
              </td>
              );
          }
        },
        getInitialState: function() {
          return {
            isSearching: false
          }
        },
        componentDidMount: function() {
          cellCache[this.props.day][this.props.hour] = this;
        },
        clicked: function() {
          var props = this.props;
          if (!this.state.isSearching) {
            _searchCell(props.day, props.hour);
          }
        }
      });

      var Row = React.createClass({
        render: function() {
          var cells = [];
          for (var i=0; i < DAYS.length; i++) {
            var day = DAYS[i];
            var cell = Cell({hour: this.props.hour, day: day});
            cells.push(cell);
          }
          return (<tr>{cells}</tr>)
        }
      });

      var Calendar = React.createClass({
        render: function() {
          var headerRow = HeaderRow();

          var rows = [];
          for (var i=0; i < HOURS.length; i++) {
            var hour = HOURS[i];
            rows.push(Row({hour: hour}));
          }

          return (
            <div className='calendar'>
              <button className='btn' onClick={this.searchAll}>Search all month</button>
              <table>
                <HeaderRow />
                {rows}
              </table>
            </div>
            )
        },
        searchAll: function() {
          for (var i=0; i < HOURS.length; i++) {
            for (var j=0; j < DAYS.length; j++) {
              _searchCell(DAYS[j], HOURS[i]);
            }
          }
        }
      });

      React.renderComponent(Calendar(), element[0]);
    }
  }
});
