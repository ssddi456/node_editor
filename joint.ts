import {Connector} from './connector';
import {EditorElement, EditorElementData} from './editor_element';

export const enum JointType {
    OUTPUT : "output",
    INPUT : "input"
}

export interface JointData extends EditorElementData{
    type : JointType;
    jointdata : Object;
}


export abstract class Joint extends EditorElement implements JointData{

    type:JointType;
    jointdata : Object;

    constructor( instance_id : string, jointdata : Object ){
        super();

        this.instance_id  = instance_id;
        this.jointdata = jointdata
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

    toJSON (): JointData{
        return {
            type: this.type,
            instance_id : this.instance_id,
            jointdata : this.jointdata,
            pos : {
                x : this.pos.x,
                y : this.pos.y
            }
        };
    }
} 


export class OutputJoint extends Joint{

    type:JointType = JointType.OUTPUT;

    connectors:Connector[];


    add_connector ( connector:Connector ){
        this.connectors.push(connector);
    }

    remove_connector ( connector:Connector ){
        this.connectors.splice(this.connectors.indexOf(connector), 1 );
    }
}

export class InputJoint extends Joint{

    type:JointType = JointType.INPUT;

    connector:Connector;


    add_connector ( connector:Connector ){
        this.connector = connector;
    }

    remove_connector ( connector:Connector ){
        if( this.connector == connector ){
            this.connector = null;
        }
    }
}