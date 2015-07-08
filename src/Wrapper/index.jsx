'use strict';

var React    = require('react')
var assign   = require('object-assign')
var Scroller = require('react-virtual-scroller')

module.exports = React.createClass({

    displayName: 'ReactDataGrid.Wrapper',

    propTypes: {
        scrollLeft   : React.PropTypes.number,
        scrollTop    : React.PropTypes.number,
        scrollbarSize: React.PropTypes.number,
        rowHeight   : React.PropTypes.any,
        renderCount : React.PropTypes.number
    },

    getDefaultProps: function(){
        return {
            scrollLeft: 0,
            scrollTop : 0
        }
    },

    render: function() {

        var props     = this.prepareProps(this.props)
        var rowsCount = props.renderCount

        var groupsCount = 0
        if (props.groupData){
            groupsCount = props.groupData.groupsCount
        }

        rowsCount += groupsCount

        // var loadersSize = props.loadersSize
        var verticalScrollerSize = (props.totalLength + groupsCount) * props.rowHeight// + loadersSize

        // determine to render empty text, empty rows or data
        var content;
        if ( props.empty && props.fillEmptyRows ) {
            content = <div {...props.tableProps} ref="table">{this.fillEmptyRows()}</div>;
        }
        else if ( props.empty ) {
            content = <div className="z-empty-text" style={props.emptyTextStyle}>{props.emptyText}</div>;
        }
        else if ( props.fillEmptyRows ) {
            content = <div {...props.tableProps} ref="table"></div>
            content.props.children = content.props.children.concat(this.fillEmptyRows());
        } else {
            content = <div {...props.tableProps} ref="table"></div>;
        }

        return <Scroller
                ref="scroller"
                preventDefaultHorizontal={true}

                loadMask={!props.loadMaskOverHeader}
                loading={props.loading}

                scrollbarSize={props.scrollbarSize}

                minVerticalScrollStep={props.rowHeight}
                scrollTop={props.scrollTop}
                scrollLeft={props.scrollLeft}

                scrollHeight={verticalScrollerSize}
                scrollWidth={props.minRowWidth}

                onVerticalScroll={this.onVerticalScroll}
                onHorizontalScroll={this.onHorizontalScroll}
            >
            {content}
        </Scroller>
    },

    onVerticalScrollOverflow: function() {
    },

    onHorizontalScrollOverflow: function() {
    },

    onHorizontalScroll: function(scrollLeft) {
        this.props.onScrollLeft(scrollLeft)
    },

    onVerticalScroll: function(pos){
        this.props.onScrollTop(pos)
    },

    fillEmptyRows: function(){
        var emptyPixels = 0;
        var numEmptyRows = 0;
        var emptyRows = [];
        var emptyCells = [];
        var rowClass, cellClass, cellWidth, rowHeight, offset;

        if ( this.props.style.height > this.props.renderCount * this.props.rowHeight ) {
            emptyPixels = this.props.style.height - (this.props.renderCount * this.props.rowHeight);
            numEmptyRows = Math.ceil(emptyPixels/this.props.rowHeight);

            for( var i = 0; i < numEmptyRows; i++ ){
                emptyCells = [];
                rowClass = 'z-row';
                offset = (this.props.renderCount - 1) + i;

                rowClass += (offset % 2 ? ' z-odd' : ' z-even');
                rowHeight = { height: this.props.rowHeight }

                for ( var j = 0; j < this.props.columns.length; j++ ) {
                    cellClass = 'z-cell';

                    if ( j === 0 ) {
                        cellClass += ' z-first';
                    }
                    if ( j === this.props.columns.length - 1 ) {
                        cellClass += ' z-last';
                    }

                    cellWidth = this.props.columns[j].width ? {width: this.props.columns[j].width} : {minWidth: this.props.columns[j].minWidth, flex: 1};

                    emptyCells.push(
                        <div className={cellClass} style={cellWidth} />
                    );
                }

                emptyRows.push(
                    <div className={rowClass} style={rowHeight}>
                        {emptyCells}
                    </div>
                );
            }
        }

        return emptyRows;
    },

    prepareProps: function(thisProps){
        var props = {}

        assign(props, thisProps)

        return props
    }
})