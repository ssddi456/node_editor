import { ENodeTemplate } from './node';
import { FlowNodeTemplate } from './flow-node';

export const defaultNodeClassId = 'default_node_classId';
export const flowNodeClassId = 'flow_node_class_id';
export const buildInNodeCLassId: string[] = [
    defaultNodeClassId, flowNodeClassId
];

export interface NodeTypeSet {
    [key: string]: ENodeTemplate
}

export const NodeTypes: NodeTypeSet = {
    [defaultNodeClassId]: new ENodeTemplate({ class_id: defaultNodeClassId }),
    [flowNodeClassId]: new FlowNodeTemplate({ class_id: flowNodeClassId }),
};

