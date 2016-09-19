import {OutputJoint, InputJoint} from './joint';
import {EditorElement} from './editor_element';

export class Connector extends EditorElement{
    input_node:InputJoint;
    output_node:OutputJoint;

    element : SVGAElement;

    constructor( input_node:InputJoint, output_node :OutputJoint ){
        super();
        this.input_node = input_node;
        this.output_node = output_node;
    }

    draw (){

    }
}