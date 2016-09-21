import {Connector} from './connector';
import {EditorElement} from './editor_element';

export abstract class Joint extends EditorElement{
    instance_id : String;

    constructor( instance_id : String ){
        super();

        this.instance_id  = instance_id;
    }

    abstract add_connector( connector:Connector )
    abstract remove_connector( connector:Connector )

    draw(){
        this.element
            .attr({
                x1 : this.pos.x, 
                y1 : this.pos.y,
            });
    }
} 


export class OutputJoint extends Joint{
    type:String = 'output';

    connectors:Connector[];

    constructor( instance_id :String){
        super(instance_id);
    }

    add_connector ( connector:Connector ){
        this.connectors.push(connector);
    }

    remove_connector ( connector:Connector ){
        this.connectors.splice(this.connectors.indexOf(connector));
    }
}

export class InputJoint extends Joint{
    type:String = 'input';
    connector:Connector;

    constructor( instance_id :String){
        super(instance_id);
    }

    add_connector ( connector:Connector ){
        this.connector = connector;
    }

    remove_connector ( connector:Connector ){
        if( this.connector == connector ){
            this.connector = null;
        }
    }
}