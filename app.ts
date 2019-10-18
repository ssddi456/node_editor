import { NodeEditor } from './node_editor';
import * as ko from "knockout";
import * as d3 from "d3";

var toolbar_vm = {
    editor: null as NodeEditor,
    save_data: function (editor) {
        var data = JSON.stringify(editor || toolbar_vm.editor);
        localStorage.setItem('node_editor', data);
    },
    load_data: function (container, canvas_option){
        var stored_data = localStorage.getItem("node_editor");
        try {
            var parsed_data = JSON.parse(stored_data);
        } catch (e) {}
        const editor = new NodeEditor(parsed_data || default_data);
        toolbar_vm.editor = editor;
        editor.create_view(container, canvas_option);
        return editor;
    },
};

var default_data = {
    node_list: [
        {
            class_id: "",
            instance_id: '',
            data: {},
            pos: {
                x: 20,
                y: 40
            },
            name: '未命名',
            input_joints: [{
                type: 'input',
                instance_id: '1',
                jointdata: { name: 'data' },
                pos: { x: 0, y: 0 }
            }],
            output_joints: [{
                type: 'output',
                instance_id: '2',
                jointdata: { name: 'data' },
                pos: { x: 0, y: 0 }
            }],
        },
        {
            class_id: "",
            instance_id: '',
            data: {},
            pos: {
                x: 340,
                y: 40
            },
            name: '未命名',
            input_joints: [{
                type: 'input',
                instance_id: '3',
                jointdata: { name: 'data' },
                pos: { x: 0, y: 0 }
            }],
            output_joints: [{
                type: 'output',
                instance_id: '4',
                jointdata: { name: 'data' },
                pos: { x: 0, y: 0 }
            }],
        }

    ],
    node_template_list: [],
    connecter_list: [{
        input_id: '3',
        output_id: '2'
    }],
    menu: {}
};




var main_view = $('.main-view');
var canvas_option = {
    width: main_view.width(),
    height: main_view.height()
};

var svg = d3.select('#main-view')
    .append('svg')
    .attr(canvas_option);

var defs = svg.append('defs');
var title_bg_color = defs.append('linearGradient')
    .attr({
        'id': 'title_bg_color'
    });

title_bg_color.append('stop')
    .attr({
        'offset': '0%',
        'stop-color': '#332d58'
    });

title_bg_color.append('stop')
    .attr({
        'offset': '100%',
        'stop-color': 'black',
        'stop-opacity': '0'
    });

var top = svg.append('svg:g');


export let init = () => {
    ko.applyBindings(toolbar_vm, document.getElementById('tool-bar'));
    toolbar_vm.load_data(top, canvas_option);
};

