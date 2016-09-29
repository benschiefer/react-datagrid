'use strict';

var normalize = require('react-style-normalizer');

var colors = ['blue', 'red', 'magenta'];
module.exports = function (props) {
    var scrollTop = props.virtualRendering ? -(props.topOffset || 0) : props.scrollTop;
    var scrollLeft = props.virtualColumnRendering && props.endColIndex !== null ? props.columns.length === props.endColIndex + 1 ? props.columns[props.endColIndex].width : 0 : props.scrollLeft;

    return normalize({
        transform: 'translate3d(' + -scrollLeft + 'px, ' + -scrollTop + 'px, 0px)'
    });
};