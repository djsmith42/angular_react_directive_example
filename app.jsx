/**
 * @jsx React.DOM
 */

var HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
var DAYS  = ["1 October", "2 October", "3 October", "4 October", "5 October", "6 October", "7 October", "8 October", "9 October", "10 October", "11 October", "12  October", "13 October", "14 October", "15 October", "16 October", "17 October", "18 October", "19 October", "20 October", "21 October", "22 October", "23 October", "24 October", "25 October", "26 October", "27 October", "28 October", "29 October", "30 October", "31 October"];

var randomMillis = function() {
  return Math.floor(Math.random() * 500);
}

angular.module("myapp", []).
directive("myCalendar", function() {
    return {
        restrict: 'E',
        scope: {},
        replace: true,
        template:
            '<div class="calendar">' +
            ' <button class="btn" ng-hide="loaded" ng-click="load()">Load</button>' +
            ' <button class="btn" ng-show="loaded" ng-click="searchAll()">Search all month</button>' +
            ' <table ng-if="loaded">' +
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
            scope.loaded = false;
            scope.hours = HOURS;
            scope.days  = DAYS;

            scope.searchAll = function() {
              scope.$broadcast('allSearchRequested');
            }

            scope.dayHeaderClicked = function(day) {
              scope.$broadcast('daySearchRequested', day);
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
    template:
      '<div ng-click="cellClicked(day, hour)" ng-class="cellClass()">' +
      '  <div ng-if="showSpinner()">' +
      '    <div ng-if="showSpinner()">' +
      '      <div ng-if="showSpinner()">' +
      '        <div ng-if="showSpinner()">' +
      '          <div ng-if="showSpinner()">' +
      '            <div ng-if="showSpinner()">' +
      '              Searching' +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div ng-if="showHour()" class="time">' +
      '    <div ng-if="showHour()">' +
      '      <div ng-if="showHour()">' +
      '        <div ng-if="showHour()">' +
      '          <div ng-if="showHour()">' +
      '            <div ng-if="showHour()">' +
      '              <div ng-if="showHour()">' +
      '                {{hour}}:00' +
      '              </div>' +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div ng-if="showSearchResults()">' +
      '    <div ng-if="showSearchResults()">' +
      '      <div ng-if="showSearchResults()">' +
      '        <div ng-if="showSearchResults()">' +
      '          <div ng-if="showSearchResults()">' +
      '            <div ng-if="showSearchResults()">' +
      '              <div ng-if="showSearchResults()">' +
      '                <div>{{status.searchResults.options}}</div>' +
      '                <div>results</div>' +
      '              </div>' +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>',
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
        //setTimeout(function() {
        $timeout(function() {
          $scope.status.isSearching = false;
          $scope.status.searchResults = {options: Math.floor(Math.random() * 5)};
          //$scope.$digest();
        }, randomMillis());
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
      var cells = []
      React.render(<Calendar cells={cells}/>, element[0]);
    }
  }
});


/* React Components */

var HeaderCell = React.createClass({
  render: function() {
    return (
      <th className='day-header' onClick={this.clicked}>{this.props.day}</th>
    )
  }
});

var HeaderRow = React.createClass({
  render: function() {
    return (
      <tr>
        {DAYS.map(function(day) {
          return <HeaderCell day={day} key={day} />
        })}
      </tr>
      );
  }
});

var Cell = React.createClass({
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
    this.props.cells.push(this);
  },
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
          <div className={classes}>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <div>
                        Searching
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      );
    } else if (this.state.searchResults) {
      return (
        <td className='hour-cell' onClick={this.clicked}>
          <div className={classes}>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <div>{this.state.searchResults}</div>
                      <div>results</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      );
    } else {
      return (
        <td className='hour-cell' onClick={this.clicked}>
          <div className={classes}>
            <div>
              <div>
                <div>
                  <div>
                    {this.props.hour}:00
                  </div>
                </div>
              </div>
            </div>
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
  clicked: function() {
    this.search();
  }
});

var Row = React.createClass({
  render: function() {
    var hour = this.props.hour;
    var cells = this.props.cells;
    return (
      <tr>
        {DAYS.map(function(day) {
          return <Cell hour={hour} day={day} key={day} cells={cells} />
          })}
      </tr>
    )
  }
});

var Calendar = React.createClass({
  getInitialState: function() {
    return {
      isLoaded: false
    }
  },
  load: function() {
    this.setState({isLoaded: true});
  },
  render: function() {
    var cells = this.props.cells;
    return (
      <div className='calendar'>
        {this.state.isLoaded || <button className='btn' onClick={this.load}>Load</button>}
        {this.state.isLoaded && <button className='btn' onClick={this.searchAll}>Search all month</button>}
        {this.state.isLoaded &&
        <table>
          <HeaderRow />
          {HOURS.map(function(hour) {
            return <Row hour={hour} key={hour} cells={cells}/>
          })}
        </table>
        }
      </div>
      )
  },
  searchAll: function(args) {
    this.props.cells.forEach(function(cell) {
      cell.search();
    });
  }
});
