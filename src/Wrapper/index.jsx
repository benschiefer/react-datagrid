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

    getInitialState: function(){
        return {}
    },

    componentDidMount: function(){
        this.setState({height: React.findDOMNode(this).offsetHeight});
        window.addEventListener('resize', this._handleResize);
    },

    componentWillUnmount: function(){
        window.removeEventListener('resize', this._handleResize);
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
            content = <div {...props.tableProps} children={props.tableProps.children.concat(this.fillEmptyRows())} ref="table"></div>
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
        var height = this.state.height !== 0 && this.state.height;
        var rowClass, cellClass, cellWidth, rowHeight, offset;

        if ( height > this.props.renderCount * this.props.rowHeight ) {
            emptyPixels = height - ((this.props.renderCount - 1) * this.props.rowHeight);
            numEmptyRows = Math.ceil(emptyPixels/this.props.rowHeight);

            for( var i = 0; i < numEmptyRows; i++ ){
                emptyCells = [];
                rowClass = 'z-row z-empty-row';
                offset = (this.props.renderCount - 1) + i;

                rowClass += (offset % 2 ? ' z-odd' : ' z-even');
                rowHeight = { height: this.props.rowHeight };

                for ( var j = 0; j < this.props.columns.length; j++ ) {
                    cellClass = 'z-cell';

                    if ( j === 0 ) {
                        cellClass += ' z-first';
                    }
                    if ( j === this.props.columns.length - 1 ) {
                        cellClass += ' z-last';
                    }

                    cellWidth = this.props.columns[j].width ? {width: this.props.columns[j].width, minWidth: this.props.columns[j].width} : {minWidth: this.props.columns[j].minWidth, WebkitFlex: 1, msFlex: 1, flex: 1};

                    emptyCells.push(
                        <div key={j} className={cellClass} style={cellWidth} />
                    );
                }

                emptyRows.push(
                    <div key={offset} className={rowClass} style={rowHeight} onClick={this._onEmptyRowClick}>
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
    },

    _handleResize: function() {
        this.setState({height: React.findDOMNode(this).offsetHeight});
    },

    _onEmptyRowClick: function(e) {
        if (typeof this.props.onEmptyRowClick === 'function') {
            this.props.onEmptyRowClick(e);
        }
    }
})
