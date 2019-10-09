import { ENode, ENodeTemplate, buildInNodeCLassId, NodeData } from "./node";
import * as util from './util';
import { EditableText } from "./editor_element";
import { JointViewParam, Joint } from "./joint";

export class FlowNode extends ENode {
    init_view(main: d3.Selection<Object>) {

        var body_bg = util.add_background(main, {
            padding: 0
        });

        body_bg.attr({
            opacity: 0.6
        });

        var title = main.append('g');
        var title_bg = util.add_background(title, {});

        var title_text = new EditableText(this, ['name']);
        title_text.init_view(title);

        var body = main.append('g')
            .classed('node_body', true)
            .attr({
                'transform': 'translate(0,' + this.element_parameter.title_height + ')'
            });

        const joint_padding_top = this.element_parameter.joint_padding_top;
        const joint_height = this.element_parameter.title_height;

        var joint_top = this.element_parameter.title_height + joint_padding_top;
        var input_joints = main.append('g')
            .classed('input_joints_container', true)
            .attr({
                'transform': 'translate(0,' + joint_top + ')'
            }) as d3.Selection<SVGGElement>;

        var joint_param = <JointViewParam>{
            width: this.element_parameter.body_width,
            left: this.pos.x
        };

        var init_join = (joint_container: d3.Selection<SVGGElement>, offset = 0) => {
            return (joint: Joint, idx: number) => {
                joint_param.top = idx * joint_height + offset + joint_top + this.pos.y;
                joint.init_view(
                    joint_container
                        .append('g')
                        .classed('joint_container', true)
                        .attr({
                            'transform': 'translate(0,' + (idx * joint_height) + ')'
                        }),
                    joint_param);
            }
        }

        this.input_joints.forEach(init_join(input_joints));

        var last = this.input_joints.length;
        var output_joints = main.append('g')
            .classed('output_joints_container', true)
            .attr({
                'transform': 'translate(0,' + (joint_top + last * joint_height) + ')'
            }) as d3.Selection<SVGGElement>;

        this.output_joints.forEach(init_join(output_joints, last + 16));

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
    create_enode(initdata: NodeData): ENode {

        initdata.instance_id = initdata.instance_id || util.uuid();
        initdata.name = initdata.name || this.default_name;
        initdata.data = initdata.data || Object.create(this.data);

        initdata.output_joints = initdata.output_joints || this.output_joints.slice();
        initdata.input_joints = initdata.input_joints || this.input_joints.slice();

        var enode = new FlowNode(this.class_id, initdata.instance_id, initdata);

        return enode;
    }
}

export const flowNodeClassId = 'flow_node_class_id';
buildInNodeCLassId.push(flowNodeClassId);

new FlowNodeTemplate({ class_id: flowNodeClassId });
