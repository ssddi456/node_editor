import {OutputJoint, InputJoint, JointData} from './joint';
import {EditorElement, EditorElementData} from './editor_element';
import * as util from './util';

export interface NodeData  extends EditorElementData{
    class_id : string;

    name : string;
    data : Object; 

    output_joints : JointData[];
    input_joints : JointData[];
}

interface NodeConstructor extends Function{

}

export class ENode extends EditorElement implements NodeData{
    instance_id : string;
    class_id : string;
    name : string;
    data : Object; 

    output_joints : OutputJoint[];
    input_joints : InputJoint[];

	constructor( class_id:string, instance_id:string, initdata:NodeData ) {
        super();

        this.class_id = class_id;
        this.instance_id = instance_id;

        this.name = initdata.name;
        this.data = initdata.data;

        this.output_joints = initdata.output_joints.map(function( node:JointData ) {
            return new OutputJoint(node.instance_id || util.uuid(), node);
        });

        this.input_joints = initdata.input_joints.map(function( node:JointData ) {
            return new InputJoint(node.instance_id || util.uuid(), node);
        });

        this.pos.x = initdata.pos.x;
        this.pos.y = initdata.pos.y;
	}

    createUI(){
        this.element
    }

    draw(){

    }

    toJSON():NodeData{
        return {
            instance_id : this.instance_id,
            class_id : this.class_id,
            name : this.name,
            data : this.data,
            pos : { 
                x : this.pos.x , 
                y : this.pos.y 
            },
            output_joints : this.output_joints.map(function( joint ) {
                  return joint.toJSON();  
            }),
            input_joints : this.output_joints.map(function( joint ) {
                  return joint.toJSON();  
            }),
        }
    }

}

export interface ENodeTemplateData{
    class_id : string;
    default_name : string;
    data : Object;

    output_joints : JointData[];
    input_joints  : JointData[];
}

export class ENodeTemplate implements ENodeTemplateData {

    class_id : string;
    default_name : string;
    data : Object;

    output_joints : JointData[];
    input_joints  : JointData[];

    constructor(initdata? : ENodeTemplateData){
        initdata = initdata || <ENodeTemplateData>{};

        this.class_id = initdata.class_id || util.uuid();
        this.default_name = initdata.default_name || '未命名';
        this.data = initdata.default_name || {};
        this.output_joints = (initdata.output_joints || []).slice();
        this.input_joints = (initdata.input_joints || []).slice();

        NodeTypes[this.class_id] = this;
    }

    static create_template( initdata : ENodeTemplateData ){
        return new ENodeTemplate(initdata);
    }

    create_enode( initdata: NodeData ) : ENode{

        initdata.instance_id = initdata.instance_id || util.uuid();
        initdata.name = initdata.name || this.default_name;
        initdata.data = initdata.data || Object.create(this.data);

        initdata.output_joints = initdata.output_joints || this.output_joints.slice();
        initdata.input_joints  = initdata.input_joints  || this.input_joints.slice();


        var enode = new ENode( this.class_id, initdata.instance_id, initdata );

        return enode;

    }

    toJSON() : ENodeTemplateData{
        return {
            class_id : this.class_id,
            default_name : this.default_name,
            data : this.data,
            output_joints : this.output_joints,
            input_joints : this.input_joints,
        }
    }

}

interface NodeTypeSet{
    [key: string] : ENodeTemplate
}

export var NodeTypes : NodeTypeSet = {}