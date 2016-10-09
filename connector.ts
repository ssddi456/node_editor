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
        var node = parent.append('line')
                    .attr({
                        stroke : 'white'
                    })
        this.element = {
            node
        };
    }
    bind_event(){
        
    }

    draw (){
        this.element.node
            .attr({
                x1 : this.input_node.pos.x, 
                y1 : this.input_node.pos.y,

                x2 : this.output_node.pos.x, 
                y2 : this.output_node.pos.y,
            });
    }
    toJSON (): ConnectorData{
        return {
            output_id   : this.output_node.instance_id,
            input_id    : this.input_node.instance_id,
        };
    }
}