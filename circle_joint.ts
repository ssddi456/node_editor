import { InputJoint, OutputJoint, JointViewParam, Joint } from "./joint";



function circleNodeInitView<T extends Joint>(this: T, container: d3.Selection<Object>, option: JointViewParam) {

    var node = container.append('circle')
        .attr({
            r: 20,
        })
        .style({
            fill: this.jointdata['fill'] || 'blue'
        });

    var text_container = container.append('g');
    var text = text_container.append('text')
        .attr({
            y: 5,
            'text-anchor': 'middle'
        })
        .style({
            'user-select': 'none',
            'pointer-events': 'none',
            fill: 'white'
        })
        .text(this.jointdata['name'])


    node.classed('joint', true);

    this.element = {
        container,
        node,
        text,
    };

    this.update_node_center(option);

    this.bind_event();
}


export class InputCircleJoint extends InputJoint {
    init_view = circleNodeInitView;
}

export class OutputCircleJoint extends OutputJoint {
    init_view = circleNodeInitView;
}
