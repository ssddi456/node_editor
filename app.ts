import {ENode,ENodeTemplate,NodeData,NodeTypes, ENodeTemplateData} from './node';
import {Joint,JointType,InputJoint,OutputJoint} from './joint';
import {Connector,ConnectorData} from './connector';
import {Position} from './editor_element';
import {NodeEditor,NodeEditorData} from './node_editor'

var template_list_vm = {

};

var toolbar_vm = {

};

var editor_vm = {
  main_app  : new NodeEditor(<NodeEditorData>{})
};



ko.applyBindings(toolbar_vm, document.getElementById('tool-bar'));
ko.applyBindings(editor_vm, document.getElementById('main-view'));
ko.applyBindings(template_list_vm, document.getElementById('node-template'));

