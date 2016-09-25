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
  element:SVGLocatable,
  parent: d3.Selection<Object>,
  option: BackgroundOption,
  background?:d3.Selection<Object>
): d3.Selection<Object>{
  var bbox = element.getBBox();
  
  if( !background ){
    background = parent.append('svg:rect')
                  .attr({
                    'rx' : 5,
                    'ry' : 5,
                    'fill' : option.fill || '#191b18',
                    'strokeWidth' : option.borderWidth || 2,
                    'strokeColor' : option.borderColor || 'darkslateblue'
                  });
  }

  var padding = option.padding || 5;

  background
        .attr({
          'width' : (option.width || bbox.width) +
                      2 * (padding),
          'height' : (option.height || bbox.height) +
                      2 * (padding),
          'x'  : bbox.x - padding,
          'y'  : bbox.y - padding,
        })

  return background;
}

export function d3_get( el:d3.Selection<Object>):SVGLocatable{
  return <any>el[0][0];
}

export function move_group( group:d3.Selection<Object>, pos:Position ){
  group.attr({ transform : 'translate(' + pos.x +','+ pos.y + ')'})
}