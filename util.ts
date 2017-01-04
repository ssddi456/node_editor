import "d3";
import {Position} from './editor_element';

export function uuid ( tpl? :string) : string {
  return (tpl || "xxyxxyxx4xxxyxxx").replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0;
    var v = c == "x" ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

interface BackgroundOption{
  width?:number,
  height?:number,
  padding?:number,
  borderWidth?: number,
  
  fill? : string,
  borderColor? : string, 
}

export function add_background( 
  element:CommonSVGElement|d3.Selection<Object>,
  parent: d3.Selection<Object>,
  option: BackgroundOption,
  background?:d3.Selection<Object>
): d3.Selection<Object>{

  if( 'getBBox' in element ){
  } else {
    element = d3_get(<d3.Selection<Object>>element);
  }

  if( background ){
    background.attr({
      x : 0,
      y : 0,
      widdth: 0,
      height : 0
    });
  }
  var bbox = (<CommonSVGElement>element).getBBox();
  
  if( !background ){
    background = parent.append('svg:rect')
                  .classed('background', true)
                  .attr({
                    'rx' : 5,
                    'ry' : 5,
                    'fill' : option.fill || '#ffffff',//'#191b18',
                    'stroke-width' : option.borderWidth || 2,
                    'stroke' : option.borderColor || 'darkslateblue'
                  });
  }

  var padding = option.padding || 5;

  background
        .attr({
          'width' : (option.width || bbox.width) + 2 * padding,
          'height' : (option.height || bbox.height) + 2 * padding,
          'x'  : bbox.x - padding,
          'y'  : bbox.y - padding,
        })

  return background;
}

interface CommonSVGElement extends SVGElement, SVGStylable, SVGTransformable{
}

export function d3_get( el:d3.Selection<Object>):CommonSVGElement{
  return <CommonSVGElement>el[0][0];
}

export function move_group( group:d3.Selection<Object>, pos:Position ){
  group.attr({ transform : 'translate(' + pos.x +','+ pos.y + ')'})
}

export function find_instance( el:d3.Selection<Object>|SVGElement) {
  if( el instanceof SVGElement ){

  } else {
    el = d3_get(<d3.Selection<Object>>el);
  }

  var _el = <Element>(<SVGElement>el);

  while( _el ){
    var instance_id = _el.getAttribute('instance_id');
    if( instance_id ){
      return instance_id;
    }

    _el = _el.parentElement;
  }
}

export function set_by_path( obj, data_path, value ) {
  let key;
  let last_key = data_path[data_path.length-1];
  data_path = data_path.slice(0, -1);

  while( data_path.length ){
    key = data_path.shift()

    obj = obj[key];
  }
  obj[last_key] = value;
}

export function get_by_path( obj, data_path ) {
  let key;
  data_path = data_path.slice();

  while( data_path.length ){
    key = data_path.shift()

    obj = obj[key];
  }
  return obj
}
