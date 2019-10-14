import { InputJoint, OutputJoint, JointViewParam } from "./joint";



export class InputCircleJoint extends InputJoint {

    init_view(container: d3.Selection<Object>, option: JointViewParam) {

        var node = container.append('circle')
            .attr({
                r: 20,
                fill: 'blue'
            });

        var text_container = container.append('g');
        var text = text_container.append('text')
            .attr({
                y: 5,
                'text-anchor': 'middle'
            })
            .style({
                'user-select': 'none',
                'pointer-events': 'none'
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
}

export class OutputCircleJoint extends OutputJoint {

    init_view(container: d3.Selection<Object>, option: JointViewParam) {

        var node = container.append('circle')
            .attr({
                r: 20,
                fill: 'blue'
            });

        var text_container = container.append('g');
        var text = text_container.append('text')
            .attr({
                y: 5,
                'text-anchor': 'middle'
            })
            .style({
                'user-select': 'none',
                'pointer-events': 'none'
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
}
