'use strict';

var React = require('react');
var Region = require('region');
var assign = require('object-assign');
var normalize = require('react-style-normalizer');
var Cell = require('../Cell');
var CellFactory = React.createFactory(Cell);
var ReactMenu = require('react-menus');
var ReactMenuFactory = React.createFactory(ReactMenu);

module.exports = React.createClass({

    displayName: 'ReactDataGrid.Row',

    propTypes: {
        data: React.PropTypes.object,
        columns: React.PropTypes.array,
        index: React.PropTypes.number
    },

    getDefaultProps: function getDefaultProps() {

        return {
            defaultClassName: 'z-row',
            mouseOverClassName: 'z-over',
            selectedClassName: 'z-selected',
            defaultStyle: normalize({
                userSelect: 'none'
            })
        };
    },

    getInitialState: function getInitialState() {
        return {
            mouseOver: false
        };
    },

    render: function render() {
        var props = this.prepareProps(this.props);
        var cols = props.virtualColumnRendering ? props.columns.slice(props.startColIndex, props.endColIndex + 1) : props.columns;

        var cells = props.children || cols.map(this.renderCell.bind(this, this.props));

        return React.createElement(
            'div',
            props,
            cells
        );
    },

    prepareProps: function prepareProps(thisProps) {
        var props = assign({}, thisProps);

        props.className = this.prepareClassName(props, this.state);
        props.style = this.prepareStyle(props);

        props.onMouseEnter = this.handleMouseEnter;
        props.onMouseLeave = this.handleMouseLeave;
        props.onContextMenu = this.handleContextMenu;
        props.onClick = this.handleRowClick;

        delete props.data;
        delete props.cellPadding;

        return props;
    },

    handleRowClick: function handleRowClick(event) {

        if (this.props.onClick) {
            this.props.onClick(event);
        }

        if (this.props._onClick) {
            this.props._onClick(this.props, event);
        }
    },

    handleContextMenu: function handleContextMenu(event) {

        if (this.props.rowContextMenu) {
            this.showMenu(event);
        }

        if (this.props.onContextMenu) {
            this.props.onContextMenu(event);
        }
    },

    showMenu: function showMenu(event) {
        var factory = this.props.rowContextMenu;
        var alignTo = Region.from(event);

        var props = {
            style: {
                position: 'absolute'
            },
            rowProps: this.props,
            data: this.props.data,
            alignTo: alignTo,
            alignPositions: ['tl-bl', 'tr-br', 'bl-tl', 'br-tr'],
            items: [{
                label: 'stop'
            }]
        };

        var menu = factory(props);

        if (menu === undefined) {
            menu = ReactMenuFactory(props);
        }

        event.preventDefault();

        this.props.showMenu(function () {
            return menu;
        });
    },

    handleMouseLeave: function handleMouseLeave(event) {
        this.setState({
            mouseOver: false
        });

        if (this.props.onMouseLeave) {
            this.props.onMouseLeave(event);
        }
    },

    handleMouseEnter: function handleMouseEnter(event) {
        this.setState({
            mouseOver: true
        });

        if (this.props.onMouseEnter) {
            this.props.onMouseEnter(event);
        }
    },

    renderCell: function renderCell(props, column, index) {

        var text = props.data[column.name];
        var columns = props.columns;

        var cellProps = {
            style: column.style,
            className: column.className,

            key: column.name,
            name: column.name,

            data: props.data,
            columns: columns,
            index: column.index,
            rowIndex: props.index,
            textPadding: props.cellPadding,
            renderCell: props.renderCell,
            renderText: props.renderText,
            onSelectedCellChange: props.onSelectedCellChange,
            selectedCells: props.selectedCells
        };

        if (typeof column.render == 'function') {
            text = column.render(text, props.data, cellProps);
        }

        cellProps.text = text;

        var result;

        if (props.cellFactory) {
            result = props.cellFactory(cellProps);
        }

        if (result === undefined) {
            result = CellFactory(cellProps);
        }

        return result;
    },

    prepareClassName: function prepareClassName(props, state) {
        var className = props.className || '';

        className += ' ' + props.defaultClassName;

        if (state.mouseOver && !props.selectCells) {
            className += ' ' + props.mouseOverClassName;
        }

        if (props.selected && !props.selectCells) {
            className += ' ' + props.selectedClassName;
        }

        return className;
    },

    prepareStyle: function prepareStyle(props) {

        var style = assign({}, props.defaultStyle, props.style);

        style.height = props.rowHeight;
        // style.minWidth = props.minWidth

        return style;
    }
});