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

    editor: NodeEditor;

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
        this.safe_draw();
    }

    move_to_top(){
        util.d3_get(this.parent).appendChild( util.d3_get(this.container) );
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


    pos : Position = {
        x : 0,
        y : 0
    };

    constructor( instance_id?:string ){
      super(instance_id);
    }

}

export class EditableText extends VisibleElement {
    
    text : d3.Selection<Object>;
    input: d3.Selection<Object>;
    input_el : HTMLInputElement;

    value : string;

    obj : Object;
    data_path : [string|number];

    editing: boolean;

    constructor( obj, data_path ) {
        super();

        this.obj = obj;
        this.data_path = data_path;
        this.value = util.get_by_path(obj, data_path)
    }

    init_view( parent, option? ){
        this.parent = parent;

        let container=  this.container = parent.append('g');

        this.text = container.append('text')
        this.input = container.append('foreignObject')
        this.input.attr({
            x : 0,
            y : -20
        });
        util.d3_get(this.input).innerHTML = `
            <body xmlns="http://www.w3.org/1999/xhtml">
                <div>
                    <input type="text"/>
                </div>
            </body>
        `;

        this.input_el = <HTMLInputElement>(<any>util.d3_get(this.input.select('input')));
        this.set_text(this.value);
    }

    set_text ( str:string){
        this.text.text(this.value);
        this.input_el.value = this.value;
    }

    bind_event(){
        this.show_text();
        this.hide_edit();

        util.d3_get(this.text).addEventListener('click', (e)=>{
            e.stopPropagation();
        }, true);

        util.d3_get(this.text).addEventListener('dblclick', ()=> {
            this.begin_edit();
        });

        this.input_el.addEventListener('click', (e)=>{
            e.stopPropagation();
        }, true);

        this.input_el.addEventListener('contextmenu', (e)=>{
            e.stopPropagation();
        }, true);

        this.editor.container.on('click.end_edit_'+ this.instance_id , ()=>{
            this.end_edit();
        });
    }
    show_text (){

        this.text.attr('visibility', 'visible')
    }
    hide_text(){

        this.text.attr('visibility', 'hidden')
    }

    show_edit (){
        this.input.attr({
            'visibility': 'visible',
            x : 0,
            y : -20
        });

    }

    hide_edit(){
        this.input.attr('visibility', 'hidden')
    }

    begin_edit( ){

        if( this.editing ){
            return;
        }

        this.editing = true;
        this.show_edit();
        this.hide_text();
    }

    end_edit(){
        // should optimize this hook

        if( !this.editing ){
            return;
        }
        this.editing = false;
        let edited_value = this.input_el.value;

        if( this.value != edited_value ) {

            this.value = edited_value;
            this.text.text(edited_value);

            util.set_by_path(this.obj, this.data_path, edited_value);
        }
        this.hide_edit();
        this.show_text();
    }
    destroy(){

    }
    draw(){

    }
}