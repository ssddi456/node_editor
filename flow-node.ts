import { ENode, ENodeTemplate, NodeData, ENodeTemplateData, ENodeViewParameter } from "./node";
import * as util from './util';
import { EditableText, Position } from "./editor_element";
import { JointViewParam, Joint, JointType, JointData, JointConfigData, OutputJoint, InputJoint } from "./joint";
import { NodeEditor } from "./node_editor";
import { InputCircleJoint, OutputCircleJoint } from "./circle_joint";

interface FlowNodeViewParameter extends ENodeViewParameter {
    title_top: number;
    input_joint_pos: Position[];
    output_joint_pos: Position[];
}


const flowNodeWidth = 160;
const flowNodeHeight = 80;
export class FlowNode extends ENode {
    element_parameter: FlowNodeViewParameter = {
        title_top: 45,
        title_height: 0,
        body_width: flowNodeWidth,
        body_height: flowNodeHeight,
        joint_padding_top: 5,
        joint_height: 20,
        input_joint_pos: [{
            x: flowNodeWidth / 2,
            y: 0,
        }],
        output_joint_pos: [{
            x: flowNodeWidth / 2,
            y: flowNodeHeight
        }, {
            x: flowNodeWidth,
            y: flowNodeHeight / 2
        }]
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
            class: 'flow_node_body_bg'
        });

        body_bg.attr({
            opacity: 0.6
        });

        const element_parameter = this.element_parameter;
        const body = main.append('g')
            .classed('node_body', true)
            .attr({
                'transform': 'translate(0,' + element_parameter.title_height + ')'
            });

        const title = main.append('g')
            .attr({
                'transform': 'translate(0, ' + element_parameter.title_top + ')'
            });
        const title_bg = util.add_background(title, {
            borderColor: 'none'
        });
        const title_text = new EditableText(this, ['name'], this.editor);
        title_text.init_view(title);
        title_bg.redraw();

        body.append('rect')
            .attr({
                width: element_parameter.body_width,
                height: element_parameter.body_height,
                fill: 'transparent'
            });
        body_bg.redraw();

        const joint_padding_top = element_parameter.joint_padding_top;
        const joint_height = element_parameter.title_height;

        const joint_top = element_parameter.title_height + joint_padding_top;
        const input_joints = main.append('g')
            .classed('input_joints_container', true) as d3.Selection<SVGGElement>;

        const init_join = (joint_container: d3.Selection<SVGGElement>, param: Position[]) => {
            return (joint: Joint, idx: number) => {
                joint.create_view(
                    joint_container
                        .append('g')
                        .classed('joint_container', true)
                        .attr({
                            'transform': 'translate('
                                + param[idx].x + ','
                                + param[idx].y +
                                ')'
                        }),
                    {
                        left: this.pos.x + param[idx].x,
                        top: this.pos.y + param[idx].y,
                        width: element_parameter.body_width
                    });
            }
        }

        this.input_joints.forEach(init_join(input_joints, element_parameter.input_joint_pos));

        const last = this.input_joints.length;
        const output_joints = main.append('g')
            .classed('output_joints_container', true) as d3.Selection<SVGGElement>;

        this.output_joints.forEach(init_join(output_joints, element_parameter.output_joint_pos));


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

export class FlowStartNodeTemplate extends FlowNodeTemplate {

    constructor(initdata: Partial<ENodeTemplateData> = {}) {
        super(initdata);
        this.default_name = initdata.default_name || '未命名流程开始节点';
        this.input_joints = [];
        this.output_joints = [{
            type: JointType.OUTPUT,
            jointdata: {
                name: 'OUT'
            }
        }];
    }

}

export class FlowWhenNodeTemplate extends FlowNodeTemplate {

    constructor(initdata: Partial<ENodeTemplateData> = {}) {
        super(initdata);
        this.default_name = initdata.default_name || '未命名流程触发节点';
        this.input_joints = [{
            type: JointType.INPUT,
            jointdata: {
                name: 'IN'
            }
        }];
        this.output_joints = [{
            type: JointType.OUTPUT,
            jointdata: {
                name: 'YES'
            }
        }, {
            type: JointType.OUTPUT,
            jointdata: {
                name: 'NO'
            }
        }];
    }
}
