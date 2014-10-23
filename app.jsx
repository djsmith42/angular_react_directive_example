/**
 * @jsx React.DOM
 */

var HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
var DAYS  = ["1 October", "2 October","3 October", "4 October", "5 October", "6 October", "7 October", "8 OCtober", "9 October", "10 October", "11 October", "12  October", "13 October", "14 October", "15 October", "16 October", "17 October", "18 October", "19 October", "20 October", "21 October", "22 October", "23 October", "24 October", "25 October", "26 October", "27 October", "28 October", "29 October", "30 October", "31 October"];

angular.module("myapp", []).
directive("myCalendarAngular", function($timeout) {
    return {
        restrict: 'E',
        scope: {},
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
            '   <td ng-repeat="day in days" class="hour-cell" ng-class="cellClass(day, hour)" ng-click="cellClicked(day, hour)" ng-mouseenter="cellEntered(day, hour)">' +
            '     <div ng-if="showTip(day, hour)">' +
            '       Click to search' +
            '     </div>' +
            '     <div ng-if="showSpinner(day, hour)">' +
            '       Searching' +
            '     </div>' +
            '     <div ng-if="showHour(day, hour)">' +
            '       {{hour}}:00' +
            '     </div>' +
            '   </td>' +
            '  </tr>' +
            ' </table>' +
            '</button>',
        link: function(scope, element, attrs) {
            scope.hours = HOURS;
            scope.days  = DAYS;
            scope.statuses = {};
            angular.forEach(DAYS, function(day) {
                scope.statuses[day] = {};
                angular.forEach(HOURS, function(hour) {
                    scope.statuses[day][hour] = {
                        isSearching: false,
                        isHovered: false
                    }
                });
            });

            scope.showTip = function(day, hour) {
                return scope.isHovered(day, hour) && !scope.isSearching(day, hour);
            }

            scope.showSpinner = function(day, hour) {
                return scope.isSearching(day, hour);
            }

            scope.showHour = function(day, hour) {
                return !scope.isSearching(day, hour) && !scope.isHovered(day, hour);
            }

            scope.cellClass = function(day, hour) {
                if (scope.statuses[day][hour].isSearching) {
                    return 'searching';
                }
            }

            scope.cellEntered = function(day, hour) {
                _hoverHelper(day, hour);
            }

            scope.isHovered = function(day, hour) {
                return scope.statuses[day][hour].isHovered;
            }

            scope.isSearching = function(day, hour) {
                return scope.statuses[day][hour].isSearching;
            }

            scope.searchAll = function() {
                angular.forEach(DAYS, function(day) {
                    scope.dayHeaderClicked(day);
                });
            }

            scope.cellClicked = function(day, hour) {
                var alreadySearching = scope.statuses[day][hour].isSearching;
                scope.statuses[day][hour].isSearching = !alreadySearching;
                if (!alreadySearching) {
                    $timeout(function() {
                        scope.statuses[day][hour].isSearching = false;
                    }, 1000 + Math.random() * 5000)
                }
            }

            scope.dayHeaderClicked = function(day) {
                angular.forEach(HOURS, function(hour) {
                    scope.cellClicked(day, hour);
                });
            }

            function _hoverHelper(iday, ihour) {
                angular.forEach(DAYS, function(day) {
                    angular.forEach(HOURS, function(hour) {
                        scope.statuses[day][hour].isHovered = (day == iday && hour == ihour);
                    });
                });
            }
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
                cell.setState({isSearching: true});
                setTimeout(function() {
                    cell.setState({isSearching: false});
                }, 1000 + Math.random() * 5000);
            }

            var HeaderCell = React.createClass({
                render: function() {
                    return (<th className='day-header' onClick={this.clicked}>{this.props.day}</th>)
                },
                clicked: function() {
                    for (var i=0; i<HOURS.length; i++) {
                        _searchCell(this.props.day, HOURS[i]);
                    }
                }
            });

            var HeaderRow = React.createClass({
                render: function() {
                    var headerCells = [];
                    for (var i=0; i<DAYS.length; i++) {
                        headerCells.push(HeaderCell({day: DAYS[i]}));
                    }
                    return (<tr>{headerCells}</tr>);
                }
            });

            var Cell = React.createClass({
                render: function() {
                    if (this.state.isSearching) {
                        return (<td className='hour-cell searching'>Searching</td>);
                    } else if (this.state.isHovered) {
                        return (<td className='hour-cell' onClick={this.clicked} onMouseEnter={this.mouseEntered}>Click to Search</td>);
                    } else {
                        return (<td className='hour-cell' onClick={this.clicked} onMouseEnter={this.mouseEntered}>{this.props.hour}:00</td>);
                    }
                },
                getInitialState: function() {
                    return {
                        isHovered: false,
                        isSearching: false
                    }
                },
                componentDidMount: function() {
                    cellCache[this.props.day][this.props.hour] = this;
                },
                mouseEntered: function() {
                    for (var i=0; i<HOURS.length; i++) {
                        var hour = HOURS[i];
                        for (var j=0; j<DAYS.length; j++) {
                            _cellHovered(this.props.day, this.props.hour);
                        }
                    }
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
                    for (var i=0; i<DAYS.length; i++) {
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
                    for (var i=0; i<HOURS.length; i++) {
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
                    for (var i=0; i<HOURS.length; i++) {
                        for (var j=0; j<DAYS.length; j++) {
                            _searchCell(DAYS[j], HOURS[i]);
                        }
                    }
                }
            });

            function _cellHovered(day, hour) {
                for (var i=0; i<DAYS.length; i++) {
                    for (var j=0; j<HOURS.length; j++) {
                        var cell = cellCache[DAYS[i]][HOURS[j]];
                        var isHovered = (day == cell.props.day && hour == cell.props.hour);
                        if (cell.state.isHovered != isHovered) {
                            cell.setState({isHovered: isHovered});
                        }
                    }
                }
            }

            React.renderComponent(Calendar(), element[0]);
        }
    }
});
