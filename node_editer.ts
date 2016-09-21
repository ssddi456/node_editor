import {ENode,ENodeTemplate,NodeData,NodeTypes, ENodeTemplateData} from './node';
import {Joint,JointType,InputJoint,OutputJoint} from './joint';
import {Connector,ConnectorData} from './connector';
import {Position} from './editor_element';

interface NodeEditorData {
    node_template_list : ENodeTemplateData[],
    node_list : NodeData[],
    connecter_list : ConnectorData[],
};

export class NodeEditer{

    static instance:NodeEditer;

    view: d3.selection.Group;
    node_list:ENode[];
    connector_list:Connector[];
    joint_map : {
        [key:string] : Joint
    }

    constructor( view:d3.selection.Group, initdata:NodeEditorData ){
        if( NodeEditer.instance ){
            return NodeEditer.instance;
        }

        this.view = view;

        this.load_node_template(initdata.node_template_list);
        this.load_nodes(initdata.node_list);
        this.load_connecters(initdata.connecter_list);
    }

    load_node_template (nodetemplatelist:ENodeTemplateData[]){
        nodetemplatelist.forEach(( node )=>{
            ENodeTemplate.create_template( node );
        });
    }

    load_nodes( nodelist:NodeData[]){
        nodelist.forEach(( node )=>{
            var node_template = NodeTypes[node.class_id];
            var enode = node_template.create_enode(node);

            enode.name = node.name;

            this.node_list.push( enode );

            // save joints here;
            enode.output_joints.forEach(( joint )=>{
                this.joint_map[ joint.instance_id] = joint;
            });

            enode.input_joints.forEach(( joint ) =>{
                this.joint_map[ joint.instance_id] = joint;
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

    start_add_connector ( startjoint:Joint ) : boolean | Object {
        if( startjoint.type == JointType.INPUT && (<InputJoint>startjoint).connector ){
            return false;
        }
        var self = this;
        return {
            can_add_connector : (endjoint:Joint) :boolean=>{
               return startjoint.type != endjoint.type;
            },
            end_add_connector : function(endjoint?:Joint) : boolean {
                if( !endjoint ){
                    return false;
                }
                if( !this.can_add_connector(endjoint) ){
                    return false;
                }

                var params = [startjoint, endjoint];

                if( startjoint.type == JointType.INPUT ){

                } else {
                    params.reverse();
                }

                self.add_connector.call(self, ...params);
            }
        }
    }

    add_connector( inputjoint:InputJoint, outputjoint:OutputJoint ){
        this.connector_list.push(new Connector(inputjoint, outputjoint));
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
