'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var assign = require('object-assign');
var normalize = require('react-style-normalizer');

var EVENT_NAMES = require('react-event-names');

var TEXT_ALIGN_2_JUSTIFY = {
    right: 'flex-end',
    center: 'center'
};

function copyProps(target, source, list) {

    list.forEach(function (name) {
        if (name in source) {
            target[name] = source[name];
        }
    });
}

module.exports = React.createClass({

    displayName: 'ReactDataGrid.Cell',

    propTypes: {
        className: React.PropTypes.string,
        textPadding: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        style: React.PropTypes.object,
        text: React.PropTypes.any,
        rowIndex: React.PropTypes.number
    },

    getDefaultProps: function getDefaultProps() {
        return {
            text: '',
            defaultClassName: 'z-cell'
        };
    },

    render: function render() {
        var props = this.props;

        var columns = props.columns;
        var index = props.index;
        var column = columns ? columns[index] : null;
        var className = props.className || '';
        var textAlign = column && column.textAlign;
        var textPadding = typeof props.rowIndex !== 'undefined' && column.cellPadding || props.textPadding;
        var text = props.renderText ? props.renderText(props.text, column, props.rowIndex) : props.text;

        var textCellProps = {
            className: 'z-text',
            style: { padding: textPadding, margin: 'auto 0' }
        };

        var textCell = props.renderCell ? props.renderCell(textCellProps, text, props) : React.DOM.div(textCellProps, text);

        if (!index) {
            className += ' z-first';
        }
        if (columns && index == columns.length - 1) {
            className += ' z-last';
        }

        if (textAlign) {
            className += ' z-align-' + textAlign;
        }

        if (props.selectedCells && Array.isArray(props.selectedCells) && props.selectedCells.length) {
            for (var i = 0; i < props.selectedCells.length; i++) {
                if (props.selectedCells[i].columnIndex === props.index && props.selectedCells[i].rowIndex === props.rowIndex) {
                    className += ' z-cell-selected';
                }
            }
        }

        className += ' ' + props.defaultClassName;

        var sizeStyle = column && column.sizeStyle;
        var cellProps = {
            className: className,
            style: normalize(assign({}, props.style, sizeStyle))
        };

        copyProps(cellProps, props, ['onMouseOver', 'onMouseOut', 'onClick'].concat([EVENT_NAMES.onMouseDown, EVENT_NAMES.onMouseUp]));

        var innerStyle = props.innerStyle;

        if (textAlign) {
            innerStyle = assign({}, innerStyle, {
                justifyContent: column.style.justifyContent || TEXT_ALIGN_2_JUSTIFY[column.textAlign]
            });
        }

        var c = React.createElement(
            'div',
            { className: 'z-inner', style: innerStyle },
            textCell
        );

        // var c = {textCell}
        return React.createElement(
            'div',
            _extends({}, cellProps, { onClick: this.handleCellClick }),
            c,
            props.children
        );
    },

    handleCellClick: function handleCellClick() {
        var cell = {
            name: this.props.name,
            value: this.props.data[this.props.name],
            columnIndex: this.props.index,
            rowIndex: this.props.rowIndex
        };

        if (this.props.onCellClick && typeof this.props.onCellClick === 'function') {
            this.props.onCellClick(cell);
        }
    }
});