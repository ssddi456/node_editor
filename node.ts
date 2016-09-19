import {OutputJoint, InputJoint} from './joint';
import {EditorElement} from './editor_element';

export class ENode  extends EditorElement{
    instance_id : String;
    class_id : String;
    name : String;
    data : Object; 

    output_joints : OutputJoint[];
    input_joints : InputJoint[];

	constructor( class_id:String, instance_id:String ) {
        super();

        this.class_id = class_id;
        this.instance_id = instance_id;


	}

    createUI(){

    }
}
