import "d3";
import { Position } from './editor_element';

export function uuid(tpl?: string): string {
    return (tpl || "xxyxxyxx4xxxyxxx").replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

interface BackgroundOption {
    class: string;
    width: number,
    height: number,
    padding: number,
    borderWidth: number,

    fill: string,
    borderColor: string,
}


export interface backgroundObject extends d3.Selection<SVGGraphicsElement> {
    redraw: (a?: {}) => void
}

export function add_background(
    parent: d3.Selection<any>,
    option: Partial<BackgroundOption>,
    background?: d3.Selection<Object>
): backgroundObject {


    var element = d3_get(parent);


    if (background) {
        background.attr({
            x: 0,
            y: 0,
            widdth: 0,
            height: 0
        });
    }
    var bbox = (<SVGGraphicsElement>element).getBBox();

    var padding = 'padding' in option ? option.padding : 5;

    option.padding = padding;
    option.fill = option.fill || '#ffffff';
    option.borderWidth = 'borderWidth' in option ? option.borderWidth : 2;
    option.borderColor = option.borderColor || 'darkslateblue';

    if (!background) {
        background = parent.append('svg:rect')
            .classed('background', true)
            .attr({
                'rx': 5,
                'ry': 5,
                'fill': option.fill || '#ffffff',//'#191b18',
                'stroke-width': option.borderWidth || 2,
                'stroke': option.borderColor || 'darkslateblue'
            });
    }

    background
        .attr({
            'width': ('width' in option ? option.width : bbox.width) + 2 * padding,
            'height': ('height' in option ? option.height : bbox.height) + 2 * padding,
            'x': bbox.x - padding,
            'y': bbox.y - padding,
        })
    if(option.class) {
        background.classed(option.class, true);
    }
    var ret: backgroundObject = <backgroundObject>background;

    ret.redraw = function (new_option = {}) {
        for (var k in new_option) {
            if (new_option.hasOwnProperty(k)) {
                option[k] = new_option[k]
            }
        }

        add_background(parent, option, background);
    }

    return ret;
}


export function d3_get(el: d3.Selection<any>): SVGGraphicsElement {
    return <SVGGraphicsElement>el[0][0];
}

export function move_group(group: d3.Selection<Object>, pos: Position) {
    group.attr({ transform: 'translate(' + pos.x + ',' + pos.y + ')' })
}

export function find_instance(el: d3.Selection<Object> | SVGElement) {
    if (el instanceof SVGElement) {

    } else {
        el = d3_get(<d3.Selection<Object>>el);
    }

    var _el = <Element>(<SVGElement>el);

    while (_el) {
        var instance_id = _el.getAttribute('instance_id');
        if (instance_id) {
            return instance_id;
        }

        _el = _el.parentElement;
    }
}

export function set_by_path(obj: object, data_path: Array<string | number>, value: any) {
    let key;
    let last_key = data_path[data_path.length - 1];
    data_path = data_path.slice(0, -1);

    while (data_path.length) {
        key = data_path.shift()

        obj = obj[key];
    }
    obj[last_key] = value;
}

export function get_by_path<T>(obj: object, data_path: Array<string | number>): T {
    let key;
    data_path = data_path.slice();

    while (data_path.length) {
        key = data_path.shift()

        obj = obj[key];
    }
    return obj as any as T;
}
