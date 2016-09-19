import {EditorElement} from './editor_element';

export class Joint extends EditorElement{
    instance_id : String;
    constructor( instance_id : String ){
        super();

        this.instance_id  = instance_id;
    }
} 


export class OutputJoint extends Joint{
    type:String = 'output';
    constructor( instance_id :String){
        super(instance_id);

    }
}

export class InputJoint extends Joint{
    type:String = 'input';
    constructor( instance_id :String){
        super(instance_id);

    }
}