import {ENode} from './node';
import {InputJoint} from './joint';
import {Connector} from './connector';

export class NodeEditer{

    view: d3.selection.Group;
    node_list:ENode[];
    connector_list:Connector[];

    constructor( view:d3.selection.Group, init_data:any ){
        this.view = view;
        init_data.node_list.forEach(( node )=>{
            var enode = new ENode(node.class_id, node.instance_id);

            enode.name = node.name;

            this.node_list.push( enode );
        });
    }
}
