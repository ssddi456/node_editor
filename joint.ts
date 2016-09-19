export class Joint{
    instance_id : String;
    constructor( instance_id : String ){
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