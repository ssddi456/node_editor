import {ENode,ENodeTemplate,NodeData,NodeTypes, ENodeTemplateData} from './node';
import {Joint,JointType,InputJoint,OutputJoint} from './joint';
import {Connector,ConnectorData} from './connector';
import {Position} from './editor_element';
import {NodeEditor,NodeEditorData} from './node_editor';
import * as ko from "knockout";
import * as d3 from "d3";
import * as $ from "jquery";

var template_list_vm = {

};

var toolbar_vm = {

};

var editor_vm = {
  main_app  : new NodeEditor({
    node_list : [
      {
        class_id : "",
        instance_id : '',
        data : {},
        pos : {
          x : 20,
          y : 40
        },
        name : '未命名',
        input_joints : [{
          type : 'input',
          instance_id : '1',
          jointdata : { some : 'data'},
          pos:{ x:0, y:0}
        }],
        output_joints : [{
          type : 'output',
          instance_id : '2',
          jointdata : { some : 'data'},
          pos:{ x:0, y:0}
        }],
      },
      {
        class_id : "",
        instance_id : '',
        data : {},
        pos : {
          x : 340,
          y : 40
        },
        name : '未命名',
        input_joints : [{
          type : 'input',
          instance_id : '3',
          jointdata : { some : 'data'},
          pos:{ x:0, y:0}
        }],
        output_joints : [{
          type : 'output',
          instance_id : '4',
          jointdata : { some : 'data'},
          pos:{ x:0, y:0}
        }],
      }

    ],
    node_template_list : [],
    connecter_list : [{
      input_id : '3',
      output_id : '2',
      instance_id : '23123'
    }]
  })
};


var main_view = $('.main-view');
var svg = d3.select('#main-view').append('svg');
var defs =svg.append('defs');
var title_bg_color = defs.append('linearGradient')
                      .attr({
                        'id' : 'title_bg_color'
                      });

title_bg_color.append('stop')
                .attr({
                  'offset' : '0%',
                  'stop-color' : '#332d58'
                });

title_bg_color.append('stop')
                .attr({
                  'offset' : '100%',
                  'stop-color' : 'black',
                  'stop-opacity' : '0'
                });


var main_view_container = svg
                              .attr({
                                width : main_view.width(),
                                height : main_view.height()
                              })
                              .append('svg:g');

main_view_container
  .append('svg:rect')
    .attr({
      fill : '#262626',
      width : main_view.width(),
      height : main_view.height()
    })
 

export let init = () => {
  ko.applyBindings(toolbar_vm, document.getElementById('tool-bar'));
  ko.applyBindings(editor_vm, document.getElementById('main-view'));
  ko.applyBindings(template_list_vm, document.getElementById('node-template'));

  editor_vm.main_app.create_view(main_view_container);
};

