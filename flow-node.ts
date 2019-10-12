import { ENode, ENodeTemplate, NodeData, ENodeTemplateData, ENodeViewParameter } from "./node";
import * as util from './util';
import { EditableText, Position } from "./editor_element";
import { JointViewParam, Joint, JointType, JointData, JointConfigData, OutputJoint, InputJoint } from "./joint";
import { NodeEditor } from "./node_editor";
import { InputCircleJoint, OutputCircleJoint } from "./circle_joint";

interface FlowNodeViewParameter extends ENodeViewParameter {
    title_top: number;
    input_joint_pos: Position;
    output_joint_pos: Position;
}



export class FlowNode extends ENode {
    element_parameter: FlowNodeViewParameter = {
        title_top: 60,
        title_height: 0,
        body_width: 120,
        body_height: 80,
        joint_padding_top: 5,
        joint_height: 20,
        input_joint_pos: {
            x: 60,
            y: 0,
        },
        output_joint_pos: {
            x: 60,
            y: 80
        }
    };

    init_joints(initdata: NodeData) {

        this.input_joints = initdata.input_joints.map((node: JointData | JointConfigData) => {
            var joint = new InputCircleJoint((node as JointData).instance_id || util.uuid(), node, this.editor);
            joint.node = this;
            return joint;
        });

        this.output_joints = initdata.output_joints.map((node: JointData | JointConfigData) => {
            var joint = new OutputCircleJoint((node as JointData).instance_id || util.uuid(), node, this.editor);
            joint.node = this;
            return joint;
        });

    }

    init_view(main: d3.Selection<Object>) {

        const body_bg = util.add_background(main, {
            padding: -15,
            class: 'flow_node_body_bg'
        });

        body_bg.attr({
            opacity: 0.6
        });

        const element_parameter = this.element_parameter;
        const title = main.append('g')
            .attr({
                'transform': 'translate(0, ' + element_parameter.title_top + ')'
            });
        const title_bg = util.add_background(title, {});
        const title_text = new EditableText(this, ['name'], this.editor);
        title_text.init_view(title);

        const body = main.append('g')
            .classed('node_body', true)
            .attr({
                'transform': 'translate(0,' + element_parameter.title_height + ')'
            });

        const joint_padding_top = element_parameter.joint_padding_top;
        const joint_height = element_parameter.title_height;

        const joint_top = element_parameter.title_height + joint_padding_top;
        const input_joints = main.append('g')
            .classed('input_joints_container', true)
            .attr({
                'transform': 'translate(' 
                    + element_parameter.input_joint_pos.x + ',' 
                    + element_parameter.input_joint_pos.y + 
                ')'
            }) as d3.Selection<SVGGElement>;

        const joint_param = <JointViewParam>{
            width: element_parameter.body_width,
            left: this.pos.x
        };

        const init_join = (joint_container: d3.Selection<SVGGElement>, offset = 0) => {
            return (joint: Joint, idx: number) => {
                joint_param.top = idx * joint_height + offset + joint_top + this.pos.y;
                joint.init_view(
                    joint_container
                        .append('g')
                        .classed('joint_container', true),
                    joint_param);
            }
        }

        this.input_joints.forEach(init_join(input_joints));

        const last = this.input_joints.length;
        const output_joints = main.append('g')
            .classed('output_joints_container', true)
            .attr({
                'transform': 'translate(' +
                    + element_parameter.output_joint_pos.x + ','
                    + element_parameter.output_joint_pos.y +
                    ')'
            }) as d3.Selection<SVGGElement>;

        this.output_joints.forEach(init_join(output_joints, last + 16));

        // body_bg.redraw();

        this.element = {
            main,
            title,
            title_bg,
            title_text,

            body,
            body_bg,

            input_joints,
            output_joints
        };
    }
}

export class FlowNodeTemplate extends ENodeTemplate {

    constructor(initdata: Partial<ENodeTemplateData> = {}) {
        super(initdata);
        this.default_name = initdata.default_name || '未命名流程节点';
        this.input_joints = [{
            type: JointType.INPUT,
            jointdata: {
                name: 'IN'
            }
        }];
        this.output_joints = [{
            type: JointType.OUTPUT,
            jointdata: {
                name: 'OUT'
            }
        }];
    }
    create_enode(initdata: NodeData, editor: NodeEditor): ENode {

        initdata.instance_id = initdata.instance_id || util.uuid();
        initdata.name = initdata.name || this.default_name;
        initdata.data = initdata.data || Object.create(this.data);

        initdata.output_joints = initdata.output_joints || this.output_joints.slice();
        initdata.input_joints = initdata.input_joints || this.input_joints.slice();

        const enode = new FlowNode(this.class_id, initdata.instance_id, initdata, editor);
        return enode;
    }
}
