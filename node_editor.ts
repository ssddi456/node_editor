import {ENode,ENodeTemplate,NodeData,NodeTypes, ENodeTemplateData} from './node';
import {Joint,JointType,InputJoint,OutputJoint,JointData} from './joint';
import {Connector,ConnectorData} from './connector';
import {Position} from './editor_element';
import {Menu, MenuData} from './menu';
import * as util from './util';

export interface NodeEditorData {
    node_template_list : ENodeTemplateData[],
    node_list : NodeData[],
    connecter_list : ConnectorData[],
    menu : MenuData,
};

export class NodeEditor{

    static instance:NodeEditor;

    view: d3.selection.Group;
    zoom : d3.behavior.Zoom<Object>;

    node_list:ENode[] = [];
    connector_list:Connector[] = [];
    joint_map : {
        [key:string] : Joint,
    } = {};
    menu :Menu;

    end_add_connector: Function;

    container : d3.Selection<Object>;
    zoomable_container : d3.Selection<Object>;

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

        this.load_menu(initdata.menu);
    }

    create_view( top:d3.Selection<Object>, canvas_option:{[key:string]:number} ){

        this.container = top;
        var bg = top
          .append('svg:rect')
            .attr({
              fill : '#262626',
            })
            .attr(canvas_option);
        var zoomable_container = top.append('svg:g');
        this.zoomable_container = zoomable_container;
        

        var zoom = d3.behavior.zoom()
                    .scaleExtent([0.1, 2])
                    .on('zoom', redraw);

        this.zoom = zoom;

        console.log( zoom.center() );
        bg.call(zoom);

        function redraw() {
          var e = <d3.ZoomEvent>d3.event;

          zoomable_container
            .attr('transform', 
                'translate(' + e.translate + ')' +
                ' scale(' + e.scale + ')');
        }

        // 保证node层不会被连接线挡住
        var connector_container = this.connector_container = zoomable_container.append('g');
        var node_container = this.node_container = zoomable_container.append('g');

        this.node_list.forEach(( node )=>{
            node.create_view( node_container );
        });

        this.connector_list.forEach(( connector )=>{
            connector.create_view( connector_container);
        });

        this.menu.create_view( top );

        this.bind_events();
    }

    bind_events (){

        this.container.on('mouseup.add_connector', ()=>{
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

    load_nodes( nodelist:NodeData[]):ENode[]{
        return nodelist.map(( node )=>{
            var node_template = NodeTypes[node.class_id];
            if(!node_template ){
                node_template = new ENodeTemplate();
            }

            var enode = node_template.create_enode(node);
            enode.editor = this;

            enode.name = node.name;


            this.node_list.push( enode );

            
            // save joints here;
            enode.output_joints.forEach(( joint )=>{
                this.add_to_joint_map(joint);
            });

            enode.input_joints.forEach(( joint ) =>{
                this.add_to_joint_map(joint);
            });
            return enode;
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

    load_menu ( menu:MenuData ){
        this.menu = new Menu(menu);
        this.menu.editor = this;
    }

    add_node ( template : ENodeTemplate, pos:Position ){
        var enode = template.create_enode(<NodeData>{ pos : pos });

        enode.create_view( this.node_container);

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

        node.destroy();
        this.refresh_connector();
    }

    refresh_connector (){
        if( this.connector_list.some( connector => connector.is_destroyed ) ){
            this.connector_list = this.connector_list.filter( connector => connector.is_destroyed );
        }
    }

    start_add_connector ( startjoint:Joint ){
        if( startjoint.type == JointType.INPUT 
          && (<InputJoint>startjoint).connector ){
            return;
        }
        var fake_joint;
        var temp_connector :Connector;

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
            temp_connector = new Connector(startjoint, fake_joint);
        } else if ( startjoint instanceof OutputJoint ){
            fake_joint = new OutputJoint(fake_joint_data.instance_id, fake_joint_data);
            temp_connector = new Connector(fake_joint, startjoint);
        }

        temp_connector.create_view( this.connector_container);
        var mouse_move_handle = ()=>{
            var e = <MouseEvent>d3.event;
            var pos = d3.mouse(util.d3_get(this.zoomable_container));
            fake_joint.pos.x = pos[0];
            fake_joint.pos.y = pos[1];

            temp_connector.draw();
        };

        this.container.on('mousemove.add_connector', mouse_move_handle);

        var can_add_connector = (startjoint:Joint, endjoint:Joint) :boolean =>{
            var ret = startjoint.node != endjoint.node
                    && startjoint.can_connect(endjoint)
                    && endjoint.can_connect(startjoint);

            return ret;
        };

        this.end_add_connector = (endjoint?:Joint)=>{
            console.log("end_add_connector", endjoint);
            this.end_add_connector = undefined;
            this.container.on('mousemove.add_connector', null);

            temp_connector.destroy();


            if( !endjoint ){
                return;
            }

            var params = [startjoint, endjoint];
            if( !can_add_connector(params[0], params[1]) ){
                return;
            }
            if( params[0] instanceof InputJoint ){

            } else {
                params.reverse();
            }

            this.add_connector.call(this, ...params);
            params.forEach(joint => joint.draw() );
        };
    }

    


    add_connector( inputjoint:InputJoint, outputjoint:OutputJoint ){

        var temp_connector = new Connector(inputjoint, outputjoint);
        temp_connector.create_view( this.connector_container );

        this.connector_list.push( temp_connector );

    }

    remove_connector( connector:Connector){

        var index_node = this.connector_list.indexOf(connector);
        if( index_node === -1 ){
            return false
        }

        connector.destroy();
    }

    toJSON () : NodeEditorData{
        this.refresh_connector();

        return {
            node_template_list : Object.keys(NodeTypes).map( k => NodeTypes[k].toJSON() ),

            node_list : this.node_list
                          .filter(node => node.is_destroyed )
                          .map( node => node.toJSON() ),

            connecter_list : this.connector_list
                                 .filter(node => node.is_destroyed )
                                 .map( node => node.toJSON() ),
            menu : this.menu.toJSON()
        };
    }
}
