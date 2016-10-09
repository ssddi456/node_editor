import {Connector} from './connector';
import {ENode} from './node';
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
    node : ENode;
    abstract can_connect(joint:Joint):boolean;

    constructor( instance_id : string, initdata : JointData ){
        super(instance_id);

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
        if ( this instanceof InputJoint ){
            var node = container.append('circle')
                        .attr({
                            cx : 15,
                            r : 5,
                            fill : 'white',
                            stroke : '1px soild white' 
                        });
        }

        var text = container.append('text')
                    .attr({
                        x : 25,
                        y : 5,
                    })
                    .append('tspan')

        if ( this instanceof OutputJoint ){
            var node = container.append('circle')
                        .attr({
                            cx : option.width - 30,
                            r : 5,
                            fill : 'white',
                            stroke : '1px soild white' 
                        });
        }

        this.element = {
            container,
            node,
            text
        };

        this.update_node_center(option);

        this.bind_event();
    }

    bind_event () {

        var node = this.element.node;
        node.on('mousedown.add_connector', ()=>{
            var e = <MouseEvent>d3.event;
            e.stopPropagation();
            e.preventDefault();

            if( this.editor ){
                // should implements by editor; 
                this.editor.start_add_connector( this );
            }
        });

        node.on('mouseup.add_connector', ()=>{
            (<MouseEvent>d3.event).stopPropagation();

            if( this.editor &&　this.editor.end_add_connector ){
                this.editor.end_add_connector(this);
            }
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

    type:string = JointType.OUTPUT;

    connectors:Connector[] = [];


    add_connector ( connector:Connector ){
        this.connectors.push(connector);
    }

    remove_connector ( connector:Connector ){
        this.connectors.splice(this.connectors.indexOf(connector), 1 );
        this.safe_draw();
    }

    update_connector (){
        this.connectors.forEach( connector => connector.draw() );
    }

    can_connect(joint){
        return joint.type == JointType.INPUT 
               && this.connectors.indexOf(joint.connector) == -1
    }

    draw (){
        var element = this.element;

        element.node
            .attr({
                opacity : this.connectors.length > 0 ? 1 : 0.4
            });

        element.text.text( JSON.stringify(this.jointdata) + '#' + this.instance_id);
    }

    destroy (){
        this.is_destroyed = true;
        this.connectors.forEach( node => node.destroy() );
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
            this.safe_draw();
        }
    }
    
    update_connector(){
        if( this.connector ){
            this.connector.draw();
        }
    }

    can_connect(joint){
        return !!!this.connector 
                && joint.type == JointType.OUTPUT;
    }

    draw (){
        if( this.is_destroyed ){
            return;
        }

        var element = this.element;

        element.node
            .attr({
                opacity : this.connector ? 1: 0.4
            });

        element.text.text( JSON.stringify(this.jointdata) + '#' + this.instance_id ) ;
    }

    destroy (){
        this.is_destroyed = true;
        this.connector && this.connector.destroy();
    }
}
