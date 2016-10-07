import {NodeEditor} from './node_editor';
import * as util from './util';

export interface EditorElementData {
    instance_id : string;
    pos : { x : number, y : number }  
}

export interface Position {
    x : number,
    y : number,
}

export var ElementMap = {};

export abstract class VisibleElement{
    parent: d3.Selection<Object>;
    container: d3.Selection<Object>;

    is_destroyed:boolean = false;
    ui_inited:boolean = false;

    instance_id : string;

    type : string;

    element: Object = {};

    constructor ( instance_id?:string ){
      if( instance_id ){
          this.instance_id = instance_id;
      } else {
          this.instance_id = util.uuid();
      }
      ElementMap[this.instance_id] = this;
    }

    create_view(parent: d3.Selection<Object>, option?: Object){
        this.parent = parent;
        var container = this.container = parent.append('g');

        if( this.container ){
            container.attr('instance_id', this.instance_id);
        }

        this.init_view(container, option);
        this.ui_inited = true;

        this.bind_event();
        this.draw();
    }

    safe_draw(){
        if( this.is_destroyed ){
            return;
        }
        if( !this.ui_inited ){
            return;
        }
        this.draw();
    }

    abstract init_view( parent: d3.Selection<Object>, option?: Object) 
    abstract bind_event()
    abstract draw ()
    abstract destroy ()
}

export abstract class EditorElement extends VisibleElement implements EditorElementData{



    editor: NodeEditor;

    pos : Position = {
        x : 0,
        y : 0
    };

    constructor( instance_id?:string ){
      super(instance_id);
    }

}