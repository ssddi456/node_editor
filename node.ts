import { Joint, OutputJoint, InputJoint, JointData, JointViewParam } from './joint';
import { Position, EditableText, EditorElement, EditorElementData } from './editor_element';
import * as util from './util';
import * as d3 from 'd3';
import { backgroundObject } from "./util";

export interface NodeData extends EditorElementData {
    class_id: string;

    name: string;
    data: Object;

    output_joints: JointData[];
    input_joints: JointData[];
}

interface NodeConstructor extends Function {

}

export interface ENodeView {
    main: d3.Selection<Object>;

    title: d3.Selection<Object>;
    title_bg: backgroundObject;
    title_text: EditableText;

    body: d3.Selection<Object>;
    body_bg: backgroundObject;

    input_joints: d3.Selection<Object>;
    output_joints: d3.Selection<Object>;
}

interface ENodeViewParameter {
    title_height: number;
    body_width: number;
    body_height: number;
    joint_padding_top: number;
    joint_height: number;
}

export class ENode extends EditorElement implements NodeData {
    instance_id: string;
    class_id: string;
    name: string;
    data: Object;

    type = 'node';

    element: ENodeView;
    element_parameter: ENodeViewParameter = {
        title_height: 18,
        body_width: 300,
        body_height: 120,
        joint_padding_top: 5,
        joint_height: 20,
    };

    output_joints: OutputJoint[];
    input_joints: InputJoint[];

    constructor(class_id: string, instance_id: string, initdata: NodeData) {
        super(instance_id);

        this.class_id = class_id;


        this.name = initdata.name;
        this.data = initdata.data;

        this.output_joints = initdata.output_joints.map((node: JointData) => {
            var joint = new OutputJoint(node.instance_id || util.uuid(), node);
            joint.node = this;
            return joint;
        });

        this.input_joints = initdata.input_joints.map((node: JointData) => {
            var joint = new InputJoint(node.instance_id || util.uuid(), node);
            joint.node = this;
            return joint;
        });

        this.pos.x = initdata.pos.x;
        this.pos.y = initdata.pos.y;
    }

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

    bind_event() {


        this.container.on('click', () => {
            this.move_to_top()
        });

        this.element.title_text.bind_event();


        var drag_node = d3.behavior.drag();

        var origin_cursor_point: Position = {
            x: 0,
            y: 0
        };
        var last_move_pos: Position = {
            x: 0,
            y: 0
        };

        var joint_updater: JointViewParam = {
            left: 0,
            top: 0,
            width: this.element_parameter.body_width
        };

        var current_zoom = {
            translate: {
                x: 0,
                y: 0
            },
            scale: 1
        };

        drag_node.on('dragstart', () => {
            var e = <MouseEvent>(<d3.BaseEvent>d3.event).sourceEvent;

            var zoom = this.editor.zoom;
            var pos = {
                x: this.pos.x,
                y: this.pos.y
            };
            if (zoom) {
                var translate = zoom.translate();
                var scale = zoom.scale();

                current_zoom.translate.x = translate[0];
                current_zoom.translate.y = translate[1];
                current_zoom.scale = scale


            }

            origin_cursor_point.x = (e.offsetX - current_zoom.translate.x) / current_zoom.scale - pos.x;// apply transform
            origin_cursor_point.y = (e.offsetY - current_zoom.translate.y) / current_zoom.scale - pos.y;// apply transform
        });
        drag_node.on('drag', () => {
            var e = <MouseEvent>d3.event;
            last_move_pos = {
                x: e.x - origin_cursor_point.x,
                y: e.y - origin_cursor_point.y
            };

            joint_updater.left = last_move_pos.x;
            joint_updater.top = last_move_pos.y + this.element_parameter.title_height + this.element_parameter.joint_padding_top;

            util.move_group(this.element.main, last_move_pos);

            var drag_joint = (joint: Joint, idx: number) => {
                joint.on_drag(joint_updater);
                joint_updater.top += this.element_parameter.joint_height;
            };

            this.input_joints.forEach(drag_joint);
            this.output_joints.forEach(drag_joint);
        });
        drag_node.on('dragend', () => {
            this.pos.x = last_move_pos.x;
            this.pos.y = last_move_pos.y;
        });

        this.element.main.call(drag_node);
    }


    draw() {
        console.log('call node.draw');

        var element = this.element;
        var ep = this.element_parameter;

        element.main.attr({
            'transform': 'translate(' + this.pos.x + ',' + this.pos.y + ')'
        });

        // element.title_text.text( this.name + '#' + this.instance_id );

        element.title_bg.redraw({
            width: ep.body_width,
        });

        element.body_bg.redraw({
            height: ep.body_height + ep.title_height
        });


        this.input_joints.forEach((joint) => { joint.draw() });
        this.output_joints.forEach((joint) => { joint.draw() });
    }

    destroy() {
        this.is_destroyed = true;

        this.input_joints.forEach(joint => joint.destroy());
        this.output_joints.forEach(joint => joint.destroy());

        this.container.remove();
    }

    toJSON(): NodeData {
        let clone_joint = function (joint: Joint): JointData {
            return joint.toJSON();
        };

        return {
            instance_id: this.instance_id,
            class_id: this.class_id,
            name: this.name,
            data: this.data,
            pos: {
                x: this.pos.x,
                y: this.pos.y
            },
            output_joints: this.output_joints.map(clone_joint),
            input_joints: this.input_joints.map(clone_joint),
        }
    }
    toJSONClone(): NodeData {
        let clone_joint = function (joint) {
            let data = joint.toJSON();
            data.instance_id = util.uuid();
            return data;
        };

        return {
            instance_id: util.uuid(),
            class_id: this.class_id,
            name: this.name,
            data: this.data,
            pos: {
                x: this.pos.x,
                y: this.pos.y
            },
            output_joints: this.output_joints.map(clone_joint),
            input_joints: this.input_joints.map(clone_joint),
        }
    }

}

export interface ENodeTemplateData {
    class_id: string;
    default_name: string;
    data: Object;

    output_joints: JointData[];
    input_joints: JointData[];
}

export class ENodeTemplate implements ENodeTemplateData {

    class_id: string;
    default_name: string;
    data: Object;

    output_joints: JointData[];
    input_joints: JointData[];

    constructor(initdata?: ENodeTemplateData) {
        initdata = initdata || <ENodeTemplateData>{};

        this.class_id = initdata.class_id || util.uuid();
        this.default_name = initdata.default_name || '未命名';
        this.data = initdata.data || {};
        this.output_joints = (initdata.output_joints || []).slice();
        this.input_joints = (initdata.input_joints || []).slice();

        NodeTypes[this.class_id] = this;
    }

    static create_template(initdata: ENodeTemplateData) {
        return new ENodeTemplate(initdata);
    }

    create_enode(initdata: NodeData): ENode {

        initdata.instance_id = initdata.instance_id || util.uuid();
        initdata.name = initdata.name || this.default_name;
        initdata.data = initdata.data || Object.create(this.data);

        initdata.output_joints = initdata.output_joints || this.output_joints.slice();
        initdata.input_joints = initdata.input_joints || this.input_joints.slice();


        var enode = new ENode(this.class_id, initdata.instance_id, initdata);

        return enode;

    }

    toJSON(): ENodeTemplateData {
        return {
            class_id: this.class_id,
            default_name: this.default_name,
            data: this.data,
            output_joints: this.output_joints,
            input_joints: this.input_joints,
        }
    }

}

interface NodeTypeSet {
    [key: string]: ENodeTemplate
}

export var NodeTypes: NodeTypeSet = {}
