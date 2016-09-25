import {Connector} from './connector';
import {EditorElement, EditorElementData} from './editor_element';
import * as util from './util';

export abstract class JointType {
    static OUTPUT: string = "output";
    static INPUT: string  = "input"; 
}

export interface JointData extends EditorElementData{
    type : string;
    jointdata : Object;
}

export interface JointView{
    node : d3.Selection<Object>;
    text : d3.Selection<Object>;
    container : d3.Selection<Object>; 
}

export interface JointViewParam{
    left : number,
    top : number,
    width : number,
}

export abstract class Joint extends EditorElement implements JointData{

    type:string;
    jointdata : Object;
    element:JointView;

    constructor( instance_id : string, initdata : JointData ){
        super();

        this.instance_id  = instance_id;
        this.jointdata = initdata.jointdata
    }

    abstract add_connector( connector:Connector )
    abstract remove_connector( connector:Connector )

    update_node_center(option:JointViewParam){
        var bbox = util.d3_get(this.element.node).getBBox();
        
        this.pos.x = option.left + +bbox.x + bbox.width/2;
        this.pos.y = option.top + bbox.y + bbox.height/2;
    }

    abstract update_connector()
    
    on_drag(option:JointViewParam){
        this.update_node_center(option);
        this.update_connector();
    }

    init_view(container:d3.Selection<Object>, option:JointViewParam ){

        var node = container.append('circle')
                    .attr({
                        cx : (this.type == JointType.INPUT) ? 15 : (option.width - 30 ),
                        r : 5,
                        fill : 'white',
                        stroke : '1px soild white' 
                    });

        var text = container.append('text')
                    .attr({
                        x : 25,
                        y : 5,
                    })
                    .append('tspan')

        this.element = {
            container,
            node,
            text
        };
        this.update_node_center(option);
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

    type:string = JointType.OUTPUT;

    connectors:Connector[] = [];


    add_connector ( connector:Connector ){
        this.connectors.push(connector);
    }

    remove_connector ( connector:Connector ){
        this.connectors.splice(this.connectors.indexOf(connector), 1 );
    }

    update_connector (){
        this.connectors.forEach( connector => connector.draw() );
    }
    draw (){
        var element = this.element;

        element.node
            .attr({
                opacity : this.connectors.length > 0 ? 1 : 0.4
            });

        element.text.text( JSON.stringify(this.jointdata) + '#' + this.instance_id);
    }
}

export class InputJoint extends Joint{

    type:string = JointType.INPUT;

    connector:Connector;


    add_connector ( connector:Connector ){
        this.connector = connector;
    }

    remove_connector ( connector:Connector ){
        if( this.connector == connector ){
            this.connector = null;
        }
    }
    
    update_connector(){
        if( this.connector ){
            this.connector.draw();
        }
    }
    
    draw (){
        var element = this.element;

        element.node
            .attr({
                opacity : this.connector ? 1: 0.4
            });

        element.text.text( JSON.stringify(this.jointdata) + '#' + this.instance_id ) ;
    }
}
