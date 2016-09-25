export interface EditorElementData {
    instance_id : string;
    pos : { x : number, y : number }  
}

export interface Position {
    x : number,
    y : number,
}
export abstract class EditorElement implements EditorElementData{

    instance_id : string;

    element: Object;

    pos : Position;

    constructor (){
      this.pos = {
        x : 0,
        y : 0
      };
    }

    create_view(parent: d3.Selection<Object>, option?: Object){
        this.init_view(parent, option);
        this.draw();
    }
    abstract init_view( parent: d3.Selection<Object>, option?: Object) 
    abstract draw ()
}