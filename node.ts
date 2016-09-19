import "./joint";

export class ENode {
    instance_id : String;
    class_id : String;
    name : String;
    data : Object; 

    output_joints : OutputJoint[];
    input_joints : InputJoint[];

	constructor( class_id:String, instance_id:String ) {
        this.class_id = class_id;
        this.instance_id = instance_id;


	}

    createUI(){

    }
}
