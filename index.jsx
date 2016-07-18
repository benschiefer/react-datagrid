'use strict';

require('./index.styl')

var Guid = require('guid')
var sorty = require('sorty')
var React = require('react')
var ReactDOM = require('react-dom')
var DataGrid = require('./src')
var faker = window.faker = require('faker');
var preventDefault = require('./src/utils/preventDefault')
var dataSet = require('./data-set');

var gen = (function(){

    var cache = {}

    return function(len){

        if (cache[len]){
            // return cache[len]
        }

        var arr = []

        for (var i = 0; i < len; i++){
            arr.push({
                id       : i + 1,
                // id: Guid.create(),
                grade      : Math.round(Math.random() * 10),
                email    : faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName : faker.name.lastName(),
                birthDate: faker.date.past(),
                country  : faker.address.country(),
                city  : faker.address.city()
            })
        }

        cache[len] = arr

        return arr
    }
})()

var RELOAD = true

var columns = [
    {
        name: 'country',
        style: {
            color: 'red',
            textAlign: 'right'
        },
        width: 150
    },
    {
        name: 'id',
        filterable: false,
        className: 'blue',
        type: 'number',
        width: 350
    },
    {
        name: 'grade',
        type: 'number',
        title: <span>a grade</span>,
        width: 350
    },
    {
        name: 'email',
        width: 200
    },
    {
        name: 'lastName',
        minWidth: 100,
        width: 350
    }
]

var ROW_HEIGHT = 31
var LEN = 2000
var SORT_INFO = []//[ { name: 'id', dir: 'asc'} ]
var sort = sorty(SORT_INFO)
var data = dataSet;
var origData = [].concat(data)
var PAGE_SIZE = 450
var PAGE = 2

var selected = 1
var App = React.createClass({


    handleSortChange: function(sortInfo){
        SORT_INFO = sortInfo
        // debugger
        console.log('sorting', sortInfo)
        this.setState({})
    },

    onColumnChange: function(column, visible){
        column.hidden = !visible

        this.setState({})
    },

    onColumnOrderChange: function(index, dropIndex){
        var col = columns[index]
        columns.splice(index, 1) //delete from index, 1 item
        columns.splice(dropIndex, 0, col)
        this.setState({})
    },

    onColumnResize: function(firstCol, firstSize, secondCol, secondSize){
        firstCol.width = firstSize;

         if (secondCol){
             secondCol.width = secondSize;
         }

        this.setState({})
    },

    clear: function() {
        // data = []
        this.setState({})
    },

    set: function() {
        data = [].concat(origData)

        this.setState({})
    },

    render: function(){
        var sort = sorty(SORT_INFO)

        // data = sort(origData)

        var groupBy = ['grade','country']

        function rowStyle(data, props){
            var style = {}
            if (props.index % 4 == 0){
                style.color = 'blue'
                // props.selected = true
            }
            return style
        }

        function blue(data, props){
            if (props.index % 4 == 0){
                return 'blue'
            }
        }

        function f(props){
            return <div {...props} />
        }

        var filter = function(column, value, values){
            console.log('filter for ' + column.name + ' = ', value, values)

            value = value.toUpperCase()

            if (!value){
                data = [].concat(origData)
            } else {

                data = origData.filter(function(item){
                    if (item[column.name].toUpperCase().indexOf(value) === 0){
                        return true
                    }
                })
            }

            this.setState({})
        }.bind(this)

        var clearFilter = function(){
            data = [].concat(origData)

            this.setState({})
        }.bind(this)

        var onSelectionChange = function(sel, data){
            selected = sel
            console.log(sel);
            this.setState({})
        }.bind(this)


        var refresh = function(){
            data = gen(LEN)
            this.setState({})
        }.bind(this)


        var ds = function(q){
            return 'http://5.101.99.47:8090/1000'

            return $.ajax('http://5.101.99.47:8090/1000?' + Object.keys(q).map(function(k){
                return k + '=' + q[k]
            }).join('&')).then(function(r){
                return r
            })
        }

        function rowClick(){
            console.log('rowClick: ', arguments);
        }

        return <div >

            {/*<button onClick={this.clear}>clear</button>
            <button onClick={this.set}>set</button>
            <input defaultValue="test"/>*/}
            <DataGrid
                XonFilter={filter}
                XliveFilter={true}
                defaultSelected={{451: true, 452: true}}
                onSelectionChange={onSelectionChange}
                XonColumnVisibilityChange={this.onColumnChange}
                onColumnOrderChange={this.onColumnOrderChange}
                onColumnResize={this.onColumnResize}
                XsortInfo={SORT_INFO}
                XgroupBy={groupBy}
                XrowStyle={rowStyle}
                XrowClassName={blue}
                XrowFactory={f}
                onSortChange={this.handleSortChange}
                onRowClick={rowClick}
                XscrollBy={5}
                idProperty='id'
                style={{border: '1px solid gray', height: 500, width: 600, margin: 10}}
                showCellBorders={true}
                rowHeight={ROW_HEIGHT}
                virtualRendering={true}
                virtualColumnRendering={true}
                XemptyText='testing'
                cellPadding={'0px 5px'}
                XpageSize={PAGE_SIZE}
                Xdata={data}
                XpageSize={PAGE_SIZE}
                dataSource={data}
                page={PAGE}
                onPageSizeChange={this.onPageSizeChange}
                onPageChange={this.onPageChange}
                reload={RELOAD}
                Xpagination={true}
                XpaginationToolbarProps={{
                    XshowRefreshIcon: false,
                    XshowPageSize: false,
                    XshowSeparators: false
                }}
                onDataSourceLoaded={this.onLoaded}
                columns={columns}
                XonSelectedCellChange={this.onSelectedCellChange}
                XselectCells={true}
                XselectedCells={this.selectedCells}/>
        </div>
    },

    onLoaded: function() {
        RELOAD = false
        this.setState({})
    },

    onPageChange: function(value) {
        PAGE = value
        this.setState({})
    },

    onSelectedCellChange: function(cell){
        if (cell === null){
            this.selectedCells = [];
            return;
        }

        this.selectedCells = [cell];
    },

    onPageSizeChange: function(value, props) {
        if (value > PAGE_SIZE){
            //when page size gets bigger, the page may not exist
            //so make sure you update that as well
            PAGE = Math.min(PAGE, Math.ceil(props.dataSourceCount / value))
        }
        PAGE_SIZE = value
        this.setState({})
    }
})

ReactDOM.render((
    <App />
), document.getElementById('content'))
