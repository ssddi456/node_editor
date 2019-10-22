import { VisibleElement, Position, ElementMap } from './editor_element'
import * as util from './util';
import { ENode, ENodeTemplate, ENodeTemplateData } from './node';
import { Connector } from './connector';
import { backgroundObject } from "./util";

export interface MenuData {
    NodeTypes: { [k: string]: ENodeTemplate }
}

export interface MenuView {
    menu_container: d3.Selection<Object>;
    menu_bg: backgroundObject;
}

export class MenuItem {

    name: string = '';
    type: string = 'background';
    action: (context: VisibleElement | string, pos: Position) => void;

    constructor() {
        // code...
    }
}

export class Menu extends VisibleElement {

    element: MenuView;
    container: d3.Selection<Object>;

    items: MenuItem[] = [];

    constructor(initdata: MenuData) {
        super()

        for (const key in initdata.NodeTypes) {
            if (initdata.NodeTypes.hasOwnProperty(key)) {
                const type = initdata.NodeTypes[key];
                let item_add = new MenuItem();
                item_add.name = 'add ' + type.default_name + ' node';

                item_add.action = (context, pos) => {
                    this.editor.add_node(type, pos)
                };

                this.items.push(item_add);
            }
        }


        let item_clone = new MenuItem();
        item_clone.name = 'clone node';
        item_clone.type = 'node';
        item_clone.action = (context, pos) => {
            var data = (<ENode>context).toJSONClone();
            var nodes = this.editor.load_nodes([data]);
            nodes.forEach(node => node.create_view(this.editor.node_container));
        };
        this.items.push(item_clone);

        let item_remove = new MenuItem();
        item_remove.name = 'remove node';
        item_remove.type = 'node';
        item_remove.action = (context, pos) => {
            this.editor.remove_node(<ENode>context);
        };

        this.items.push(item_remove);

        let item_remove_connector = new MenuItem();
        item_remove_connector.name = 'remove connector';
        item_remove_connector.type = 'connector';
        item_remove_connector.action = (context, pos) => {
            this.editor.remove_connector(<Connector>context);
        };

        this.items.push(item_remove_connector);
    }

    init_view(menu_container: d3.Selection<Object>) {
        menu_container.classed('menu hide', true);

        this.element.menu_container = menu_container;
        this.element.menu_bg = util.add_background(menu_container, {});
    }

    bind_event() {
        var element = this.element;
        this.parent.on('contextmenu.menu', () => {
            var e = <Event>d3.event;
            e.preventDefault();
            var pos = d3.mouse(util.d3_get(this.parent));
            var vm = ElementMap[util.find_instance(<SVGElement>e.target)]

            this.draw(vm || 'background', {
                x: pos[0],
                y: pos[1]
            });

        });

        this.parent.on('click.menu', () => {
            this.hide();
        });

        element.menu_container.on('click.menu', () => {
            this.hide();
        });
    }

    show() {
        this.element.menu_container.classed('hide', false);
    }
    hide() {
        this.element.menu_container.classed('hide', true);
    }

    draw(context?: VisibleElement | string, pos?: Position) {
        var element = this.element;
        if (!pos) {
            return;
        }

        var menu_container = element.menu_container;
        util.move_group(menu_container, pos);

        menu_container.selectAll('.menu-item').remove();

        this.items
            .filter((node) => {
                return !node.type || node.type == context || node.type == (<VisibleElement>context).type;
            })
            .forEach((item, idx) => {
                var item_container = menu_container.append('g')
                    .classed('menu-item', true);

                util.move_group(item_container, {
                    x: 0,
                    y: idx * 22,
                });

                var item_bg = item_container.append('rect');
                item_bg.attr({
                    fill: 'white',
                    width: 300,
                    height: 20,
                });

                var text = item_container.append('text');
                text.attr({
                    x: 0,
                    y: 16,
                });

                text.text(item.name);

                item_container.on('click', () => {
                    item.action(context, pos);
                });

            });

        this.element.menu_bg.redraw();

        this.show();
    }

    destroy() {
        this.is_destroyed = true;
    }

    toJSON() {
        return {};
    }
}
