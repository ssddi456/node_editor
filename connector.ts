import {OutputJoint, InputJoint} from './joint';
import {EditorElement} from './editor_element';

export class Connector extends EditorElement{
    input_node:InputJoint;
    output_node:OutputJoint;

    constructor( input_node:InputJoint, output_node :OutputJoint ){
        super();
        this.input_node = input_node;
        this.output_node = output_node;
    }

    draw (){
        this.element
            .attr({
                x1 : this.input_node.pos.x, 
                y1 : this.input_node.pos.y,

                x2 : this.output_node.pos.x, 
                y2 : this.output_node.pos.y,
            });
    }
}