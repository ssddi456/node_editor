import {OutputJoint, InputJoint} from './joint';
import {VisibleElement, EditorElementData} from './editor_element';

export interface ConnectorData {
    output_id : string;
    input_id : string;
}

export interface ConnectorView {
    node: d3.Selection<Object>
}

export class Connector extends VisibleElement{
    input_node:InputJoint;
    output_node:OutputJoint;
    
    element:ConnectorView;
    type = "connector";
    orientation = 1;

    layout: d3.svg.Line<[number,number]>;

    constructor( input_node:InputJoint, output_node :OutputJoint ){
        super();
        this.input_node = input_node;
        this.output_node = output_node;

        input_node.add_connector(this);
        output_node.add_connector(this);
    }

    destroy(){
        this.is_destroyed = true;
        this.input_node.remove_connector(this);
        this.output_node.remove_connector(this);

        if( this.element ){
            this.element.node.remove();
        }
        this.is_destroyed = true;
    }

    init_view (parent:d3.Selection<Object>){
        var node = parent.append('path').classed('connector', true)

        this.layout =  d3.svg.line()
                          .interpolate('cardinal-open');

        this.element = {
            node
        };
    }
    bind_event(){
        // add change orientation logic here
    }

    draw (){
        let pos_in = this.input_node.pos;
        let pos_out = this.output_node.pos;
        
        let delta_y = pos_out.y - pos_in.y;
        let delta_x = pos_out.x - pos_in.x;

        let get_direction = function ( value ) {
            return value / Math.abs(value);
        };

        let corner = [];

        if( Math.abs(delta_x)  >= Math.abs(delta_y) ){
            corner = [ pos_in.x + get_direction(delta_x)*Math.abs(delta_y), pos_out.y]
        } else {
            corner = [pos_out.x, pos_in.y + get_direction(delta_y)* Math.abs(delta_x)]
        }

        let data_line = [[ [pos_in.x, pos_in.y], 
                           corner,
                           [pos_out.x, pos_out.y] ]];

        this.element.node
            .data(data_line)
            .attr('d', this.layout);
    }
    toJSON (): ConnectorData{
        return {
            output_id   : this.output_node.instance_id,
            input_id    : this.input_node.instance_id,
        };
    }
}