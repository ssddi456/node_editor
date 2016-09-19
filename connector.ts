import "./joint";

class Connector {
    input_node:InputJoint;
    output_node:OutputJoint;

    element : SVGAElement;

    constructor( input_node:InputJoint, output_node :OutputJoint ){
        this.input_node = input_node;
        this.output_node = output_node;
    }

    set_view ( element:SVGAElement){
        this.element = element;
    }

    draw (){

    }
}