import {ENode,ENodeTemplate,NodeData,NodeTypes, ENodeTemplateData} from './node';
import {Joint,JointType,InputJoint,OutputJoint,JointData} from './joint';
import {Connector,ConnectorData} from './connector';
import {Position} from './editor_element';
import * as util from './util';

export interface NodeEditorData {
    node_template_list : ENodeTemplateData[],
    node_list : NodeData[],
    connecter_list : ConnectorData[],
};

export class NodeEditor{

    static instance:NodeEditor;

    view: d3.selection.Group;
    node_list:ENode[] = [];
    connector_list:Connector[] = [];
    joint_map : {
        [key:string] : Joint,
    } = {};
    
    end_add_connector: Function;

    container : d3.Selection<Object>;
    node_container : d3.Selection<Object>;
    connector_container : d3.Selection<Object>;

    add_to_joint_map ( joint:Joint ){
        if( joint.instance_id in this.joint_map ){
            throw new Error('instance_id already exists ' + joint.instance_id);
        }
        joint.editor = this;
        this.joint_map[joint.instance_id] = joint;
    }

    constructor( initdata:NodeEditorData ){
        if( NodeEditor.instance ){
            return NodeEditor.instance;
        }

        this.load_node_template(initdata.node_template_list);
        this.load_nodes(initdata.node_list);
        this.load_connecters(initdata.connecter_list);
    }

    create_view( parent:d3.Selection<Object> ){
        this.container = parent;

        // 保证node层不会被连接线挡住
        var connector_container = this.node_container = parent.append('g');
        var node_container = this.connector_container = parent.append('g');

        this.node_list.forEach(( node )=>{
            node.create_view( node_container );
        });

        this.connector_list.forEach(( connector )=>{
            connector.create_view( connector_container);
        });


        parent.on('mouseup', ()=>{
            if( this.end_add_connector ){
                this.end_add_connector();
            }
        });
    }

    load_node_template (nodetemplatelist:ENodeTemplateData[]){
        nodetemplatelist.forEach(( node )=>{
            ENodeTemplate.create_template( node );
        });
    }

    load_nodes( nodelist:NodeData[]){
        nodelist.forEach(( node )=>{
            var node_template = NodeTypes[node.class_id];
            if(!node_template ){
                node_template = new ENodeTemplate();
            }

            var enode = node_template.create_enode(node);

            enode.name = node.name;

            this.node_list.push( enode );

            
            // save joints here;
            enode.output_joints.forEach(( joint )=>{
                this.add_to_joint_map(joint);
            });

            enode.input_joints.forEach(( joint ) =>{
                this.add_to_joint_map(joint);
            });
        });
    }

    load_connecters( connectorlist:ConnectorData[] ){
        connectorlist.forEach(( node ) => {
            var connector = new Connector( 
                                    <InputJoint>this.joint_map[node.input_id], 
                                    <OutputJoint>this.joint_map[node.output_id]);

            this.connector_list.push(connector);
        });
    }

    add_node ( template : ENodeTemplate, pos:Position ){
        var enode = template.create_enode(<NodeData>{ pos : pos });

        this.node_list.push(enode);
    }

    remove_node( node:ENode ):boolean{
        // 删除自己
        // 删除自己的joint
        // 删除joint上的connector
        var index_node = this.node_list.indexOf(node);
        if( index_node === -1 ){
            return false
        }

        this.node_list.splice(index_node, 1);

        node.input_joints.forEach(( node )=>{
            delete this.joint_map[node.instance_id];
            node.connector.destroy();
        });

        node.output_joints.forEach(( node )=>{
            delete this.joint_map[node.instance_id];
            node.connectors.forEach(( connector )=>{
                 connector.destroy();
            });
        });

        this.refresh_connector();
    }

    refresh_connector (){
        if( this.connector_list.some( connector => connector.is_destroyed ) ){
            this.connector_list = this.connector_list.filter( connector => connector.is_destroyed );
        }
    }

    start_add_connector ( startjoint:Joint ){
        if( startjoint.type == JointType.INPUT && (<InputJoint>startjoint).connector ){
            return;
        }
        var fake_joint;
        var temp_coonector :Connector;

        var fake_joint_data:JointData ={
            type : '',
            instance_id : util.uuid(),
            jointdata :{},
            pos : {
                x : startjoint.pos.x,
                y : startjoint.pos.y
            }
        };

        if( startjoint instanceof InputJoint ){
            fake_joint = new OutputJoint(fake_joint_data.instance_id, fake_joint_data);
            temp_coonector = new Connector(startjoint, fake_joint);
        } else if ( startjoint instanceof OutputJoint ){
            fake_joint = new OutputJoint(fake_joint_data.instance_id, fake_joint_data);
            temp_coonector = new Connector(fake_joint, startjoint);
        }

        temp_coonector.create_view( this.connector_container);

        this.container.on('mousemove', ()=>{
            var e = <MouseEvent>d3.event;
            fake_joint.pos.x = e.x;
            fake_joint.pos.y = e.y;

            temp_coonector.draw();
        })

        var can_add_connector = (endjoint:Joint) :boolean =>{
            return startjoint.type != endjoint.type;
        };

        this.end_add_connector = (endjoint?:Joint)=>{
            console.log("end_add_connector", endjoint);

            this.end_add_connector = undefined;

            if( !endjoint ){
                return;
            }
            if( !can_add_connector(endjoint) ){
                return;
            }


            var params = [startjoint, endjoint];

            if( startjoint.type == JointType.INPUT ){
                // pass
            } else {
                params.reverse();
            }

            this.add_connector.call(this, ...params, temp_coonector);
        };
    }

    

    add_connector( inputjoint:InputJoint, outputjoint:OutputJoint, temp_coonector:Connector ){

        temp_coonector.input_node = inputjoint;
        temp_coonector.output_node = outputjoint;
        // add same start end check here

        temp_coonector.draw();

        this.connector_list.push( temp_coonector );

    }

    remove_connector( connector:Connector){
        connector.destroy();
        this.refresh_connector();
    }

    toJSON () : NodeEditorData{
        this.refresh_connector();

        return {
            node_template_list : Object.keys(NodeTypes).map( k => NodeTypes[k].toJSON() ),
            node_list : this.node_list.map( node => node.toJSON() ),
            connecter_list : this.connector_list
                                 .filter(node => node.is_destroyed )
                                 .map( node => node.toJSON() ),
        }
    }
}
