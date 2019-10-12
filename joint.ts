import { ENode } from './node';
import { NodeEditor } from './node_editor';
import { Connector } from './connector';
import { EditorElementData, EditorElement, EditableText, Position } from './editor_element';
import * as util from './util';
import * as d3 from 'd3';


export abstract class JointType {
    static OUTPUT: string = "output";
    static INPUT: string = "input";
}

export interface JointConfigData {
    type: string;
    jointdata: Object;
}
export type JointData = EditorElementData & JointConfigData;

export interface JointView {
    node: d3.Selection<Object>;
    text: EditableText<JointData> | d3.Selection<Object>,
    container: d3.Selection<Object>;
}

export interface JointViewParam {
    left: number,
    top: number,
    width: number,
}

export abstract class Joint extends EditorElement implements JointData {

    type: string;
    jointdata: Object;
    element: JointView;
    node: ENode;
    abstract can_connect(joint: Joint): boolean;
    drag_start_pos: Position;

    constructor(public instance_id: string, initdata: JointConfigData, public editor: NodeEditor) {
        super(instance_id);

        this.jointdata = initdata.jointdata
    }

    abstract add_connector(connector: Connector)
    abstract remove_connector(connector: Connector)

    update_node_center(option: Pick<JointViewParam, 'left' | 'top'>) {
        var bbox = util.d3_get(this.element.node).getBBox();

        this.pos.x = option.left + bbox.x + bbox.width / 2;
        this.pos.y = option.top + bbox.y + bbox.height / 2;
    }

    abstract update_connector(): void;

    start_drag() {
        this.drag_start_pos = { ...this.pos };
    }

    on_drag(option: Pick<JointViewParam, 'left' | 'top'>) {
        this.pos.x = this.drag_start_pos.x + option.left;
        this.pos.y = this.drag_start_pos.y + option.top;

        this.update_connector();
    }

    end_drag(option: Pick<JointViewParam, 'left' | 'top'>) {
        this.on_drag(option);
    }

    init_view(container: d3.Selection<Object>, option: JointViewParam) {
        if (this instanceof InputJoint) {
            var node = container.append('circle')
                .attr({
                    cx: 15,
                    r: 5
                });
        }

        var text = container.append('g')
            .attr('transform', 'translate(25,5)');

        var title_text = new EditableText(this.jointdata, ['name'], this.editor);
        title_text.create_view(text);

        if (this instanceof OutputJoint) {
            var node = container.append('circle')
                .attr({
                    cx: option.width - 30,
                    r: 5
                });
        }

        node.classed('joint', true);

        this.element = {
            container,
            node,
            text: title_text
        };

        this.update_node_center(option);

        this.bind_event();
    }

    bind_event() {

        var node = this.element.node;
        node.on('mousedown.add_connector', () => {
            var e = <MouseEvent>d3.event;
            e.stopPropagation();
            e.preventDefault();

            if (this.editor) {
                // should implements by editor; 
                this.editor.start_add_connector(this);
            }
        });

        node.on('mouseup.add_connector', () => {
            (<MouseEvent>d3.event).stopPropagation();

            if (this.editor && this.editor.end_add_connector) {
                this.editor.end_add_connector(this);
            }
        });
    }

    toJSON(): JointData {
        return {
            type: this.type,
            instance_id: this.instance_id,
            jointdata: this.jointdata,
            pos: {
                x: this.pos.x,
                y: this.pos.y
            }
        };
    }
}


export class OutputJoint extends Joint {

    type: string = JointType.OUTPUT;

    connectors: Connector[] = [];


    add_connector(connector: Connector) {
        this.connectors.push(connector);
    }

    remove_connector(connector: Connector) {
        this.connectors.splice(this.connectors.indexOf(connector), 1);
        this.safe_draw();
    }

    update_connector() {
        this.connectors.forEach(connector => connector.draw());
    }

    can_connect(joint) {
        return joint.type == JointType.INPUT
            && this.connectors.indexOf(joint.connector) == -1
    }

    draw() {
        var element = this.element;

        element.node
            .attr({
                opacity: this.connectors.length > 0 ? 1 : 0.4
            });

    }

    destroy() {
        this.is_destroyed = true;
        this.connectors.forEach(node => node.destroy());
    }
}

export class InputJoint extends Joint {

    type: string = JointType.INPUT;

    connector: Connector;


    add_connector(connector: Connector) {
        this.connector = connector;
    }

    remove_connector(connector: Connector) {
        if (this.connector == connector) {
            this.connector = null;
            this.safe_draw();
        }
    }

    update_connector() {
        if (this.connector) {
            this.connector.draw();
        }
    }

    can_connect(joint) {
        return !!!this.connector
            && joint.type == JointType.OUTPUT;
    }

    draw() {
        if (this.is_destroyed) {
            return;
        }

        var element = this.element;

        element.node
            .attr({
                opacity: this.connector ? 1 : 0.4
            });

    }

    destroy() {
        this.is_destroyed = true;
        this.connector && this.connector.destroy();
    }
}
